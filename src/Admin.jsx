import { useState } from 'react';
import {
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

import {
  isAdminLoggedIn,
  loginAdmin,
  logoutAdmin,
} from './adminApi.js';

import './Admin.css';

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(
    isAdminLoggedIn(),
  );

  const [password, setPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [status, setStatus] =
    useState('idle');

  const [errorMessage, setErrorMessage] =
    useState('');

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!password.trim()) {
      setErrorMessage(
        'Informe a senha administrativa.',
      );

      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      await loginAdmin(password);

      setLoggedIn(true);
      setPassword('');
      setStatus('idle');
    } catch (error) {
      setStatus('error');

      setErrorMessage(
        error?.message ||
          'Não foi possível entrar.',
      );
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setLoggedIn(false);
    setPassword('');
    setErrorMessage('');
  };

  if (loggedIn) {
    return (
      <main className="admin-page">
        <header className="admin-header">
          <div>
            <span className="admin-eyebrow">
              Colo &amp; Clareza
            </span>

            <h1>Painel administrativo</h1>

            <p>
              Visualize os mapas enviados e
              acompanhe as análises.
            </p>
          </div>

          <button
            type="button"
            className="admin-logout"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Sair
          </button>
        </header>

        <section className="admin-empty">
          <ShieldCheck size={48} />

          <h2>Acesso autorizado</h2>

          <p>
            O login está funcionando. No
            próximo passo, os mapas e dados
            enviados aparecerão aqui.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <div className="admin-login-icon">
          <LockKeyhole size={32} />
        </div>

        <span className="admin-eyebrow">
          Área restrita
        </span>

        <h1>Painel administrativo</h1>

        <p className="admin-login-description">
          Entre com a senha administrativa
          para acessar os mapas enviados.
        </p>

        <form
          onSubmit={handleLogin}
          className="admin-login-form"
        >
          <label htmlFor="admin-password">
            Senha
          </label>

          <div className="admin-password-field">
            <input
              id="admin-password"
              type={
                showPassword
                  ? 'text'
                  : 'password'
              }
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value,
                )
              }
              autoComplete="current-password"
              disabled={
                status === 'loading'
              }
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  (current) => !current,
                )
              }
              aria-label={
                showPassword
                  ? 'Ocultar senha'
                  : 'Mostrar senha'
              }
            >
              {showPassword ? (
                <EyeOff size={19} />
              ) : (
                <Eye size={19} />
              )}
            </button>
          </div>

          {errorMessage && (
            <p className="admin-login-error">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            className="admin-login-submit"
            disabled={
              status === 'loading'
            }
          >
            {status === 'loading' ? (
              <>
                <Loader2
                  size={18}
                  className="admin-spinner"
                />
                Entrando...
              </>
            ) : (
              <>
                <LockKeyhole size={18} />
                Entrar no painel
              </>
            )}
          </button>
        </form>
      </section>
    </main>
  );
}