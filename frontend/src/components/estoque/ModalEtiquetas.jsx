import { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import jsPDF from 'jspdf';
import { formatarMoeda } from '../../utils/formatters';

export default function ModalEtiquetas({ produto, onFechar }) {
  const canvasRef = useRef(null);
  const [copiado, setCopiado] = useState(false);

  const precoVista = Number(produto.precoVenda);
  // precoCartao usa campo do produto se disponível, senão calcula 10% de markup
  const precoCartao =
    produto.precoCartao != null
      ? Number(produto.precoCartao)
      : Number((precoVista * 1.1).toFixed(2));

  useEffect(() => {
    if (!canvasRef.current || !produto.codigo) return;
    JsBarcode(canvasRef.current, produto.codigo, {
      format: 'CODE128',
      lineColor: '#000000',
      width: 2,
      height: 48,
      displayValue: true,
      fontSize: 11,
      textMargin: 3,
      margin: 6,
      background: '#ffffff',
    });
  }, [produto.codigo]);

  function gerarPDF() {
    if (!canvasRef.current) return;

    const barcodeDataUrl = canvasRef.current.toDataURL('image/png');
    const nome =
      produto.nome.length > 26
        ? produto.nome.substring(0, 26) + '.'
        : produto.nome;

    const pdf = new jsPDF({ unit: 'mm', format: [58, 50], orientation: 'portrait' });

    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, 58, 50, 'F');

    // Código de barras (imagem inclui texto do displayValue)
    pdf.addImage(barcodeDataUrl, 'PNG', 4, 2, 50, 18);

    // Código legível abaixo do barcode
    pdf.setFont('courier', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(50, 50, 50);
    pdf.text(produto.codigo, 29, 23, { align: 'center' });

    // Nome do produto
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(30, 30, 30);
    pdf.text(nome.toUpperCase(), 29, 28, { align: 'center' });

    // Linha divisória sutil
    pdf.setDrawColor(210, 210, 210);
    pdf.line(6, 30.5, 52, 30.5);

    // À VISTA — label
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(5.5);
    pdf.setTextColor(140, 140, 140);
    pdf.text('À VISTA', 14.5, 34.5, { align: 'center' });

    // À VISTA — preço
    pdf.setFont('helvetica', 'bolditalic');
    pdf.setFontSize(9);
    pdf.setTextColor(184, 146, 74);
    pdf.text(formatarMoeda(precoVista), 14.5, 40, { align: 'center' });

    // Separador vertical entre os dois preços
    pdf.setDrawColor(210, 210, 210);
    pdf.line(29, 31, 29, 42);

    // CARTÃO — label
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(5.5);
    pdf.setTextColor(140, 140, 140);
    pdf.text('CARTÃO', 43.5, 34.5, { align: 'center' });

    // CARTÃO — preço
    pdf.setFont('helvetica', 'bolditalic');
    pdf.setFontSize(9);
    pdf.setTextColor(184, 146, 74);
    pdf.text(formatarMoeda(precoCartao), 43.5, 40, { align: 'center' });

    // Tamanho
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(50, 50, 50);
    pdf.text(`TAM ${produto.tamanho || 'UN'}`, 29, 47, { align: 'center' });

    pdf.save(`etiqueta-${produto.codigo}.pdf`);
  }

  function copiarCodigo() {
    navigator.clipboard.writeText(produto.codigo).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    });
  }

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div
        className="modal-box"
        style={{ maxWidth: 420, padding: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontStyle: 'italic', fontWeight: 400 }}>
            Gerar Etiqueta
          </h3>
          <button
            onClick={onFechar}
            style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--texto-leve)', lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {/* Pré-visualização da etiqueta */}
        <div
          style={{
            border: '1.5px dashed var(--borda)',
            borderRadius: 6,
            padding: '16px 20px',
            background: '#fff',
            maxWidth: 260,
            margin: '0 auto 24px',
            textAlign: 'center',
          }}
        >
          {/* Código de barras */}
          <canvas ref={canvasRef} style={{ width: '100%', display: 'block' }} />

          {/* Código em ouro + botão copiar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              marginTop: 6,
            }}
          >
            <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: 'var(--ouro)' }}>
              {produto.codigo}
            </span>
            <button
              onClick={copiarCodigo}
              title="Copiar código"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 2,
                color: copiado ? 'var(--verde)' : 'var(--texto-leve)',
                fontSize: 12,
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              {copiado ? 'Copiado!' : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
          </div>

          {/* Nome do produto */}
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--texto)',
              marginTop: 4,
              letterSpacing: '0.03em',
            }}
          >
            {produto.nome.length > 26
              ? produto.nome.substring(0, 26) + '.'
              : produto.nome.toUpperCase()}
          </div>

          {/* Linha divisória sutil */}
          <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.08)', margin: '8px 0' }} />

          {/* Dois preços lado a lado */}
          <div style={{ display: 'flex', alignItems: 'stretch' }}>
            {/* À vista */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {/* Ícone dinheiro (cédula) */}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                  <rect x="1" y="6" width="22" height="12" rx="2" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
                <span
                  style={{
                    fontSize: 9,
                    color: '#999',
                    letterSpacing: '0.05em',
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 500,
                  }}
                >
                  À VISTA
                </span>
              </div>
              <span
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 16,
                  fontStyle: 'italic',
                  fontWeight: 600,
                  color: 'var(--ouro)',
                }}
              >
                {formatarMoeda(precoVista)}
              </span>
            </div>

            {/* Divisor vertical */}
            <div style={{ width: 1, background: 'rgba(0,0,0,0.08)', alignSelf: 'stretch' }} />

            {/* Cartão */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {/* Ícone cartão */}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                <span
                  style={{
                    fontSize: 9,
                    color: '#999',
                    letterSpacing: '0.05em',
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 500,
                  }}
                >
                  CARTÃO
                </span>
              </div>
              <span
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 16,
                  fontStyle: 'italic',
                  fontWeight: 600,
                  color: 'var(--ouro)',
                }}
              >
                {formatarMoeda(precoCartao)}
              </span>
            </div>
          </div>

          {/* Tamanho */}
          <div
            style={{
              fontSize: 12,
              color: 'var(--texto-md)',
              marginTop: 8,
              fontWeight: 600,
              letterSpacing: '0.05em',
            }}
          >
            TAM {produto.tamanho || 'UN'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn-primario"
            style={{ flex: 1 }}
            onClick={gerarPDF}
            disabled={!produto.codigo}
          >
            Imprimir PDF
          </button>
          <button className="btn-secundario" onClick={onFechar}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
