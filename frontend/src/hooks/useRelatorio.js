import { useState, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export function useRelatorio() {
  const [resumo, setResumo] = useState(null);
  const [fechamentos, setFechamentos] = useState([]);
  const [fechamentoDetalhe, setFechamentoDetalhe] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const buscarResumo = useCallback(async (periodo = 'hoje', inicio = null, fim = null) => {
    setCarregando(true);
    try {
      const params = { periodo };
      if (periodo === 'personalizado') {
        params.inicio = inicio;
        params.fim = fim;
      }
      const { data } = await api.get('/relatorio/resumo', { params });
      setResumo(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  const buscarFechamentos = useCallback(async () => {
    try {
      const { data } = await api.get('/relatorio/fechamentos');
      setFechamentos(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message);
    }
  }, []);

  const buscarDetalhe = useCallback(async (id) => {
    setCarregando(true);
    try {
      const { data } = await api.get(`/relatorio/fechamentos/${id}`);
      setFechamentoDetalhe(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  return {
    resumo,
    fechamentos,
    fechamentoDetalhe,
    carregando,
    buscarResumo,
    buscarFechamentos,
    buscarDetalhe,
  };
}
