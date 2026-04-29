// Serviço de geração de dados de relatório
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function gerarResumo(inicio, fim) {
  const vendas = await prisma.venda.findMany({
    where: { cancelada: false, createdAt: { gte: inicio, lte: fim } },
    include: {
      items: { include: { produto: { select: { nome: true } } } },
      pagamentos: true,
    },
  });

  let totalGeral = 0, totalPix = 0, totalDinheiro = 0, totalDebito = 0, totalCredito = 0, totalPecas = 0;
  const produtosMap = {};

  for (const venda of vendas) {
    totalGeral += venda.total;

    for (const item of venda.items) {
      totalPecas += item.quantidade;

      if (!produtosMap[item.produtoId]) {
        produtosMap[item.produtoId] = {
          nome: item.produto?.nome ?? 'Produto removido',
          quantidade: 0,
          valorTotal: 0,
        };
      }
      produtosMap[item.produtoId].quantidade += item.quantidade;
      produtosMap[item.produtoId].valorTotal += item.subtotal;
    }

    for (const p of venda.pagamentos) {
      if (p.forma === 'PIX') totalPix += p.valor;
      else if (p.forma === 'DINHEIRO') totalDinheiro += p.valor;
      else if (p.forma === 'DEBITO') totalDebito += p.valor;
      else if (p.forma === 'CREDITO') totalCredito += p.valor;
    }
  }

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
