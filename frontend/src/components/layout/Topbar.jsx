import { useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useWindowSize } from '../../hooks/useWindowSize';

const titulos = {
  '/caixa':     'Caixa',
  '/estoque':   'Estoque',
  '/relatorio': 'Relatório',
};

export default function Topbar() {
  const { pathname } = useLocation();
  const { width } = useWindowSize();
  const isMobile = width < 768;
  const titulo = titulos[pathname] || 'RM Modas';
  const hoje = format(new Date(), isMobile ? "dd/MM/yyyy" : "EEEE, dd 'de' MMMM", { locale: ptBR });

  return (
    <header
      style={{
        background: 'var(--preto)',
        padding: isMobile ? '0 16px' : '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #1a1a1a',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img
          src="/logo.svg"
          alt="RM Modas"
          style={{ width: isMobile ? 32 : 36, height: isMobile ? 32 : 36, flexShrink: 0 }}
        />
        <h1
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: isMobile ? 20 : 22,
            fontStyle: 'italic',
            fontWeight: 300,
            color: '#FFFFFF',
            letterSpacing: 0.5,
          }}
        >
          {titulo}
        </h1>
      </div>

      <span
        style={{
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 11,
          fontWeight: 300,
          color: 'var(--texto-leve)',
          letterSpacing: 0.5,
          textTransform: isMobile ? 'none' : 'capitalize',
        }}
      >
        {hoje}
      </span>
    </header>
  );
}
