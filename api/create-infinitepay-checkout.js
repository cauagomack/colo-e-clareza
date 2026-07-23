import crypto from 'node:crypto';

import {
  ANALYSIS_AMOUNT_CENTS,
  SITE_URL,
  createInfinitePayCheckout,
  requireEnv,
  sendJson,
  signToken,
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
    const checkoutSecret = requireEnv(
      'CHECKOUT_TOKEN_SECRET',
    );

    const orderNsu = `cc-analysis-${crypto.randomUUID()}`;

    const checkoutToken = signToken(
      {
        kind: 'checkout',
        orderNsu,
        amountCents: ANALYSIS_AMOUNT_CENTS,
      },
      checkoutSecret,
      60 * 60,
    );

    const redirectUrl = new URL(
      '/mapa',
      SITE_URL,
    );

    redirectUrl.searchParams.set(
      'payment',
      'return',
    );


    

    const body =
      req.body && typeof req.body === 'object'
        ? req.body
        : {};

    const customer = {
      name: body.name || '',
      email: body.email || '',
      phoneNumber: body.phoneNumber || '',
    };

    const checkout = await createInfinitePayCheckout({
        orderNsu,
        redirectUrl: redirectUrl.toString(),
        customer,
      });

    return sendJson(res, 200, {
      success: true,
      checkoutUrl: checkout.url,
      orderNsu,
      checkoutToken,
    });
  } catch (error) {
    console.error(
      'Erro ao criar checkout InfinitePay:',
      error,
    );

    return sendJson(res, 500, {
      success: false,
      error:
        error?.message ||
        'Não foi possível criar o pagamento.',
    });
  }
}