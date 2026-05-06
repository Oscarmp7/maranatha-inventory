import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BottomNav from '@/components/ui/BottomNav'
import FAB from '@/components/ui/FAB'
import { logout } from '@/app/actions/auth'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  return (
    <div className="app-shell">
      {/* Top bar */}
      <header className="app-header">
        <div className="app-header-brand">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" width="22" height="22">
            <rect width="24" height="24" rx="6" fill="#0A0A63"/>
            <path d="M6 17V7l6 4.5L18 7v10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>MaranaTha</span>
        </div>
        <div className="app-header-right">
          <span className="app-header-user">{profile?.name ?? user.email}</span>
          <form action={logout}>
            <button type="submit" className="app-header-logout" aria-label="Cerrar sesión">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </form>
        </div>
      </header>

      {/* Page content */}
      <main className="app-main">
        {children}
      </main>

      {/* Bottom navigation */}
      <BottomNav isAdmin={isAdmin} />

      {/* Floating action button */}
      <FAB />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .app-shell {
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          background: #f5f5f7;
          font-family: 'DM Sans', sans-serif;
        }

        .app-header {
          position: sticky;
          top: 0;
          z-index: 30;
          background: #0A0A63;
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1rem;
          height: 52px;
          box-shadow: 0 1px 0 rgba(255,255,255,0.08);
        }

        .app-header-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.01em;
          color: white;
        }

        .app-header-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .app-header-user {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.6);
          font-weight: 400;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .app-header-logout {
          background: none;
          border: none;
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.15s, background 0.15s;
          -webkit-tap-highlight-color: transparent;
        }

        .app-header-logout:hover {
          color: white;
          background: rgba(255,255,255,0.1);
        }

        .app-main {
          flex: 1;
          padding: 1rem;
          padding-bottom: calc(72px + var(--safe-bottom) + 1rem);
          max-width: 640px;
          margin: 0 auto;
          width: 100%;
        }

        @media (min-width: 768px) {
          .app-main {
            padding-bottom: 2rem;
          }
        }
      `}</style>
    </div>
  )
}
