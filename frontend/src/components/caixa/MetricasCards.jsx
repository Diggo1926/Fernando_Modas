import { formatarMoeda } from '../../utils/formatters';

const IcoFaturamento = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const IcoPecas = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z" />
  </svg>
);

const IcoAlerta = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export default function MetricasCards({ metricas, isMobile, isTablet }) {
  if (!metricas) return null;
  const { faturamentoTotal, totalPecas, ticketMedio, produtosBaixoEstoque } = metricas;
  const pecas       = totalPecas ?? 0;
  const baixoEstoque = produtosBaixoEstoque ?? 0;
  const colunas     = isMobile ? 1 : isTablet ? 2 : 3;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${colunas}, 1fr)`, gap: 12, marginBottom: 20 }}>
      {/* Faturamento */}
      <div className="card animar-entrada" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div className="label-padrao" style={{ marginBottom: 0 }}>FATURAMENTO DO DIA</div>
          <span style={{ color: 'var(--ouro)', opacity: 0.7 }}><IcoFaturamento /></span>
        </div>
        <div
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: isMobile ? 28 : 32,
            fontStyle: 'italic',
            fontWeight: 600,
            color: 'var(--ouro)',
            lineHeight: 1,
          }}
        >
          {formatarMoeda(faturamentoTotal)}
        </div>
      </div>

      {/* Peças vendidas */}
      <div className="card animar-entrada" style={{ padding: '18px 20px', animationDelay: '0.06s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div className="label-padrao" style={{ marginBottom: 0 }}>PEÇAS VENDIDAS</div>
          <span style={{ color: 'var(--texto-md)', opacity: 0.6 }}><IcoPecas /></span>
        </div>
        <div
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: isMobile ? 28 : 32,
            fontStyle: 'italic',
            fontWeight: 600,
            color: 'var(--texto)',
            lineHeight: 1,
          }}
        >
          {pecas}
        </div>
        <div style={{ marginTop: 6, fontSize: 11, color: 'var(--texto-md)' }}>
          Ticket médio:&nbsp;
          <strong style={{ color: 'var(--texto)', fontWeight: 600 }}>
            {formatarMoeda(ticketMedio)}
          </strong>
        </div>
      </div>

      {/* Estoque baixo */}
      <div
        className="card animar-entrada"
        style={{
          padding: '18px 20px',
          animationDelay: '0.12s',
          background: baixoEstoque > 0
            ? 'rgba(184, 90, 74, 0.07)'
            : 'rgba(255, 255, 255, 0.65)',
          borderColor: baixoEstoque > 0
            ? 'rgba(184, 90, 74, 0.3)'
            : 'rgba(184, 146, 74, 0.2)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div className="label-padrao" style={{ marginBottom: 0 }}>ESTOQUE BAIXO</div>
          <span style={{ color: baixoEstoque > 0 ? 'var(--vermelho)' : 'var(--texto-leve)', opacity: 0.7 }}>
            <IcoAlerta />
          </span>
        </div>
        <div
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: isMobile ? 28 : 32,
            fontStyle: 'italic',
            fontWeight: 600,
            color: baixoEstoque > 0 ? 'var(--vermelho)' : 'var(--texto)',
            lineHeight: 1,
          }}
        >
          {baixoEstoque}
        </div>
        <div style={{ marginTop: 6, fontSize: 11, color: 'var(--texto-md)' }}>
          {baixoEstoque > 0 ? 'produtos sem estoque' : 'estoque normalizado'}
        </div>
      </div>
    </div>
  );
}
