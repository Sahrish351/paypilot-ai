import { Router, Request, Response } from 'express';
import { authMiddleware, extractSessionToken } from '../middleware/auth.ts';
import { db } from '../db.ts';
import { verifySessionToken } from '../utils/crypto.ts';
import {
  createPayPalOrder,
  capturePayPalOrder,
  getPublicPayPalConfig,
  PayPalConfigError,
} from '../services/paypal.ts';

const router = Router();

// Public endpoint so checkout & settings can inspect PayPal Sandbox readiness
router.get('/config', (_req: Request, res: Response) => {
  const paypal = getPublicPayPalConfig();
  const geminiConfigured = Boolean(
    process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
  );
  res.json({
    paypal,
    geminiConfigured,
  });
});

// Create PayPal Sandbox order for a payment request (public customer checkout or authenticated owner)
router.post('/create-order', async (req: Request, res: Response) => {
  try {
    const { paymentRequestId, publicToken } = req.body;
    let paymentRequest = null;

    if (publicToken && typeof publicToken === 'string') {
      paymentRequest = db.getPaymentRequestByPublicToken(publicToken);
    } else if (paymentRequestId && typeof paymentRequestId === 'string') {
      const token = extractSessionToken(req);
      const session = token ? verifySessionToken(token) : null;
      if (!session) {
        res.status(401).json({ error: 'Authentication or valid publicToken is required.' });
        return;
      }
      paymentRequest = db.getPaymentRequestById(paymentRequestId, session.userId);
    }

    if (!paymentRequest) {
      res.status(404).json({ error: 'Payment request not found.' });
      return;
    }

    if (paymentRequest.status === 'COMPLETED') {
      res.status(400).json({ error: 'This payment has already been completed.' });
      return;
    }

    if (paymentRequest.status === 'CANCELLED' || paymentRequest.status === 'DRAFT') {
      res.status(400).json({ error: `Cannot process payment for a ${paymentRequest.status.toLowerCase()} request.` });
      return;
    }

    const orderResult = await createPayPalOrder(paymentRequest);
    res.json(orderResult);
  } catch (err: any) {
    if (err instanceof PayPalConfigError) {
      res.status(503).json({
        configured: false,
        error: err.message,
        requiredEnv: err.requiredEnv,
      });
      return;
    }
    console.error('[Create Order Route Error]:', err);
    res.status(500).json({ error: err.message || 'Failed to create PayPal order.' });
  }
});

// Capture and verify an approved PayPal Sandbox order
router.post('/capture-order', async (req: Request, res: Response) => {
  try {
    const { paymentRequestId, publicToken, orderId } = req.body;
    if (!orderId || typeof orderId !== 'string') {
      res.status(400).json({ error: 'PayPal Order ID is required for capture verification.' });
      return;
    }

    let paymentRequest = null;
    if (publicToken && typeof publicToken === 'string') {
      paymentRequest = db.getPaymentRequestByPublicToken(publicToken);
    } else if (paymentRequestId && typeof paymentRequestId === 'string') {
      paymentRequest = db.getPaymentRequestByOrderId(orderId);
      if (paymentRequest && paymentRequest.id !== paymentRequestId) {
        paymentRequest = null;
      }
    } else {
      paymentRequest = db.getPaymentRequestByOrderId(orderId);
    }

    if (!paymentRequest) {
      res.status(404).json({ error: 'Matching payment request not found for verification.' });
      return;
    }

    const result = await capturePayPalOrder(paymentRequest, orderId);
    res.json(result);
  } catch (err: any) {
    if (err instanceof PayPalConfigError) {
      res.status(503).json({
        configured: false,
        error: err.message,
        requiredEnv: err.requiredEnv,
      });
      return;
    }
    console.error('[Capture Order Route Error]:', err);
    res.status(400).json({ error: err.message || 'Failed to capture and verify PayPal order.' });
  }
});

// Transaction history for authenticated user
router.get('/', authMiddleware, (req: Request, res: Response) => {
  const transactions = db.getTransactions(req.user!.id);
  res.json({ transactions });
});

router.get('/:id', authMiddleware, (req: Request, res: Response) => {
  const txn = db.getTransactionById(req.params.id, req.user!.id);
  if (!txn) {
    res.status(404).json({ error: 'Transaction record not found.' });
    return;
  }
  res.json({ transaction: txn });
});

export default router;
