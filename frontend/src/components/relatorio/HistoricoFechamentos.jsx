import { formatarData, formatarMoeda } from '../../utils/formatters';

export default function HistoricoFechamentos({ fechamentos, onSelecionar }) {
  if (!fechamentos || fechamentos.length === 0) {
    return (
      <div className="card" style={{ padding: 24, textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--texto-leve)' }}>Nenhum fechamento registrado ainda</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 20 }}>
      <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontStyle: 'italic', fontWeight: 400, marginBottom: 16 }}>
        Histórico de Fechamentos
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {fechamentos.map((f) => (
          <button
            key={f.id}
            onClick={() => onSelecionar(f.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              background: 'var(--bg)',
              border: '1px solid transparent',
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'all 0.15s',
              textAlign: 'left',
              width: '100%',
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--ouro)'; e.currentTarget.style.background = 'var(--ouro-bg)'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'var(--bg)'; }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--texto)' }}>
                {formatarData(f.data)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--texto-leve)', marginTop: 2 }}>
                {f.totalPecas} peças
              </div>
            </div>
            <div
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 18,
                fontStyle: 'italic',
                color: 'var(--ouro)',
              }}
            >
              {formatarMoeda(f.totalGeral)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
