import { formatarMoeda } from '../../utils/formatters';

export default function ResumoVisual({ resumo }) {
  if (!resumo) return null;

  const {
    totalGeral,
    totalPix,
    totalDinheiro,
    totalDebito,
    totalCredito,
    totalPecas,
    ticketMedio,
    quantidadeVendas,
    top5Produtos,
  } = resumo;

  const metricas = [
    { label: 'FATURAMENTO', valor: formatarMoeda(totalGeral), cor: 'var(--ouro)', grande: true },
    { label: 'PEÇAS',        valor: totalPecas ?? 0,          cor: 'var(--texto)' },
    { label: 'TICKET MÉDIO', valor: formatarMoeda(ticketMedio), cor: 'var(--texto)' },
    { label: 'VENDAS',       valor: quantidadeVendas ?? 0,    cor: 'var(--texto)' },
  ];

  const formas = [
    { label: 'PIX',      valor: totalPix,      cor: 'var(--verde)', bg: 'rgba(74,140,101,0.15)' },
    { label: 'Dinheiro', valor: totalDinheiro,  cor: 'var(--ouro)',  bg: 'rgba(184,146,74,0.15)' },
    { label: 'Débito',   valor: totalDebito,    cor: 'var(--roxo)',  bg: 'rgba(122,90,156,0.15)' },
    { label: 'Crédito',  valor: totalCredito,   cor: 'var(--azul)',  bg: 'rgba(74,106,156,0.15)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Métricas principais */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {metricas.map(({ label, valor, cor }, i) => (
          <div
            key={label}
            className="card animar-entrada"
            style={{
              padding: '18px 18px',
              animationDelay: `${i * 0.06}s`,
            }}
          >
            <div className="label-padrao" style={{ marginBottom: 8 }}>{label}</div>
            <div
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 22,
                fontStyle: 'italic',
                fontWeight: 600,
                color: cor,
                lineHeight: 1,
              }}
            >
              {valor}
            </div>
          </div>
        ))}
      </div>

      {/* Breakdown por forma de pagamento */}
      <div className="card" style={{ padding: '20px 22px' }}>
        <h3
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 20,
            fontStyle: 'italic',
            fontWeight: 600,
            color: 'var(--texto)',
            marginBottom: 18,
          }}
        >
          Por Forma de Pagamento
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {formas.map(({ label, valor, cor, bg }) => {
            const pct = totalGeral > 0 ? (valor / totalGeral) * 100 : 0;
            return (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: cor }} />
                    <span style={{ fontSize: 12, color: 'var(--texto-md)' }}>{label}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: cor, fontFamily: 'monospace' }}>
                    {formatarMoeda(valor)}&nbsp;
                    <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: 11, color: 'var(--texto-leve)' }}>
                      ({pct.toFixed(0)}%)
                    </span>
                  </span>
                </div>
                <div className="barra-progresso">
                  <div
                    className="barra-progresso-fill"
                    style={{ width: `${pct}%`, background: cor }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top 5 produtos */}
      {top5Produtos && top5Produtos.length > 0 && (
        <div className="card" style={{ padding: '20px 22px' }}>
          <h3
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 20,
              fontStyle: 'italic',
              fontWeight: 600,
              color: 'var(--texto)',
              marginBottom: 18,
            }}
          >
            Top 5 Produtos
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {top5Produtos.map((p, i) => (
              <div
                key={p.nome}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '11px 14px',
                  background: i === 0 ? 'rgba(184,146,74,0.07)' : 'rgba(247,245,242,0.7)',
                  borderRadius: 10,
                  border: i === 0 ? '1px solid rgba(184,146,74,0.25)' : '1px solid rgba(184,146,74,0.08)',
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: i === 0 ? 'var(--ouro)' : 'rgba(184,146,74,0.15)',
                    color: i === 0 ? '#FFF' : 'var(--ouro)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    flexShrink: 0,
                    fontFamily: 'Montserrat, sans-serif',
                  }}
                >
                  {i + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--texto)' }}>{p.nome}</div>
                  <div style={{ fontSize: 11, color: 'var(--texto-leve)', marginTop: 2 }}>{p.quantidade} peças</div>
                </div>
                <div
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: 17,
                    fontStyle: 'italic',
                    fontWeight: 600,
                    color: 'var(--ouro)',
                    flexShrink: 0,
                  }}
                >
                  {formatarMoeda(p.valorTotal)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
