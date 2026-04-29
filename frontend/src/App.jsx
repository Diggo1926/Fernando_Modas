import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import BottomNav from './components/layout/BottomNav';
import CaixaPage from './pages/CaixaPage';
import EstoquePage from './pages/EstoquePage';
import RelatorioPage from './pages/RelatorioPage';
import { useWindowSize } from './hooks/useWindowSize';

export default function App() {
  const { width } = useWindowSize();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {!isMobile && <Sidebar collapsed={isTablet} />}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar />

        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            background: 'var(--bg)',
            paddingBottom: isMobile ? '64px' : '0',
          }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/caixa" replace />} />
            <Route path="/caixa" element={<CaixaPage />} />
            <Route path="/estoque" element={<EstoquePage />} />
            <Route path="/relatorio" element={<RelatorioPage />} />
          </Routes>
        </main>
      </div>

      {isMobile && <BottomNav />}
    </div>
  );
}
