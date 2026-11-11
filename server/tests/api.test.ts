import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const tempDbFile = path.join(os.tmpdir(), `paypilot_test_${Date.now()}.json`);
process.env.NODE_ENV = 'test';
process.env.PAYPILOT_DB_FILE = tempDbFile;
// Keep automated unit tests deterministic and avoid burning free-tier Gemini quota
process.env.GEMINI_API_KEY = '';

let server: http.Server;
let baseUrl = '';

test.before(async () => {
  const { createApp } = await import('../../server.ts');
  const app = createApp();
  await new Promise<void>(resolve => {
    server = app.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (addr && typeof addr === 'object') {
        baseUrl = `http://127.0.0.1:${addr.port}`;
      }
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
  if (fs.existsSync(tempDbFile)) {
    fs.unlinkSync(tempDbFile);
  }
});

test('GET /api/health, /api/payments/config, and CORS policy', async () => {
  const healthRes = await fetch(`${baseUrl}/api/health`, {
    headers: { Origin: 'http://localhost:3000' },
  });
  assert.equal(healthRes.status, 200);
  assert.equal(healthRes.headers.get('access-control-allow-origin'), 'http://localhost:3000');
  const health = (await healthRes.json()) as any;
  assert.equal(health.status, 'ok');
  assert.equal(typeof health.geminiConfigured, 'boolean');
  assert.equal(typeof health.paypalSandboxConfigured, 'boolean');

  const cfgRes = await fetch(`${baseUrl}/api/payments/config`);
  assert.equal(cfgRes.status, 200);
  const cfg = (await cfgRes.json()) as any;
  assert.equal(cfg.paypal.mode, 'sandbox');
});

test('Protected routes reject unauthenticated requests with 401', async () => {
  const endpoints = [
    '/api/auth/me',
    '/api/dashboard/stats',
    '/api/clients',
    '/api/payment-requests',
    '/api/payments',
    '/api/ai/history',
  ];
  for (const ep of endpoints) {
    const res = await fetch(`${baseUrl}${ep}`);
    assert.equal(res.status, 401, `Expected 401 for unauthenticated ${ep}`);
  }
});

test('Authentication: demo login, password change, and forgot/reset password flow', async () => {
  const badRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'john@example.com', password: 'wrong-password' }),
  });
  assert.equal(badRes.status, 401);

  const okRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'john@example.com', password: 'demo1234' }),
  });
  assert.equal(okRes.status, 200);
  const data = (await okRes.json()) as any;
  assert.ok(data.token);
  assert.equal(data.user.email, 'john@example.com');
  assert.equal((data.user as any).passwordHash, undefined);

  // Register a test user to exercise password change & reset
  const testEmail = `pwtest_${Date.now()}@paypilot.test`;
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'PW Tester', email: testEmail, password: 'InitialPass123!' }),
  });
  assert.equal(regRes.status, 201);
  const regData = (await regRes.json()) as any;

  // Change password
  const chRes = await fetch(`${baseUrl}/api/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${regData.token}`,
    },
    body: JSON.stringify({
      currentPassword: 'InitialPass123!',
      newPassword: 'UpdatedPass456!',
    }),
  });
  assert.equal(chRes.status, 200);

  // Forgot & Reset password
  const forgotRes = await fetch(`${baseUrl}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail }),
  });
  assert.equal(forgotRes.status, 200);
  const forgotJson = (await forgotRes.json()) as any;
  assert.ok(forgotJson.devResetToken);

  const resetRes = await fetch(`${baseUrl}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: forgotJson.devResetToken, newPassword: 'FinalResetPass789!' }),
  });
  assert.equal(resetRes.status, 200);

  const finalLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'FinalResetPass789!' }),
  });
  assert.equal(finalLoginRes.status, 200);
});

