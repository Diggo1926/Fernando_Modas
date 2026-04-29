import { useState } from 'react';

export default function ModalReposicao({ produto, onFechar, onRepor, carregando }) {
  const [quantidade, setQuantidade] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!quantidade || parseInt(quantidade) < 1) return;
    await onRepor(produto.id, parseInt(quantidade));
    onFechar();
  }

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-box" style={{ maxWidth: 400, padding: 32 }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontStyle: 'italic', fontWeight: 400, marginBottom: 6 }}>
          Repor Estoque
        </h2>
        <p style={{ fontSize: 13, color: 'var(--texto-md)', marginBottom: 24 }}>
          <strong style={{ color: 'var(--texto)' }}>{produto.nome}</strong> —{' '}
          {produto.tamanho} · {produto.cor} · Atual: {produto.quantidade} un.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="label-padrao">QUANTIDADE A ADICIONAR</label>
            <input
              className="input-padrao"
              type="number"
              min="1"
              required
              autoFocus
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              placeholder="Ex: 10"
            />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn-primario" style={{ flex: 1 }} disabled={carregando}>
              {carregando ? 'Repondo...' : 'Confirmar Reposição'}
            </button>
            <button type="button" className="btn-secundario" onClick={onFechar}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
