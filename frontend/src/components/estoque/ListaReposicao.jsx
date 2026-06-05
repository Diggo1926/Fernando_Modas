import { formatarMoeda } from '../../utils/formatters';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ListaReposicao({ produtos = [], onFechar }) {
  async function copiarLista() {
    const linhas = produtos.map(
      (p) => `${p.nome} (${p.tamanho} · ${p.cor}) — ${p.quantidade} un. restantes`
    );
    try {
      await navigator.clipboard.writeText(linhas.join('\n'));
      alert('Lista copiada para a área de transferência!');
    } catch {
      alert('Não foi possível copiar. Selecione e copie manualmente.');
    }
  }

  function exportarPDF() {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Diva Modas — Lista de Reposição', 14, 20);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 28);

    autoTable(doc, {
      startY: 36,
      head: [['Produto', 'Tamanho', 'Cor', 'Categoria', 'Qtd. Atual']],
      body: produtos.map((p) => [p.nome, p.tamanho, p.cor, p.categoria, p.quantidade]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [17, 17, 17] },
    });

    doc.save('lista-reposicao-diva-modas.pdf');
  }

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-box" style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--borda-suave)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontStyle: 'italic', fontWeight: 400 }}>
            Lista de Reposição ({produtos.length} produtos)
          </h2>
          <button onClick={onFechar} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--texto-leve)' }}>×</button>
        </div>

        <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {produtos.map((p) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                background: p.quantidade === 0 ? 'var(--vermelho-bg)' : 'var(--bg)',
                borderRadius: 6,
              }}
            >
              <span className="ponto-alerta" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--texto)' }}>{p.nome}</div>
                <div style={{ fontSize: 11, color: 'var(--texto-leve)' }}>{p.tamanho} · {p.cor} · {p.categoria}</div>
              </div>
              <span style={{ fontWeight: 600, color: 'var(--vermelho)', fontSize: 13 }}>
                {p.quantidade} un.
              </span>
            </div>
          ))}
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--borda-suave)', display: 'flex', gap: 10 }}>
          <button className="btn-primario" onClick={exportarPDF} style={{ flex: 1 }}>
            Exportar PDF
          </button>
          <button className="btn-secundario" onClick={copiarLista}>
            Copiar lista
          </button>
          <button className="btn-secundario" onClick={onFechar}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
