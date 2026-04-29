import { useState } from 'react';
import { formatarMoeda } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function BarraCaixa({ vendas, onFecharCaixa, carregando }) {
  const [confirmarModal, setConfirmarModal] = useState(false);
  const [fechamento, setFechamento] = useState(null);

  // Calcula totais por forma de pagamento
  const totais = { PIX: 0, Dinheiro: 0, Débito: 0, Crédito: 0, geral: 0 };

  for (const v of vendas.filter((v) => !v.cancelada)) {
    let formas = [];
    try { formas = JSON.parse(v.formasPagamento); } catch { }
    for (const fp of formas) {
      if (totais[fp.forma] !== undefined) totais[fp.forma] += Number(fp.valor);
      totais.geral += Number(fp.valor);
    }
  }

  async function handleFechar() {
    const resultado = await onFecharCaixa();
    if (resultado) {
      setFechamento(resultado);
      setConfirmarModal(false);
    }
  }

  return (
    <>
      <div
        style={{
          background: 'var(--branco)',
          borderTop: '1px solid var(--borda)',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {/* Total geral */}
          <div>
            <div className="label-padrao">TOTAL DO DIA</div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontStyle: 'italic', color: 'var(--ouro)' }}>
              {formatarMoeda(totais.geral)}
            </div>
          </div>

          <div style={{ width: 1, background: 'var(--borda-suave)' }} />

          {/* Subtotais por forma */}
          {[
            { key: 'PIX', cor: 'var(--verde)' },
            { key: 'Dinheiro', cor: 'var(--ouro)' },
            { key: 'Débito', cor: 'var(--roxo)' },
            { key: 'Crédito', cor: 'var(--azul)' },
          ].map(({ key, cor }) => (
            <div key={key}>
              <div className="label-padrao">{key.toUpperCase()}</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: cor }}>
                {formatarMoeda(totais[key])}
              </div>
            </div>
          ))}
        </div>

        <button
          className="btn-primario"
          onClick={() => setConfirmarModal(true)}
          disabled={carregando || totais.geral === 0}
        >
          Fechar Caixa
        </button>
      </div>

      {/* Modal de confirmação de fechamento */}
      {confirmarModal && (
        <div className="modal-overlay" onClick={() => setConfirmarModal(false)}>
          <div className="modal-box" style={{ padding: 32 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, fontStyle: 'italic', fontWeight: 400, marginBottom: 8 }}>
              Fechar Caixa
            </h2>
            <p style={{ fontSize: 13, color: 'var(--texto-md)', marginBottom: 24 }}>
              Confirme o fechamento do caixa de hoje. Esta ação salvará o resumo no banco de dados.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
              {[
                { label: 'Total Geral', valor: totais.geral, cor: 'var(--ouro)' },
                { label: 'PIX', valor: totais.PIX, cor: 'var(--verde)' },
                { label: 'Dinheiro', valor: totais.Dinheiro, cor: 'var(--ouro)' },
                { label: 'Débito', valor: totais.Débito, cor: 'var(--roxo)' },
                { label: 'Crédito', valor: totais.Crédito, cor: 'var(--azul)' },
              ].map(({ label, valor, cor }) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid var(--borda-suave)',
                    fontSize: 14,
                  }}
                >
                  <span style={{ color: 'var(--texto-md)' }}>{label}</span>
                  <span style={{ color: cor, fontWeight: 600 }}>{formatarMoeda(valor)}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn-primario"
                style={{ flex: 1 }}
                onClick={handleFechar}
                disabled={carregando}
              >
                {carregando ? 'Fechando...' : 'Confirmar Fechamento'}
              </button>
              <button className="btn-secundario" onClick={() => setConfirmarModal(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de sucesso de fechamento */}
      {fechamento && (
        <div className="modal-overlay" onClick={() => setFechamento(null)}>
          <div className="modal-box" style={{ padding: 32, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, fontStyle: 'italic', fontWeight: 400, color: 'var(--verde)', marginBottom: 8 }}>
              Caixa fechado com sucesso!
            </h2>
            <p style={{ color: 'var(--texto-md)', fontSize: 13 }}>
              O resumo do dia foi salvo. Bom descanso!
            </p>
            <button className="btn-primario" style={{ marginTop: 24 }} onClick={() => setFechamento(null)}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
