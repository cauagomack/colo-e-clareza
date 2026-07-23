import crypto from 'node:crypto';

import {
  requireEnv,
  sendJson,
  signToken,
} from './_paymentShared.js';

function safeEquals(received, expected) {
  const receivedBuffer = Buffer.from(
    String(received || ''),
  );

  const expectedBuffer = Buffer.from(
    String(expected || ''),
  );

  if (
    receivedBuffer.length !==
    expectedBuffer.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    receivedBuffer,
    expectedBuffer,
  );
}

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
      body = JSON.parse(body);
    }

    const receivedPassword = String(
      body.password || '',
    );

    const adminPassword = requireEnv(
      'ADMIN_PASSWORD',
    );

    if (
      !safeEquals(
        receivedPassword,
        adminPassword,
      )
    ) {
      return sendJson(res, 401, {
        success: false,
        error: 'Senha incorreta.',
      });
    }

    const tokenSecret = requireEnv(
      'ADMIN_TOKEN_SECRET',
    );

    const adminToken = signToken(
      {
        kind: 'admin',
      },
      tokenSecret,
      60 * 60 * 8,
    );

    return sendJson(res, 200, {
      success: true,
      adminToken,
    });
  } catch (error) {
    console.error(
      'Erro no login administrativo:',
      error,
    );

    return sendJson(res, 500, {
      success: false,
      error:
        error?.message ||
        'Não foi possível realizar o login.',
    });
  }
}