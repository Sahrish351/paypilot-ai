import { db } from '../db.ts';
import { PaymentRequest, Transaction } from '../types.ts';

function getPayPalConfig() {
  return {
    baseUrl: process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com',
    clientId: (process.env.PAYPAL_CLIENT_ID || '').trim(),
    clientSecret: (process.env.PAYPAL_CLIENT_SECRET || '').trim(),
  };
}

export function isPayPalConfigured(): boolean {
  const { clientId, clientSecret } = getPayPalConfig();
  return Boolean(
    clientId &&
      clientSecret &&
      clientId !== 'YOUR_PAYPAL_CLIENT_ID' &&
      clientSecret !== 'YOUR_PAYPAL_CLIENT_SECRET'
  );
}

export function getPublicPayPalConfig() {
  const { clientId } = getPayPalConfig();
  const configured = isPayPalConfigured();
  return {
    configured,
    clientId: configured ? clientId : null,
    mode: 'sandbox' as const,
  };
}

export class PayPalConfigError extends Error {
  public readonly statusCode = 503;
  public readonly requiredEnv = ['PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET'];

  constructor(message?: string) {
    super(
      message ||
        'PayPal Sandbox credentials (PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET) are not configured on the backend server.'
    );
    this.name = 'PayPalConfigError';
  }
}

export interface CreateOrderResult {
  orderId: string;
  status: string;
  isSandboxLive: boolean;
  approvalUrl?: string;
}

export interface CaptureOrderResult {
  success: boolean;
  transaction: Transaction;
  message: string;
}

async function getPayPalAccessToken(): Promise<string> {
  if (!isPayPalConfigured()) {
    throw new PayPalConfigError();
  }

  const { baseUrl, clientId, clientSecret } = getPayPalConfig();
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`PayPal Sandbox OAuth failed (${response.status}): ${errBody}`);
  }

  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error('PayPal Sandbox OAuth response did not include an access_token.');
  }
  return data.access_token;
}

/**
 * Create a PayPal Sandbox Order via Orders API v2.
 * Never fabricates orders when PayPal credentials are missing.
 */
export async function createPayPalOrder(paymentRequest: PaymentRequest): Promise<CreateOrderResult> {
  if (paymentRequest.status === 'COMPLETED' || paymentRequest.status === 'CANCELLED') {
    throw new Error(`Cannot create PayPal order for a ${paymentRequest.status.toLowerCase()} payment request.`);
  }

  const token = await getPayPalAccessToken();
  const { baseUrl } = getPayPalConfig();
  const currency = paymentRequest.currency || 'USD';
  const appUrl = process.env.APP_URL || 'http://localhost:3000';

  const orderPayload = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: paymentRequest.id,
        description: (paymentRequest.title || paymentRequest.description).slice(0, 127),
        custom_id: paymentRequest.id,
        amount: {
          currency_code: currency,
          value: paymentRequest.totalAmount.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: currency,
              value: paymentRequest.totalAmount.toFixed(2),
            },
          },
        },
        items: paymentRequest.lineItems.map(item => ({
          name: item.name.slice(0, 127),
          description: (item.description || '').slice(0, 127),
          quantity: String(item.quantity),
          unit_amount: {
            currency_code: currency,
            value: item.unitPrice.toFixed(2),
          },
        })),
      },
    ],
    application_context: {
      brand_name: 'PayPilot AI (Sandbox)',
      landing_page: 'NO_PREFERENCE',
      user_action: 'PAY_NOW',
      return_url: `${appUrl}/pay/${paymentRequest.publicToken}?paypalStatus=success`,
      cancel_url: `${appUrl}/pay/${paymentRequest.publicToken}?paypalStatus=cancelled`,
    },
  };

  const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'PayPal-Request-Id': `PAYPILOT_CREATE_${paymentRequest.id}`,
    },
    body: JSON.stringify(orderPayload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`PayPal Orders API v2 create failed (${response.status}): ${errText}`);
  }

  const orderData = (await response.json()) as {
    id: string;
    status: string;
    links?: Array<{ rel: string; href: string }>;
  };

  const approvalUrl = orderData.links?.find(l => l.rel === 'approve')?.href;

  db.updatePaymentRequest(paymentRequest.id, paymentRequest.ownerId, {
    paypalOrderId: orderData.id,
  });

  return {
    orderId: orderData.id,
    status: orderData.status,
    isSandboxLive: true,
    approvalUrl,
  };
}

