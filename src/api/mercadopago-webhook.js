import { WebhookSignatureValidator } from 'mercadopago';
import {
  fetchPayment,
  isOurPayment,
  registerPaymentInAppsScript,
  requireEnv,
  sendJson,
} from './_paymentShared.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Método não permitido.' });
  }

  try {
    const dataId = String(
      req.query['data.id'] || req.body?.data?.id || req.query.id || '',
    );

    WebhookSignatureValidator.validate({
      xSignature: req.headers['x-signature'],
      xRequestId: req.headers['x-request-id'],
      dataId,
      secret: requireEnv('MERCADO_PAGO_WEBHOOK_SECRET'),
    });

    const eventType = String(req.body?.type || req.query.type || '');
    if (eventType !== 'payment' || !dataId) {
      return sendJson(res, 200, { received: true });
    }

    const payment = await fetchPayment(dataId);
    if (!isOurPayment(payment)) {
      return sendJson(res, 200, { received: true, ignored: true });
    }

    await registerPaymentInAppsScript(payment);
    return sendJson(res, 200, { received: true });
  } catch (error) {
    console.error(error);
    return sendJson(res, 401, { error: 'Webhook inválido.' });
  }
}