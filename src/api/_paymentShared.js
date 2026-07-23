import crypto from 'node:crypto';
import { MercadoPagoConfig, Payment } from 'mercadopago';

export const ANALYSIS_AMOUNT = Number(process.env.ANALYSIS_PRICE || '69.90');
export const ANALYSIS_CURRENCY = 'BRL';
export const SITE_URL = (process.env.SITE_URL || 'https://colo-e-clareza.vercel.app').replace(/\/$/, '');

export function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Variável de ambiente ausente: ${name}`);
  return value;
}

export function signToken(payload, secret, ttlSeconds) {
  const body = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const encoded = Buffer.from(JSON.stringify(body)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(encoded).digest('hex');
  return `${encoded}.${signature}`;
}

export function verifyToken(token, secret, expectedKind) {
  if (!token || typeof token !== 'string') throw new Error('Token ausente.');
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) throw new Error('Token inválido.');

  const expected = crypto.createHmac('sha256', secret).update(encoded).digest('hex');
  const sigBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  if (
    sigBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
  ) {
    throw new Error('Assinatura do token inválida.');
  }

  const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
  if (payload.exp < Math.floor(Date.now() / 1000)) throw new Error('Token expirado.');
  if (expectedKind && payload.kind !== expectedKind) throw new Error('Tipo de token inválido.');
  return payload;
}

export function mercadoPagoClient() {
  return new MercadoPagoConfig({
    accessToken: requireEnv('MERCADO_PAGO_ACCESS_TOKEN'),
    options: { timeout: 10000 },
  });
}

export async function fetchPayment(paymentId) {
  const paymentClient = new Payment(mercadoPagoClient());
  return paymentClient.get({ id: String(paymentId) });
}

export function isOurPayment(payment, expectedExternalReference = null) {
  const amountMatches = Math.abs(Number(payment.transaction_amount) - ANALYSIS_AMOUNT) < 0.001;
  const currencyMatches = payment.currency_id === ANALYSIS_CURRENCY;
  const reference = String(payment.external_reference || '');
  const referenceMatches = reference.startsWith('cc-analysis-');
  const expectedMatches = !expectedExternalReference || reference === expectedExternalReference;

  return amountMatches && currencyMatches && referenceMatches && expectedMatches;
}

export async function registerPaymentInAppsScript(payment) {
  const appsScriptUrl = requireEnv('APPS_SCRIPT_URL');
  const backendSecret = requireEnv('BACKEND_SHARED_SECRET');

  const response = await fetch(appsScriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      action: 'registerPayment',
      backendSecret,
      paymentId: String(payment.id),
      externalReference: String(payment.external_reference || ''),
      paymentStatus: String(payment.status || ''),
      amount: Number(payment.transaction_amount),
      currency: String(payment.currency_id || ''),
      updatedAt: new Date().toISOString(),
    }),
  });

  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success) {
    throw new Error(result?.error || 'O Apps Script não registrou o pagamento.');
  }

  return result;
}

export function sendJson(res, status, body) {
  res.status(status).setHeader('Cache-Control', 'no-store');
  res.json(body);
}