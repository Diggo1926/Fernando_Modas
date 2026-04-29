import { useState, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export function useEstoque() {
  const [produtos, setProdutos] = useState([]);
  const [baixoEstoque, setBaixoEstoque] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const buscarProdutos = useCallback(async (filtros = {}) => {
    setCarregando(true);
    try {
      const { data } = await api.get('/estoque', { params: filtros });
      setProdutos(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  const buscarBaixoEstoque = useCallback(async () => {
    try {
      const { data } = await api.get('/estoque/baixo-estoque');
      setBaixoEstoque(data);
    } catch (err) {
      toast.error(err.message);
    }
  }, []);

  const criarProduto = useCallback(async (formData) => {
    setCarregando(true);
    try {
      await api.post('/estoque', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Produto cadastrado com sucesso!');
      await buscarProdutos();
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    } finally {
      setCarregando(false);
    }
  }, [buscarProdutos]);

  const atualizarProduto = useCallback(async (id, formData) => {
    setCarregando(true);
    try {
      await api.put(`/estoque/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Produto atualizado com sucesso!');
      await buscarProdutos();
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    } finally {
      setCarregando(false);
    }
  }, [buscarProdutos]);

  const deletarProduto = useCallback(async (id) => {
    setCarregando(true);
    try {
      await api.delete(`/estoque/${id}`);
      toast.success('Produto removido');
      await buscarProdutos();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCarregando(false);
    }
  }, [buscarProdutos]);

  const reporEstoque = useCallback(async (id, quantidade) => {
    setCarregando(true);
    try {
      await api.post(`/estoque/${id}/repor`, { quantidade });
      toast.success('Estoque reposto com sucesso!');
      await Promise.all([buscarProdutos(), buscarBaixoEstoque()]);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCarregando(false);
    }
  }, [buscarProdutos, buscarBaixoEstoque]);

  return {
    produtos,
    baixoEstoque,
    carregando,
    buscarProdutos,
    buscarBaixoEstoque,
    criarProduto,
    atualizarProduto,
    deletarProduto,
    reporEstoque,
  };
}
