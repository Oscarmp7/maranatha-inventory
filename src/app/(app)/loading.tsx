export default function Loading() {
  return (
    <div className="loading-shell" aria-label="Cargando..." aria-busy="true">
      <div className="loading-bar" />
      <div className="loading-content">
        <div className="skel skel-title" />
        <div className="skel skel-sub" />
        <div className="skel-cards">
          <div className="skel skel-card" />
          <div className="skel skel-card" />
        </div>
        <div className="skel skel-row" />
        <div className="skel skel-row" style={{ width: '88%' }} />
        <div className="skel skel-row" style={{ width: '72%' }} />
      </div>

      <style>{`
        .loading-shell {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0;
          overflow: hidden;
        }

        /* Top progress bar — appears instantly, sweeps across */
        .loading-bar {
          position: fixed;
          top: 52px; /* below header */
          left: 0;
          height: 2px;
          background: linear-gradient(90deg, #0A0A63, #4f46e5, #0A0A63);
          background-size: 200% 100%;
          animation: bar-sweep 1.2s ease-in-out infinite;
          z-index: 99;
          width: 100%;
        }

        @keyframes bar-sweep {
          0%   { background-position: 100% 0; opacity: 0.9; }
          50%  { background-position: -100% 0; opacity: 1; }
          100% { background-position: 100% 0; opacity: 0.9; }
        }

        .loading-content {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding-top: 0.25rem;
          animation: fade-in 0.1s ease-out;
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .skel {
          border-radius: 8px;
          background: linear-gradient(90deg, #ebebf0 25%, #f5f5f8 50%, #ebebf0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s ease-in-out infinite;
        }

        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .skel-title  { height: 28px; width: 55%; border-radius: 6px; }
        .skel-sub    { height: 14px; width: 38%; border-radius: 4px; margin-top: -0.25rem; }

        .skel-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.625rem;
          margin-top: 0.25rem;
        }

        .skel-card   { height: 80px; border-radius: 14px; }
        .skel-row    { height: 60px; border-radius: 12px; }

        @media (prefers-reduced-motion: reduce) {
          .loading-bar, .skel { animation: none !important; }
          .skel { background: #ebebf0; }
        }
      `}</style>
    </div>
  )
}
