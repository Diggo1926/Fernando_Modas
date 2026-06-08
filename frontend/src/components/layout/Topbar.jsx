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
  const titulo = titulos[pathname] || 'Diva Modas';
  const hoje = format(new Date(), isMobile ? "dd/MM/yyyy" : "EEEE, dd 'de' MMMM", { locale: ptBR });

  return (
    <header
      style={{
        background: 'rgba(247, 245, 242, 0.88)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        padding: isMobile ? '0 16px' : '0 28px',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(184, 146, 74, 0.15)',
        flexShrink: 0,
      }}
    >
      {/* Esquerda: logo (mobile) + título */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {isMobile && (
          <img
            src="/logo-diva-modas.png"
            alt="Diva Modas"
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #B8924A',
              flexShrink: 0,
            }}
          />
        )}
        <div>
          <h1
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: isMobile ? 22 : 24,
              fontStyle: 'italic',
              fontWeight: 600,
              color: '#111111',
              letterSpacing: 0.3,
              lineHeight: 1,
            }}
          >
            {titulo}
          </h1>
          {!isMobile && (
            <div
              style={{
                height: 2,
                width: 32,
                background: 'linear-gradient(90deg, #B8924A 0%, transparent 100%)',
                borderRadius: 1,
                marginTop: 4,
              }}
            />
          )}
        </div>
      </div>

      {/* Direita: nome da loja + data */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {!isMobile && (
          <span
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 11,
              fontWeight: 600,
              color: '#B8924A',
              letterSpacing: 0.5,
            }}
          >
            Diva Modas
          </span>
        )}
        {!isMobile && (
          <span style={{ color: 'rgba(184,146,74,0.4)', fontSize: 11 }}>·</span>
        )}
        <span
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 11,
            fontWeight: 300,
            color: '#888888',
            letterSpacing: 0.3,
            textTransform: 'capitalize',
          }}
        >
          {hoje}
        </span>
      </div>
    </header>
  );
}
