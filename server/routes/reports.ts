import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.ts';
import { db } from '../db.ts';

const router = Router();

router.get('/revenue', authMiddleware, (req: Request, res: Response) => {
  const userId = req.user!.id;
  const transactions = db.getTransactions(userId);
  const requests = db.getPaymentRequests(userId);
  const completed = transactions.filter(t => t.status === 'Completed');
  const totalRevenue = Number(completed.reduce((sum, t) => sum + t.amount, 0).toFixed(2));
  const pendingTotal = Number(
    requests
      .filter(r => r.status === 'PENDING' || r.status === 'OVERDUE')
      .reduce((sum, r) => sum + r.totalAmount, 0)
      .toFixed(2)
  );

  res.json({
    totalRevenue,
    completedCount: completed.length,
    averageTicket: completed.length > 0 ? Number((totalRevenue / completed.length).toFixed(2)) : 0,
    pendingTotal,
    totalRequests: requests.length,
  });
});

router.get('/export', authMiddleware, (req: Request, res: Response) => {
  const type = (req.query.type as string) || 'transactions';
  const userId = req.user!.id;

  if (type === 'requests') {
    const requests = db.getPaymentRequests(userId);
    const rows = [
      ['Request Number', 'Client Name', 'Client Email', 'Title', 'Amount', 'Currency', 'Status', 'Due Date', 'Created At'],
      ...requests.map(r => [
        r.requestNumber,
        `"${r.clientName.replace(/"/g, '""')}"`,
        `"${(r.clientEmail || '').replace(/"/g, '""')}"`,
        `"${r.title.replace(/"/g, '""')}"`,
        r.totalAmount.toFixed(2),
        r.currency,
        r.status,
        r.dueDate,
        r.createdAt,
      ]),
    ];
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="paypilot_payment_requests.csv"');
    res.send(rows.map(r => r.join(',')).join('\n'));
    return;
  }

  if (type === 'clients') {
    const clients = db.getClients(userId);
    const rows = [
      ['Client Name', 'Company', 'Email', 'Total Requests', 'Total Paid', 'Pending Amount', 'Last Payment Date'],
      ...clients.map(c => [
        `"${c.name.replace(/"/g, '""')}"`,
        `"${c.company.replace(/"/g, '""')}"`,
        `"${c.email.replace(/"/g, '""')}"`,
        String(c.totalRequests),
        c.totalPaid.toFixed(2),
        c.pendingAmount.toFixed(2),
        c.lastPaymentDate || '',
      ]),
    ];
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="paypilot_clients_report.csv"');
    res.send(rows.map(r => r.join(',')).join('\n'));
    return;
  }

  const transactions = db.getTransactions(userId);
  const rows = [
    ['Transaction ID', 'PayPal Order ID', 'PayPal Capture ID', 'Client Name', 'Description', 'Amount', 'Currency', 'Status', 'Date'],
    ...transactions.map(t => [
      t.id,
      t.paypalOrderId,
      t.paypalCaptureId,
      `"${t.clientName.replace(/"/g, '""')}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount.toFixed(2),
      t.currency,
      t.status,
      t.capturedAt || t.createdAt,
    ]),
  ];

  const csv = rows.map(r => r.join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="paypilot_transactions_report.csv"');
  res.send(csv);
});

export default router;
