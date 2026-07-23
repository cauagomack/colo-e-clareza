const ADMIN_TOKEN_KEY =
  'colo-clareza-admin-token';

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

export async function loginAdmin(password) {
  const response = await fetch(
    '/api/admin-login',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        password,
      }),
    },
  );

  const result = await readResponse(response);

  if (!result?.adminToken) {
    throw new Error(
      'O servidor não retornou a autorização.',
    );
  }

  sessionStorage.setItem(
    ADMIN_TOKEN_KEY,
    result.adminToken,
  );

  return result.adminToken;
}

export function getAdminToken() {
  return (
    sessionStorage.getItem(
      ADMIN_TOKEN_KEY,
    ) || ''
  );
}

export function isAdminLoggedIn() {
  return Boolean(getAdminToken());
}

export function logoutAdmin() {
  sessionStorage.removeItem(
    ADMIN_TOKEN_KEY,
  );
}
export async function getAdminSubmissions() {
    const token = getAdminToken();
  
    if (!token) {
      throw new Error(
        'Sua sessão expirou. Entre novamente.',
      );
    }
  
    const response = await fetch(
      '/api/admin-submissions',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  
    return readResponse(response);
  }