test('Cross-user isolation, AI parsing, payment lifecycle validation, and disk persistence', async () => {
  const emailA = `userA_${Date.now()}@paypilot.test`;
  const emailB = `userB_${Date.now()}@paypilot.test`;

  const regA = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'User A', email: emailA, password: 'Password123!' }),
  });
  const regB = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'User B', email: emailB, password: 'Password123!' }),
  });
  const userAData = (await regA.json()) as any;
  const userBData = (await regB.json()) as any;

  const headersA = { 'Content-Type': 'application/json', Authorization: `Bearer ${userAData.token}` };
  const headersB = { 'Content-Type': 'application/json', Authorization: `Bearer ${userBData.token}` };

  // User A creates a client & payment request
  const cliRes = await fetch(`${baseUrl}/api/clients`, {
    method: 'POST',
    headers: headersA,
    body: JSON.stringify({ name: 'Acme Buyer', email: 'buyer@acme.test', company: 'Acme Corp' }),
  });
  assert.equal(cliRes.status, 201);
  const cliData = (await cliRes.json()) as any;

  // Invalid payment amount rejected
  const badPrRes = await fetch(`${baseUrl}/api/payment-requests`, {
    method: 'POST',
    headers: headersA,
    body: JSON.stringify({ clientName: 'Acme Buyer', title: 'Invalid', unitPrice: -10 }),
  });
  assert.equal(badPrRes.status, 400);

  const prRes = await fetch(`${baseUrl}/api/payment-requests`, {
    method: 'POST',
    headers: headersA,
    body: JSON.stringify({
      clientName: 'Acme Buyer',
      clientEmail: 'buyer@acme.test',
      title: 'Website Development',
      unitPrice: 250,
      quantity: 1,
      currency: 'USD',
    }),
  });
  assert.equal(prRes.status, 201);
  const prData = (await prRes.json()) as any;

  // User B CANNOT see, update, cancel, or delete User A's client or payment request
  const bClients = (await (await fetch(`${baseUrl}/api/clients`, { headers: headersB })).json()) as any;
  assert.equal(bClients.clients.length, 0);

  const bGetAClient = await fetch(`${baseUrl}/api/clients/${cliData.client.id}`, { headers: headersB });
  assert.equal(bGetAClient.status, 404);

  const bGetARequest = await fetch(`${baseUrl}/api/payment-requests/${prData.request.id}`, { headers: headersB });
  assert.equal(bGetARequest.status, 404);

  const bCancelARequest = await fetch(`${baseUrl}/api/payment-requests/${prData.request.id}/cancel`, {
    method: 'POST',
    headers: headersB,
  });
  assert.equal(bCancelARequest.status, 400);

  // AI payment proposal extraction
  const aiRes = await fetch(`${baseUrl}/api/ai/chat`, {
    method: 'POST',
    headers: headersA,
    body: JSON.stringify({
      message: 'Create a payment request for John for $250 for website development.',
    }),
  });
  assert.equal(aiRes.status, 200);
  const aiJson = (await aiRes.json()) as any;
  assert.ok(aiJson.proposal);
  assert.equal(aiJson.proposal.unit_price, 250);
  assert.equal(aiJson.proposal.total_amount, 250);
  assert.equal(aiJson.proposal.service_name, 'Website development');
  assert.ok(Array.isArray(aiJson.proposal.missing_fields));

  // Public checkout fetch works without auth
  const pubRes = await fetch(`${baseUrl}/api/payment-requests/public/${prData.request.publicToken}`);
  assert.equal(pubRes.status, 200);
  const pubJson = (await pubRes.json()) as any;
  assert.equal(pubJson.totalAmount, 250);

  // PayPal order creation returns 503 honestly when Sandbox credentials are absent
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    const orderRes = await fetch(`${baseUrl}/api/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicToken: prData.request.publicToken }),
    });
    assert.equal(orderRes.status, 503);
  }

  // Cancel request and verify cancelled request cannot initiate PayPal checkout
  const cancelRes = await fetch(`${baseUrl}/api/payment-requests/${prData.request.id}/cancel`, {
    method: 'POST',
    headers: headersA,
  });
  assert.equal(cancelRes.status, 200);

  const cancelledOrderRes = await fetch(`${baseUrl}/api/payments/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publicToken: prData.request.publicToken }),
  });
  assert.equal(cancelledOrderRes.status, 400);

  // CSV export works
  const csvRes = await fetch(`${baseUrl}/api/reports/export?type=requests`, { headers: headersA });
  assert.equal(csvRes.status, 200);
  const csvText = await csvRes.text();
  assert.ok(csvText.includes('Request Number,Client Name'));
  assert.ok(csvText.includes('Acme Buyer'));

  // Database persistence across fresh Database instance (simulates server restart)
  const { Database } = await import('../db.ts');
  const reloadedDb = new Database(tempDbFile);
  const persistedUser = reloadedDb.findUserByEmail(emailA);
  assert.ok(persistedUser);
  assert.equal(reloadedDb.getClients(persistedUser.id).length, 1);
  assert.equal(reloadedDb.getPaymentRequests(persistedUser.id).length, 1);
});

