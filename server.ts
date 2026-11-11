import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import authRoutes from './server/routes/auth.ts';
import aiRoutes from './server/routes/ai.ts';
import paymentRequestsRoutes from './server/routes/paymentRequests.ts';
import paymentsRoutes from './server/routes/payments.ts';
import clientsRoutes from './server/routes/clients.ts';
import dashboardRoutes from './server/routes/dashboard.ts';
import reportsRoutes from './server/routes/reports.ts';
import { isGeminiConfigured } from './server/services/gemini.ts';
import { isPayPalConfigured } from './server/services/paypal.ts';

dotenv.config({ path: ['.env.local', '.env'], quiet: true });

// Lightweight sliding-window rate limiter (no external dependency required)
function createRateLimiter(windowMs: number, maxRequests: number) {
  const hits = new Map<string, number[]>();
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (process.env.NODE_ENV === 'test') return next();
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const recent = (hits.get(key) || []).filter(ts => now - ts < windowMs);
    if (recent.length >= maxRequests) {
      res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' });
      return;
    }
    recent.push(now);
    hits.set(key, recent);
    next();
  };
}

export function createApp() {
  const app = express();

  // Explicit CORS policy for credentialed requests
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = new Set([
      process.env.APP_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ]);
    if (origin && allowedOrigins.has(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    }
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // Security headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Body parsers
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Serve static assets
  app.use('/src/assets/images', express.static(path.resolve(process.cwd(), 'src/assets/images')));
  app.use('/public', express.static(path.resolve(process.cwd(), 'public')));

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'PayPilot AI Backend',
      geminiConfigured: isGeminiConfigured(),
      paypalSandboxConfigured: isPayPalConfigured(),
      timestamp: new Date().toISOString(),
    });
  });

  // Rate limits for auth mutations (brute-force protection) & AI endpoints
  const authMutationLimiter = createRateLimiter(60_000, 30);
  const aiLimiter = createRateLimiter(60_000, 40);

  // API Routes
  app.use('/api/auth', (req, res, next) => {
    if (req.method === 'POST') {
      return authMutationLimiter(req, res, next);
    }
    return next();
  }, authRoutes);
  app.use('/api/ai', aiLimiter, aiRoutes);
  app.use('/api/payment-requests', paymentRequestsRoutes);
  app.use('/api/payments', paymentsRoutes);
  app.use('/api/clients', clientsRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/reports', reportsRoutes);

  return app;
}

async function startServer() {
  const app = createApp();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PayPilot AI] Server listening on http://localhost:${PORT}`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  startServer().catch(err => {
    console.error('[PayPilot AI] Failed to start server:', err);
    process.exit(1);
  });
}
