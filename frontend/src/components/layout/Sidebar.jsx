import { NavLink } from 'react-router-dom';

const IcoCaixa = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    <line x1="12" y1="12" x2="12" y2="16" />
    <line x1="10" y1="14" x2="14" y2="14" />
  </svg>
);

const IcoEstoque = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const IcoRelatorio = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6"  y1="20" x2="6"  y2="14" />
  </svg>
);

const links = [
  { to: '/caixa',     label: 'Caixa',     Ico: IcoCaixa     },
  { to: '/estoque',   label: 'Estoque',   Ico: IcoEstoque   },
  { to: '/relatorio', label: 'Relatório', Ico: IcoRelatorio },
];

export default function Sidebar({ collapsed }) {
  const largura = collapsed ? 56 : 240;

  return (
    <aside
      style={{
        width: largura,
        minWidth: largura,
        background: '#111111',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        borderRight: '1px solid rgba(184, 146, 74, 0.12)',
        flexShrink: 0,
      }}
    >
      {/* Logo + nome da marca */}
      <div
        style={{
          padding: collapsed ? '22px 0' : '28px 20px 22px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          borderBottom: '1px solid rgba(184, 146, 74, 0.12)',
          minHeight: collapsed ? 80 : 114,
          justifyContent: 'center',
        }}
      >
        <Logo tamanho={collapsed ? 34 : 50} />
        {!collapsed && (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 20,
                fontStyle: 'italic',
                fontWeight: 600,
                color: '#B8924A',
                lineHeight: 1.15,
                letterSpacing: 0.3,
              }}
            >
              Diva Modas
            </div>
            <div
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 8,
                fontWeight: 300,
                letterSpacing: 3.5,
                color: 'rgba(184, 146, 74, 0.45)',
                marginTop: 4,
                textTransform: 'uppercase',
              }}
            >
              Itabaiana · SE
            </div>
          </div>
        )}
      </div>

      {/* Navegação */}
      <nav style={{ padding: collapsed ? '12px 0' : '12px 8px', flex: 1 }}>
        {links.map(({ to, label, Ico }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              padding: collapsed ? '13px 0' : '11px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: collapsed ? 0 : 8,
              marginBottom: 2,
              textDecoration: 'none',
              color: isActive ? '#B8924A' : '#888888',
              background: isActive ? 'rgba(184, 146, 74, 0.12)' : 'transparent',
              borderLeft: !collapsed
                ? (isActive ? '3px solid #B8924A' : '3px solid transparent')
                : 'none',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 13,
              fontWeight: isActive ? 500 : 400,
              transition: 'all 0.18s ease',
              letterSpacing: 0.2,
            })}
          >
            <Ico />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Rodapé */}
      <div
        style={{
          padding: collapsed ? '12px 0' : '10px 20px',
          borderTop: '1px solid rgba(184, 146, 74, 0.1)',
          display: 'flex',
          justifyContent: collapsed ? 'center' : 'space-between',
          alignItems: 'center',
        }}
      >
        {!collapsed ? (
          <>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.18)', fontFamily: 'Montserrat, sans-serif', letterSpacing: 1 }}>
              v1.0
            </span>
            <span style={{ fontSize: 9, color: 'rgba(184,146,74,0.25)', fontFamily: 'Montserrat, sans-serif', letterSpacing: 0.5 }}>
              Sistema de Gestão
            </span>
          </>
        ) : (
          <div style={{ width: 16, height: 1, background: 'rgba(184,146,74,0.2)' }} />
        )}
      </div>
    </aside>
  );
}

function Logo({ tamanho }) {
  return (
    <img
      src="/logo-diva-modas.png"
      alt="Diva Modas"
      style={{
        width: tamanho,
        height: tamanho,
        borderRadius: '50%',
        objectFit: 'cover',
        border: '2px solid #B8924A',
        boxShadow: '0 0 0 4px rgba(184, 146, 74, 0.12)',
        flexShrink: 0,
      }}
    />
  );
}
