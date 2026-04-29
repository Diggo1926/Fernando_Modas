import { useState, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export function useVendas() {
  const [vendas, setVendas] = useState([]);
  const [metricas, setMetricas] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const buscarVendas = useCallback(async () => {
    try {
      const { data } = await api.get('/caixa/vendas');
      setVendas(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message);
    }
  }, []);

  const buscarMetricas = useCallback(async () => {
    try {
      const { data } = await api.get('/caixa/metricas');
      setMetricas(data);
    } catch (err) {
      toast.error(err.message);
    }
  }, []);

  const registrarVenda = useCallback(async (dados) => {
    setCarregando(true);
    try {
      await api.post('/caixa/vendas', dados);
      toast.success('Venda registrada com sucesso!');
      await Promise.all([buscarVendas(), buscarMetricas()]);
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    } finally {
      setCarregando(false);
    }
  }, [buscarVendas, buscarMetricas]);

  const cancelarVenda = useCallback(async (id) => {
    setCarregando(true);
    try {
      await api.delete(`/caixa/vendas/${id}`);
      toast.success('Venda cancelada');
      await Promise.all([buscarVendas(), buscarMetricas()]);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCarregando(false);
    }
  }, [buscarVendas, buscarMetricas]);

  const fecharCaixa = useCallback(async () => {
    setCarregando(true);
    try {
      const { data } = await api.post('/caixa/fechar');
      toast.success('Caixa fechado com sucesso!');
      await Promise.all([buscarVendas(), buscarMetricas()]);
      return data;
    } catch (err) {
      toast.error(err.message);
      return null;
    } finally {
      setCarregando(false);
    }
  }, [buscarVendas, buscarMetricas]);

  return {
    vendas,
    metricas,
    carregando,
    buscarVendas,
    buscarMetricas,
    registrarVenda,
    cancelarVenda,
    fecharCaixa,
  };
}
