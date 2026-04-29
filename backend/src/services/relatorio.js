// Serviço de geração de dados de relatório
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Retorna o resumo de vendas para um período
 * @param {Date} inicio - Data/hora de início
 * @param {Date} fim - Data/hora de fim
 */
async function gerarResumo(inicio, fim) {
  // Busca todas as vendas não canceladas no período
  const vendas = await prisma.venda.findMany({
    where: {
      cancelada: false,
      dataHora: { gte: inicio, lte: fim },
    },
    include: { produto: { select: { nome: true } } },
  });

  // Totais por forma de pagamento
  let totalGeral = 0;
  let totalPix = 0;
  let totalDinheiro = 0;
  let totalDebito = 0;
  let totalCredito = 0;
  let totalPecas = 0;
  const produtosMap = {};

  for (const venda of vendas) {
    const valor = Number(venda.valorTotal);
    totalGeral += valor;
    totalPecas += venda.quantidade;

    // Contabiliza por produto
    if (!produtosMap[venda.produtoId]) {
      produtosMap[venda.produtoId] = {
        nome: venda.produto.nome,
        quantidade: 0,
        valorTotal: 0,
      };
    }
    produtosMap[venda.produtoId].quantidade += venda.quantidade;
    produtosMap[venda.produtoId].valorTotal += valor;

    // Decodifica formas de pagamento
    let formas = [];
    try { formas = JSON.parse(venda.formasPagamento); } catch { }

    for (const fp of formas) {
      const v = Number(fp.valor);
      if (fp.forma === 'PIX') totalPix += v;
      else if (fp.forma === 'Dinheiro') totalDinheiro += v;
      else if (fp.forma === 'Débito') totalDebito += v;
      else if (fp.forma === 'Crédito') totalCredito += v;
    }
  }

  // Top 5 produtos mais vendidos
  const top5 = Object.values(produtosMap)
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 5);

  const ticketMedio = vendas.length > 0 ? totalGeral / vendas.length : 0;

  return {
    totalGeral,
    totalPix,
    totalDinheiro,
    totalDebito,
    totalCredito,
    totalPecas,
    ticketMedio,
    quantidadeVendas: vendas.length,
    top5Produtos: top5,
  };
}

module.exports = { gerarResumo };
