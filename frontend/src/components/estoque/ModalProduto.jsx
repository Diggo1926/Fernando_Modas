import { useState, useEffect } from 'react';
import { calcularMargem } from '../../utils/formatters';

const CATEGORIAS = ['Vestido', 'Blusa', 'Calça', 'Saia', 'Conjunto', 'Acessório', 'Outro'];
const TAMANHOS   = ['PP', 'P', 'M', 'G', 'GG', 'Único'];
const LIMITE_FOTO = 5 * 1024 * 1024;

export default function ModalProduto({ produto, onFechar, onSalvar, carregando }) {
  const [form, setForm] = useState({
    nome: '', categoria: '', tamanho: '', cor: '',
    quantidade: '0', precoCusto: '', precoVenda: '',
    foto: null, fotoPreview: null,
  });

  useEffect(() => {
    if (produto) {
      setForm({
        nome: produto.nome || '',
        categoria: produto.categoria || '',
        tamanho: produto.tamanho || '',
        cor: produto.cor || '',
        quantidade: String(produto.quantidade || 0),
        precoCusto: String(produto.precoCusto || ''),
        precoVenda: String(produto.precoVenda || ''),
        foto: null,
        fotoPreview: produto.fotoUrl || null,
      });
    }
  }, [produto]);

  const margem = calcularMargem(form.precoCusto, form.precoVenda);

  function handleFoto(e) {
    const arquivo = e.target.files[0];
    if (!arquivo) return;
    if (arquivo.size > LIMITE_FOTO) { alert('A imagem deve ter no máximo 5MB'); return; }
    setForm((f) => ({ ...f, foto: arquivo, fotoPreview: URL.createObjectURL(arquivo) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData();
    fd.append('nome',       form.nome);
    fd.append('categoria',  form.categoria);
    fd.append('tamanho',    form.tamanho);
    fd.append('cor',        form.cor);
    fd.append('quantidade', form.quantidade);
    fd.append('precoCusto', form.precoCusto);
    fd.append('precoVenda', form.precoVenda);
    if (form.foto) fd.append('foto', form.foto);
    const ok = await onSalvar(fd);
    if (ok) onFechar();
  }

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-box" style={{ maxWidth: 580 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--borda-suave)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontStyle: 'italic', fontWeight: 400 }}>
            {produto ? 'Editar Produto' : 'Cadastrar Produto'}
          </h2>
          <button onClick={onFechar} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--texto-leve)', minWidth: 36, minHeight: 36 }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Foto */}
          <div>
            <label className="label-padrao">FOTO DO PRODUTO</label>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: 6, border: '1px solid var(--borda)', overflow: 'hidden', background: 'var(--bg)', flexShrink: 0 }}>
                {form.fotoPreview
                  ? <img src={form.fotoPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--texto-leve)' }}>Sem foto</div>
                }
              </div>
              <label style={{ flex: 1, padding: '10px 16px', border: '1px dashed var(--borda)', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: 'var(--texto-md)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 48 }}>
                Clique para selecionar (JPG, PNG ou WebP, máx. 5MB)
                <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleFoto} />
              </label>
            </div>
          </div>

          {/* Nome */}
          <div>
            <label className="label-padrao">NOME DO PRODUTO</label>
            <input className="input-padrao" required value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              placeholder="Ex: Vestido Floral Midi" />
          </div>

          {/* Categoria e Cor */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="label-padrao">CATEGORIA</label>
              <select className="input-padrao" required value={form.categoria}
                onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}>
                <option value="">Selecione...</option>
                {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label-padrao">COR</label>
              <input className="input-padrao" required value={form.cor}
                onChange={(e) => setForm((f) => ({ ...f, cor: e.target.value }))}
                placeholder="Ex: Rosa" />
            </div>
          </div>

          {/* Tamanho */}
          <div>
            <label className="label-padrao">TAMANHO</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {TAMANHOS.map((t) => (
                <button key={t} type="button"
                  className={`toggle-btn${form.tamanho === t ? ' ativo' : ''}`}
                  onClick={() => setForm((f) => ({ ...f, tamanho: t }))}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Quantidade e Preços */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label className="label-padrao">QUANTIDADE</label>
              <input className="input-padrao" type="number" min="0" required value={form.quantidade}
                onChange={(e) => setForm((f) => ({ ...f, quantidade: e.target.value }))} />
            </div>
            <div>
              <label className="label-padrao">PREÇO DE CUSTO</label>
              <input className="input-padrao" type="number" step="0.01" min="0" required value={form.precoCusto}
                onChange={(e) => setForm((f) => ({ ...f, precoCusto: e.target.value }))}
                placeholder="0,00" />
            </div>
            <div>
              <label className="label-padrao">PREÇO DE VENDA</label>
              <input className="input-padrao" type="number" step="0.01" min="0.01" required value={form.precoVenda}
                onChange={(e) => setForm((f) => ({ ...f, precoVenda: e.target.value }))}
                placeholder="0,00" />
            </div>
          </div>

          {/* Margem */}
          {form.precoCusto && form.precoVenda && (
            <div style={{ padding: '10px 14px', background: margem >= 0 ? 'var(--verde-bg)' : 'var(--vermelho-bg)', borderRadius: 6, fontSize: 12, color: margem >= 0 ? 'var(--verde)' : 'var(--vermelho)', fontWeight: 500 }}>
              Margem de lucro: {margem.toFixed(1)}%
            </div>
          )}

          {/* Botões */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="submit" className="btn-primario" style={{ flex: 1 }} disabled={carregando}>
              {carregando ? 'Salvando...' : (produto ? 'Salvar Alterações' : 'Cadastrar Produto')}
            </button>
            <button type="button" className="btn-secundario" onClick={onFechar}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
