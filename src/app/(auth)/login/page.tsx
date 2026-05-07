'use client'

import { useActionState } from 'react'
import { login } from '@/app/actions/auth'

export default function LoginPage() {
  const [error, action, pending] = useActionState(login, null)

  return (
    <div className="login-root">
      {/* Background geometric pattern */}
      <div className="login-bg">
        <div className="login-bg-pattern" aria-hidden="true" />
        <div className="login-bg-glow" aria-hidden="true" />
      </div>

      {/* Card */}
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-color.png" alt="Maranatha" height="32" className="login-logo-wordmark" />
        </div>

        <p className="login-headline">Sistema de Inventario</p>

        <form action={action} className="login-form">
          <div className="login-field">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="usuario@maranatha.com"
              required
              disabled={pending}
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              required
              disabled={pending}
            />
          </div>

          {error && (
            <div className="login-error" role="alert">
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd"/>
              </svg>
              {error}
            </div>
          )}

          <button type="submit" className="login-btn" disabled={pending}>
            {pending ? (
              <span className="login-btn-loading">
                <svg className="login-spinner" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
                  <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Ingresando…
              </span>
            ) : 'Ingresar'}
          </button>
        </form>

        <p className="login-footer">Acceso restringido al personal autorizado</p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600&display=swap');

        .login-root {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #05053a;
          padding: 1.5rem;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .login-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .login-bg-pattern {
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0);
          background-size: 32px 32px;
        }

        .login-bg-glow {
          position: absolute;
          width: 60vw;
          height: 60vw;
          max-width: 480px;
          max-height: 480px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(28,28,155,0.5) 0%, transparent 70%);
          top: -10%;
          right: -15%;
        }

        .login-card {
          position: relative;
          z-index: 1;
          background: #fff;
          border-radius: 20px;
          padding: 2.5rem 2rem;
          width: 100%;
          max-width: 380px;
          box-shadow:
            0 0 0 1px rgba(10,10,99,0.08),
            0 24px 64px rgba(5,5,58,0.35),
            0 8px 24px rgba(5,5,58,0.2);
        }

        .login-logo {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          margin-bottom: 1.5rem;
        }

        .login-logo-wordmark {
          object-fit: contain;
          max-width: 180px;
        }

        .login-headline {
          font-size: 0.8rem;
          color: #9ca3af;
          margin: 0 0 1.75rem;
          font-weight: 400;
          letter-spacing: 0.02em;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .login-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .login-field label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #374151;
          letter-spacing: 0.02em;
        }

        .login-field input {
          height: 46px;
          padding: 0 0.875rem;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          font-size: 0.9rem;
          font-family: 'DM Sans', sans-serif;
          color: #111827;
          background: #fafafa;
          transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
          outline: none;
          -webkit-appearance: none;
        }

        .login-field input::placeholder {
          color: #d1d5db;
        }

        .login-field input:focus {
          border-color: #0A0A63;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(10,10,99,0.08);
        }

        .login-field input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 0.625rem 0.75rem;
          font-size: 0.8rem;
          color: #dc2626;
          font-weight: 500;
        }

        .login-error svg {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
        }

        .login-btn {
          height: 48px;
          background: #0A0A63;
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
          margin-top: 0.25rem;
          letter-spacing: 0.02em;
          box-shadow: 0 4px 16px rgba(10,10,99,0.35);
        }

        .login-btn:hover:not(:disabled) {
          background: #1C1C9B;
          box-shadow: 0 6px 20px rgba(10,10,99,0.45);
        }

        .login-btn:active:not(:disabled) {
          transform: scale(0.98);
        }

        .login-btn:disabled {
          opacity: 0.75;
          cursor: not-allowed;
        }

        .login-btn-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .login-spinner {
          width: 18px;
          height: 18px;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .login-footer {
          text-align: center;
          font-size: 0.7rem;
          color: #d1d5db;
          margin: 1.25rem 0 0;
          letter-spacing: 0.02em;
        }
      `}</style>
    </div>
  )
}
