import { useNavigate } from 'react-router-dom';

export default function AlertaEstoque({ produtos }) {
  const navigate = useNavigate();

  if (!produtos || produtos.length === 0) return null;

  return (
    <div className="card" style={{ padding: 20, borderColor: 'var(--vermelho)', background: 'var(--vermelho-bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, fontStyle: 'italic', fontWeight: 400, color: 'var(--vermelho)' }}>
          ⚠ Estoque Baixo
        </h3>
        <button
          onClick={() => navigate('/estoque')}
          style={{
            fontSize: 11,
            color: 'var(--vermelho)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 500,
          }}
        >
          Ir para estoque
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {produtos.map((p) => (
          <div
            key={p.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 13,
            }}
          >
            <span className="ponto-alerta" />
            <span style={{ flex: 1, color: 'var(--texto)' }}>{p.nome}</span>
            <span style={{ fontWeight: 600, color: 'var(--vermelho)' }}>
              {p.quantidade} {p.quantidade === 1 ? 'un.' : 'un.'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
