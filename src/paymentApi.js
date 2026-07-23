const CHECKOUT_TOKEN_KEY =
  'colo-clareza-checkout-token';

const ORDER_NSU_KEY =
  'colo-clareza-order-nsu';

async function readResponse(response) {
  const result = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.error ||
        'Não foi possível concluir a operação.',
    );
  }

  return result;
}

export async function createAnalysisCheckout(
  customer = {},
) {
  const response = await fetch(
    '/api/create-infinitepay-checkout',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: customer.name || '',
        email: customer.email || '',
        phoneNumber:
          customer.phoneNumber ||
          customer.phone ||
          '',
      }),
    },
  );

  const result = await readResponse(response);

  if (
    !result?.checkoutUrl ||
    !result?.checkoutToken ||
    !result?.orderNsu
  ) {
    throw new Error(
      'O link de pagamento não foi criado corretamente.',
    );
  }

  sessionStorage.setItem(
    CHECKOUT_TOKEN_KEY,
    result.checkoutToken,
  );

  sessionStorage.setItem(
    ORDER_NSU_KEY,
    result.orderNsu,
  );

  return result;
}

export async function openAnalysisCheckout(
  customer = {},
) {
  const checkout =
    await createAnalysisCheckout(customer);

  window.location.assign(checkout.checkoutUrl);
}

export function getInfinitePayReturnData() {
  const params = new URLSearchParams(
    window.location.search,
  );

  const checkoutToken =
    params.get('checkout_token') ||
    sessionStorage.getItem(
      CHECKOUT_TOKEN_KEY,
    ) ||
    '';

  const orderNsu =
    params.get('order_nsu') ||
    sessionStorage.getItem(ORDER_NSU_KEY) ||
    '';

  const transactionNsu =
    params.get('transaction_nsu') || '';

  const slug = params.get('slug') || '';

  const captureMethod =
    params.get('capture_method') || '';

  const receiptUrl =
    params.get('receipt_url') || '';

  return {
    checkoutToken,
    orderNsu,
    transactionNsu,
    slug,
    captureMethod,
    receiptUrl,

    hasPaymentReturn: Boolean(
      orderNsu &&
        transactionNsu &&
        slug &&
        checkoutToken,
    ),
  };
}

export async function checkAnalysisPayment(
  paymentData,
) {
  const response = await fetch(
    '/api/infinitepay-payment-status',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        checkoutToken:
          paymentData.checkoutToken,

        orderNsu: paymentData.orderNsu,

        transactionNsu:
          paymentData.transactionNsu,

        slug: paymentData.slug,

        captureMethod:
          paymentData.captureMethod || '',

        receiptUrl:
          paymentData.receiptUrl || '',
      }),
    },
  );

  return readResponse(response);
}

export function clearCheckoutStorage() {
  sessionStorage.removeItem(
    CHECKOUT_TOKEN_KEY,
  );

  sessionStorage.removeItem(
    ORDER_NSU_KEY,
  );
}

export function removePaymentParameters() {
  const url = new URL(window.location.href);

  const parameters = [
    'payment',
    'checkout_token',
    'order_nsu',
    'transaction_nsu',
    'slug',
    'capture_method',
    'receipt_url',
  ];

  parameters.forEach((parameter) => {
    url.searchParams.delete(parameter);
  });

  window.history.replaceState(
    {},
    document.title,
    `${url.pathname}${url.search}${url.hash}`,
  );
}