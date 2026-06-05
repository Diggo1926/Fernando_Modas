import { useState, useEffect } from 'react';

export default function ModalCategorias({ categorias, carregando, onCriar, onFechar }) {
  const [nome, setNome] = useState('');
  const [temTamanhoUnico, setTemTamanhoUnico] = useState(false);
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nome.trim()) return;
    setSalvando(true);
    const ok = await onCriar({ nome: nome.trim(), temTamanhoUnico });
    if (ok) {
      setNome('');
      setTemTamanhoUnico(false);
    }
    setSalvando(false);
  }

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div
        className="modal-box"
        style={{ maxWidth: 480 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--borda-suave)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 20,
              fontStyle: 'italic',
              fontWeight: 400,
            }}
          >
            Gerenciar Categorias
          </h2>
          <button
            onClick={onFechar}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 20,
              color: 'var(--texto-leve)',
              minWidth: 36,
              minHeight: 36,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Nova categoria */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label className="label-padrao">NOVA CATEGORIA</label>
            <input
              className="input-padrao"
              placeholder="Ex: Vestido Festa"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              maxLength={60}
            />
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
                color: 'var(--texto-md)',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <input
                type="checkbox"
                checked={temTamanhoUnico}
                onChange={(e) => setTemTamanhoUnico(e.target.checked)}
                style={{ accentColor: 'var(--ouro, #B8924A)', width: 14, height: 14 }}
              />
              Permitir tamanho único (U) nesta categoria
            </label>
            <button
              type="submit"
              className="btn-primario"
              disabled={salvando || !nome.trim()}
            >
              {salvando ? 'Criando...' : 'Criar Categoria'}
            </button>
          </form>

          {/* Lista de categorias */}
          <div>
            <label className="label-padrao" style={{ marginBottom: 8, display: 'block' }}>
              CATEGORIAS EXISTENTES ({categorias.length})
            </label>
            <div
              style={{
                maxHeight: 280,
                overflowY: 'auto',
                border: '1px solid var(--borda)',
                borderRadius: 6,
              }}
            >
              {carregando ? (
                <div
                  style={{
                    padding: '20px',
                    textAlign: 'center',
                    fontSize: 12,
                    color: 'var(--texto-leve)',
                  }}
                >
                  Carregando...
                </div>
              ) : categorias.length === 0 ? (
                <div
                  style={{
                    padding: '20px',
                    textAlign: 'center',
                    fontSize: 12,
                    color: 'var(--texto-leve)',
                  }}
                >
                  Nenhuma categoria cadastrada
                </div>
              ) : (
                categorias.map((cat, i) => (
                  <div
                    key={cat.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderBottom: i < categorias.length - 1 ? '1px solid var(--borda-suave)' : 'none',
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: 'var(--texto)' }}>{cat.nome}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {cat.temTamanhoUnico && (
                        <span
                          style={{
                            fontSize: 10,
                            color: 'var(--texto-leve)',
                            background: 'var(--bg)',
                            border: '1px solid var(--borda)',
                            borderRadius: 4,
                            padding: '2px 6px',
                          }}
                        >
                          tam. único
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: 11,
                          color: 'var(--ouro, #B8924A)',
                          fontWeight: 600,
                          fontFamily: 'monospace',
                        }}
                      >
                        {cat.sigla}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
