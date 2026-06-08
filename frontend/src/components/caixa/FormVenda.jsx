import { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatarMoeda } from '../../utils/formatters';
import toast from 'react-hot-toast';

const TAMANHOS = ['P', 'M', 'G', 'GG', 'GGG', 'U', '36', '38', '40', '42', '44', '46'];

const FORMAS = [
  { api: 'DINHEIRO', label: 'Dinheiro', cor: 'var(--ouro)',  bg: 'rgba(184,146,74,0.08)'  },
  { api: 'PIX',      label: 'PIX',      cor: 'var(--verde)', bg: 'rgba(74,140,101,0.08)'  },
  { api: 'DEBITO',   label: 'Débito',   cor: 'var(--roxo)',  bg: 'rgba(122,90,156,0.08)'  },
  { api: 'CREDITO',  label: 'Crédito',  cor: 'var(--azul)',  bg: 'rgba(74,106,156,0.08)'  },
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
        produtoId:     form.produtoSelecionado.id,
        quantidade:    parseInt(form.quantidade),
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
      <h3
        style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 20,
          fontStyle: 'italic',
          fontWeight: 600,
          color: 'var(--texto)',
          marginBottom: 18,
        }}
      >
        Registrar Venda
      </h3>

      {/* Produto selecionado via scanner */}
      {form.produtoSelecionado && form.produtoSelecionado.codigo && (
        <div
          style={{
            padding: '10px 14px',
            background: 'rgba(184,146,74,0.07)',
            border: '1px solid rgba(184,146,74,0.25)',
            borderRadius: 10,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--ouro)',
              background: 'rgba(184,146,74,0.1)',
              padding: '2px 6px',
              borderRadius: 4,
            }}
          >
            {form.produtoSelecionado.codigo}
          </span>
          <span style={{ fontSize: 13, color: 'var(--texto)', flex: 1, fontWeight: 500 }}>
            {form.produtoSelecionado.nome}
          </span>
        </div>
      )}

      {/* Busca produto */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
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
              background: 'rgba(255,255,255,0.96)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(184,146,74,0.2)',
              borderRadius: 10,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              zIndex: 10,
              maxHeight: 220,
              overflowY: 'auto',
              marginTop: 4,
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
                  borderBottom: '1px solid rgba(184,146,74,0.08)',
                  color: p.quantidade === 0 ? 'var(--texto-leve)' : 'var(--texto)',
                  minHeight: 48,
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(184,146,74,0.06)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>{p.nome}</div>
                  <div style={{ fontSize: 11, color: 'var(--texto-leve)', marginTop: 2 }}>
                    {p.codigo && (
                      <span style={{ fontFamily: 'monospace', color: 'var(--ouro)', marginRight: 6 }}>{p.codigo}</span>
                    )}
                    {p.tamanho} · {p.cor}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                  <div style={{ fontSize: 14, color: 'var(--ouro)', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>
                    {formatarMoeda(p.precoVenda)}
                  </div>
                  <div style={{ fontSize: 10, color: p.quantidade === 0 ? 'var(--vermelho)' : 'var(--verde)' }}>
                    {p.quantidade} em estoque
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tamanho */}
      <div style={{ marginBottom: 16 }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div>
          <label className="label-padrao">QUANTIDADE</label>
          <input
            className="input-padrao"
            type="number"
            min="1"
            value={form.quantidade}
            onChange={(e) => {
              const qtd = e.target.value;
              setForm((f) => ({
                ...f,
                quantidade: qtd,
                valorTotal: f.produtoSelecionado
                  ? String((Math.max(1, parseInt(qtd) || 1) * Number(f.produtoSelecionado.precoVenda)).toFixed(2))
                  : f.valorTotal,
              }));
            }}
          />
        </div>
        <div>
          <label className="label-padrao">VALOR TOTAL</label>
          <input
            className="input-padrao"
            type="number"
            step="0.01"
            min="0"
            value={form.valorTotal}
            onChange={(e) => setForm((f) => ({ ...f, valorTotal: e.target.value }))}
          />
          {form.valorTotal && (
            <div style={{ fontSize: 11, color: 'var(--ouro)', marginTop: 3, fontFamily: 'monospace' }}>
              {formatarMoeda(Number(form.valorTotal))}
            </div>
          )}
        </div>
      </div>

      {/* Formas de pagamento — cards glassmorphism */}
      <div style={{ marginBottom: 16 }}>
        <label className="label-padrao">FORMA DE PAGAMENTO</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {FORMAS.map(({ api: formaApi, label, cor, bg }) => {
            const ativa = form.formasSelecionadas.includes(formaApi);
            return (
              <button
                key={formaApi}
                type="button"
                onClick={() => toggleForma(formaApi)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: ativa ? `1.5px solid ${cor}` : '1px solid rgba(184,146,74,0.2)',
                  background: ativa ? bg : 'rgba(255,255,255,0.5)',
                  backdropFilter: 'blur(8px)',
                  color: ativa ? cor : 'var(--texto-md)',
                  fontSize: 13,
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: ativa ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                  boxShadow: ativa ? `0 2px 12px ${cor}30` : 'none',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Valores por forma (pagamento misto) */}
      {form.formasSelecionadas.length > 1 && (
        <div style={{ marginBottom: 16 }}>
          <label className="label-padrao">VALOR POR FORMA</label>
          {form.formasSelecionadas.map((formaApi) => {
            const label = FORMAS.find((f) => f.api === formaApi)?.label || formaApi;
            return (
              <div key={formaApi} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 12, width: 60, color: 'var(--texto-md)', flexShrink: 0 }}>{label}</span>
                <input
                  className="input-padrao"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.valoresPorForma[formaApi] || ''}
                  onChange={(e) => setForm((f) => ({ ...f, valoresPorForma: { ...f.valoresPorForma, [formaApi]: e.target.value } }))}
                  style={{ flex: 1 }}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Valor recebido (dinheiro) */}
      {form.formasSelecionadas.includes('DINHEIRO') && (
        <div style={{ marginBottom: 16 }}>
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
                background: troco >= 0 ? 'rgba(74,140,101,0.08)' : 'rgba(184,90,74,0.08)',
                border: `1px solid ${troco >= 0 ? 'rgba(74,140,101,0.3)' : 'rgba(184,90,74,0.3)'}`,
                borderRadius: 10,
                textAlign: 'center',
              }}
            >
              <div className="label-padrao" style={{ marginBottom: 4, textAlign: 'center' }}>
                {troco >= 0 ? 'TROCO' : 'VALOR INSUFICIENTE'}
              </div>
              <div
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 26,
                  fontStyle: 'italic',
                  fontWeight: 600,
                  color: troco >= 0 ? 'var(--verde)' : 'var(--vermelho)',
                }}
              >
                {formatarMoeda(Math.abs(troco))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Parcelas (crédito) */}
      {form.formasSelecionadas.includes('CREDITO') && (
        <div style={{ marginBottom: 16 }}>
          <label className="label-padrao">PARCELAS</label>
          <select
            className="input-padrao"
            value={form.parcelas}
            onChange={(e) => setForm((f) => ({ ...f, parcelas: e.target.value }))}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}x {n > 1 ? `de ${formatarMoeda(Number(form.valorTotal) / n)}` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Total destacado */}
      {form.valorTotal && (
        <div
          style={{
            marginBottom: 16,
            padding: '14px 18px',
            background: 'rgba(184,146,74,0.06)',
            border: '1px solid rgba(184,146,74,0.2)',
            borderRadius: 12,
            textAlign: 'center',
          }}
        >
          <div className="label-padrao" style={{ marginBottom: 6, textAlign: 'center' }}>TOTAL DA VENDA</div>
          <div
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 32,
              fontStyle: 'italic',
              fontWeight: 600,
              color: 'var(--ouro)',
            }}
          >
            {formatarMoeda(Number(form.valorTotal))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
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
