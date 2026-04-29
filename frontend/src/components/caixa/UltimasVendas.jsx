import { useState } from 'react';
import { formatarMoeda, formatarHora, classeTagPagamento } from '../../utils/formatters';
import ModalHistorico from './ModalHistorico';

export default function UltimasVendas({ vendas, onCancelar, carregando }) {
  const [modalAberto, setModalAberto] = useState(false);

  // Exibe só as 5 últimas na lista principal
  const recentes = vendas.filter((v) => !v.cancelada).slice(0, 5);

  return (
    <div className="card" style={{ padding: 20 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontStyle: 'italic', fontWeight: 400 }}>
          Últimas Vendas
        </h3>
        <button
          onClick={() => setModalAberto(true)}
          style={{
            fontSize: 12,
            color: 'var(--ouro)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 500,
          }}
        >
          Ver histórico completo
        </button>
      </div>

      {recentes.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--texto-leve)', textAlign: 'center', padding: '20px 0' }}>
          Nenhuma venda registrada hoje
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recentes.map((venda) => {
            let formas = [];
            try { formas = JSON.parse(venda.formasPagamento); } catch { }

            return (
              <div
                key={venda.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: 'var(--bg)',
                  borderRadius: 6,
                  gap: 8,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--texto)', truncate: true }}>
                    {venda.produto?.nome}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--texto-leve)', marginTop: 2 }}>
                    {venda.produto?.tamanho} · {venda.produto?.cor} · {formatarHora(venda.dataHora)}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {formas.map((fp, i) => (
                    <span key={i} className={`tag-pagamento ${classeTagPagamento(fp.forma)}`}>
                      {fp.forma}
                    </span>
                  ))}
                </div>

                <div
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: 16,
                    fontStyle: 'italic',
                    color: 'var(--ouro)',
                    minWidth: 80,
                    textAlign: 'right',
                  }}
                >
                  {formatarMoeda(venda.valorTotal)}
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
