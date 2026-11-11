import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.ts';
import {
  processAIChat,
  generateAIInvoiceDescription,
  generateAIReminder,
  generateAIRevenueInsights,
  isGeminiConfigured,
} from '../services/gemini.ts';
import { db } from '../db.ts';

const router = Router();

router.post('/chat', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { message, activeProposal } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'Message text is required.' });
      return;
    }

    const userId = req.user!.id;
    const history = db.getChatHistory(userId).slice(-6).map(m => ({
      role: (m.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: m.content,
    }));

    db.appendChatMessage(userId, {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString(),
    });

    const aiResult = await processAIChat(userId, message.trim(), history, activeProposal || null);

    const savedMsg = db.appendChatMessage(userId, {
      id: `msg_a_${Date.now()}`,
      role: 'assistant',
      content: aiResult.message,
      aiMode: aiResult.aiMode,
      proposal: aiResult.proposal,
      timestamp: new Date().toISOString(),
    });

    res.json({
      message: savedMsg.content,
      aiMode: aiResult.aiMode,
      geminiConfigured: isGeminiConfigured(),
      proposal: savedMsg.proposal,
      suggested_action: aiResult.suggested_action,
      timestamp: savedMsg.timestamp,
    });
  } catch (err: any) {
    console.error('[AI Chat Route Error]:', err);
    res.status(500).json({ error: 'Failed to process AI chat message.', details: err.message });
  }
});

router.get('/history', authMiddleware, (req: Request, res: Response) => {
  const history = db.getChatHistory(req.user!.id);
  res.json({
    messages: history,
    geminiConfigured: isGeminiConfigured(),
  });
});

router.post('/clear-history', authMiddleware, (req: Request, res: Response) => {
  db.clearChatHistory(req.user!.id);
  res.json({ message: 'Chat history cleared.', messages: db.getChatHistory(req.user!.id) });
});

router.post('/generate-description', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { serviceName, clientName } = req.body;
    const description = await generateAIInvoiceDescription(serviceName || 'Consulting', clientName || 'Client');
    res.json({ description });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate description.' });
  }
});

router.post('/generate-reminder', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { clientName, amount, dueDate, tone } = req.body;
    const reminder = await generateAIReminder(
      clientName || 'Client',
      Number(amount) || 0,
      dueDate || 'in 7 days',
      tone || 'friendly'
    );
    res.json({ reminder });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate reminder.' });
  }
});

router.post('/insights', authMiddleware, async (req: Request, res: Response) => {
  try {
    const insights = await generateAIRevenueInsights(req.user!.id);
    res.json(insights);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate revenue insights.' });
  }
});

export default router;