/**
 * Capture and verify an approved PayPal Sandbox Order.
 * Verifies status === 'COMPLETED', currency, and captured amount match the stored request.
 */
export async function capturePayPalOrder(
  paymentRequest: PaymentRequest,
  paypalOrderId: string
): Promise<CaptureOrderResult> {
  // Idempotency check
  if (paymentRequest.status === 'COMPLETED') {
    const existingTxn = db
      .getTransactions(paymentRequest.ownerId)
      .find(t => t.paymentRequestId === paymentRequest.id && t.status === 'Completed');
    if (existingTxn) {
      return {
        success: true,
        transaction: existingTxn,
        message: 'This payment has already been verified and completed.',
      };
    }
  }

  if (paymentRequest.status === 'CANCELLED') {
    throw new Error('Cannot capture a cancelled payment request.');
  }

  if (paymentRequest.paypalOrderId && paymentRequest.paypalOrderId !== paypalOrderId) {
    throw new Error('Order ID mismatch: provided order does not belong to this payment request.');
  }

  const token = await getPayPalAccessToken();
  const { baseUrl } = getPayPalConfig();

  const response = await fetch(`${baseUrl}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'PayPal-Request-Id': `PAYPILOT_CAPTURE_${paymentRequest.id}_${paypalOrderId}`,
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`PayPal capture failed (${response.status}): ${errText}`);
  }

  const captureData = (await response.json()) as {
    id: string;
    status: string;
    purchase_units?: Array<{
      reference_id?: string;
      payments?: {
        captures?: Array<{
          id: string;
          status: string;
          amount?: { currency_code: string; value: string };
        }>;
      };
    }>;
  };

  const captureObj = captureData.purchase_units?.[0]?.payments?.captures?.[0];
  if (!captureObj || captureData.status !== 'COMPLETED' || captureObj.status !== 'COMPLETED') {
    throw new Error(
      `PayPal order is not completed (orderStatus=${captureData.status}, captureStatus=${captureObj?.status || 'NONE'}).`
    );
  }

  const capturedCurrency = captureObj.amount?.currency_code;
  const capturedValue = parseFloat(captureObj.amount?.value || '0');
  const expectedCurrency = paymentRequest.currency || 'USD';

  if (
    capturedCurrency !== expectedCurrency ||
    Math.abs(capturedValue - paymentRequest.totalAmount) > 0.01
  ) {
    throw new Error(
      `Captured amount verification failed: expected ${paymentRequest.totalAmount.toFixed(2)} ${expectedCurrency}, received ${capturedValue.toFixed(2)} ${capturedCurrency}.`
    );
  }

  const now = new Date().toISOString();
  const transaction: Transaction = {
    id: `txn_${Date.now()}`,
    ownerId: paymentRequest.ownerId,
    paymentRequestId: paymentRequest.id,
    paypalOrderId,
    paypalCaptureId: captureObj.id,
    clientName: paymentRequest.clientName,
    clientEmail: paymentRequest.clientEmail,
    description: paymentRequest.title || paymentRequest.description,
    amount: capturedValue,
    currency: capturedCurrency,
    status: 'Completed',
    type: 'Payment',
    captureReference: `PAYPAL_SANDBOX_CAPTURE_${captureObj.id}`,
    environment: 'sandbox',
    createdAt: now,
    capturedAt: now,
  };

  const savedTxn = db.recordTransaction(transaction);

  return {
    success: true,
    transaction: savedTxn,
    message: 'Payment verified and captured via PayPal Sandbox Orders API v2.',
  };
}
