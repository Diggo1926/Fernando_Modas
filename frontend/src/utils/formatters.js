// Utilitários de formatação — datas e valores em padrão brasileiro
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata valor monetário: R$ 1.234,56
 */
export function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(valor) || 0);
}

/**
 * Formata data completa: 29/04/2026 às 14:30
 */
export function formatarDataHora(data) {
  const d = typeof data === 'string' ? parseISO(data) : data;
  return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

/**
 * Formata apenas a hora: 14:30
 */
export function formatarHora(data) {
  const d = typeof data === 'string' ? parseISO(data) : data;
  return format(d, 'HH:mm', { locale: ptBR });
}

/**
 * Formata apenas a data: 29/04/2026
 */
export function formatarData(data) {
  const d = typeof data === 'string' ? parseISO(data) : data;
  return format(d, 'dd/MM/yyyy', { locale: ptBR });
}

/**
 * Formata data por extenso: terça-feira, 29 de abril de 2026
 */
export function formatarDataExtenso(data) {
  const d = typeof data === 'string' ? parseISO(data) : data;
  return format(d, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
}

/**
 * Calcula a margem de lucro em percentual
 */
export function calcularMargem(precoCompra, precoVenda) {
  const compra = Number(precoCompra);
  const venda = Number(precoVenda);
  if (!compra || compra === 0) return 0;
  return ((venda - compra) / compra) * 100;
}

/**
 * Retorna a classe CSS da tag de forma de pagamento
 */
export function classeTagPagamento(forma) {
  const mapa = {
    PIX: 'tag-pix',
    Dinheiro: 'tag-dinheiro',
    Débito: 'tag-debito',
    Crédito: 'tag-credito',
  };
  return mapa[forma] || '';
}

/**
 * Retorna a cor de quantidade de estoque
 */
export function corQuantidade(qtd) {
  if (qtd <= 1) return 'var(--vermelho)';
  if (qtd <= 3) return '#D4A017';
  return 'var(--verde)';
}
