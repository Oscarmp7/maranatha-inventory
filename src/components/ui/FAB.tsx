'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const DIRECT_ROUTES: Record<string, { href: string; label: string }> = {
  '/purchases': { href: '/purchases/new', label: 'Nueva compra' },
  '/sales':     { href: '/sales/new',     label: 'Nueva venta'  },
}

const SPEED_DIAL_ROUTES = ['/dashboard']

const SPEED_DIAL_ITEMS = [
  { href: '/purchases/new', label: 'Nueva compra', accent: '#0A0A63' },
  { href: '/sales/new',     label: 'Nueva venta',  accent: '#059669' },
]

export default function FAB() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => { setOpen(false) }, [pathname])

  if (pathname.endsWith('/new')) return null

  const directMatch = Object.entries(DIRECT_ROUTES).find(
    ([route]) => pathname === route || pathname.startsWith(route + '/')
  )
  const isSpeedDial = SPEED_DIAL_ROUTES.some(r => pathname === r)

  if (!directMatch && !isSpeedDial) return null

  if (directMatch) {
    const [, { href, label }] = directMatch
    return (
      <>
        <Link href={href} className="fab" aria-label={label}>
          <PlusIcon />
        </Link>
        <FabStyles />
      </>
    )
  }

  return (
    <>
      {open && <div className="fab-backdrop" onClick={() => setOpen(false)} />}
      <div className="fab-root">
        {open && (
          <div className="fab-dial" role="menu">
            {SPEED_DIAL_ITEMS.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className="fab-chip"
                role="menuitem"
                style={{ '--delay': `${i * 40}ms`, '--accent': item.accent } as React.CSSProperties}
                onClick={() => setOpen(false)}
              >
                <span className="fab-chip-dot" />
                <span className="fab-chip-label">{item.label}</span>
              </Link>
            ))}
          </div>
        )}
        <button
          type="button"
          className={`fab${open ? ' fab--open' : ''}`}
          aria-label={open ? 'Cerrar menú' : 'Registrar transacción'}
          aria-expanded={open}
          aria-haspopup="menu"
          onClick={() => setOpen(v => !v)}
        >
          <PlusIcon />
        </button>
      </div>
      <FabStyles />
    </>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="22" height="22">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function FabStyles() {
  return (
    <style>{`
      .fab-backdrop {
        position: fixed; inset: 0; z-index: 39;
        background: rgba(0,0,0,0.35);
        animation: fade-in 0.15s ease;
      }
      @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }

      .fab-root {
        position: fixed;
        bottom: calc(72px + var(--safe-bottom, 0px) + 16px);
        right: 20px;
        z-index: 40;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 10px;
      }

      .fab-dial {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 8px;
      }

      .fab-chip {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 18px 12px 12px;
        min-height: 44px;
        touch-action: manipulation;
        background: white;
        border-radius: 100px;
        text-decoration: none;
        box-shadow: 0 2px 14px rgba(0,0,0,0.13), 0 0 0 1px rgba(0,0,0,0.04);
        animation: chip-up 0.24s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        animation-delay: var(--delay, 0ms);
        -webkit-tap-highlight-color: transparent;
        cursor: pointer;
        transition: box-shadow 0.12s, transform 0.12s;
      }
      .fab-chip:active {
        box-shadow: 0 1px 6px rgba(0,0,0,0.10);
        transform: scale(0.96);
      }
      @media (hover: hover) {
        .fab-chip:hover {
          box-shadow: 0 4px 20px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04);
        }
      }

      .fab-chip-dot {
        width: 11px;
        height: 11px;
        border-radius: 50%;
        background: var(--accent, #0A0A63);
        flex-shrink: 0;
        box-shadow: 0 0 0 3px rgba(10,10,99,0.12);
      }

      .fab-chip-label {
        font-size: 0.855rem;
        font-weight: 600;
        color: #111827;
        font-family: 'DM Sans', sans-serif;
        white-space: nowrap;
        letter-spacing: -0.01em;
      }

      @keyframes chip-up {
        from { opacity: 0; transform: translateY(10px) scale(0.9); }
        to   { opacity: 1; transform: translateY(0)   scale(1);   }
      }

      .fab {
        width: 56px;
        height: 56px;
        border-radius: 16px;
        background: #0A0A63;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        border: none;
        cursor: pointer;
        touch-action: manipulation;
        box-shadow: 0 4px 16px rgba(10,10,99,0.4), 0 1px 4px rgba(10,10,99,0.25);
        transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.15s, background 0.15s;
        -webkit-tap-highlight-color: transparent;
        flex-shrink: 0;
      }
      .fab svg {
        transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
      }
      .fab--open {
        background: #1f2937;
        box-shadow: 0 2px 10px rgba(0,0,0,0.25);
      }
      .fab--open svg {
        transform: rotate(45deg);
      }
      .fab:active {
        transform: scale(0.9);
      }
      @media (hover: hover) {
        .fab:not(.fab--open):hover {
          transform: scale(1.07);
          background: #1C1C9B;
          box-shadow: 0 8px 24px rgba(10,10,99,0.5);
        }
      }

      @media (min-width: 768px) {
        .fab-root { bottom: 24px; }
      }
      @media (prefers-reduced-motion: reduce) {
        .fab-chip, .fab svg, .fab { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
      }
    `}</style>
  )
}
