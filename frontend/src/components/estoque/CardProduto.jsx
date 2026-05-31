import { useState } from 'react';
import { formatarMoeda, calcularMargem, corQuantidade } from '../../utils/formatters';

export default function CardProduto({ produto, onEditar, onRepor, onDeletar, onEtiquetas }) {
  const margem = calcularMargem(produto.precoCusto, produto.precoVenda);
  const [copiado, setCopiado] = useState(false);

  function copiarCodigo(e) {
    e.stopPropagation();
    if (!produto.codigo) return;
    navigator.clipboard.writeText(produto.codigo).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    });
  }

  return (
    <div
      className="card animar-entrada"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s',
      }}
      onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)'}
      onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* Foto */}
      <div
        style={{
          aspectRatio: '1/1',
          background: 'var(--bg)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {produto.fotoUrl ? (
          <img
            src={produto.fotoUrl}
            alt={produto.nome}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 8,
              color: 'var(--texto-leve)',
              fontSize: 12,
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span>Sem foto</span>
          </div>
        )}

        {/* Badge de quantidade */}
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: 'var(--branco)',
            borderRadius: 20,
            padding: '3px 8px',
            fontSize: 11,
            fontWeight: 600,
            color: corQuantidade(produto.quantidade),
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          }}
        >
          {produto.quantidade} un.
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--texto)', lineHeight: 1.3 }}>
          {produto.nome}
        </div>

        {/* Badge de código */}
        {produto.codigo && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--ouro)',
                background: 'rgba(184,146,74,0.08)',
                border: '1px solid rgba(184,146,74,0.25)',
                borderRadius: 4,
                padding: '2px 6px',
                letterSpacing: '0.04em',
              }}
            >
              {produto.codigo}
            </span>
            <button
              onClick={copiarCodigo}
              title="Copiar código"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px 4px',
                color: copiado ? 'var(--verde)' : 'var(--texto-leve)',
                display: 'flex',
                alignItems: 'center',
                fontSize: 11,
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              {copiado ? 'Copiado!' : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
          </div>
        )}

        <div style={{ fontSize: 11, color: 'var(--texto-leve)', marginTop: 2 }}>
          {produto.categoria} · {produto.tamanho} · {produto.cor}
        </div>
        <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontStyle: 'italic', color: 'var(--ouro)' }}>
            {formatarMoeda(produto.precoVenda)}
          </span>
          <span style={{ fontSize: 10, color: 'var(--verde)', fontWeight: 500 }}>
            +{margem.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Ações */}
      <div
        style={{
          display: 'flex',
          borderTop: '1px solid var(--borda-suave)',
          padding: '8px 12px',
          gap: 6,
        }}
      >
        <button
          onClick={() => onRepor(produto)}
          style={{
            flex: 1,
            padding: '6px 0',
            background: 'var(--verde-bg)',
            border: '1px solid var(--verde)',
            borderRadius: 4,
            fontSize: 11,
            color: 'var(--verde)',
            cursor: 'pointer',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 500,
          }}
        >
          + Repor
        </button>
        {onEtiquetas && produto.codigo && (
          <button
            onClick={() => onEtiquetas(produto)}
            title="Gerar etiqueta"
            style={{
              padding: '6px 10px',
              background: 'rgba(184,146,74,0.07)',
              border: '1px solid rgba(184,146,74,0.35)',
              borderRadius: 4,
              fontSize: 11,
              color: 'var(--ouro)',
              cursor: 'pointer',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 500,
              whiteSpace: 'nowrap',
            }}
          >
            Etiqueta
          </button>
        )}
        <button
          onClick={() => onEditar(produto)}
          style={{
            padding: '6px 12px',
            background: 'none',
            border: '1px solid var(--borda)',
            borderRadius: 4,
            fontSize: 11,
            color: 'var(--texto-md)',
            cursor: 'pointer',
            fontFamily: 'Montserrat, sans-serif',
          }}
        >
          Editar
        </button>
        <button
          onClick={() => onDeletar(produto.id)}
          style={{
            padding: '6px 10px',
            background: 'none',
            border: '1px solid var(--borda)',
            borderRadius: 4,
            fontSize: 11,
            color: 'var(--texto-leve)',
            cursor: 'pointer',
          }}
          title="Remover produto"
        >
          ×
        </button>
      </div>
    </div>
  );
}
