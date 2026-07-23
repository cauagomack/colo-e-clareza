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
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
  
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
          action: 'listAdminSubmissions',
          backendSecret,
        }),
      });
  
      const result = await response
        .json()
        .catch(() => null);
  
      if (
        !response.ok ||
        !result?.success
      ) {
        throw new Error(
          result?.error ||
            'Não foi possível carregar os envios.',
        );
      }
  
      return sendJson(res, 200, {
        success: true,
        submissions:
          result.submissions || [],
      });
    } catch (error) {
      console.error(
        'Erro ao carregar painel:',
        error,
      );
  
      const unauthorized =
        String(error?.message || '')
          .toLowerCase()
          .includes('token') ||
        String(error?.message || '')
          .toLowerCase()
          .includes('assinatura');
  
      return sendJson(
        res,
        unauthorized ? 401 : 500,
        {
          success: false,
          error: unauthorized
            ? 'Sua sessão expirou. Entre novamente.'
            : error?.message ||
              'Não foi possível carregar o painel.',
        },
      );
    }
  }