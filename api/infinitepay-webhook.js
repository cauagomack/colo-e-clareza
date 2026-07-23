import {
    ANALYSIS_AMOUNT_CENTS,
    sendJson,
  } from './_paymentShared.js';
  
  function readBody(req) {
    if (!req.body) {
      return {};
    }
  
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
  
    return req.body;
  }
  
  export default async function handler(req, res) {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
  
      return sendJson(res, 405, {
        success: false,
        message: 'Método não permitido.',
      });
    }
  
    try {
      const body = readBody(req);
  
      const orderNsu =
        body.order_nsu || body.orderNsu;
  
      const transactionNsu =
        body.transaction_nsu || body.transactionNsu;
  
      const invoiceSlug =
        body.invoice_slug ||
        body.slug ||
        body.invoiceSlug;
  
      const amount = Number(body.amount);
  
      if (
        !orderNsu ||
        !transactionNsu ||
        !invoiceSlug
      ) {
        return sendJson(res, 400, {
          success: false,
          message:
            'Dados obrigatórios do pagamento não foram enviados.',
        });
      }
  
      if (
        !String(orderNsu).startsWith(
          'cc-analysis-',
        )
      ) {
        return sendJson(res, 400, {
          success: false,
          message:
            'O pedido não pertence ao site Colo & Clareza.',
        });
      }
  
      if (amount !== ANALYSIS_AMOUNT_CENTS) {
        return sendJson(res, 400, {
          success: false,
          message:
            'O valor recebido não corresponde à análise.',
        });
      }
  
      console.log('Webhook InfinitePay recebido:', {
        orderNsu: String(orderNsu),
        transactionNsu: String(transactionNsu),
        invoiceSlug: String(invoiceSlug),
        amount,
        paidAmount: Number(
          body.paid_amount || amount,
        ),
        installments: Number(
          body.installments || 1,
        ),
        captureMethod: String(
          body.capture_method || '',
        ),
      });
  
      return sendJson(res, 200, {
        success: true,
        message: null,
      });
    } catch (error) {
      console.error(
        'Erro no webhook da InfinitePay:',
        error,
      );
  
      return sendJson(res, 400, {
        success: false,
        message:
          error?.message ||
          'Não foi possível receber a notificação.',
      });
    }
  }