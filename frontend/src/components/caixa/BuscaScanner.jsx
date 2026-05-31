import { useRef, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function BuscaScanner({ onProdutoEncontrado }) {
  const [codigo, setCodigo] = useState('');
  const [buscando, setBuscando] = useState(false);
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
      style={{ padding: '14px 16px', marginBottom: 20 }}
    >
      <label className="label-padrao" style={{ display: 'block', marginBottom: 6 }}>
        BUSCA POR CÓDIGO / SCANNER
      </label>
      <form onSubmit={buscar} style={{ display: 'flex', gap: 8 }}>
        <input
          ref={inputRef}
          className="input-padrao"
          style={{ flex: 1 }}
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
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
          style={{ whiteSpace: 'nowrap' }}
        >
          {buscando ? '...' : 'Buscar'}
        </button>
      </form>
    </div>
  );
}
