'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  adminOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Inicio',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    href: '/purchases',
    label: 'Compras',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
    ),
  },
  {
    href: '/sales',
    label: 'Ventas',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
      </svg>
    ),
  },
  {
    href: '/products',
    label: 'Productos',
    adminOnly: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
  },
]

interface BottomNavProps {
  isAdmin: boolean
}

export default function BottomNav({ isAdmin }: BottomNavProps) {
  const pathname = usePathname()

  const visibleItems = NAV_ITEMS.filter(item => !item.adminOnly || isAdmin)

  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {visibleItems.map((item) => {
        const active = pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`bottom-nav-item ${active ? 'active' : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </Link>
        )
      })}

      <style>{`
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 50;
          background: #0A0A63;
          display: flex;
          align-items: stretch;
          padding-bottom: var(--safe-bottom);
          box-shadow: 0 -1px 0 rgba(255,255,255,0.06), 0 -8px 32px rgba(5,5,50,0.4);
        }

        .bottom-nav-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          padding: 10px 4px;
          text-decoration: none;
          color: rgba(255,255,255,0.45);
          transition: color 0.15s;
          position: relative;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          min-height: 56px;
        }

        .bottom-nav-item:active {
          color: rgba(255,255,255,0.85);
          background: rgba(255,255,255,0.07);
        }

        .bottom-nav-item:active .bottom-nav-icon {
          transform: scale(0.88);
        }

        .bottom-nav-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: 32px;
          height: 2px;
          background: #fff;
          border-radius: 0 0 4px 4px;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .bottom-nav-item.active {
          color: #fff;
        }

        .bottom-nav-item.active::before {
          transform: translateX(-50%) scaleX(1);
        }

        .bottom-nav-icon {
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.15s;
        }

        .bottom-nav-icon svg {
          width: 100%;
          height: 100%;
        }

        .bottom-nav-item.active .bottom-nav-icon {
          transform: translateY(-1px);
        }

        .bottom-nav-label {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.02em;
          font-family: 'DM Sans', sans-serif;
          line-height: 1;
        }

        @media (min-width: 768px) {
          .bottom-nav {
            display: none;
          }
        }
      `}</style>
    </nav>
  )
}
