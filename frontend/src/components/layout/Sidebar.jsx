import { NavLink, useLocation } from 'react-router-dom';

// Ícones SVG inline
const IcoCaixa = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    <line x1="12" y1="12" x2="12" y2="16" />
    <line x1="10" y1="14" x2="14" y2="14" />
  </svg>
);

const IcoEstoque = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const IcoRelatorio = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const links = [
  { to: '/caixa', label: 'Caixa', Ico: IcoCaixa },
  { to: '/estoque', label: 'Estoque', Ico: IcoEstoque },
  { to: '/relatorio', label: 'Relatório', Ico: IcoRelatorio },
];

export default function Sidebar({ collapsed }) {
  const largura = collapsed ? 56 : 220;

  return (
    <aside
      style={{
        width: largura,
        minWidth: largura,
        background: 'var(--branco)',
        borderRight: '1px solid var(--borda)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
      }}
    >
      {/* Cabeçalho com logo */}
      <div
        style={{
          background: 'var(--preto)',
          padding: collapsed ? '20px 0' : '24px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          justifyContent: collapsed ? 'center' : 'flex-start',
          minHeight: 80,
        }}
      >
        <Logo tamanho={collapsed ? 36 : 44} />
        {!collapsed && (
          <div>
            <div
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 20,
                fontStyle: 'italic',
                fontWeight: 300,
                background: 'linear-gradient(135deg, #8A6A20, #C9A84C, #D4AA6A)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.1,
              }}
            >
              A Bella
            </div>
            <div
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 9,
                fontWeight: 300,
                letterSpacing: 4,
                color: 'var(--ouro)',
                marginTop: 2,
              }}
            >
              MODAS
            </div>
          </div>
        )}
      </div>

      {/* Navegação */}
      <nav style={{ padding: collapsed ? '16px 0' : '16px 12px', flex: 1 }}>
        {links.map(({ to, label, Ico }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: collapsed ? '12px 0' : '11px 14px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 6,
              marginBottom: 4,
              textDecoration: 'none',
              color: isActive ? 'var(--ouro)' : 'var(--texto-md)',
              background: isActive ? 'var(--ouro-bg)' : 'transparent',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 13,
              fontWeight: isActive ? 500 : 400,
              transition: 'all 0.15s',
            })}
          >
            <Ico />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Rodapé */}
      {!collapsed && (
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--borda-suave)',
            fontSize: 10,
            color: 'var(--texto-leve)',
            fontFamily: 'Montserrat, sans-serif',
            letterSpacing: 1,
          }}
        >
          ITABAIANA · SE
        </div>
      )}
    </aside>
  );
}

function Logo({ tamanho }) {
  return (
    <img
      src="/logo-abella.jpeg"
      alt="A Bella Modas"
      style={{
        width: tamanho,
        height: tamanho,
        borderRadius: '50%',
        objectFit: 'cover',
        border: '2px solid #B8924A',
        flexShrink: 0,
      }}
    />
  );
}
