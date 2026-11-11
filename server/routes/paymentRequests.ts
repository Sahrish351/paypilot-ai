import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.ts';
import { db } from '../db.ts';
import { PaymentRequest, LineItem, PaymentStatus } from '../types.ts';

const router = Router();

// Public endpoint for customer checkout
router.get('/public/:token', (req: Request, res: Response) => {
  const { token } = req.params;
  const request = db.getPaymentRequestByPublicToken(token);

  if (!request) {
    res.status(404).json({ error: 'Payment request not found or link has expired.' });
    return;
  }

  const owner = db.findUserById(request.ownerId);

  res.json({
    id: request.id,
    requestNumber: request.requestNumber,
    title: request.title,
    description: request.description,
    clientName: request.clientName,
    clientEmail: request.clientEmail,
    lineItems: request.lineItems,
    subtotal: request.subtotal,
    totalAmount: request.totalAmount,
    currency: request.currency,
    dueDate: request.dueDate,
    status: request.status,
    paypalOrderId: request.paypalOrderId,
    createdAt: request.createdAt,
    business: {
      name: owner?.businessName || 'PayPilot Business',
      type: owner?.businessType || 'Service Provider',
      description: owner?.businessDescription || '',
    },
  });
});

// Authenticated endpoints
router.get('/', authMiddleware, (req: Request, res: Response) => {
  const list = db.getPaymentRequests(req.user!.id);
  res.json({ requests: list });
});

router.post('/', authMiddleware, (req: Request, res: Response) => {
  const {
    clientName,
    clientEmail,
    title,
    description,
    lineItems,
    unitPrice,
    quantity,
    dueDate,
    currency,
    status,
    notes,
  } = req.body;

  if (!clientName || typeof clientName !== 'string' || !clientName.trim()) {
    res.status(400).json({ error: 'Client name is required.' });
    return;
  }

  let items: LineItem[] = [];
  let calculatedTotal = 0;

  if (Array.isArray(lineItems) && lineItems.length > 0) {
    items = lineItems.map((li: any, idx: number) => {
      const q = Math.max(1, Number(li.quantity) || 1);
      const p = Number(li.unitPrice) || 0;
      const lineTotal = Number((q * p).toFixed(2));
      calculatedTotal += lineTotal;
      return {
        id: `li_${Date.now()}_${idx}`,
        name: String(li.name || title || 'Professional Service').trim(),
        description: String(li.description || description || '').trim(),
        quantity: q,
        unitPrice: p,
        lineTotal,
      };
    });
  } else {
    const q = Math.max(1, Number(quantity) || 1);
    const p = Number(unitPrice) || 0;
    calculatedTotal = Number((q * p).toFixed(2));
    items = [
      {
        id: `li_${Date.now()}_0`,
        name: String(title || 'Professional Services').trim(),
        description: String(description || 'Deliverables as agreed upon with client.').trim(),
        quantity: q,
        unitPrice: p,
        lineTotal: calculatedTotal,
      },
    ];
  }

  if (!Number.isFinite(calculatedTotal) || calculatedTotal <= 0) {
    res.status(400).json({ error: 'Total amount must be greater than 0.' });
    return;
  }

  const trimmedName = clientName.trim();
  let client = db.getClients(req.user!.id).find(c => c.name.toLowerCase() === trimmedName.toLowerCase());
  if (!client) {
    client = db.createClient({
      id: `cli_${Date.now()}`,
      ownerId: req.user!.id,
      name: trimmedName,
      email: clientEmail?.trim() || `${trimmedName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      company: trimmedName,
      totalRequests: 0,
      totalPaid: 0,
      pendingAmount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } else if (clientEmail && clientEmail.trim() && client.email !== clientEmail.trim()) {
    db.updateClient(client.id, req.user!.id, { email: clientEmail.trim() });
  }

  const initialStatus: PaymentStatus = status === 'DRAFT' ? 'DRAFT' : 'PENDING';
  const randomHash = Math.random().toString(36).substring(2, 10);
  const newRequest: PaymentRequest = {
    id: `pr_${Date.now()}`,
    ownerId: req.user!.id,
    clientId: client.id,
    clientName: trimmedName,
    clientEmail: clientEmail?.trim() || client.email,
    requestNumber: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
    title: String(title || 'Professional Services Milestone').trim(),
    description: String(description || 'Deliverables as agreed upon with client.').trim(),
    lineItems: items,
    subtotal: calculatedTotal,
    totalAmount: calculatedTotal,
    currency: currency || req.user!.defaultCurrency || 'USD',
    dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    status: initialStatus,
    publicToken: `pay_${randomHash}`,
    notes: notes ? String(notes).trim() : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const saved = db.createPaymentRequest(newRequest);
  res.status(201).json({
    request: saved,
    paymentLink: `${process.env.APP_URL || 'http://localhost:3000'}/pay/${saved.publicToken}`,
    message: 'Payment request created successfully.',
  });
});

router.get('/:id', authMiddleware, (req: Request, res: Response) => {
  const reqItem = db.getPaymentRequestById(req.params.id, req.user!.id);
  if (!reqItem) {
    res.status(404).json({ error: 'Payment request not found.' });
    return;
  }
  res.json({ request: reqItem });
});

router.patch('/:id', authMiddleware, (req: Request, res: Response) => {
  const existing = db.getPaymentRequestById(req.params.id, req.user!.id);
  if (!existing) {
    res.status(404).json({ error: 'Payment request not found.' });
    return;
  }
  if (existing.status === 'COMPLETED') {
    res.status(400).json({ error: 'Completed payment requests cannot be modified.' });
    return;
  }

  const { title, description, dueDate, status, clientEmail, notes } = req.body;
  const updates: Partial<PaymentRequest> = {};
  if (typeof title === 'string' && title.trim()) updates.title = title.trim();
  if (typeof description === 'string') updates.description = description.trim();
  if (typeof dueDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dueDate)) updates.dueDate = dueDate;
  if (typeof clientEmail === 'string') updates.clientEmail = clientEmail.trim();
  if (typeof notes === 'string') updates.notes = notes.trim();
  if (status === 'PENDING' && existing.status === 'DRAFT') updates.status = 'PENDING';

  const updated = db.updatePaymentRequest(req.params.id, req.user!.id, updates);
  res.json({ request: updated, message: 'Payment request updated successfully.' });
});

router.post('/:id/cancel', authMiddleware, (req: Request, res: Response) => {
  const cancelled = db.cancelPaymentRequest(req.params.id, req.user!.id);
  if (!cancelled) {
    res.status(400).json({ error: 'Cannot cancel request; it may already be completed or does not exist.' });
    return;
  }
  res.json({ request: cancelled, message: 'Payment request cancelled.' });
});

router.delete('/:id', authMiddleware, (req: Request, res: Response) => {
  const ok = db.deletePaymentRequest(req.params.id, req.user!.id);
  if (!ok) {
    res.status(400).json({ error: 'Only draft or cancelled payment requests can be deleted.' });
    return;
  }
  res.json({ message: 'Payment request removed.' });
});

export default router;
