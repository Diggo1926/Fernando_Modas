import { useRef, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const IcoScan = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="5" height="5" rx="1" />
    <rect x="16" y="3" width="5" height="5" rx="1" />
    <rect x="3" y="16" width="5" height="5" rx="1" />
    <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
    <path d="M21 21v.01" />
    <path d="M12 7v3a2 2 0 0 1-2 2H7" />
    <path d="M3 12h.01" />
    <path d="M12 3h.01" />
    <path d="M12 16v.01" />
    <path d="M16 12h1" />
    <path d="M21 12v.01" />
    <path d="M12 21v-1" />
  </svg>
);

export default function BuscaScanner({ onProdutoEncontrado }) {
  const [codigo, setCodigo] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [focado, setFocado] = useState(false);
  const inputRef = useRef(null);

  async function buscar(e) {
    e.preventDefault();
    const valor = codigo.trim().toUpperCase();
    if (!valor) return;

    setBuscando(true);
    try {
      const { data } = await api.get(`/estoque/codigo/${encodeURIComponent(valor)}`);
      onProdutoEncontrado(data);
      setCodigo('');
      setTimeout(() => inputRef.current?.focus(), 80);
    } catch (err) {
      toast.error(err.message === 'Código não encontrado' ? 'Código não encontrado' : err.message);
      setCodigo('');
      inputRef.current?.select();
    } finally {
      setBuscando(false);
    }
  }

  return (
    <div
      className="card"
      style={{
        padding: '16px 18px',
        marginBottom: 20,
        borderColor: focado ? 'rgba(184, 146, 74, 0.5)' : 'rgba(184, 146, 74, 0.2)',
        boxShadow: focado
          ? '0 4px 24px rgba(0,0,0,0.06), 0 0 0 3px rgba(184,146,74,0.1)'
          : '0 4px 24px rgba(0,0,0,0.06)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span style={{ color: 'var(--ouro)', opacity: 0.8 }}><IcoScan /></span>
        <label className="label-padrao" style={{ marginBottom: 0 }}>
          SCANNER / CÓDIGO DO PRODUTO
        </label>
      </div>
      <form onSubmit={buscar} style={{ display: 'flex', gap: 8 }}>
        <input
          ref={inputRef}
          className="input-padrao"
          style={{ flex: 1 }}
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          onFocus={() => setFocado(true)}
          onBlur={() => setFocado(false)}
          placeholder="Digite o código ou use o scanner..."
          autoFocus
          disabled={buscando}
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="submit"
          className="btn-secundario"
          disabled={buscando || !codigo.trim()}
          style={{ whiteSpace: 'nowrap', minWidth: 80 }}
        >
          {buscando ? '...' : 'Buscar'}
        </button>
      </form>
    </div>
  );
}
