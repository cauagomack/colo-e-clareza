import {
    requireEnv,
    sendJson,
    verifyToken,
  } from './_paymentShared.js';
  
  function getBearerToken(req) {
    const authorization = String(
      req.headers.authorization || '',
    );
  
    if (!authorization.startsWith('Bearer ')) {
      return '';
    }
  
    return authorization.slice(7).trim();
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
      const adminToken = getBearerToken(req);
  
      verifyToken(
        adminToken,
        requireEnv('ADMIN_TOKEN_SECRET'),
        'admin',
      );
  
      let body = req.body || {};
  
      if (typeof body === 'string') {
        body = JSON.parse(body);
      }
  
      const rowId = Number(body.rowId);
      const status = String(
        body.status || '',
      ).trim();
  
      if (!Number.isInteger(rowId) || rowId < 2) {
        return sendJson(res, 400, {
          success: false,
          error: 'Identificação do envio inválida.',
        });
      }
  
      const allowedStatuses = [
        'Novo',
        'Em análise',
        'Concluído',
      ];
  
      if (!allowedStatuses.includes(status)) {
        return sendJson(res, 400, {
          success: false,
          error: 'Status inválido.',
        });
      }
  
      const response = await fetch(
        requireEnv('APPS_SCRIPT_URL'),
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'text/plain;charset=utf-8',
          },
          body: JSON.stringify({
            action:
              'updateAdminSubmissionStatus',
  
            backendSecret: requireEnv(
              'BACKEND_SHARED_SECRET',
            ),
  
            rowId,
            status,
          }),
        },
      );
  
      const result = await response
        .json()
        .catch(() => null);
  
      if (!response.ok || !result?.success) {
        throw new Error(
          result?.error ||
            'Não foi possível alterar o status.',
        );
      }
  
      return sendJson(res, 200, {
        success: true,
        rowId,
        status,
      });
    } catch (error) {
      console.error(
        'Erro ao alterar status:',
        error,
      );
  
      const message = String(
        error?.message || '',
      );
  
      const unauthorized =
        message.toLowerCase().includes('token') ||
        message.toLowerCase().includes(
          'assinatura',
        );
  
      return sendJson(
        res,
        unauthorized ? 401 : 500,
        {
          success: false,
          error: unauthorized
            ? 'Sua sessão expirou. Entre novamente.'
            : message ||
              'Não foi possível alterar o status.',
        },
      );
    }
  }