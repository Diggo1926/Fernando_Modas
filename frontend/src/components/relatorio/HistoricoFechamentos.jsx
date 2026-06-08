import { formatarData, formatarMoeda } from '../../utils/formatters';

export default function HistoricoFechamentos({ fechamentos, onSelecionar }) {
  if (!fechamentos || fechamentos.length === 0) {
    return (
      <div className="card" style={{ padding: 28, textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--texto-leve)' }}>Nenhum fechamento registrado</p>
      </div>
    );
  }

  return (
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
              background: 'rgba(247,245,242,0.7)',
              border: '1px solid rgba(184,146,74,0.1)',
              borderRadius: 10,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              textAlign: 'left',
              width: '100%',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(184,146,74,0.35)';
              e.currentTarget.style.background = 'rgba(184,146,74,0.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(184,146,74,0.1)';
              e.currentTarget.style.background = 'rgba(247,245,242,0.7)';
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--texto)' }}>
                {formatarData(f.data)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--texto-leve)', marginTop: 3 }}>
                {f.totalPecas ?? 0} peças
              </div>
            </div>
            <div
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 19,
                fontStyle: 'italic',
                fontWeight: 600,
                color: 'var(--ouro)',
                flexShrink: 0,
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
