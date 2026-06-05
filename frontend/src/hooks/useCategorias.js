import { useState, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export function useCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const buscarCategorias = useCallback(async () => {
    try {
      const { data } = await api.get('/categorias');
      setCategorias(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Erro ao carregar categorias');
    }
  }, []);

  const criarCategoria = useCallback(async ({ nome, temTamanhoUnico }) => {
    setCarregando(true);
    try {
      await api.post('/categorias', { nome, temTamanhoUnico });
      toast.success('Categoria criada com sucesso!');
      await buscarCategorias();
      return true;
    } catch (err) {
      toast.error(err.message || 'Erro ao criar categoria');
      return false;
    } finally {
      setCarregando(false);
    }
  }, [buscarCategorias]);

  return { categorias, carregando, buscarCategorias, criarCategoria };
}
