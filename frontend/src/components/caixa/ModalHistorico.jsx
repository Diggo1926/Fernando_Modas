import { formatarMoeda, formatarHora, classeTagPagamento, LABEL_FORMA } from '../../utils/formatters';

export default function ModalHistorico({ vendas, onFechar, onCancelar, carregando }) {
  const todasVendas = [...vendas].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-box" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--borda-suave)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontStyle: 'italic', fontWeight: 400 }}>
            Histórico de Vendas do Dia
          </h2>
          <button onClick={onFechar} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--texto-leve)', minWidth: 36, minHeight: 36 }}>
            ×
          </button>
        </div>

        <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {todasVendas.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--texto-leve)', padding: '24px 0', fontSize: 13 }}>
              Nenhuma venda hoje
            </p>
          ) : (
            todasVendas.map((venda) => {
              const primeiroItem = venda.items?.[0];
              const nomeProduto = primeiroItem?.produto?.nome || 'Venda';
              const tamanho = primeiroItem?.produto?.tamanho || '';

              return (
                <div
                  key={venda.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 6, background: venda.cancelada ? 'var(--vermelho-bg)' : 'var(--bg)', opacity: venda.cancelada ? 0.65 : 1 }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--texto)', textDecoration: venda.cancelada ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {nomeProduto}{venda.items?.length > 1 ? ` +${venda.items.length - 1}` : ''}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--texto-leve)', marginTop: 2 }}>
                      {tamanho && `${tamanho} · `}{formatarHora(venda.createdAt)}
                      {venda.cancelada && <span style={{ marginLeft: 6, color: 'var(--vermelho)', fontWeight: 500 }}>CANCELADA</span>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {(venda.pagamentos || []).map((p, i) => (
                      <span key={i} className={`tag-pagamento ${classeTagPagamento(p.forma)}`}>
                        {LABEL_FORMA[p.forma] || p.forma}
                      </span>
                    ))}
                  </div>

                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, fontStyle: 'italic', color: venda.cancelada ? 'var(--texto-leve)' : 'var(--ouro)', minWidth: 72, textAlign: 'right' }}>
                    {formatarMoeda(venda.total)}
                  </div>

                  {!venda.cancelada && (
                    <button
                      onClick={() => onCancelar(venda.id)}
                      disabled={carregando}
                      style={{ background: 'none', border: '1px solid var(--borda)', color: 'var(--texto-md)', padding: '4px 10px', borderRadius: 4, fontSize: 11, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', transition: 'all 0.15s', whiteSpace: 'nowrap', minHeight: 32 }}
                      onMouseOver={(e) => { e.target.style.borderColor = 'var(--vermelho)'; e.target.style.color = 'var(--vermelho)'; }}
                      onMouseOut={(e) => { e.target.style.borderColor = 'var(--borda)'; e.target.style.color = 'var(--texto-md)'; }}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
