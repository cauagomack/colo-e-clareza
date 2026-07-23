import {
    ANALYSIS_AMOUNT_CENTS,
    checkInfinitePayPayment,
    isOurPayment,
    registerPaymentInAppsScript,
    requireEnv,
    sendJson,
    signToken,
    verifyToken,
  } from './_paymentShared.js';
  
  export default async function handler(req, res) {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
  
      return sendJson(res, 405, {
        success: false,
        error: 'Método não permitido.',
      });
    }
  
    try {
      let body = req.body || {};
  
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch {
          body = {};
        }
      }
  
      const checkoutToken =
        body.checkoutToken || body.checkout_token;
  
      const orderNsu =
        body.orderNsu || body.order_nsu;
  
      const transactionNsu =
        body.transactionNsu || body.transaction_nsu;
  
      const slug =
        body.slug || body.invoiceSlug || body.invoice_slug;
  
      const captureMethod =
        body.captureMethod || body.capture_method || '';
  
      const receiptUrl =
        body.receiptUrl || body.receipt_url || '';
  
      if (
        !checkoutToken ||
        !orderNsu ||
        !transactionNsu ||
        !slug
      ) {
        return sendJson(res, 400, {
          success: false,
          paid: false,
          error:
            'Os dados necessários para verificar o pagamento estão incompletos.',
        });
      }
  
      const checkoutSecret = requireEnv(
        'CHECKOUT_TOKEN_SECRET',
      );
  
      const checkoutData = verifyToken(
        checkoutToken,
        checkoutSecret,
        'checkout',
      );
  
      if (
        String(checkoutData.orderNsu) !==
        String(orderNsu)
      ) {
        return sendJson(res, 403, {
          success: false,
          paid: false,
          error:
            'O pagamento não corresponde ao pedido criado.',
        });
      }
  
      if (
        Number(checkoutData.amountCents) !==
        ANALYSIS_AMOUNT_CENTS
      ) {
        return sendJson(res, 403, {
          success: false,
          paid: false,
          error: 'O valor do pedido é inválido.',
        });
      }
  
      const payment =
        await checkInfinitePayPayment({
          orderNsu,
          transactionNsu,
          slug,
        });
  
      if (!isOurPayment(payment)) {
        return sendJson(res, 200, {
          success: true,
          paid: false,
          message:
            'O pagamento ainda não foi confirmado.',
        });
      }
  
      await registerPaymentInAppsScript({
        orderNsu,
        transactionNsu,
        slug,
        amountCents: Number(payment.amount),
        captureMethod:
          payment.capture_method || captureMethod,
        receiptUrl,
      });
  
      const submissionSecret = requireEnv(
        'SUBMISSION_TOKEN_SECRET',
      );
  
      const submissionToken = signToken(
        {
          kind: 'submission',
          provider: 'infinitepay',
          orderNsu: String(orderNsu),
          transactionNsu: String(transactionNsu),
          slug: String(slug),
          amountCents: Number(payment.amount),
        },
        submissionSecret,
        60 * 60 * 24,
      );
  
      return sendJson(res, 200, {
        success: true,
        paid: true,
        submissionToken,
        payment: {
          orderNsu: String(orderNsu),
          transactionNsu: String(transactionNsu),
          slug: String(slug),
          amount: Number(payment.amount),
          paidAmount: Number(
            payment.paid_amount || payment.amount,
          ),
          installments: Number(
            payment.installments || 1,
          ),
          captureMethod: String(
            payment.capture_method ||
              captureMethod ||
              '',
          ),
          receiptUrl: String(receiptUrl || ''),
        },
      });
    } catch (error) {
      console.error(
        'Erro ao verificar pagamento InfinitePay:',
        error,
      );
  
      const message =
        error?.message ||
        'Não foi possível verificar o pagamento.';
  
      const clientError =
        message.includes('Token') ||
        message.includes('token') ||
        message.includes('Assinatura') ||
        message.includes('expirado');
  
      return sendJson(res, clientError ? 400 : 500, {
        success: false,
        paid: false,
        error: message,
      });
    }
  }