export function getPort(): number {
  const parsed = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 3000;
}

function normalizeBaseUrl(rawUrl: string): string {
  return rawUrl.trim().replace(/\/+$/, '');
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Central environment-independent application URL.
 * Reads APP_URL (e.g. http://localhost:3000 locally or https://paypilot-ai-zz8c.onrender.com on Render),
 * falling back to RENDER_EXTERNAL_URL or http://localhost:<PORT>.
 */
export function getAppUrl(): string {
  const port = getPort();
  const raw =
    (process.env.APP_URL || '').trim() ||
    (process.env.RENDER_EXTERNAL_URL || '').trim() ||
    `http://localhost:${port}`;

  const normalized = normalizeBaseUrl(raw);
  if (!isValidHttpUrl(normalized)) {
    throw new Error(
      `Invalid APP_URL configuration "${raw}". Expected a valid http:// or https:// URL.`
    );
  }
  return normalized;
}

export function getPaymentLink(publicToken: string): string {
  return `${getAppUrl()}/pay/${encodeURIComponent(publicToken)}`;
}

export function getPayPalReturnUrl(publicToken: string): string {
  return `${getPaymentLink(publicToken)}?paypalStatus=success`;
}

export function getPayPalCancelUrl(publicToken: string): string {
  return `${getPaymentLink(publicToken)}?paypalStatus=cancelled`;
}

export interface ConfigValidationResult {
  valid: boolean;
  appUrl: string;
  warnings: string[];
  errors: string[];
}

export function validateServerConfig(): ConfigValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  let appUrl = `http://localhost:${getPort()}`;

  try {
    appUrl = getAppUrl();
  } catch (err: any) {
    errors.push(err.message);
  }

  const isProd = process.env.NODE_ENV === 'production';
  const rawAppUrl = (process.env.APP_URL || '').trim();

  if (isProd && !rawAppUrl && !process.env.RENDER_EXTERNAL_URL) {
    warnings.push(
      'APP_URL is not set in production. Set APP_URL to your deployed origin (e.g. https://paypilot-ai-zz8c.onrender.com).'
    );
  }

  if (isProd && appUrl.includes('localhost')) {
    warnings.push(
      `APP_URL is currently "${appUrl}" in production mode. PayPal redirects should use your live HTTPS domain.`
    );
  }

  const paypalBaseUrl = (process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com').trim();
  if (!isValidHttpUrl(paypalBaseUrl)) {
    errors.push(`Invalid PAYPAL_BASE_URL "${paypalBaseUrl}".`);
  }

  const authSecret = (process.env.AUTH_SECRET || '').trim();
  if (isProd && (!authSecret || authSecret.includes('replace-with'))) {
    warnings.push('AUTH_SECRET is missing or using a placeholder in production.');
  }

  const paypalClientId = (process.env.PAYPAL_CLIENT_ID || '').trim();
  const paypalSecret = (process.env.PAYPAL_CLIENT_SECRET || '').trim();
  if (!paypalClientId || !paypalSecret) {
    warnings.push(
      'PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET is not set. PayPal Sandbox checkout will be disabled until configured.'
    );
  }

  return {
    valid: errors.length === 0,
    appUrl,
    warnings,
    errors,
  };
}
