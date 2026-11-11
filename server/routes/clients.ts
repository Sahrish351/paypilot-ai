import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.ts';
import { db } from '../db.ts';

const router = Router();

router.get('/', authMiddleware, (req: Request, res: Response) => {
  const clients = db.getClients(req.user!.id);
  res.json({ clients });
});

router.post('/', authMiddleware, (req: Request, res: Response) => {
  const { name, email, company, notes } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ error: 'Client name is required.' });
    return;
  }

  const trimmedName = name.trim();
  const client = db.createClient({
    id: `cli_${Date.now()}`,
    ownerId: req.user!.id,
    name: trimmedName,
    email: email?.trim() || `${trimmedName.toLowerCase().replace(/\s+/g, '')}@example.com`,
    company: company?.trim() || trimmedName,
    notes: notes?.trim() || '',
    totalRequests: 0,
    totalPaid: 0,
    pendingAmount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  res.status(201).json({ client, message: 'Client created successfully.' });
});

router.get('/:id', authMiddleware, (req: Request, res: Response) => {
  const client = db.getClientById(req.params.id, req.user!.id);
  if (!client) {
    res.status(404).json({ error: 'Client not found.' });
    return;
  }
  const requests = db.getPaymentRequests(req.user!.id).filter(r => r.clientId === client.id);
  const transactions = db
    .getTransactions(req.user!.id)
    .filter(t => requests.some(r => r.id === t.paymentRequestId) || t.clientEmail === client.email);
  res.json({ client, requests, transactions });
});

router.patch('/:id', authMiddleware, (req: Request, res: Response) => {
  const { name, email, company, notes } = req.body;
  const updates: Record<string, string> = {};
  if (typeof name === 'string' && name.trim()) updates.name = name.trim();
  if (typeof email === 'string' && email.trim()) updates.email = email.trim();
  if (typeof company === 'string') updates.company = company.trim();
  if (typeof notes === 'string') updates.notes = notes.trim();

  const updated = db.updateClient(req.params.id, req.user!.id, updates);
  if (!updated) {
    res.status(404).json({ error: 'Client not found.' });
    return;
  }
  res.json({ client: updated, message: 'Client updated successfully.' });
});

router.delete('/:id', authMiddleware, (req: Request, res: Response) => {
  const ok = db.deleteClient(req.params.id, req.user!.id);
  if (!ok) {
    res.status(400).json({ error: 'Cannot delete client with active payment requests. Cancel them first.' });
    return;
  }
  res.json({ message: 'Client removed successfully.' });
});

export default router;
