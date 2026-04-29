import { formatarMoeda } from '../../utils/formatters';

export default function MetricasCards({ metricas, isMobile, isTablet }) {
  if (!metricas) return null;
  const { faturamentoTotal, totalPecas, ticketMedio, produtosBaixoEstoque } = metricas;
  const pecas = totalPecas ?? 0;
  const baixoEstoque = produtosBaixoEstoque ?? 0;
  const colunas = isMobile ? 1 : isTablet ? 2 : 3;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${colunas}, 1fr)`, gap: 12, marginBottom: 20 }}>
      <div className="card animar-entrada" style={{ padding: '16px 20px' }}>
        <div className="label-padrao" style={{ marginBottom: 6 }}>FATURAMENTO DO DIA</div>
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: isMobile ? 26 : 30, fontStyle: 'italic', color: 'var(--ouro)', lineHeight: 1 }}>
          {formatarMoeda(faturamentoTotal)}
        </div>
      </div>

      <div className="card animar-entrada" style={{ padding: '16px 20px', animationDelay: '0.05s' }}>
        <div className="label-padrao" style={{ marginBottom: 6 }}>PEÇAS VENDIDAS</div>
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: isMobile ? 26 : 30, fontStyle: 'italic', color: 'var(--texto)', lineHeight: 1 }}>
          {pecas}
        </div>
        <div style={{ marginTop: 6, fontSize: 12, color: 'var(--texto-md)' }}>
          Ticket médio: <strong style={{ color: 'var(--texto)' }}>{formatarMoeda(ticketMedio)}</strong>
        </div>
      </div>

      <div
        className="card animar-entrada"
        style={{
          padding: '16px 20px',
          animationDelay: '0.1s',
          background: baixoEstoque > 0 ? 'var(--vermelho-bg)' : 'var(--branco)',
          borderColor: baixoEstoque > 0 ? 'var(--vermelho)' : 'var(--borda)',
        }}
      >
        <div className="label-padrao" style={{ marginBottom: 6 }}>ESTOQUE BAIXO</div>
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: isMobile ? 26 : 30, fontStyle: 'italic', color: baixoEstoque > 0 ? 'var(--vermelho)' : 'var(--texto)', lineHeight: 1 }}>
          {baixoEstoque}
        </div>
        <div style={{ marginTop: 6, fontSize: 12, color: 'var(--texto-md)' }}>
          {baixoEstoque > 0 ? 'produtos com ≤ 3 unidades' : 'estoque normalizado'}
        </div>
      </div>
    </div>
  );
}
