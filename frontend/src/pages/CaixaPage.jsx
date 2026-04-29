import { useEffect } from 'react';
import { useVendas } from '../hooks/useVendas';
import { useEstoque } from '../hooks/useEstoque';
import { useWindowSize } from '../hooks/useWindowSize';
import MetricasCards from '../components/caixa/MetricasCards';
import UltimasVendas from '../components/caixa/UltimasVendas';
import AlertaEstoque from '../components/caixa/AlertaEstoque';
import FormVenda from '../components/caixa/FormVenda';
import BarraCaixa from '../components/caixa/BarraCaixa';

export default function CaixaPage() {
  const { vendas, metricas, carregando, buscarVendas, buscarMetricas, registrarVenda, cancelarVenda, fecharCaixa } = useVendas();
  const { baixoEstoque, buscarBaixoEstoque } = useEstoque();
  const { width } = useWindowSize();
  const isMobile = width < 768;

  useEffect(() => {
    buscarVendas();
    buscarMetricas();
    buscarBaixoEstoque();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '24px' }}>
        {/* Cards de métricas */}
        {isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {metricas && (
              <>
                <div className="card" style={{ padding: '16px 20px' }}>
                  <div className="label-padrao">FATURAMENTO DO DIA</div>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontStyle: 'italic', color: 'var(--ouro)' }}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metricas.faturamentoTotal || 0)}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <MetricasCards metricas={metricas} />
        )}

        {/* Alerta de estoque baixo */}
        {baixoEstoque.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <AlertaEstoque produtos={baixoEstoque} />
          </div>
        )}

        {/* Layout principal */}
        <div style={{ display: isMobile ? 'flex' : 'grid', gridTemplateColumns: '1fr 400px', flexDirection: 'column', gap: 20 }}>
          {/* Painel esquerdo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <UltimasVendas
              vendas={vendas}
              onCancelar={cancelarVenda}
              carregando={carregando}
            />
          </div>

          {/* Formulário de venda */}
          <div>
            <FormVenda onVendaRegistrada={registrarVenda} carregando={carregando} />
          </div>
        </div>
      </div>

      {/* Barra inferior fixa */}
      <BarraCaixa vendas={vendas} onFecharCaixa={fecharCaixa} carregando={carregando} />
    </div>
  );
}
