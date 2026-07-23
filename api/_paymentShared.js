import crypto from 'node:crypto';

export const ANALYSIS_AMOUNT = Number(
  process.env.ANALYSIS_PRICE || '69.90',
);

export const ANALYSIS_AMOUNT_CENTS = Math.round(
  ANALYSIS_AMOUNT * 100,
);

export const ANALYSIS_CURRENCY = 'BRL';

export const SITE_URL = (
  process.env.SITE_URL ||
  'https://colo-e-clareza.vercel.app'
).replace(/\/$/, '');

const INFINITEPAY_API_URL =
  'https://api.checkout.infinitepay.io';

export function requireEnv(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `Variável de ambiente ausente: ${name}`,
    );
  }

  return value;
}

export function getInfinitePayHandle() {
  return requireEnv('INFINITEPAY_HANDLE')
    .replace(/^\$/, '')
    .trim();
}

export function signToken(payload, secret, ttlSeconds) {
  const body = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };

  const encoded = Buffer.from(
    JSON.stringify(body),
  ).toString('base64url');

  const signature = crypto
    .createHmac('sha256', secret)
    .update(encoded)
    .digest('hex');

  return `${encoded}.${signature}`;
}

export function verifyToken(
  token,
  secret,
  expectedKind,
) {
  if (!token || typeof token !== 'string') {
    throw new Error('Token ausente.');
  }

  const [encoded, signature] = token.split('.');

  if (!encoded || !signature) {
    throw new Error('Token inválido.');
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(encoded)
    .digest('hex');

  const signatureBuffer = Buffer.from(
    signature,
    'hex',
  );

  const expectedBuffer = Buffer.from(
    expected,
    'hex',
  );

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(
      signatureBuffer,
      expectedBuffer,
    )
  ) {
    throw new Error('Assinatura do token inválida.');
  }

  const payload = JSON.parse(
    Buffer.from(encoded, 'base64url').toString(
      'utf8',
    ),
  );

  if (
    !payload.exp ||
    payload.exp < Math.floor(Date.now() / 1000)
  ) {
    throw new Error('Token expirado.');
  }

  if (
    expectedKind &&
    payload.kind !== expectedKind
  ) {
    throw new Error('Tipo de token inválido.');
  }

  return payload;
}

async function postInfinitePay(path, body) {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 10000);

  try {
    const response = await fetch(
      `${INFINITEPAY_API_URL}/${path}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      },
    );

    const text = await response.text();

    let result = null;

    try {
      result = text ? JSON.parse(text) : null;
    } catch {
      result = null;
    }

    if (!response.ok) {
      throw new Error(
        result?.message ||
          result?.error ||
          `Erro da InfinitePay: ${response.status}`,
      );
    }

    return result;
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error(
        'A InfinitePay demorou para responder.',
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function createInfinitePayCheckout({
  orderNsu,
  redirectUrl,
  webhookUrl,
  customer = null,
}) {
  const payload = {
    handle: getInfinitePayHandle(),
    redirect_url: redirectUrl,
    webhook_url: webhookUrl,
    order_nsu: orderNsu,
    items: [
      {
        quantity: 1,
        price: ANALYSIS_AMOUNT_CENTS,
        description:
          'Análise Sistêmica Individual — Mapa Sistêmico Familiar',
      },
    ],
  };

  if (customer) {
    const customerData = {};

    if (customer.name) {
      customerData.name = String(
        customer.name,
      ).trim();
    }

    if (customer.email) {
      customerData.email = String(
        customer.email,
      ).trim();
    }

    if (customer.phoneNumber) {
      customerData.phone_number = String(
        customer.phoneNumber,
      ).trim();
    }

    if (Object.keys(customerData).length > 0) {
      payload.customer = customerData;
    }
  }

  const result = await postInfinitePay(
    'links',
    payload,
  );

  if (!result?.url) {
    throw new Error(
      'A InfinitePay não retornou o link do pagamento.',
    );
  }

  return result;
}

export async function checkInfinitePayPayment({
  orderNsu,
  transactionNsu,
  slug,
}) {
  if (!orderNsu || !transactionNsu || !slug) {
    throw new Error(
      'Dados do pagamento incompletos.',
    );
  }

  return postInfinitePay('payment_check', {
    handle: getInfinitePayHandle(),
    order_nsu: String(orderNsu),
    transaction_nsu: String(transactionNsu),
    slug: String(slug),
  });
}

export function isOurPayment(payment) {
  const success = payment?.success === true;
  const paid = payment?.paid === true;

  const amountMatches =
    Number(payment?.amount) ===
    ANALYSIS_AMOUNT_CENTS;

  return success && paid && amountMatches;
}

export async function registerPaymentInAppsScript({
  orderNsu,
  transactionNsu,
  slug,
  amountCents = ANALYSIS_AMOUNT_CENTS,
  captureMethod = '',
  receiptUrl = '',
}) {
  const appsScriptUrl = requireEnv(
    'APPS_SCRIPT_URL',
  );

  const backendSecret = requireEnv(
    'BACKEND_SHARED_SECRET',
  );

  const response = await fetch(appsScriptUrl, {
    method: 'POST',
    headers: {
      'Content-Type':
        'text/plain;charset=utf-8',
    },
    body: JSON.stringify({
      action: 'registerPayment',
      backendSecret,

      provider: 'infinitepay',

      paymentId: String(transactionNsu),
      externalReference: String(orderNsu),
      paymentStatus: 'approved',

      orderNsu: String(orderNsu),
      transactionNsu: String(transactionNsu),
      invoiceSlug: String(slug),

      amount: Number(amountCents) / 100,
      amountCents: Number(amountCents),
      currency: ANALYSIS_CURRENCY,

      captureMethod: String(
        captureMethod || '',
      ),

      receiptUrl: String(receiptUrl || ''),
      updatedAt: new Date().toISOString(),
    }),
  });

  const result = await response
    .json()
    .catch(() => null);

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.error ||
        'O Apps Script não registrou o pagamento.',
    );
  }

  return result;
}

export function sendJson(res, status, body) {
  res.status(status);
  res.setHeader('Cache-Control', 'no-store');
  res.json(body);
}