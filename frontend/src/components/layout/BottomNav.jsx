import { NavLink } from 'react-router-dom';

const IcoCaixa = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
);

const IcoEstoque = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
  </svg>
);

const IcoRelatorio = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const itens = [
  { to: '/caixa', label: 'Caixa', Ico: IcoCaixa },
  { to: '/estoque', label: 'Estoque', Ico: IcoEstoque },
  { to: '/relatorio', label: 'Relatório', Ico: IcoRelatorio },
];

export default function BottomNav() {
  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--branco)',
        borderTop: '1px solid var(--borda)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '8px 0 12px',
        zIndex: 40,
      }}
    >
      {itens.map(({ to, label, Ico }) => (
        <NavLink
          key={to}
          to={to}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            textDecoration: 'none',
            color: isActive ? 'var(--ouro)' : 'var(--texto-leve)',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 10,
            fontWeight: isActive ? 500 : 300,
            minWidth: 60,
          })}
        >
          <Ico />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
