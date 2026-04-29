import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { formatarMoeda } from '../../utils/formatters';
import toast from 'react-hot-toast';

const TAMANHOS = ['PP', 'P', 'M', 'G', 'GG', 'Único'];
const FORMAS = ['PIX', 'Dinheiro', 'Débito', 'Crédito'];

const estadoInicial = {
  busca: '',
  produtoSelecionado: null,
  sugestoes: [],
  tamanho: '',
  quantidade: '1',
  valorTotal: '',
  formasSelecionadas: [],
  valoresPorForma: {},
  valorRecebido: '',
  parcelas: '1',
};

export default function FormVenda({ onVendaRegistrada, carregando }) {
  const [form, setForm] = useState(estadoInicial);

  // Busca de produtos com debounce
  useEffect(() => {
    if (form.busca.length < 2) { setForm((f) => ({ ...f, sugestoes: [] })); return; }
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get('/estoque', { params: { busca: form.busca } });
        setForm((f) => ({ ...f, sugestoes: data.slice(0, 8) }));
      } catch { /* silencioso */ }
    }, 300);
    return () => clearTimeout(timer);
  }, [form.busca]);

  function selecionarProduto(p) {
    setForm((f) => ({
      ...f,
      busca: p.nome,
      produtoSelecionado: p,
      sugestoes: [],
      tamanho: p.tamanho,
      valorTotal: String(Number(p.precoVenda).toFixed(2)),
    }));
  }

  function toggleForma(forma) {
    setForm((f) => {
      const novas = f.formasSelecionadas.includes(forma)
        ? f.formasSelecionadas.filter((x) => x !== forma)
        : [...f.formasSelecionadas, forma];

      // Distribui o valor igualmente entre as formas ao adicionar
      const novosMapa = { ...f.valoresPorForma };
      if (!novas.includes(forma)) {
        delete novosMapa[forma];
      } else if (!novosMapa[forma]) {
        const restante = Object.values(novosMapa).reduce((a, v) => a - Number(v), Number(f.valorTotal));
        novosMapa[forma] = restante > 0 ? restante.toFixed(2) : '0.00';
      }

      return { ...f, formasSelecionadas: novas, valoresPorForma: novosMapa };
    });
  }

  const troco =
    form.formasSelecionadas.includes('Dinheiro') && form.valorRecebido
      ? Number(form.valorRecebido) - Number(form.valorTotal)
      : null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.produtoSelecionado) return toast.error('Selecione um produto');
    if (!form.tamanho) return toast.error('Selecione o tamanho');
    if (form.formasSelecionadas.length === 0) return toast.error('Selecione uma forma de pagamento');

    const formasPagamento = form.formasSelecionadas.map((forma) => ({
      forma,
      valor: Number(form.valoresPorForma[forma] || form.valorTotal),
    }));

    const ok = await onVendaRegistrada({
      produtoId: form.produtoSelecionado.id,
      quantidade: parseInt(form.quantidade),
      valorTotal: parseFloat(form.valorTotal),
      formasPagamento,
      parcelas: form.formasSelecionadas.includes('Crédito') ? parseInt(form.parcelas) : undefined,
    });

    if (ok) setForm(estadoInicial);
  }

  return (
    <form className="card" style={{ padding: 20 }} onSubmit={handleSubmit}>
      <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontStyle: 'italic', fontWeight: 400, marginBottom: 16 }}>
        Registrar Venda
      </h3>

      {/* Busca de produto */}
      <div style={{ position: 'relative', marginBottom: 14 }}>
        <label className="label-padrao">PRODUTO</label>
        <input
          className="input-padrao"
          value={form.busca}
          onChange={(e) => setForm((f) => ({ ...f, busca: e.target.value, produtoSelecionado: null }))}
          placeholder="Buscar por nome..."
        />
        {form.sugestoes.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'var(--branco)',
              border: '1px solid var(--borda)',
              borderRadius: 6,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              zIndex: 10,
              maxHeight: 200,
              overflowY: 'auto',
            }}
          >
            {form.sugestoes.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => selecionarProduto(p)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px 14px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: 13,
                  borderBottom: '1px solid var(--borda-suave)',
                  color: p.quantidade === 0 ? 'var(--texto-leve)' : 'var(--texto)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>{p.nome}</div>
                  <div style={{ fontSize: 11, color: 'var(--texto-leve)' }}>{p.tamanho} · {p.cor}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, color: 'var(--ouro)' }}>{formatarMoeda(p.precoVenda)}</div>
                  <div style={{ fontSize: 11, color: p.quantidade <= 3 ? 'var(--vermelho)' : 'var(--verde)' }}>
                    {p.quantidade} em estoque
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tamanho */}
      <div style={{ marginBottom: 14 }}>
        <label className="label-padrao">TAMANHO</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {TAMANHOS.map((t) => (
            <button
              key={t}
              type="button"
              className={`toggle-btn${form.tamanho === t ? ' ativo' : ''}`}
              onClick={() => setForm((f) => ({ ...f, tamanho: t }))}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Quantidade e Valor */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div>
          <label className="label-padrao">QUANTIDADE</label>
          <input
            className="input-padrao"
            type="number"
            min="1"
            value={form.quantidade}
            onChange={(e) => setForm((f) => ({ ...f, quantidade: e.target.value }))}
          />
        </div>
        <div>
          <label className="label-padrao">VALOR TOTAL (R$)</label>
          <input
            className="input-padrao"
            type="number"
            step="0.01"
            min="0"
            value={form.valorTotal}
            onChange={(e) => setForm((f) => ({ ...f, valorTotal: e.target.value }))}
          />
        </div>
      </div>

      {/* Formas de pagamento */}
      <div style={{ marginBottom: 14 }}>
        <label className="label-padrao">FORMA DE PAGAMENTO</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FORMAS.map((forma) => (
            <button
              key={forma}
              type="button"
              className={`toggle-btn${form.formasSelecionadas.includes(forma) ? ' ativo' : ''}`}
              onClick={() => toggleForma(forma)}
            >
              {forma}
            </button>
          ))}
        </div>
      </div>

      {/* Valores por forma em vendas mistas */}
      {form.formasSelecionadas.length > 1 && (
        <div style={{ marginBottom: 14 }}>
          <label className="label-padrao">VALOR POR FORMA</label>
          {form.formasSelecionadas.map((forma) => (
            <div key={forma} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 12, width: 60, color: 'var(--texto-md)' }}>{forma}</span>
              <input
                className="input-padrao"
                type="number"
                step="0.01"
                min="0"
                value={form.valoresPorForma[forma] || ''}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    valoresPorForma: { ...f.valoresPorForma, [forma]: e.target.value },
                  }))
                }
                style={{ flex: 1 }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Campo de dinheiro recebido */}
      {form.formasSelecionadas.includes('Dinheiro') && (
        <div style={{ marginBottom: 14 }}>
          <label className="label-padrao">VALOR RECEBIDO (R$)</label>
          <input
            className="input-padrao"
            type="number"
            step="0.01"
            min="0"
            value={form.valorRecebido}
            onChange={(e) => setForm((f) => ({ ...f, valorRecebido: e.target.value }))}
            placeholder="0,00"
          />
          {troco !== null && (
            <div
              style={{
                marginTop: 10,
                padding: '12px 16px',
                background: troco >= 0 ? 'var(--verde-bg)' : 'var(--vermelho-bg)',
                borderRadius: 6,
                textAlign: 'center',
              }}
            >
              <div className="label-padrao" style={{ marginBottom: 4, textAlign: 'center' }}>
                {troco >= 0 ? 'TROCO' : 'VALOR INSUFICIENTE'}
              </div>
              <div
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 24,
                  fontStyle: 'italic',
                  color: troco >= 0 ? 'var(--verde)' : 'var(--vermelho)',
                }}
              >
                {formatarMoeda(Math.abs(troco))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Parcelas para crédito */}
      {form.formasSelecionadas.includes('Crédito') && (
        <div style={{ marginBottom: 14 }}>
          <label className="label-padrao">PARCELAS</label>
          <select
            className="input-padrao"
            value={form.parcelas}
            onChange={(e) => setForm((f) => ({ ...f, parcelas: e.target.value }))}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n}x {n > 1 ? `de ${formatarMoeda(Number(form.valorTotal) / n)}` : ''}</option>
            ))}
          </select>
        </div>
      )}

      {/* Botões */}
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button
          type="submit"
          className="btn-primario"
          disabled={carregando}
          style={{ flex: 1 }}
        >
          {carregando ? 'Registrando...' : 'Confirmar Venda'}
        </button>
        <button
          type="button"
          className="btn-secundario"
          onClick={() => setForm(estadoInicial)}
        >
          Limpar
        </button>
      </div>
    </form>
  );
}
