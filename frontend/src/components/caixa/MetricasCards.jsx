import { formatarMoeda } from '../../utils/formatters';

export default function MetricasCards({ metricas }) {
  if (!metricas) return null;

  const { faturamentoTotal, totalPecas, ticketMedio, produtosBaixoEstoque } = metricas;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
      {/* Faturamento do dia */}
      <div className="card animar-entrada" style={{ padding: '20px 24px' }}>
        <div className="label-padrao" style={{ marginBottom: 8 }}>FATURAMENTO DO DIA</div>
        <div
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 30,
            fontStyle: 'italic',
            color: 'var(--ouro)',
            lineHeight: 1,
          }}
        >
          {formatarMoeda(faturamentoTotal)}
        </div>
      </div>

      {/* Peças e ticket médio */}
      <div className="card animar-entrada" style={{ padding: '20px 24px', animationDelay: '0.05s' }}>
        <div className="label-padrao" style={{ marginBottom: 8 }}>PEÇAS VENDIDAS</div>
        <div
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 30,
            fontStyle: 'italic',
            color: 'var(--texto)',
            lineHeight: 1,
          }}
        >
          {totalPecas}
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--texto-md)' }}>
          Ticket médio: <strong style={{ color: 'var(--texto)' }}>{formatarMoeda(ticketMedio)}</strong>
        </div>
      </div>

      {/* Estoque baixo */}
      <div
        className="card animar-entrada"
        style={{
          padding: '20px 24px',
          animationDelay: '0.1s',
          background: produtosBaixoEstoque > 0 ? 'var(--vermelho-bg)' : 'var(--branco)',
          borderColor: produtosBaixoEstoque > 0 ? 'var(--vermelho)' : 'var(--borda)',
        }}
      >
        <div className="label-padrao" style={{ marginBottom: 8 }}>ESTOQUE BAIXO</div>
        <div
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 30,
            fontStyle: 'italic',
            color: produtosBaixoEstoque > 0 ? 'var(--vermelho)' : 'var(--texto)',
            lineHeight: 1,
          }}
        >
          {produtosBaixoEstoque}
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--texto-md)' }}>
          {produtosBaixoEstoque > 0 ? 'produtos com ≤ 3 unidades' : 'estoque normalizado'}
        </div>
      </div>
    </div>
  );
}