test('PayPal Orders API v2 verification logic: order creation, capture verification, amount mismatch rejection, and idempotency (local mock PayPal server)', async () => {
  const prevBase = process.env.PAYPAL_BASE_URL;
  const prevId = process.env.PAYPAL_CLIENT_ID;
  const prevSecret = process.env.PAYPAL_CLIENT_SECRET;

  let captureAmountOverride = '150.00';
  let captureCurrencyOverride = 'USD';
  let captureCount = 0;

  const mockPayPal = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if (req.url === '/v1/oauth2/token' && req.method === 'POST') {
      res.end(JSON.stringify({ access_token: 'mock_sandbox_token' }));
      return;
    }
    if (req.url === '/v2/checkout/orders' && req.method === 'POST') {
      res.end(
        JSON.stringify({
          id: 'MOCK_ORD_12345',
          status: 'CREATED',
          links: [{ rel: 'approve', href: 'https://www.sandbox.paypal.com/checkoutnow?token=MOCK_ORD_12345' }],
        })
      );
      return;
    }
    if (req.url === '/v2/checkout/orders/MOCK_ORD_12345/capture' && req.method === 'POST') {
      captureCount++;
      res.end(
        JSON.stringify({
          id: 'MOCK_ORD_12345',
          status: 'COMPLETED',
          purchase_units: [
            {
              payments: {
                captures: [
                  {
                    id: 'MOCK_CAP_999',
                    status: 'COMPLETED',
                    amount: { currency_code: captureCurrencyOverride, value: captureAmountOverride },
                  },
                ],
              },
            },
          ],
        })
      );
      return;
    }
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not found' }));
  });

  await new Promise<void>(resolve => mockPayPal.listen(0, '127.0.0.1', () => resolve()));
  const addr = mockPayPal.address() as { port: number };
  process.env.PAYPAL_BASE_URL = `http://127.0.0.1:${addr.port}`;
  process.env.PAYPAL_CLIENT_ID = 'mock_client_id';
  process.env.PAYPAL_CLIENT_SECRET = 'mock_client_secret';

  try {
    const uniqueEmail = `pp_${Date.now()}@paypilot.test`;
    const reg = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'PP Tester', email: uniqueEmail, password: 'Password123!' }),
    });
    const regJson = (await reg.json()) as any;
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${regJson.token}` };

    const prRes = await fetch(`${baseUrl}/api/payment-requests`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        clientName: 'PayPal Buyer',
        clientEmail: 'buyer@sandbox.test',
        title: 'Audit Milestone',
        unitPrice: 150,
        currency: 'USD',
      }),
    });
    const prData = (await prRes.json()) as any;

    // 1. Create order
    const orderRes = await fetch(`${baseUrl}/api/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicToken: prData.request.publicToken }),
    });
    assert.equal(orderRes.status, 200);
    const orderData = (await orderRes.json()) as any;
    assert.equal(orderData.orderId, 'MOCK_ORD_12345');

    // 2. Reject mismatched capture amount ($10.00 vs $150.00)
    captureAmountOverride = '10.00';
    const mismatchRes = await fetch(`${baseUrl}/api/payments/capture-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicToken: prData.request.publicToken, orderId: 'MOCK_ORD_12345' }),
    });
    assert.equal(mismatchRes.status, 400);

    // 3. Reject mismatched order ID
    const wrongOrderRes = await fetch(`${baseUrl}/api/payments/capture-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicToken: prData.request.publicToken, orderId: 'WRONG_ORDER' }),
    });
    assert.equal(wrongOrderRes.status, 400);

    // 4. Valid capture succeeds and records Transaction
    captureAmountOverride = '150.00';
    const okCapRes = await fetch(`${baseUrl}/api/payments/capture-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicToken: prData.request.publicToken, orderId: 'MOCK_ORD_12345' }),
    });
    assert.equal(okCapRes.status, 200);
    const okCapJson = (await okCapRes.json()) as any;
    assert.equal(okCapJson.success, true);
    assert.equal(okCapJson.transaction.paypalCaptureId, 'MOCK_CAP_999');

    // 5. Duplicate capture returns idempotent result without calling PayPal capture again
    const countBefore = captureCount;
    const dupRes = await fetch(`${baseUrl}/api/payments/capture-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicToken: prData.request.publicToken, orderId: 'MOCK_ORD_12345' }),
    });
    assert.equal(dupRes.status, 200);
    assert.equal(captureCount, countBefore);
  } finally {
    await new Promise<void>(resolve => mockPayPal.close(() => resolve()));
    process.env.PAYPAL_BASE_URL = prevBase ?? '';
    process.env.PAYPAL_CLIENT_ID = prevId ?? '';
    process.env.PAYPAL_CLIENT_SECRET = prevSecret ?? '';
  }
});
