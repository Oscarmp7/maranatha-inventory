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
  { href: '/purchases/new', label: 'Nueva compra', color: '#0A0A63' },
  { href: '/sales/new',     label: 'Nueva venta',  color: '#059669' },
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
      <Link href={href} className="fab" aria-label={label}>
        <PlusIcon />
        <FabStyles />
      </Link>
    )
  }

  return (
    <>
      {open && <div className="fab-backdrop" onClick={() => setOpen(false)} />}
      <div className="fab-wrap">
        {open && SPEED_DIAL_ITEMS.map((item, i) => (
          <Link
            key={item.href}
            href={item.href}
            className="fab-mini"
            style={{ '--i': i, '--c': item.color } as React.CSSProperties}
            onClick={() => setOpen(false)}
          >
            <span className="fab-mini-label">{item.label}</span>
            <span className="fab-mini-dot" style={{ background: item.color }} />
          </Link>
        ))}
        <button
          type="button"
          className={`fab ${open ? 'fab-open' : ''}`}
          aria-label={open ? 'Cerrar menú' : 'Registrar'}
          aria-expanded={open}
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
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  )
}

function FabStyles() {
  return (
    <style>{`
      .fab-backdrop {
        position: fixed; inset: 0; z-index: 39; background: rgba(0,0,0,0.2);
      }
      .fab-wrap {
        position: fixed;
        bottom: calc(72px + var(--safe-bottom) + 16px);
        right: 20px;
        z-index: 40;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.5rem;
      }
      .fab {
        width: 56px; height: 56px; border-radius: 16px;
        background: #0A0A63; color: white;
        display: flex; align-items: center; justify-content: center;
        text-decoration: none; border: none; cursor: pointer;
        box-shadow: 0 4px 16px rgba(10,10,99,0.45), 0 1px 4px rgba(10,10,99,0.3);
        transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.15s, background 0.15s;
        -webkit-tap-highlight-color: transparent;
        flex-shrink: 0;
      }
      .fab svg { width: 24px; height: 24px; transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1); }
      .fab.fab-open { background: #374151; }
      .fab.fab-open svg { transform: rotate(45deg); }
      .fab:active { transform: scale(0.92); box-shadow: 0 2px 8px rgba(10,10,99,0.35); }
      @media (hover: hover) {
        .fab:hover { transform: scale(1.06); background: #1C1C9B; box-shadow: 0 8px 24px rgba(10,10,99,0.5); }
        .fab.fab-open:hover { background: #4b5563; }
      }

      .fab-mini {
        display: flex; align-items: center; gap: 0.6rem;
        text-decoration: none;
        animation: fab-up 0.2s cubic-bezier(0.34,1.56,0.64,1) both;
        animation-delay: calc(var(--i, 0) * 0.05s);
      }
      .fab-mini-label {
        background: white; color: #111827; font-size: 0.8rem; font-weight: 600;
        padding: 0.35rem 0.7rem; border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        font-family: 'DM Sans', sans-serif; white-space: nowrap;
      }
      .fab-mini-dot {
        width: 44px; height: 44px; border-radius: 13px;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 3px 10px rgba(0,0,0,0.2); flex-shrink: 0;
      }

      @keyframes fab-up {
        from { opacity: 0; transform: translateY(12px) scale(0.85); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }

      @media (min-width: 768px) {
        .fab-wrap { bottom: 24px; }
        .fab { position: static; }
      }
    `}</style>
  )
}
