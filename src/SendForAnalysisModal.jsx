import { useState } from 'react';
import {
  X,
  Send,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

import {
  APPS_SCRIPT_URL,
  MAX_IMAGE_SIZE_MB,
  MIN_SECONDS_BETWEEN_SUBMISSIONS,
} from './appsScriptConfig.js';

import './SendForAnalysisModal.css';

const LAST_SUBMIT_KEY =
  'colo-clareza-mapa-envio-ultimo';

const INITIAL_FIELDS = {
  name: '',
  contact: '',
  message: '',
  authorized: false,
  website: '',
};

function isValidContact(value) {
  const text = value.trim();

  const looksLikeEmail =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);

  const digitsOnly = text.replace(/\D/g, '');

  const looksLikePhone =
    digitsOnly.length >= 8;

  return looksLikeEmail || looksLikePhone;
}

function base64SizeInMb(dataUrl) {
  const base64 =
    dataUrl.split(',')[1] || '';

  const bytes = base64.length * 0.75;

  return bytes / (1024 * 1024);
}

export default function SendForAnalysisModal({
  open,
  onClose,
  onCaptureImage,
  submissionToken,
  onSubmitted,
}) {
  const [fields, setFields] =
    useState(INITIAL_FIELDS);

  const [errors, setErrors] =
    useState({});

  const [status, setStatus] =
    useState('idle');

  const [errorMessage, setErrorMessage] =
    useState('');

  if (!open) return null;

  const updateField = (field, value) => {
    setFields((current) => ({
      ...current,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((current) => ({
        ...current,
        [field]: undefined,
      }));
    }
  };

  const validate = () => {
    const nextErrors = {};

    if (!fields.name.trim()) {
      nextErrors.name =
        'Informe um nome.';
    }

    if (
      !fields.contact.trim() ||
      !isValidContact(fields.contact)
    ) {
      nextErrors.contact =
        'Informe um WhatsApp ou e-mail válido.';
    }

    if (!fields.authorized) {
      nextErrors.authorized =
        'É necessário autorizar o armazenamento para enviar.';
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  };

  const resetAndClose = () => {
    setFields(INITIAL_FIELDS);
    setErrors({});
    setStatus('idle');
    setErrorMessage('');
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (status === 'loading') return;
    if (!validate()) return;

    if (fields.website.trim()) {
      setStatus('success');
      return;
    }

    if (!submissionToken) {
      setStatus('error');

      setErrorMessage(
        'O pagamento ainda não foi confirmado. Volte ao mapa e conclua o pagamento antes de enviar.',
      );

      return;
    }

    const lastSubmit = Number(
      window.localStorage.getItem(
        LAST_SUBMIT_KEY,
      ) || 0,
    );

    const secondsSinceLast =
      (Date.now() - lastSubmit) / 1000;

    if (
      lastSubmit &&
      secondsSinceLast <
        MIN_SECONDS_BETWEEN_SUBMISSIONS
    ) {
      const remaining = Math.ceil(
        MIN_SECONDS_BETWEEN_SUBMISSIONS -
          secondsSinceLast,
      );

      setStatus('error');

      setErrorMessage(
        `Aguarde mais ${remaining}s antes de enviar novamente.`,
      );

      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const imageDataUrl =
        await onCaptureImage();

      if (!imageDataUrl) {
        throw new Error(
          'Não foi possível gerar a imagem do mapa.',
        );
      }

      const imageSizeMb =
        base64SizeInMb(imageDataUrl);

      if (
        imageSizeMb > MAX_IMAGE_SIZE_MB
      ) {
        throw new Error(
          `A imagem do mapa ficou grande demais (${imageSizeMb.toFixed(
            1,
          )}MB). Tente reduzir o zoom ou o número de personagens antes de enviar.`,
        );
      }

      if (
        !APPS_SCRIPT_URL ||
        APPS_SCRIPT_URL.includes(
          'COLE_AQUI',
        )
      ) {
        throw new Error(
          'O envio ainda não foi configurado corretamente.',
        );
      }

      const response = await fetch(
        APPS_SCRIPT_URL,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'text/plain;charset=utf-8',
          },

          body: JSON.stringify({
            action: 'submitMap',

            submissionToken,

            name: fields.name.trim(),

            contact:
              fields.contact.trim(),

            message:
              fields.message.trim(),

            imageBase64: imageDataUrl,

            authorized:
              fields.authorized,

            honeypot:
              fields.website.trim(),
          }),
        },
      );

      const result = await response
        .json()
        .catch(() => null);

      if (
        !response.ok ||
        !result ||
        result.success !== true
      ) {
        throw new Error(
          result?.error ||
            'O servidor não confirmou o recebimento.',
        );
      }

      window.localStorage.setItem(
        LAST_SUBMIT_KEY,
        String(Date.now()),
      );

      setStatus('success');

      if (
        typeof onSubmitted ===
        'function'
      ) {
        onSubmitted();
      }
    } catch (error) {
      setStatus('error');

      setErrorMessage(
        error?.message ||
          'Não foi possível enviar o mapa agora. Verifique sua conexão e tente novamente.',
      );
    }
  };

  return (
    <div
      className="send-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="send-modal-title"
    >
      <div className="send-modal">
        <button
          type="button"
          className="send-modal__close"
          onClick={resetAndClose}
          aria-label="Fechar"
        >
          <X
            size={20}
            strokeWidth={2}
          />
        </button>

        {status === 'success' ? (
          <div className="send-modal__result">
            <CheckCircle2
              size={44}
              strokeWidth={1.4}
              color="#4c6b4a"
            />

            <h2>
              Mapa enviado com sucesso.
            </h2>

            <p>
              Seu mapa sistêmico foi
              recebido e será analisado
              com cuidado. A devolutiva
              será realizada em até 24
              horas.
            </p>

            <button
              type="button"
              className="botao botao--primario"
              onClick={resetAndClose}
            >
              Fechar
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
          >
            <h2 id="send-modal-title">
              Enviar mapa para análise
            </h2>

            <p className="send-modal__description">
              O pagamento foi confirmado.
              Preencha seus dados para
              enviar uma cópia do mapa para
              análise.
            </p>

            <div className="send-modal__field">
              <label htmlFor="send-name">
                Nome
              </label>

              <input
                id="send-name"
                type="text"
                value={fields.name}
                onChange={(event) =>
                  updateField(
                    'name',
                    event.target.value,
                  )
                }
                aria-invalid={Boolean(
                  errors.name,
                )}
                disabled={
                  status === 'loading'
                }
              />

              {errors.name && (
                <span className="send-modal__error">
                  {errors.name}
                </span>
              )}
            </div>

            <div className="send-modal__field">
              <label htmlFor="send-contact">
                WhatsApp ou e-mail
              </label>

              <input
                id="send-contact"
                type="text"
                placeholder="(00) 00000-0000 ou seuemail@exemplo.com"
                value={fields.contact}
                onChange={(event) =>
                  updateField(
                    'contact',
                    event.target.value,
                  )
                }
                aria-invalid={Boolean(
                  errors.contact,
                )}
                disabled={
                  status === 'loading'
                }
              />

              {errors.contact && (
                <span className="send-modal__error">
                  {errors.contact}
                </span>
              )}
            </div>

            <div className="send-modal__field">
              <label htmlFor="send-message">
                Mensagem (opcional)
              </label>

              <textarea
                id="send-message"
                rows={3}
                placeholder="Algo que gostaria de contextualizar sobre este mapa..."
                value={fields.message}
                onChange={(event) =>
                  updateField(
                    'message',
                    event.target.value,
                  )
                }
                disabled={
                  status === 'loading'
                }
              />
            </div>

            <div
              className="send-modal__honeypot"
              aria-hidden="true"
            >
              <label htmlFor="send-website">
                Não preencha este campo
              </label>

              <input
                id="send-website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={fields.website}
                onChange={(event) =>
                  updateField(
                    'website',
                    event.target.value,
                  )
                }
              />
            </div>

            <label className="send-modal__checkbox">
              <input
                type="checkbox"
                checked={
                  fields.authorized
                }
                onChange={(event) =>
                  updateField(
                    'authorized',
                    event.target.checked,
                  )
                }
                disabled={
                  status === 'loading'
                }
              />

              <span>
                Autorizo o armazenamento
                desta imagem e destes dados
                para fins de análise.
              </span>
            </label>

            {errors.authorized && (
              <span className="send-modal__error">
                {errors.authorized}
              </span>
            )}

            {status === 'error' && (
              <div className="send-modal__alert">
                <AlertTriangle
                  size={16}
                  strokeWidth={2}
                />

                <span>
                  {errorMessage}
                </span>
              </div>
            )}

            <button
              type="submit"
              className="botao botao--primario send-modal__submit"
              disabled={
                status === 'loading'
              }
            >
              {status === 'loading' ? (
                <>
                  <Loader2
                    size={17}
                    strokeWidth={2}
                    className="send-modal__spin"
                  />

                  Enviando...
                </>
              ) : (
                <>
                  Enviar meu mapa

                  <Send
                    size={17}
                    strokeWidth={2}
                  />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}