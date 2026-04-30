import { useEffect, useState } from 'react';
import { useVendas } from '../hooks/useVendas';
import { useWindowSize } from '../hooks/useWindowSize';
import MetricasCards from '../components/caixa/MetricasCards';
import UltimasVendas from '../components/caixa/UltimasVendas';
import FormVenda from '../components/caixa/FormVenda';
import BarraCaixa from '../components/caixa/BarraCaixa';

export default function CaixaPage() {
  const { vendas, metricas, carregando, buscarVendas, buscarMetricas, registrarVenda, cancelarVenda, fecharCaixa } = useVendas();
  const { width } = useWindowSize();
  const isMobile  = width < 768;
  const isTablet  = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  const [drawerAberto, setDrawerAberto] = useState(false);

  useEffect(() => {
    buscarVendas();
    buscarMetricas();
  }, []);

  async function handleVenda(dados) {
    const ok = await registrarVenda(dados);
    if (ok) setDrawerAberto(false);
    return ok;
  }

  const formVenda = <FormVenda onVendaRegistrada={handleVenda} carregando={carregando} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '24px' }}>

        {/* Cards de métricas — responsivos */}
        <MetricasCards metricas={metricas} isMobile={isMobile} isTablet={isTablet} />

        {/* Botão Nova Venda (mobile e tablet) */}
        {!isDesktop && (
          <button
            className="btn-primario"
            style={{ width: '100%', marginBottom: 20 }}
            onClick={() => setDrawerAberto(true)}
          >
            + Nova Venda
          </button>
        )}

        {/* Layout principal */}
        {isDesktop ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 20 }}>
            <UltimasVendas vendas={vendas} onCancelar={cancelarVenda} carregando={carregando} />
            <div>{formVenda}</div>
          </div>
        ) : (
          <UltimasVendas vendas={vendas} onCancelar={cancelarVenda} carregando={carregando} />
        )}

        {/* Totais do dia como card — apenas no mobile, dentro do scroll */}
        {isMobile && (
          <div style={{ marginTop: 20 }}>
            <BarraCaixa vendas={vendas} onFecharCaixa={fecharCaixa} carregando={carregando} isMobile />
          </div>
        )}
      </div>

      {/* Drawer — mobile: sobe de baixo */}
      {isMobile && drawerAberto && (
        <div className="drawer-overlay" onClick={() => setDrawerAberto(false)}>
          <div className="drawer-box" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-handle" />
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 16px 4px' }}>
              <button
                onClick={() => setDrawerAberto(false)}
                style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--texto-leve)', minWidth: 36, minHeight: 36 }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: '0 16px 16px' }}>{formVenda}</div>
          </div>
        </div>
      )}

      {/* Modal — tablet: centralizado */}
      {isTablet && drawerAberto && (
        <div className="modal-overlay" onClick={() => setDrawerAberto(false)}>
          <div className="modal-box" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 16px 0' }}>
              <button
                onClick={() => setDrawerAberto(false)}
                style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--texto-leve)', minWidth: 36, minHeight: 36 }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: '0 20px 20px' }}>{formVenda}</div>
          </div>
        </div>
      )}

      {/* Barra de totais — tablet e desktop: fixa no bottom */}
      {!isMobile && <BarraCaixa vendas={vendas} onFecharCaixa={fecharCaixa} carregando={carregando} />}
    </div>
  );
}
