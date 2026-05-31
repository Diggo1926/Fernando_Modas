import { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import jsPDF from 'jspdf';
import { formatarMoeda } from '../../utils/formatters';

export default function ModalEtiquetas({ produto, onFechar }) {
  const canvasRef = useRef(null);
  const [copiado, setCopiado] = useState(false);

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

    const pdf = new jsPDF({ unit: 'mm', format: [58, 45], orientation: 'portrait' });

    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, 58, 45, 'F');

    // Código de barras
    pdf.addImage(barcodeDataUrl, 'PNG', 4, 2, 50, 17);

    // Código legível
    pdf.setFont('courier', 'normal');
    pdf.setFontSize(7);
    pdf.text(produto.codigo, 29, 21, { align: 'center' });

    // Nome do produto
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    const nome = produto.nome.length > 26 ? produto.nome.substring(0, 26) + '.' : produto.nome;
    pdf.text(nome.toUpperCase(), 29, 27, { align: 'center' });

    // Preço
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text(formatarMoeda(Number(produto.precoVenda)), 29, 34, { align: 'center' });

    // Tamanho
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text(`TAM ${produto.tamanho}`, 29, 41, { align: 'center' });

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
          <canvas ref={canvasRef} style={{ width: '100%', display: 'block' }} />

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
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: copiado ? 'var(--verde)' : 'var(--texto-leve)', fontSize: 12, fontFamily: 'Montserrat, sans-serif' }}
            >
              {copiado ? 'Copiado!' : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--texto)', marginTop: 4, letterSpacing: '0.03em' }}>
            {produto.nome.length > 26 ? produto.nome.substring(0, 26) + '.' : produto.nome.toUpperCase()}
          </div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontStyle: 'italic', color: 'var(--ouro)', marginTop: 4 }}>
            {formatarMoeda(Number(produto.precoVenda))}
          </div>
          <div style={{ fontSize: 12, color: 'var(--texto-md)', marginTop: 2 }}>
            TAM {produto.tamanho}
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
