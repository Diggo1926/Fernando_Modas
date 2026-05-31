import { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatarMoeda } from '../../utils/formatters';
import toast from 'react-hot-toast';

const TAMANHOS = ['P', 'M', 'G', 'GG', 'GGG', 'U', '36', '38', '40', '42', '44', '46'];

const FORMAS = [
  { api: 'DINHEIRO', label: 'Dinheiro' },
  { api: 'PIX',      label: 'PIX'      },
  { api: 'DEBITO',   label: 'Débito'   },
  { api: 'CREDITO',  label: 'Crédito'  },
];

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

export default function FormVenda({ onVendaRegistrada, carregando, produtoInjetado, onProdutoInjetadoUsado }) {
  const [form, setForm] = useState(estadoInicial);

  // Produto injetado pelo scanner
  useEffect(() => {
    if (!produtoInjetado) return;
    const qtd = Math.max(1, parseInt(form.quantidade) || 1);
    setForm((f) => ({
      ...f,
      busca: produtoInjetado.nome,
      produtoSelecionado: produtoInjetado,
      sugestoes: [],
      tamanho: produtoInjetado.tamanho,
      valorTotal: String((qtd * Number(produtoInjetado.precoVenda)).toFixed(2)),
    }));
    if (onProdutoInjetadoUsado) onProdutoInjetadoUsado();
  }, [produtoInjetado]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sugestões de busca por nome
  useEffect(() => {
    if (form.busca.length < 2) { setForm((f) => ({ ...f, sugestoes: [] })); return; }
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get('/estoque', { params: { busca: form.busca } });
        setForm((f) => ({ ...f, sugestoes: Array.isArray(data) ? data.slice(0, 8) : [] }));
      } catch { /* silencioso */ }
    }, 300);
    return () => clearTimeout(timer);
  }, [form.busca]);

  function selecionarProduto(p) {
    setForm((f) => {
      const qtd = Math.max(1, parseInt(f.quantidade) || 1);
      return {
        ...f,
        busca: p.nome,
        produtoSelecionado: p,
        sugestoes: [],
        tamanho: p.tamanho,
        valorTotal: String((qtd * Number(p.precoVenda)).toFixed(2)),
      };
    });
  }

  function toggleForma(formaApi) {
    setForm((f) => {
      const novas = f.formasSelecionadas.includes(formaApi)
        ? f.formasSelecionadas.filter((x) => x !== formaApi)
        : [...f.formasSelecionadas, formaApi];

      const novosMapa = { ...f.valoresPorForma };
      if (!novas.includes(formaApi)) {
        delete novosMapa[formaApi];
      } else if (!novosMapa[formaApi]) {
        const restante = Object.values(novosMapa).reduce((a, v) => a - Number(v), Number(f.valorTotal));
        novosMapa[formaApi] = restante > 0 ? restante.toFixed(2) : '0.00';
      }
      return { ...f, formasSelecionadas: novas, valoresPorForma: novosMapa };
    });
  }

  const troco =
    form.formasSelecionadas.includes('DINHEIRO') && form.valorRecebido
      ? Number(form.valorRecebido) - Number(form.valorTotal)
      : null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.produtoSelecionado) return toast.error('Selecione um produto');
    if (!form.tamanho)            return toast.error('Selecione o tamanho');
    if (form.formasSelecionadas.length === 0) return toast.error('Selecione uma forma de pagamento');

    const pagamentos = form.formasSelecionadas.map((formaApi) => ({
      forma: formaApi,
      valor: Number(form.valoresPorForma[formaApi] || form.valorTotal),
      ...(formaApi === 'CREDITO' ? { parcelas: parseInt(form.parcelas) } : {}),
    }));

    const payload = {
      items: [{
        produtoId:    form.produtoSelecionado.id,
        quantidade:   parseInt(form.quantidade),
        precoUnitario: parseFloat(form.produtoSelecionado.precoVenda),
      }],
      pagamentos,
      total:         parseFloat(form.valorTotal),
      valorRecebido: form.formasSelecionadas.includes('DINHEIRO') && form.valorRecebido
        ? parseFloat(form.valorRecebido) : undefined,
      troco: troco !== null && troco >= 0 ? troco : undefined,
    };

    const ok = await onVendaRegistrada(payload);
    if (ok) setForm(estadoInicial);
  }

  return (
    <form className="card" style={{ padding: 20 }} onSubmit={handleSubmit}>
      <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontStyle: 'italic', fontWeight: 400, marginBottom: 16 }}>
        Registrar Venda
      </h3>

      {/* Produto selecionado via scanner — destaque visual */}
      {form.produtoSelecionado && form.produtoSelecionado.codigo && (
        <div
          style={{
            padding: '8px 12px',
            background: 'rgba(184,146,74,0.07)',
            border: '1px solid rgba(184,146,74,0.25)',
            borderRadius: 6,
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: 'var(--ouro)' }}>
            {form.produtoSelecionado.codigo}
          </span>
          <span style={{ fontSize: 12, color: 'var(--texto)', flex: 1 }}>
            {form.produtoSelecionado.nome}
          </span>
        </div>
      )}

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
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--branco)', border: '1px solid var(--borda)', borderRadius: 6, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', zIndex: 10, maxHeight: 200, overflowY: 'auto' }}>
            {form.sugestoes.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => selecionarProduto(p)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 13, borderBottom: '1px solid var(--borda-suave)', color: p.quantidade === 0 ? 'var(--texto-leve)' : 'var(--texto)', minHeight: 48 }}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>{p.nome}</div>
                  <div style={{ fontSize: 11, color: 'var(--texto-leve)' }}>
                    {p.codigo && <span style={{ fontFamily: 'monospace', color: 'var(--ouro)', marginRight: 6 }}>{p.codigo}</span>}
                    {p.tamanho} · {p.cor}
                  </div>
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
            <button key={t} type="button" className={`toggle-btn${form.tamanho === t ? ' ativo' : ''}`}
              onClick={() => setForm((f) => ({ ...f, tamanho: t }))}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Quantidade e Valor */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div>
          <label className="label-padrao">QUANTIDADE</label>
          <input className="input-padrao" type="number" min="1" value={form.quantidade}
            onChange={(e) => {
              const qtd = e.target.value;
              setForm((f) => ({
                ...f,
                quantidade: qtd,
                valorTotal: f.produtoSelecionado
                  ? String((Math.max(1, parseInt(qtd) || 1) * Number(f.produtoSelecionado.precoVenda)).toFixed(2))
                  : f.valorTotal,
              }));
            }} />
        </div>
        <div>
          <label className="label-padrao">VALOR TOTAL</label>
          <input className="input-padrao" type="number" step="0.01" min="0" value={form.valorTotal}
            onChange={(e) => setForm((f) => ({ ...f, valorTotal: e.target.value }))} />
          {form.valorTotal && (
            <div style={{ fontSize: 11, color: 'var(--ouro)', marginTop: 3 }}>
              {formatarMoeda(Number(form.valorTotal))}
            </div>
          )}
        </div>
      </div>

      {/* Formas de pagamento */}
      <div style={{ marginBottom: 14 }}>
        <label className="label-padrao">FORMA DE PAGAMENTO</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FORMAS.map(({ api: formaApi, label }) => (
            <button key={formaApi} type="button"
              className={`toggle-btn${form.formasSelecionadas.includes(formaApi) ? ' ativo' : ''}`}
              onClick={() => toggleForma(formaApi)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Valores por forma em vendas mistas */}
      {form.formasSelecionadas.length > 1 && (
        <div style={{ marginBottom: 14 }}>
          <label className="label-padrao">VALOR POR FORMA</label>
          {form.formasSelecionadas.map((formaApi) => {
            const label = FORMAS.find((f) => f.api === formaApi)?.label || formaApi;
            return (
              <div key={formaApi} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 12, width: 64, color: 'var(--texto-md)', flexShrink: 0 }}>{label}</span>
                <input className="input-padrao" type="number" step="0.01" min="0"
                  value={form.valoresPorForma[formaApi] || ''}
                  onChange={(e) => setForm((f) => ({ ...f, valoresPorForma: { ...f.valoresPorForma, [formaApi]: e.target.value } }))}
                  style={{ flex: 1 }} />
              </div>
            );
          })}
        </div>
      )}

      {/* Valor recebido em dinheiro */}
      {form.formasSelecionadas.includes('DINHEIRO') && (
        <div style={{ marginBottom: 14 }}>
          <label className="label-padrao">VALOR RECEBIDO (R$)</label>
          <input className="input-padrao" type="number" step="0.01" min="0"
            value={form.valorRecebido}
            onChange={(e) => setForm((f) => ({ ...f, valorRecebido: e.target.value }))}
            placeholder="0,00" />
          {troco !== null && (
            <div style={{ marginTop: 10, padding: '12px 16px', background: troco >= 0 ? 'var(--verde-bg)' : 'var(--vermelho-bg)', borderRadius: 6, textAlign: 'center' }}>
              <div className="label-padrao" style={{ marginBottom: 4, textAlign: 'center' }}>
                {troco >= 0 ? 'TROCO' : 'VALOR INSUFICIENTE'}
              </div>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, fontStyle: 'italic', color: troco >= 0 ? 'var(--verde)' : 'var(--vermelho)' }}>
                {formatarMoeda(Math.abs(troco))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Parcelas para crédito */}
      {form.formasSelecionadas.includes('CREDITO') && (
        <div style={{ marginBottom: 14 }}>
          <label className="label-padrao">PARCELAS</label>
          <select className="input-padrao" value={form.parcelas}
            onChange={(e) => setForm((f) => ({ ...f, parcelas: e.target.value }))}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n}x {n > 1 ? `de ${formatarMoeda(Number(form.valorTotal) / n)}` : ''}</option>
            ))}
          </select>
        </div>
      )}

      {/* Total destacado */}
      {form.valorTotal && (
        <div style={{ marginBottom: 14, padding: '12px 16px', background: 'var(--bg)', borderRadius: 8, textAlign: 'center' }}>
          <div className="label-padrao" style={{ marginBottom: 4, textAlign: 'center' }}>TOTAL DA VENDA</div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontStyle: 'italic', color: 'var(--ouro)', fontWeight: 400 }}>
            {formatarMoeda(Number(form.valorTotal))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button type="submit" className="btn-primario" disabled={carregando} style={{ flex: 1 }}>
          {carregando ? 'Registrando...' : 'Confirmar Venda'}
        </button>
        <button type="button" className="btn-secundario" onClick={() => setForm(estadoInicial)}>
          Limpar
        </button>
      </div>
    </form>
  );
}
