'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const FAB_ROUTES: Record<string, { href: string; label: string }> = {
  '/purchases': { href: '/purchases/new', label: 'Nueva compra' },
  '/sales': { href: '/sales/new', label: 'Nueva venta' },
  '/dashboard': { href: '/purchases/new', label: 'Registrar' },
}

export default function FAB() {
  const pathname = usePathname()

  const match = Object.entries(FAB_ROUTES).find(([route]) =>
    pathname === route || pathname.startsWith(route + '/')
  )

  if (!match || pathname.includes('/new')) return null

  const [, { href, label }] = match

  return (
    <Link href={href} className="fab" aria-label={label}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

        .fab {
          position: fixed;
          bottom: calc(72px + var(--safe-bottom) + 16px);
          right: 20px;
          z-index: 40;
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: #0A0A63;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          box-shadow:
            0 4px 16px rgba(10,10,99,0.45),
            0 1px 4px rgba(10,10,99,0.3);
          transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.15s;
          -webkit-tap-highlight-color: transparent;
        }

        .fab svg {
          width: 24px;
          height: 24px;
        }

        .fab:active {
          transform: scale(0.92);
          box-shadow: 0 2px 8px rgba(10,10,99,0.35);
        }

        @media (hover: hover) {
          .fab:hover {
            transform: scale(1.06);
            background: #1C1C9B;
            box-shadow: 0 8px 24px rgba(10,10,99,0.5);
          }
        }

        @media (min-width: 768px) {
          .fab {
            bottom: 24px;
          }
        }
      `}</style>
    </Link>
  )
}
