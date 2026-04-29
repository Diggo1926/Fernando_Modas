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

  const formas = [
    { label: 'PIX', valor: totalPix, cor: 'var(--verde)', bg: 'var(--verde-bg)' },
    { label: 'Dinheiro', valor: totalDinheiro, cor: 'var(--ouro)', bg: 'var(--ouro-bg)' },
    { label: 'Débito', valor: totalDebito, cor: 'var(--roxo)', bg: 'var(--roxo-bg)' },
    { label: 'Crédito', valor: totalCredito, cor: 'var(--azul)', bg: 'var(--azul-bg)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Métricas principais */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: 'FATURAMENTO', valor: formatarMoeda(totalGeral), cor: 'var(--ouro)' },
          { label: 'PEÇAS VENDIDAS', valor: totalPecas ?? 0, cor: 'var(--texto)' },
          { label: 'TICKET MÉDIO', valor: formatarMoeda(ticketMedio), cor: 'var(--texto)' },
          { label: 'VENDAS', valor: quantidadeVendas ?? 0, cor: 'var(--texto)' },
        ].map(({ label, valor, cor }) => (
          <div key={label} className="card animar-entrada" style={{ padding: '18px 20px' }}>
            <div className="label-padrao" style={{ marginBottom: 6 }}>{label}</div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, fontStyle: 'italic', color: cor }}>
              {valor}
            </div>
          </div>
        ))}
      </div>

      {/* Breakdown por forma de pagamento */}
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontStyle: 'italic', fontWeight: 400, marginBottom: 16 }}>
          Por Forma de Pagamento
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {formas.map(({ label, valor, cor, bg }) => {
            const pct = totalGeral > 0 ? (valor / totalGeral) * 100 : 0;
            return (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--texto-md)' }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: cor }}>
                    {formatarMoeda(valor)} ({pct.toFixed(0)}%)
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
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontStyle: 'italic', fontWeight: 400, marginBottom: 16 }}>
            Top 5 Produtos
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {top5Produtos.map((p, i) => (
              <div
                key={p.nome}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  background: i === 0 ? 'var(--ouro-bg)' : 'var(--bg)',
                  borderRadius: 6,
                  border: i === 0 ? '1px solid var(--ouro)' : '1px solid transparent',
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: i === 0 ? 'var(--ouro)' : 'var(--borda)',
                    color: i === 0 ? '#FFF' : 'var(--texto-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--texto)' }}>{p.nome}</div>
                  <div style={{ fontSize: 11, color: 'var(--texto-leve)' }}>{p.quantidade} peças vendidas</div>
                </div>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, fontStyle: 'italic', color: 'var(--ouro)' }}>
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
