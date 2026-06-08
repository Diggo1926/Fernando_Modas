import { useState } from 'react';
import { formatarMoeda, calcularMargem, corQuantidade } from '../../utils/formatters';

export default function CardProduto({ produto, onEditar, onRepor, onDeletar, onEtiquetas }) {
  const margem = calcularMargem(produto.precoCusto, produto.precoVenda);
  const [copiado, setCopiado] = useState(false);
  const [hovered, setHovered] = useState(false);

  function copiarCodigo(e) {
    e.stopPropagation();
    if (!produto.codigo) return;
    navigator.clipboard.writeText(produto.codigo).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    });
  }

  const qtdCor = produto.quantidade === 0 ? 'var(--vermelho)' : produto.quantidade <= 3 ? '#C9A84C' : 'var(--verde)';

  return (
    <div
      className="card animar-entrada"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        transform: hovered ? 'scale(1.012)' : 'scale(1)',
        boxShadow: hovered ? '0 10px 36px rgba(0,0,0,0.10)' : '0 4px 24px rgba(0,0,0,0.06)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Foto */}
      <div
        style={{
          aspectRatio: '1/1',
          background: 'rgba(247,245,242,0.8)',
          overflow: 'hidden',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        {produto.fotoUrl ? (
          <img
            src={produto.fotoUrl}
            alt={produto.nome}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
              transform: hovered ? 'scale(1.04)' : 'scale(1)',
            }}
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
              fontSize: 11,
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span>Sem foto</span>
          </div>
        )}

        {/* Badge quantidade */}
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(8px)',
            borderRadius: 12,
            padding: '3px 9px',
            fontSize: 11,
            fontWeight: 600,
            color: qtdCor,
            border: `1px solid ${qtdCor}40`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          {produto.quantidade}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
        {/* Código */}
        {produto.codigo && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: 10,
                fontWeight: 700,
                color: 'var(--ouro)',
                background: 'rgba(184,146,74,0.08)',
                border: '1px solid rgba(184,146,74,0.25)',
                borderRadius: 5,
                padding: '2px 7px',
                letterSpacing: '0.06em',
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
                padding: '2px 3px',
                color: copiado ? 'var(--verde)' : 'var(--texto-leve)',
                display: 'flex',
                alignItems: 'center',
                fontSize: 10,
                fontFamily: 'Montserrat, sans-serif',
                transition: 'color 0.15s',
              }}
            >
              {copiado ? 'OK' : (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
          </div>
        )}

        {/* Nome */}
        <div
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 15,
            fontWeight: 600,
            color: 'var(--texto)',
            lineHeight: 1.25,
          }}
        >
          {produto.nome}
        </div>

        {/* Categoria / tamanho / cor */}
        <div style={{ fontSize: 11, color: 'var(--texto-md)', letterSpacing: 0.2 }}>
          {produto.categoria} · {produto.tamanho} · {produto.cor}
        </div>

        {/* Preço + margem */}
        <div style={{ marginTop: 4, display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 19,
              fontStyle: 'italic',
              fontWeight: 600,
              color: 'var(--ouro)',
            }}
          >
            {formatarMoeda(produto.precoVenda)}
          </span>
          {margem > 0 && (
            <span style={{ fontSize: 10, color: 'var(--verde)', fontWeight: 500 }}>
              +{margem.toFixed(0)}%
            </span>
          )}
        </div>
      </div>

      {/* Ações */}
      <div
        style={{
          display: 'flex',
          borderTop: '1px solid rgba(184,146,74,0.12)',
          padding: '8px 10px',
          gap: 5,
          background: 'rgba(255,255,255,0.5)',
        }}
      >
        <button
          onClick={() => onRepor(produto)}
          style={{
            flex: 1,
            padding: '6px 0',
            background: 'rgba(74,140,101,0.08)',
            border: '1px solid rgba(74,140,101,0.3)',
            borderRadius: 6,
            fontSize: 11,
            color: 'var(--verde)',
            cursor: 'pointer',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 500,
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(74,140,101,0.15)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(74,140,101,0.08)'}
        >
          + Repor
        </button>

        {onEtiquetas && produto.codigo && (
          <button
            onClick={() => onEtiquetas(produto)}
            title="Gerar etiqueta"
            style={{
              padding: '6px 10px',
              background: 'rgba(184,146,74,0.08)',
              border: '1px solid rgba(184,146,74,0.3)',
              borderRadius: 6,
              fontSize: 11,
              color: 'var(--ouro)',
              cursor: 'pointer',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(184,146,74,0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(184,146,74,0.08)'}
          >
            Etiqueta
          </button>
        )}

        <button
          onClick={() => onEditar(produto)}
          style={{
            padding: '6px 10px',
            background: 'none',
            border: '1px solid rgba(184,146,74,0.2)',
            borderRadius: 6,
            fontSize: 11,
            color: 'var(--texto-md)',
            cursor: 'pointer',
            fontFamily: 'Montserrat, sans-serif',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--ouro)'; e.currentTarget.style.color = 'var(--ouro)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(184,146,74,0.2)'; e.currentTarget.style.color = 'var(--texto-md)'; }}
        >
          Editar
        </button>

        <button
          onClick={() => onDeletar(produto.id)}
          title="Remover produto"
          style={{
            padding: '6px 8px',
            background: 'none',
            border: '1px solid rgba(184,146,74,0.15)',
            borderRadius: 6,
            fontSize: 14,
            color: 'var(--texto-leve)',
            cursor: 'pointer',
            lineHeight: 1,
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--vermelho)'; e.currentTarget.style.color = 'var(--vermelho)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(184,146,74,0.15)'; e.currentTarget.style.color = 'var(--texto-leve)'; }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
