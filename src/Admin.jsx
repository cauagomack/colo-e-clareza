import {
    useEffect,
    useMemo,
    useState,
  } from 'react';
  
  import {
    CalendarDays,
    CreditCard,
    ExternalLink,
    Eye,
    EyeOff,
    ImageOff,
    Loader2,
    LockKeyhole,
    LogOut,
    MessageCircle,
    RefreshCw,
    Search,
    ShieldCheck,
    User,
  } from 'lucide-react';
  
  import {
    getAdminSubmissions,
    isAdminLoggedIn,
    loginAdmin,
    logoutAdmin,
  } from './adminApi.js';
  
  import './Admin.css';
  
  function formatDate(value) {
    if (!value) return 'Data não informada';
  
    const date = new Date(value);
  
    if (Number.isNaN(date.getTime())) {
      return value;
    }
  
    return new Intl.DateTimeFormat(
      'pt-BR',
      {
        dateStyle: 'short',
        timeStyle: 'short',
      },
    ).format(date);
  }
  
  function getImagePreviewUrl(fileId) {
    if (!fileId) return '';
  
    return (
      'https://drive.google.com/thumbnail' +
      `?id=${encodeURIComponent(fileId)}` +
      '&sz=w1200'
    );
  }
  
  export default function Admin() {
    const [loggedIn, setLoggedIn] =
      useState(isAdminLoggedIn());
  
    const [password, setPassword] =
      useState('');
  
    const [showPassword, setShowPassword] =
      useState(false);
  
    const [loginStatus, setLoginStatus] =
      useState('idle');
  
    const [errorMessage, setErrorMessage] =
      useState('');
  
    const [submissions, setSubmissions] =
      useState([]);
  
    const [loadStatus, setLoadStatus] =
      useState('idle');
  
    const [loadError, setLoadError] =
      useState('');
  
    const [searchText, setSearchText] =
      useState('');
  
    const [imageErrors, setImageErrors] =
      useState({});
  
    const loadSubmissions = async () => {
      setLoadStatus('loading');
      setLoadError('');
  
      try {
        const result =
          await getAdminSubmissions();
  
        setSubmissions(
          Array.isArray(result?.submissions)
            ? result.submissions
            : [],
        );
  
        setLoadStatus('success');
      } catch (error) {
        setLoadStatus('error');
  
        setLoadError(
          error?.message ||
            'Não foi possível carregar os envios.',
        );
      }
    };
  
    useEffect(() => {
      if (loggedIn) {
        loadSubmissions();
      }
    }, [loggedIn]);
  
    const filteredSubmissions =
      useMemo(() => {
        const search = searchText
          .trim()
          .toLowerCase();
  
        if (!search) return submissions;
  
        return submissions.filter(
          (submission) => {
            const searchableText = [
              submission.name,
              submission.contact,
              submission.message,
              submission.status,
              submission.paymentId,
              submission.externalReference,
            ]
              .join(' ')
              .toLowerCase();
  
            return searchableText.includes(
              search,
            );
          },
        );
      }, [submissions, searchText]);
  
    const handleLogin = async (event) => {
      event.preventDefault();
  
      if (!password.trim()) {
        setErrorMessage(
          'Informe a senha administrativa.',
        );
  
        return;
      }
  
      setLoginStatus('loading');
      setErrorMessage('');
  
      try {
        await loginAdmin(password);
  
        setLoggedIn(true);
        setPassword('');
        setLoginStatus('idle');
      } catch (error) {
        setLoginStatus('error');
  
        setErrorMessage(
          error?.message ||
            'Não foi possível entrar.',
        );
      }
    };
  
    const handleLogout = () => {
      logoutAdmin();
  
      setLoggedIn(false);
      setSubmissions([]);
      setPassword('');
      setErrorMessage('');
      setLoadError('');
    };
  
    if (!loggedIn) {
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
                    loginStatus === 'loading'
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
                  loginStatus === 'loading'
                }
              >
                {loginStatus === 'loading' ? (
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
              acompanhe as solicitações de
              análise.
            </p>
          </div>
  
          <div className="admin-header-actions">
            <button
              type="button"
              className="admin-refresh"
              onClick={loadSubmissions}
              disabled={
                loadStatus === 'loading'
              }
            >
              <RefreshCw
                size={18}
                className={
                  loadStatus === 'loading'
                    ? 'admin-spinner'
                    : ''
                }
              />
  
              Atualizar
            </button>
  
            <button
              type="button"
              className="admin-logout"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </header>
  
        <section className="admin-toolbar">
          <div className="admin-search">
            <Search size={19} />
  
            <input
              type="search"
              placeholder="Buscar por nome, contato ou pedido..."
              value={searchText}
              onChange={(event) =>
                setSearchText(
                  event.target.value,
                )
              }
            />
          </div>
  
          <div className="admin-total">
            <ShieldCheck size={18} />
  
            <span>
              {filteredSubmissions.length}{' '}
              {filteredSubmissions.length === 1
                ? 'envio'
                : 'envios'}
            </span>
          </div>
        </section>
  
        {loadStatus === 'loading' && (
          <section className="admin-empty">
            <Loader2
              size={44}
              className="admin-spinner"
            />
  
            <h2>Carregando envios...</h2>
  
            <p>
              Buscando os mapas e dados da
              planilha.
            </p>
          </section>
        )}
  
        {loadStatus === 'error' && (
          <section className="admin-empty">
            <ImageOff size={44} />
  
            <h2>
              Não foi possível carregar
            </h2>
  
            <p>{loadError}</p>
  
            <button
              type="button"
              className="admin-refresh"
              onClick={loadSubmissions}
            >
              <RefreshCw size={18} />
              Tentar novamente
            </button>
          </section>
        )}
  
        {loadStatus === 'success' &&
          filteredSubmissions.length === 0 && (
            <section className="admin-empty">
              <ShieldCheck size={48} />
  
              <h2>
                Nenhum envio encontrado
              </h2>
  
              <p>
                Os novos mapas aparecerão
                aqui depois do pagamento e
                envio.
              </p>
            </section>
          )}
  
        {loadStatus === 'success' &&
          filteredSubmissions.length > 0 && (
            <section className="admin-grid">
              {filteredSubmissions.map(
                (submission) => {
                  const previewUrl =
                    getImagePreviewUrl(
                      submission.imageFileId,
                    );
  
                  const imageFailed =
                    imageErrors[
                      submission.rowId
                    ];
  
                  return (
                    <article
                      className="admin-submission-card"
                      key={submission.rowId}
                    >
                      <div className="admin-image-area">
                        {previewUrl &&
                        !imageFailed ? (
                          <img
                            src={previewUrl}
                            alt={`Mapa sistêmico enviado por ${submission.name}`}
                            loading="lazy"
                            onError={() =>
                              setImageErrors(
                                (current) => ({
                                  ...current,
                                  [submission.rowId]:
                                    true,
                                }),
                              )
                            }
                          />
                        ) : (
                          <div className="admin-image-fallback">
                            <ImageOff size={36} />
  
                            <span>
                              Prévia indisponível
                            </span>
                          </div>
                        )}
  
                        {submission.imageUrl && (
                          <a
                            href={
                              submission.imageUrl
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="admin-open-image"
                          >
                            <ExternalLink
                              size={16}
                            />
                            Abrir no Drive
                          </a>
                        )}
                      </div>
  
                      <div className="admin-submission-content">
                        <div className="admin-card-heading">
                          <div>
                            <span className="admin-submission-date">
                              <CalendarDays
                                size={15}
                              />
  
                              {formatDate(
                                submission.date,
                              )}
                            </span>
  
                            <h2>
                              {submission.name ||
                                'Nome não informado'}
                            </h2>
                          </div>
  
                          <span
                            className={`admin-status admin-status--${String(
                              submission.status ||
                                'novo',
                            )
                              .toLowerCase()
                              .replace(/\s+/g, '-')}`}
                          >
                            {submission.status ||
                              'Novo'}
                          </span>
                        </div>
  
                        <dl className="admin-details">
                          <div>
                            <dt>
                              <User size={16} />
                              Contato
                            </dt>
  
                            <dd>
                              {submission.contact ||
                                'Não informado'}
                            </dd>
                          </div>
  
                          <div>
                            <dt>
                              <MessageCircle
                                size={16}
                              />
                              Mensagem
                            </dt>
  
                            <dd>
                              {submission.message ||
                                'Nenhuma mensagem adicional.'}
                            </dd>
                          </div>
  
                          <div>
                            <dt>
                              <CreditCard
                                size={16}
                              />
                              Pagamento
                            </dt>
  
                            <dd>
                              {submission.paymentStatus ||
                                'Não informado'}
                            </dd>
                          </div>
                        </dl>
  
                        <details className="admin-payment-details">
                          <summary>
                            Ver dados técnicos do
                            pagamento
                          </summary>
  
                          <p>
                            <strong>
                              ID do pagamento:
                            </strong>{' '}
                            {submission.paymentId ||
                              '—'}
                          </p>
  
                          <p>
                            <strong>
                              Referência:
                            </strong>{' '}
                            {submission.externalReference ||
                              '—'}
                          </p>
                        </details>
                      </div>
                    </article>
                  );
                },
              )}
            </section>
          )}
      </main>
    );
  }