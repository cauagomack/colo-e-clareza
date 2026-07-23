import crypto from 'node:crypto';
import { Preference } from 'mercadopago';
import {
  ANALYSIS_AMOUNT,
  ANALYSIS_CURRENCY,
  SITE_URL,
  mercadoPagoClient,
  requireEnv,
  sendJson,
  signToken,
} from './_paymentShared.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Método não permitido.' });
  }

  try {
    const externalReference = `cc-analysis-${crypto.randomUUID()}`;
    const preferenceClient = new Preference(mercadoPagoClient());

    const preference = await preferenceClient.create({
      body: {
        items: [
          {
            id: 'systemic-analysis',
            title: 'Análise Sistêmica Individual — Colo & Clareza',
            description: 'Análise profissional do Mapa Sistêmico Familiar com devolutiva em até 24 horas.',
            quantity: 1,
            currency_id: ANALYSIS_CURRENCY,
            unit_price: ANALYSIS_AMOUNT,
          },
        ],
        external_reference: externalReference,
        back_urls: {
          success: `${SITE_URL}/mapa?payment=success`,
          pending: `${SITE_URL}/mapa?payment=pending`,
          failure: `${SITE_URL}/mapa?payment=failure`,
        },
        auto_return: 'approved',
        notification_url: `${SITE_URL}/api/mercadopago-webhook`,
        statement_descriptor: 'COLOCLAREZA',
        metadata: {
          service: 'systemic-analysis',
        },
      },
    });

    const checkoutToken = signToken(
      { kind: 'checkout', externalReference },
      requireEnv('CHECKOUT_TOKEN_SECRET'),
      7 * 24 * 60 * 60,
    );

    const isTest = String(process.env.MERCADO_PAGO_MODE || 'test').toLowerCase() !== 'production';
    const checkoutUrl = isTest
      ? preference.sandbox_init_point || preference.init_point
      : preference.init_point;

    if (!checkoutUrl) throw new Error('O Mercado Pago não retornou a URL do checkout.');

    return sendJson(res, 200, {
      checkoutUrl,
      checkoutToken,
      externalReference,
      preferenceId: preference.id,
    });
  } catch (error) {
    console.error(error);
    return sendJson(res, 500, {
      error: 'Não foi possível criar o pagamento agora. Tente novamente.',
    });
  }
}