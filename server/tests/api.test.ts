import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const tempDbFile = path.join(os.tmpdir(), `paypilot_test_${Date.now()}.json`);
process.env.NODE_ENV = 'test';
process.env.PAYPILOT_DB_FILE = tempDbFile;

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

test('GET /api/health and /api/payments/config return service readiness', async () => {
  const healthRes = await fetch(`${baseUrl}/api/health`);
  assert.equal(healthRes.status, 200);
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
  const endpoints = ['/api/dashboard/stats', '/api/clients', '/api/payment-requests', '/api/payments'];
  for (const ep of endpoints) {
    const res = await fetch(`${baseUrl}${ep}`);
    assert.equal(res.status, 401, `Expected 401 for unauthenticated ${ep}`);
  }
});

test('Authentication: login rejects bad password and succeeds for demo account', async () => {
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
});

test('Registration, tenant isolation, client CRUD, AI parsing, and payment requests lifecycle', async () => {
  const uniqueEmail = `test_${Date.now()}@paypilot.test`;

  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Freelancer',
      email: uniqueEmail,
      password: 'Password123!',
    }),
  });
  assert.equal(regRes.status, 201);
  const regData = (await regRes.json()) as any;
  const token = regData.token as string;
  assert.ok(token);

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // New user starts with isolated empty records
  const clientsRes = await fetch(`${baseUrl}/api/clients`, { headers: authHeaders });
  assert.equal(clientsRes.status, 200);
  const clientsJson = (await clientsRes.json()) as any;
  assert.equal(clientsJson.clients.length, 0);

  // Create client
  const createCliRes = await fetch(`${baseUrl}/api/clients`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Acme Buyer',
      email: 'buyer@acme.test',
      company: 'Acme Corp',
    }),
  });
  assert.equal(createCliRes.status, 201);
  const cliData = (await createCliRes.json()) as any;
  assert.equal(cliData.client.name, 'Acme Buyer');

  // AI payment proposal extraction
  const aiRes = await fetch(`${baseUrl}/api/ai/chat`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      message: 'Create a payment request for John for $250 for website development.',
    }),
  });
  assert.equal(aiRes.status, 200);
  const aiJson = (await aiRes.json()) as any;
  assert.ok(aiJson.proposal);
  assert.equal(aiJson.proposal.unit_price, 250);
  assert.equal(aiJson.proposal.total_amount, 250);
  assert.ok(Array.isArray(aiJson.proposal.missing_fields));

  // Create payment request
  const prRes = await fetch(`${baseUrl}/api/payment-requests`, {
    method: 'POST',
    headers: authHeaders,
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
  assert.equal(prData.request.totalAmount, 250);
  assert.equal(prData.request.status, 'PENDING');

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

  // CSV export works
  const csvRes = await fetch(`${baseUrl}/api/reports/export?type=requests`, {
    headers: authHeaders,
  });
  assert.equal(csvRes.status, 200);
  const csvText = await csvRes.text();
  assert.ok(csvText.includes('Request Number,Client Name'));
  assert.ok(csvText.includes('Acme Buyer'));
});
