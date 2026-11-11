import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.ts';
import { db } from '../db.ts';

const router = Router();

router.get('/stats', authMiddleware, (req: Request, res: Response) => {
  const userId = req.user!.id;
  const transactions = db.getTransactions(userId);
  const requests = db.getPaymentRequests(userId);
  const clients = db.getClients(userId);

  const completedTxns = transactions.filter(t => t.status === 'Completed');
  const totalRevenue = Number(completedTxns.reduce((sum, t) => sum + t.amount, 0).toFixed(2));

  const pendingRequests = requests.filter(r => r.status === 'PENDING' || r.status === 'OVERDUE' || r.status === 'APPROVED');
  const pendingPayments = Number(pendingRequests.reduce((sum, r) => sum + r.totalAmount, 0).toFixed(2));
  const completedRequestsCount = requests.filter(r => r.status === 'COMPLETED').length;
  const overdueRequestsCount = requests.filter(r => r.status === 'OVERDUE').length;

  res.json({
    totalRevenue,
    totalTransactions: completedTxns.length,
    activeClients: clients.length,
    pendingPayments,
    completedRequests: completedRequestsCount,
    overdueRequests: overdueRequestsCount,
    isDemoData: Boolean(req.user?.isDemoAccount),
  });
});

router.get('/revenue', authMiddleware, (req: Request, res: Response) => {
  const userId = req.user!.id;
  const range = (req.query.range as string) || '30d';
  const transactions = db.getTransactions(userId).filter(t => t.status === 'Completed');

  // Group completed transactions chronologically for real timeline chart
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.capturedAt || a.createdAt).getTime() - new Date(b.capturedAt || b.createdAt).getTime()
  );

  let cumulative = 0;
  const timeline = sorted.map(t => {
    cumulative += t.amount;
    const d = new Date(t.capturedAt || t.createdAt);
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: t.amount,
      value: Number(cumulative.toFixed(2)),
    };
  });

  const total = Number(sorted.reduce((sum, t) => sum + t.amount, 0).toFixed(2));

  res.json({
    range,
    total,
    data: timeline,
    isDemoData: Boolean(req.user?.isDemoAccount),
  });
});

router.get('/recent-transactions', authMiddleware, (req: Request, res: Response) => {
  const transactions = db.getTransactions(req.user!.id).slice(0, 8);
  res.json({ transactions });
});

router.get('/notifications', authMiddleware, (req: Request, res: Response) => {
  const notifications = db.getNotifications(req.user!.id);
  res.json({ notifications });
});

router.post('/notifications/:id/read', authMiddleware, (req: Request, res: Response) => {
  db.markNotificationAsRead(req.params.id, req.user!.id);
  res.json({ success: true });
});

router.post('/notifications/read-all', authMiddleware, (req: Request, res: Response) => {
  db.markAllNotificationsAsRead(req.user!.id);
  res.json({ success: true });
});

export default router;
