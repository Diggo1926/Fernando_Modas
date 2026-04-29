import { useState } from 'react';
import { formatarMoeda } from '../../utils/formatters';

export default function BarraCaixa({ vendas, onFecharCaixa, carregando }) {
  const [confirmarModal, setConfirmarModal] = useState(false);
  const [fechamento, setFechamento] = useState(null);

  // Calcula totais usando a estrutura normalizada VendaPagamento
  const totais = { PIX: 0, DINHEIRO: 0, DEBITO: 0, CREDITO: 0, geral: 0 };
  for (const v of (vendas ?? []).filter((v) => !v.cancelada)) {
    totais.geral += v.total || 0;
    for (const p of v.pagamentos || []) {
      if (totais[p.forma] !== undefined) totais[p.forma] += p.valor;
    }
  }

  async function handleFechar() {
    const resultado = await onFecharCaixa();
    if (resultado) { setFechamento(resultado); setConfirmarModal(false); }
  }

  const linhas = [
    { key: 'PIX',     label: 'PIX',     cor: 'var(--verde)' },
    { key: 'DINHEIRO',label: 'Dinheiro',cor: 'var(--ouro)'  },
    { key: 'DEBITO',  label: 'Débito',  cor: 'var(--roxo)'  },
    { key: 'CREDITO', label: 'Crédito', cor: 'var(--azul)'  },
  ];

  return (
    <>
      <div
        style={{
          background: 'var(--branco)',
          borderTop: '1px solid var(--borda)',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          gap: 12,
          flexWrap: 'wrap',
          overflowX: 'auto',
        }}
      >
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', minWidth: 0 }}>
          <div>
            <div className="label-padrao">TOTAL DO DIA</div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontStyle: 'italic', color: 'var(--ouro)' }}>
              {formatarMoeda(totais.geral)}
            </div>
          </div>
          <div style={{ width: 1, background: 'var(--borda-suave)', alignSelf: 'stretch' }} />
          {linhas.map(({ key, label, cor }) => (
            <div key={key}>
              <div className="label-padrao">{label.toUpperCase()}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: cor }}>{formatarMoeda(totais[key])}</div>
            </div>
          ))}
        </div>

        <button
          className="btn-primario"
          onClick={() => setConfirmarModal(true)}
          disabled={carregando || totais.geral === 0}
          style={{ whiteSpace: 'nowrap' }}
        >
          Fechar Caixa
        </button>
      </div>

      {/* Modal de confirmação */}
      {confirmarModal && (
        <div className="modal-overlay" onClick={() => setConfirmarModal(false)}>
          <div className="modal-box" style={{ padding: 28 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontStyle: 'italic', fontWeight: 400, marginBottom: 8 }}>
              Fechar Caixa
            </h2>
            <p style={{ fontSize: 13, color: 'var(--texto-md)', marginBottom: 20 }}>
              Confirme o fechamento do caixa de hoje.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {[{ label: 'Total Geral', valor: totais.geral, cor: 'var(--ouro)' }, ...linhas.map(l => ({ label: l.label, valor: totais[l.key], cor: l.cor }))].map(({ label, valor, cor }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--borda-suave)', fontSize: 14 }}>
                  <span style={{ color: 'var(--texto-md)' }}>{label}</span>
                  <span style={{ color: cor, fontWeight: 600 }}>{formatarMoeda(valor)}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-primario" style={{ flex: 1 }} onClick={handleFechar} disabled={carregando}>
                {carregando ? 'Fechando...' : 'Confirmar'}
              </button>
              <button className="btn-secundario" onClick={() => setConfirmarModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de sucesso */}
      {fechamento && (
        <div className="modal-overlay" onClick={() => setFechamento(null)}>
          <div className="modal-box" style={{ padding: 32, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontStyle: 'italic', fontWeight: 400, color: 'var(--verde)', marginBottom: 8 }}>
              Caixa fechado com sucesso!
            </h2>
            <p style={{ color: 'var(--texto-md)', fontSize: 13 }}>O resumo do dia foi salvo.</p>
            <button className="btn-primario" style={{ marginTop: 24 }} onClick={() => setFechamento(null)}>Fechar</button>
          </div>
        </div>
      )}
    </>
  );
}
