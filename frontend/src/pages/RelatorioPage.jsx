import { useEffect, useState } from 'react';
import { useRelatorio } from '../hooks/useRelatorio';
import { useWindowSize } from '../hooks/useWindowSize';
import ResumoVisual from '../components/relatorio/ResumoVisual';
import HistoricoFechamentos from '../components/relatorio/HistoricoFechamentos';
import { formatarData, formatarMoeda } from '../utils/formatters';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PERIODOS = [
  { key: 'hoje',         label: 'Hoje'         },
  { key: 'semana',       label: 'Esta semana'   },
  { key: 'mes',          label: 'Este mês'      },
  { key: 'personalizado',label: 'Personalizado' },
];

export default function RelatorioPage() {
  const { resumo, fechamentos, fechamentoDetalhe, carregando, buscarResumo, buscarFechamentos, buscarDetalhe } = useRelatorio();
  const { width } = useWindowSize();
  const isMobile = width < 768;

  const [periodo, setPeriodo] = useState('hoje');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [detalheAberto, setDetalheAberto] = useState(null);

  useEffect(() => { buscarFechamentos(); }, []);
  useEffect(() => { if (periodo !== 'personalizado') buscarResumo(periodo); }, [periodo]);

  function buscarPersonalizado() {
    if (dataInicio && dataFim) buscarResumo('personalizado', dataInicio, dataFim);
  }

  async function handleSelecionarFechamento(id) {
    setDetalheAberto(id);
    await buscarDetalhe(id);
  }

  function exportarPDF() {
    if (!resumo) return;
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.text('A Bella Modas', 14, 20);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.text('Relatório de Vendas', 14, 28);
    doc.setFontSize(9);
    doc.text(`Período: ${PERIODOS.find((p) => p.key === periodo)?.label || periodo}`, 14, 35);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 41);

    doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.text('Resumo', 14, 54);
    autoTable(doc, {
      startY: 58,
      body: [
        ['Faturamento Total', formatarMoeda(resumo.totalGeral)],
        ['Peças Vendidas',    String(resumo.totalPecas)],
        ['Ticket Médio',      formatarMoeda(resumo.ticketMedio)],
        ['PIX',               formatarMoeda(resumo.totalPix)],
        ['Dinheiro',          formatarMoeda(resumo.totalDinheiro)],
        ['Débito',            formatarMoeda(resumo.totalDebito)],
        ['Crédito',           formatarMoeda(resumo.totalCredito)],
      ],
      styles: { fontSize: 10 },
      columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
    });

    if (resumo.top5Produtos?.length > 0) {
      const y = doc.lastAutoTable.finalY + 12;
      doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.text('Top Produtos', 14, y);
      autoTable(doc, {
        startY: y + 4,
        head: [['Produto', 'Qtd. Vendida', 'Total Gerado']],
        body: resumo.top5Produtos.map((p) => [p.nome, String(p.quantidade), formatarMoeda(p.valorTotal)]),
        styles: { fontSize: 10 },
        headStyles: { fillColor: [17, 17, 17] },
      });
    }
    doc.save('relatorio-a-bella-modas.pdf');
  }

  return (
    <div style={{ padding: isMobile ? 16 : 24 }}>
      {/* Filtros de período */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        {PERIODOS.map(({ key, label }) => (
          <button key={key} className={`toggle-btn${periodo === key ? ' ativo' : ''}`} onClick={() => setPeriodo(key)}>
            {label}
          </button>
        ))}

        {periodo === 'personalizado' && (
          <>
            <input className="input-padrao" type="date" style={{ width: isMobile ? '100%' : 160 }}
              value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
            <span style={{ color: 'var(--texto-md)', fontSize: 13 }}>até</span>
            <input className="input-padrao" type="date" style={{ width: isMobile ? '100%' : 160 }}
              value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
            <button className="btn-primario" onClick={buscarPersonalizado} disabled={!dataInicio || !dataFim}>
              Buscar
            </button>
          </>
        )}

        {resumo && (
          <button onClick={exportarPDF} style={{ marginLeft: isMobile ? 0 : 'auto', padding: '10px 18px', background: 'var(--ouro-bg)', border: '1px solid var(--ouro)', borderRadius: 6, color: 'var(--ouro)', fontSize: 13, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', fontWeight: 500, minHeight: 48 }}>
            Exportar PDF
          </button>
        )}
      </div>

      {/* Conteúdo */}
      {carregando ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--texto-leve)', fontSize: 13 }}>
          Carregando relatório...
        </div>
      ) : (
        <div style={{ display: isMobile ? 'flex' : 'grid', gridTemplateColumns: '1fr 320px', flexDirection: 'column', gap: 24, alignItems: 'start' }}>
          <ResumoVisual resumo={resumo} />
          <HistoricoFechamentos fechamentos={fechamentos} onSelecionar={handleSelecionarFechamento} />
        </div>
      )}

      {/* Modal de detalhe de fechamento */}
      {detalheAberto && fechamentoDetalhe && (
        <div className="modal-overlay" onClick={() => setDetalheAberto(null)}>
          <div className="modal-box" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--borda-suave)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontStyle: 'italic', fontWeight: 400 }}>
                Fechamento — {formatarData(fechamentoDetalhe.data)}
              </h2>
              <button onClick={() => setDetalheAberto(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--texto-leve)', minWidth: 36, minHeight: 36 }}>×</button>
            </div>
            <div style={{ padding: '16px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'Total',    valor: fechamentoDetalhe.totalGeral,    cor: 'var(--ouro)'  },
                  { label: 'Peças',    valor: (fechamentoDetalhe.totalPecas ?? 0) + ' un.', cor: 'var(--texto)' },
                  { label: 'PIX',      valor: fechamentoDetalhe.totalPix,      cor: 'var(--verde)' },
                  { label: 'Dinheiro', valor: fechamentoDetalhe.totalDinheiro, cor: 'var(--ouro)'  },
                  { label: 'Débito',   valor: fechamentoDetalhe.totalDebito,   cor: 'var(--roxo)'  },
                  { label: 'Crédito',  valor: fechamentoDetalhe.totalCredito,  cor: 'var(--azul)'  },
                ].map(({ label, valor, cor }) => (
                  <div key={label} style={{ padding: '10px 14px', background: 'var(--bg)', borderRadius: 6 }}>
                    <div className="label-padrao">{label}</div>
                    <div style={{ color: cor, fontWeight: 600, fontSize: 14 }}>
                      {typeof valor === 'number' ? formatarMoeda(valor) : valor}
                    </div>
                  </div>
                ))}
              </div>

              {/* Lista de vendas do fechamento — usa items[] e total */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto' }}>
                {fechamentoDetalhe.vendas?.map((v) => {
                  const nomes = v.items?.map((i) => i.produto?.nome).filter(Boolean).join(', ') || '—';
                  return (
                    <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg)', borderRadius: 4, fontSize: 12 }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{nomes}</span>
                      <span style={{ color: 'var(--ouro)', marginLeft: 12, flexShrink: 0 }}>{formatarMoeda(v.total)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
