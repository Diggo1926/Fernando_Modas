import { useState } from 'react';
import { formatarMoeda } from '../../utils/formatters';

export default function BarraCaixa({ vendas, onFecharCaixa, carregando, isMobile = false }) {
  const [confirmarModal, setConfirmarModal] = useState(false);
  const [fechamento, setFechamento] = useState(null);

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
    { key: 'PIX',      label: 'PIX',     cor: 'var(--verde)' },
    { key: 'DINHEIRO', label: 'Dinheiro', cor: 'var(--ouro)' },
    { key: 'DEBITO',   label: 'Débito',  cor: 'var(--roxo)'  },
    { key: 'CREDITO',  label: 'Crédito', cor: 'var(--azul)'  },
  ];

  return (
    <>
      {isMobile ? (
        /* Card mobile */
        <div
          className="card"
          style={{ padding: 18 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <div className="label-padrao">TOTAL DO DIA</div>
            <div
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 26,
                fontStyle: 'italic',
                fontWeight: 600,
                color: 'var(--ouro)',
              }}
            >
              {formatarMoeda(totais.geral)}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {linhas.map(({ key, label, cor }) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--texto-md)' }}>{label}</span>
                <span style={{ fontWeight: 500, color: cor, fontFamily: 'monospace', fontSize: 13 }}>
                  {formatarMoeda(totais[key])}
                </span>
              </div>
            ))}
          </div>
          <button
            className="btn-primario"
            style={{ width: '100%' }}
            onClick={() => setConfirmarModal(true)}
            disabled={carregando || totais.geral === 0}
          >
            Fechar Caixa
          </button>
        </div>
      ) : (
        /* Barra desktop/tablet */
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderTop: '1px solid rgba(184, 146, 74, 0.2)',
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            gap: 16,
            flexWrap: 'wrap',
            overflowX: 'auto',
          }}
        >
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', minWidth: 0, alignItems: 'center' }}>
            <div>
              <div className="label-padrao">TOTAL DO DIA</div>
              <div
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 22,
                  fontStyle: 'italic',
                  fontWeight: 600,
                  color: 'var(--ouro)',
                }}
              >
                {formatarMoeda(totais.geral)}
              </div>
            </div>
            <div style={{ width: 1, background: 'rgba(184,146,74,0.2)', alignSelf: 'stretch' }} />
            {linhas.map(({ key, label, cor }) => (
              <div key={key}>
                <div className="label-padrao">{label.toUpperCase()}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: cor, fontFamily: 'monospace' }}>
                  {formatarMoeda(totais[key])}
                </div>
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
      )}

      {/* Modal de confirmação */}
      {confirmarModal && (
        <div className="modal-overlay" onClick={() => setConfirmarModal(false)}>
          <div className="modal-box" style={{ padding: '28px 32px' }} onClick={(e) => e.stopPropagation()}>
            <h2
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 24,
                fontStyle: 'italic',
                fontWeight: 600,
                color: 'var(--texto)',
                marginBottom: 8,
              }}
            >
              Fechar Caixa
            </h2>
            <p style={{ fontSize: 13, color: 'var(--texto-md)', marginBottom: 22 }}>
              Confirme o fechamento do caixa de hoje.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {[
                { label: 'Total Geral', valor: totais.geral, cor: 'var(--ouro)' },
                ...linhas.map((l) => ({ label: l.label, valor: totais[l.key], cor: l.cor })),
              ].map(({ label, valor, cor }) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '9px 0',
                    borderBottom: '1px solid rgba(184,146,74,0.1)',
                    fontSize: 14,
                  }}
                >
                  <span style={{ color: 'var(--texto-md)' }}>{label}</span>
                  <span style={{ color: cor, fontWeight: 600, fontFamily: 'monospace' }}>
                    {formatarMoeda(valor)}
                  </span>
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
          <div
            className="modal-box"
            style={{ padding: '36px 32px', textAlign: 'center' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'rgba(74,140,101,0.1)',
                border: '2px solid var(--verde)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--verde)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 24,
                fontStyle: 'italic',
                fontWeight: 600,
                color: 'var(--verde)',
                marginBottom: 8,
              }}
            >
              Caixa fechado!
            </h2>
            <p style={{ color: 'var(--texto-md)', fontSize: 13, marginBottom: 24 }}>
              O resumo do dia foi salvo com sucesso.
            </p>
            <button className="btn-primario" onClick={() => setFechamento(null)}>Fechar</button>
          </div>
        </div>
      )}
    </>
  );
}
