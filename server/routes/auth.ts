import crypto from 'crypto';
import { Router, Request, Response } from 'express';
import { db } from '../db.ts';
import { authMiddleware, SESSION_COOKIE_NAME } from '../middleware/auth.ts';
import { hashPassword, signSessionToken, verifyPassword } from '../utils/crypto.ts';
import { User } from '../types.ts';

const router = Router();

function sanitizeUser(user: User) {
  const { passwordHash, passwordResetToken, passwordResetExpires, ...safeUser } = user;
  return safeUser;
}

function setSessionCookie(res: Response, token: string) {
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

router.post('/register', (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    res.status(400).json({ error: 'Please enter your full name (at least 2 characters).' });
    return;
  }
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    res.status(400).json({ error: 'Please enter a valid email address.' });
    return;
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = db.findUserByEmail(normalizedEmail);
  if (existing) {
    res.status(409).json({ error: 'An account with this email already exists.' });
    return;
  }

  const now = new Date().toISOString();
  const newUser = db.createUser({
    id: `usr_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    businessName: `${name.trim()}'s Studio`,
    businessType: 'Freelancer',
    businessDescription: 'Independent professional providing client services.',
    defaultCurrency: 'USD',
    onboardingCompleted: false,
    isDemoAccount: false,
    notificationPreferences: {
      emailReceipts: true,
      overdueReminders: true,
      aiInsightsDigest: true,
      paymentAlerts: true,
    },
    createdAt: now,
    updatedAt: now,
  });

  const token = signSessionToken(newUser.id, newUser.email);
  setSessionCookie(res, token);

  res.status(201).json({
    user: sanitizeUser(newUser),
    token,
    message: 'Account created successfully.',
  });
});

router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const user = db.findUserByEmail(String(email));
  if (!user || !verifyPassword(String(password), user.passwordHash, user.isDemoAccount)) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  const token = signSessionToken(user.id, user.email);
  setSessionCookie(res, token);

  res.json({
    user: sanitizeUser(user),
    token,
    message: 'Signed in successfully.',
  });
});

router.post('/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    res.status(400).json({ error: 'Email address is required.' });
    return;
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    // Do not leak user existence, return consistent response
    res.json({
      message: 'If an account matches that email, password reset instructions have been prepared.',
    });
    return;
  }

  const resetToken = crypto.randomBytes(24).toString('hex');
  const expires = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  db.updateUser(user.id, {
    passwordResetToken: resetToken,
    passwordResetExpires: expires,
  });

  // Note: No SMTP provider is configured in this hackathon environment; return resetToken only in non-production for testing
  res.json({
    message: 'Password reset token generated. (Email delivery is disabled in local hackathon mode; use the reset form below.)',
    ...(process.env.NODE_ENV !== 'production' ? { devResetToken: resetToken } : {}),
  });
});

router.post('/reset-password', (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword || String(newPassword).length < 8) {
    res.status(400).json({ error: 'Valid reset token and a new password (min 8 chars) are required.' });
    return;
  }

  const user = db.findUserByResetToken(String(token));
  if (!user || !user.passwordResetExpires || new Date(user.passwordResetExpires).getTime() < Date.now()) {
    res.status(400).json({ error: 'Reset token is invalid or has expired.' });
    return;
  }

  db.updateUser(user.id, {
    passwordHash: hashPassword(String(newPassword)),
    passwordResetToken: undefined,
    passwordResetExpires: undefined,
  });

  res.json({ message: 'Password updated successfully. You can now sign in.' });
});

router.get('/me', authMiddleware, (req: Request, res: Response) => {
  res.json({ user: sanitizeUser(req.user!) });
});

router.patch('/profile', authMiddleware, (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const allowedUpdates: Partial<User> = {};
  const {
    name,
    businessName,
    businessType,
    businessDescription,
    defaultCurrency,
    onboardingCompleted,
    notificationPreferences,
  } = req.body;

  if (typeof name === 'string' && name.trim()) allowedUpdates.name = name.trim();
  if (typeof businessName === 'string' && businessName.trim()) allowedUpdates.businessName = businessName.trim();
  if (typeof businessType === 'string') allowedUpdates.businessType = businessType as User['businessType'];
  if (typeof businessDescription === 'string') allowedUpdates.businessDescription = businessDescription.trim();
  if (typeof defaultCurrency === 'string' && ['USD', 'EUR', 'GBP', 'CAD', 'AUD'].includes(defaultCurrency)) {
    allowedUpdates.defaultCurrency = defaultCurrency;
  }
  if (typeof onboardingCompleted === 'boolean') allowedUpdates.onboardingCompleted = onboardingCompleted;
  if (notificationPreferences && typeof notificationPreferences === 'object') {
    allowedUpdates.notificationPreferences = {
      emailReceipts: Boolean(notificationPreferences.emailReceipts),
      overdueReminders: Boolean(notificationPreferences.overdueReminders),
      aiInsightsDigest: Boolean(notificationPreferences.aiInsightsDigest),
      paymentAlerts: Boolean(notificationPreferences.paymentAlerts),
    };
  }

  const updated = db.updateUser(req.user.id, allowedUpdates);
  res.json({ user: updated ? sanitizeUser(updated) : null, message: 'Profile updated successfully.' });
});

router.post('/change-password', authMiddleware, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || String(newPassword).length < 8) {
    res.status(400).json({ error: 'Current password and a new password (min 8 chars) are required.' });
    return;
  }

  const user = req.user!;
  if (!verifyPassword(String(currentPassword), user.passwordHash, user.isDemoAccount)) {
    res.status(400).json({ error: 'Current password is incorrect.' });
    return;
  }

  db.updateUser(user.id, { passwordHash: hashPassword(String(newPassword)) });
  res.json({ message: 'Password changed successfully.' });
});

router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
  res.json({ message: 'Signed out successfully.' });
});

export default router;
