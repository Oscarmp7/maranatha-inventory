export default function NewPurchasePage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Nueva Compra</h1>
        <p className="page-subtitle">Registra una entrada de inventario</p>
      </div>
      <div className="coming-soon">
        <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M6 12l18-8 18 8v26a2 2 0 01-2 2H8a2 2 0 01-2-2V12z" stroke="#0A0A63" strokeWidth="2" strokeOpacity="0.3"/>
          <path d="M24 22v8M24 34h.01" stroke="#0A0A63" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <p>Formulario en construcción.</p>
        <p className="coming-sub">Esta pantalla estará lista en la siguiente fase.</p>
      </div>
      <style>{`
        .page { display: flex; flex-direction: column; gap: 1rem; }
        .page-header { margin-bottom: 0.25rem; }
        .page-title { font-size: 1.4rem; font-weight: 700; color: #111827; margin: 0 0 0.2rem; font-family: 'DM Sans', sans-serif; }
        .page-subtitle { font-size: 0.8rem; color: #9ca3af; margin: 0; }
        .coming-soon { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 3rem 1rem; text-align: center; background: white; border-radius: 16px; border: 1px solid #f3f4f6; }
        .coming-soon p { margin: 0; font-weight: 500; color: #374151; font-size: 0.9rem; }
        .coming-sub { font-weight: 400 !important; color: #9ca3af !important; font-size: 0.775rem !important; }
      `}</style>
    </div>
  )
}
