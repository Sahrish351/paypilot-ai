import crypto from 'crypto';

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret === 'replace-with-a-long-random-secret-string') {
    if (process.env.NODE_ENV === 'production') {
      console.warn('[Security] AUTH_SECRET is missing or using placeholder in production!');
    }
    return 'paypilot-ai-local-dev-secret-change-me';
  }
  return secret;
}

/**
 * Hash a plaintext password with a random 16-byte salt using scrypt.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

/**
 * Verify a plaintext password against a stored scrypt hash.
 * Also validates the seeded demo account password safely.
 */
export function verifyPassword(password: string, storedHash: string, isDemoAccount?: boolean): boolean {
  if (!password || !storedHash) return false;

  if (storedHash.startsWith('scrypt$')) {
    const parts = storedHash.split('$');
    if (parts.length !== 3) return false;
    const [, salt, originalHex] = parts;
    const derived = crypto.scryptSync(password, salt, 64);
    const original = Buffer.from(originalHex, 'hex');
    if (derived.length !== original.length) return false;
    return crypto.timingSafeEqual(derived, original);
  }

  // Legacy seeded demo account compatibility
  if (isDemoAccount && storedHash === '$2a$10$demoHashedPasswordMockForDemoAuth6688') {
    return password === 'demo1234';
  }

  return false;
}

export interface SessionTokenPayload {
  userId: string;
  email: string;
  exp: number;
}

/**
 * Sign an HMAC-SHA256 session token.
 */
export function signSessionToken(userId: string, email: string): string {
  const payload: SessionTokenPayload = {
    userId,
    email,
    exp: Date.now() + TOKEN_TTL_MS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', getAuthSecret())
    .update(encodedPayload)
    .digest('base64url');
  return `${encodedPayload}.${signature}`;
}

/**
 * Verify and decode an HMAC-SHA256 session token.
 */
export function verifySessionToken(token: string): SessionTokenPayload | null {
  if (!token || !token.includes('.')) return null;
  const [encodedPayload, providedSig] = token.split('.');
  if (!encodedPayload || !providedSig) return null;

  const expectedSig = crypto
    .createHmac('sha256', getAuthSecret())
    .update(encodedPayload)
    .digest('base64url');

  const a = Buffer.from(providedSig, 'utf-8');
  const b = Buffer.from(expectedSig, 'utf-8');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8')) as SessionTokenPayload;
    if (!payload.userId || !payload.exp || Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Parse cookies from an HTTP Cookie header without external dependencies.
 */
export function parseCookies(cookieHeader?: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;

  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = decodeURIComponent(part.slice(idx + 1).trim());
    if (key) cookies[key] = val;
  }
  return cookies;
}
