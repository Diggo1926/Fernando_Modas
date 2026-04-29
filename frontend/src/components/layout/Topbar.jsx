import { useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const titulos = {
  '/caixa': 'Caixa',
  '/estoque': 'Estoque',
  '/relatorio': 'Relatório',
};

export default function Topbar() {
  const { pathname } = useLocation();
  const titulo = titulos[pathname] || 'RM Modas';
  const hoje = format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR });

  return (
    <header
      style={{
        background: 'var(--preto)',
        padding: '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #1a1a1a',
        flexShrink: 0,
      }}
    >
      <h1
        style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 22,
          fontStyle: 'italic',
          fontWeight: 300,
          color: '#FFFFFF',
          letterSpacing: 0.5,
        }}
      >
        {titulo}
      </h1>

      <span
        style={{
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 11,
          fontWeight: 300,
          color: 'var(--texto-leve)',
          letterSpacing: 0.5,
          textTransform: 'capitalize',
        }}
      >
        {hoje}
      </span>
    </header>
  );
}
