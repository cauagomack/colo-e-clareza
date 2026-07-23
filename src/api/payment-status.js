import {
    ANALYSIS_AMOUNT,
    ANALYSIS_CURRENCY,
    fetchPayment,
    isOurPayment,
    registerPaymentInAppsScript,
    requireEnv,
    sendJson,
    signToken,
    verifyToken,
  } from './_paymentShared.js';
  
  export default async function handler(req, res) {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return sendJson(res, 405, { error: 'Método não permitido.' });
    }
  
    try {
      const paymentId = String(req.query.payment_id || '');
      const checkoutToken = String(req.headers['x-checkout-token'] || '');
      if (!paymentId) return sendJson(res, 400, { error: 'ID do pagamento ausente.' });
  
      const checkout = verifyToken(
        checkoutToken,
        requireEnv('CHECKOUT_TOKEN_SECRET'),
        'checkout',
      );
  
      const payment = await fetchPayment(paymentId);
  
      if (!isOurPayment(payment, checkout.externalReference)) {
        return sendJson(res, 403, { error: 'Este pagamento não pertence a esta solicitação.' });
      }
  
      if (payment.status !== 'approved') {
        const pending = ['pending', 'in_process', 'in_mediation'].includes(payment.status);
        return sendJson(res, pending ? 409 : 402, {
          error: pending
            ? 'O pagamento ainda está pendente de aprovação.'
            : 'O pagamento não foi aprovado.',
          paymentStatus: pending ? 'pending' : String(payment.status || 'rejected'),
        });
      }
  
      await registerPaymentInAppsScript(payment);
  
      const submissionToken = signToken(
        {
          kind: 'submission',
          paymentId: String(payment.id),
          externalReference: String(payment.external_reference),
          amount: ANALYSIS_AMOUNT,
          currency: ANALYSIS_CURRENCY,
        },
        requireEnv('SUBMISSION_TOKEN_SECRET'),
        30 * 60,
      );
  
      return sendJson(res, 200, {
        approved: true,
        paymentId: String(payment.id),
        submissionToken,
      });
    } catch (error) {
      console.error(error);
      return sendJson(res, 400, {
        error: error?.message || 'Não foi possível confirmar o pagamento.',
      });
    }
  }