// Utilitários de formatação — datas e valores em padrão brasileiro
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor) || 0);
}

export function formatarDataHora(data) {
  const d = typeof data === 'string' ? parseISO(data) : data;
  return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

export function formatarHora(data) {
  if (!data) return '';
  const d = typeof data === 'string' ? parseISO(data) : data;
  return format(d, 'HH:mm', { locale: ptBR });
}

export function formatarData(data) {
  if (!data) return '';
  const d = typeof data === 'string' ? parseISO(data) : data;
  return format(d, 'dd/MM/yyyy', { locale: ptBR });
}

export function formatarDataExtenso(data) {
  const d = typeof data === 'string' ? parseISO(data) : data;
  return format(d, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function calcularMargem(precoCusto, precoVenda) {
  const custo = Number(precoCusto);
  const venda = Number(precoVenda);
  if (!custo || custo === 0) return 0;
  return ((venda - custo) / custo) * 100;
}

// Formas de pagamento: chave API → label exibido
export const LABEL_FORMA = {
  PIX: 'PIX',
  DINHEIRO: 'Dinheiro',
  DEBITO: 'Débito',
  CREDITO: 'Crédito',
};

export function classeTagPagamento(forma) {
  const mapa = {
    PIX: 'tag-pix',
    DINHEIRO: 'tag-dinheiro',
    DEBITO: 'tag-debito',
    CREDITO: 'tag-credito',
  };
  return mapa[forma] || '';
}

export function corQuantidade(qtd) {
  if (qtd === 0) return 'var(--vermelho)';
  return 'var(--verde)';
}
