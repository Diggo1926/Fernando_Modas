import { useEffect, useState } from 'react';
import { useEstoque } from '../hooks/useEstoque';
import { useCategorias } from '../hooks/useCategorias';
import { useWindowSize } from '../hooks/useWindowSize';
import CardProduto from '../components/estoque/CardProduto';
import ModalProduto from '../components/estoque/ModalProduto';
import ModalReposicao from '../components/estoque/ModalReposicao';
import ModalEtiquetas from '../components/estoque/ModalEtiquetas';
import ListaReposicao from '../components/estoque/ListaReposicao';
import ModalCategorias from '../components/estoque/ModalCategorias';

const TAMANHOS = ['P', 'M', 'G', 'GG', 'GGG', 'U', '36', '38', '40', '42', '44', '46'];

export default function EstoquePage() {
  const { produtos, baixoEstoque, carregando, buscarProdutos, buscarBaixoEstoque, criarProduto, atualizarProduto, deletarProduto, reporEstoque } = useEstoque();
  const { categorias, carregando: carregandoCats, buscarCategorias, criarCategoria } = useCategorias();
  const { width } = useWindowSize();
  const isMobile = width < 768;

  const [filtros, setFiltros] = useState({ busca: '', categoria: '', tamanho: '', ordenar: '' });
  const [modalProduto, setModalProduto] = useState(null); // null | 'novo' | produto
  const [modalReposicao, setModalReposicao] = useState(null);
  const [modalEtiquetas, setModalEtiquetas] = useState(null);
  const [modalLista, setModalLista] = useState(false);
  const [modalCategorias, setModalCategorias] = useState(false);

  useEffect(() => {
    buscarProdutos(filtros);
    buscarBaixoEstoque();
  }, [filtros]);

  useEffect(() => { buscarCategorias(); }, []);

  async function salvarProduto(fd) {
    if (modalProduto === 'novo') return await criarProduto(fd);
    return await atualizarProduto(modalProduto.id, fd);
  }

  function confirmarDeletar(id) {
    if (window.confirm('Remover este produto do estoque?')) deletarProduto(id);
  }

  const colunas = isMobile ? 2 : width < 1024 ? 3 : 4;

  return (
    <div style={{ padding: isMobile ? 16 : 24 }}>
      {/* Barra de ações */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 20,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {/* Busca — aceita nome ou código (ex: VES-001) */}
        <input
          className="input-padrao"
          style={{ flex: 1, minWidth: 200 }}
          placeholder="Buscar por nome ou código (ex: VES-001)..."
          value={filtros.busca}
          onChange={(e) => setFiltros((f) => ({ ...f, busca: e.target.value }))}
        />

        {/* Categoria */}
        <select
          className="input-padrao"
          style={{ width: 150 }}
          value={filtros.categoria}
          onChange={(e) => setFiltros((f) => ({ ...f, categoria: e.target.value }))}
        >
          <option value="">Categoria</option>
          {categorias.map((c) => <option key={c.id} value={c.nome}>{c.nome}</option>)}
        </select>

        {/* Gerenciar categorias */}
        <button
          className="btn-secundario"
          style={{ padding: '10px 14px', fontSize: 12, whiteSpace: 'nowrap' }}
          onClick={() => setModalCategorias(true)}
        >
          + Categorias
        </button>

        {/* Ordenar */}
        <select
          className="input-padrao"
          style={{ width: 160 }}
          value={filtros.ordenar}
          onChange={(e) => setFiltros((f) => ({ ...f, ordenar: e.target.value }))}
        >
          <option value="">Ordenar por</option>
          <option value="preco_asc">Menor preço</option>
          <option value="preco_desc">Maior preço</option>
          <option value="quantidade_asc">Menor estoque</option>
          <option value="quantidade_desc">Maior estoque</option>
        </select>

        {/* Botões */}
        {baixoEstoque.length > 0 && (
          <button
            style={{
              padding: '10px 16px',
              background: 'var(--vermelho-bg)',
              border: '1px solid var(--vermelho)',
              borderRadius: 6,
              color: 'var(--vermelho)',
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 500,
            }}
            onClick={() => setModalLista(true)}
          >
            Lista de Reposição ({baixoEstoque.length})
          </button>
        )}

        <button className="btn-primario" onClick={() => setModalProduto('novo')}>
          + Novo Produto
        </button>
      </div>

      {/* Filtros de tamanho */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        <button
          className={`toggle-btn${filtros.tamanho === '' ? ' ativo' : ''}`}
          onClick={() => setFiltros((f) => ({ ...f, tamanho: '' }))}
        >
          Todos
        </button>
        {TAMANHOS.map((t) => (
          <button
            key={t}
            className={`toggle-btn${filtros.tamanho === t ? ' ativo' : ''}`}
            onClick={() => setFiltros((f) => ({ ...f, tamanho: f.tamanho === t ? '' : t }))}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Grid de produtos */}
      {carregando ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--texto-leve)', fontSize: 13 }}>
          Carregando produtos...
        </div>
      ) : produtos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--texto-leve)', fontSize: 13 }}>
          Nenhum produto encontrado
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${colunas}, 1fr)`, gap: 16 }}>
          {produtos.map((p) => (
            <CardProduto
              key={p.id}
              produto={p}
              onEditar={setModalProduto}
              onRepor={setModalReposicao}
              onDeletar={confirmarDeletar}
              onEtiquetas={setModalEtiquetas}
            />
          ))}
        </div>
      )}

      {/* Modais */}
      {modalProduto && (
        <ModalProduto
          produto={modalProduto === 'novo' ? null : modalProduto}
          onFechar={() => setModalProduto(null)}
          onSalvar={salvarProduto}
          carregando={carregando}
        />
      )}

      {modalReposicao && (
        <ModalReposicao
          produto={modalReposicao}
          onFechar={() => setModalReposicao(null)}
          onRepor={reporEstoque}
          carregando={carregando}
        />
      )}

      {modalEtiquetas && (
        <ModalEtiquetas
          produto={modalEtiquetas}
          onFechar={() => setModalEtiquetas(null)}
        />
      )}

      {modalLista && (
        <ListaReposicao
          produtos={baixoEstoque}
          onFechar={() => setModalLista(false)}
        />
      )}

      {modalCategorias && (
        <ModalCategorias
          categorias={categorias}
          carregando={carregandoCats}
          onCriar={criarCategoria}
          onFechar={() => setModalCategorias(false)}
        />
      )}
    </div>
  );
}
