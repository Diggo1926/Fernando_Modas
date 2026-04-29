import { useState } from 'react';
import { formatarMoeda, formatarHora, classeTagPagamento, LABEL_FORMA } from '../../utils/formatters';
import ModalHistorico from './ModalHistorico';

export default function UltimasVendas({ vendas, onCancelar, carregando }) {
  const [modalAberto, setModalAberto] = useState(false);

  const recentes = vendas.filter((v) => !v.cancelada).slice(0, 5);

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontStyle: 'italic', fontWeight: 400 }}>
          Últimas Vendas
        </h3>
        <button
          onClick={() => setModalAberto(true)}
          style={{ fontSize: 12, color: 'var(--ouro)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
        >
          Ver histórico
        </button>
      </div>

      {recentes.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--texto-leve)', textAlign: 'center', padding: '20px 0' }}>
          Nenhuma venda registrada hoje
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recentes.map((venda) => {
            const primeiroItem = venda.items?.[0];
            const nomeProduto = primeiroItem?.produto?.nome || 'Venda';
            const tamanho = primeiroItem?.produto?.tamanho || '';

            return (
              <div
                key={venda.id}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg)', borderRadius: 6, gap: 8 }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--texto)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {nomeProduto}{venda.items?.length > 1 ? ` +${venda.items.length - 1}` : ''}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--texto-leve)', marginTop: 2 }}>
                    {tamanho && `${tamanho} · `}{formatarHora(venda.createdAt)}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {(venda.pagamentos || []).map((p, i) => (
                    <span key={i} className={`tag-pagamento ${classeTagPagamento(p.forma)}`}>
                      {LABEL_FORMA[p.forma] || p.forma}
                    </span>
                  ))}
                </div>

                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, fontStyle: 'italic', color: 'var(--ouro)', minWidth: 72, textAlign: 'right' }}>
                  {formatarMoeda(venda.total)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalAberto && (
        <ModalHistorico
          vendas={vendas}
          onFechar={() => setModalAberto(false)}
          onCancelar={onCancelar}
          carregando={carregando}
        />
      )}
    </div>
  );
}
