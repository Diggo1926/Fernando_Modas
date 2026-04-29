// Controller do módulo Caixa
const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const { sanitizarString } = require('../utils/sanitize');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

// Registra uma nova venda
async function registrarVenda(req, res, next) {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    return res.status(400).json({ erros: erros.array().map((e) => e.msg) });
  }

  try {
    const { produtoId, quantidade, valorTotal, formasPagamento, parcelas } = req.body;

    const produto = await prisma.produto.findFirst({
      where: { id: produtoId, ativo: true },
    });
    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });

    const qtd = parseInt(quantidade);
    if (produto.quantidade < qtd) {
      return res.status(400).json({ erro: 'Estoque insuficiente para esta venda' });
    }

    // Valida formas de pagamento
    const formasValidas = ['PIX', 'Dinheiro', 'Débito', 'Crédito'];
    for (const fp of formasPagamento) {
      if (!formasValidas.includes(fp.forma)) {
        return res.status(400).json({ erro: `Forma de pagamento inválida: ${fp.forma}` });
      }
    }

    // Cria venda e debita estoque em transação atômica
    const [venda] = await prisma.$transaction([
      prisma.venda.create({
        data: {
          produtoId,
          quantidade: qtd,
          valorTotal: parseFloat(valorTotal),
          formasPagamento: JSON.stringify(formasPagamento),
          parcelas: parcelas ? parseInt(parcelas) : null,
        },
        include: { produto: { select: { nome: true, tamanho: true, cor: true } } },
      }),
      prisma.produto.update({
        where: { id: produtoId },
        data: { quantidade: { decrement: qtd } },
      }),
    ]);

    logger.info({ vendaId: venda.id, produtoId }, 'Venda registrada');
    res.status(201).json(venda);
  } catch (err) {
    next(err);
  }
}

// Cancela uma venda e devolve ao estoque
async function cancelarVenda(req, res, next) {
  try {
    const venda = await prisma.venda.findUnique({
      where: { id: req.params.id },
    });
    if (!venda) return res.status(404).json({ erro: 'Venda não encontrada' });
    if (venda.cancelada) return res.status(400).json({ erro: 'Venda já foi cancelada' });

    // Desfaz a venda e devolve estoque em transação
    const [vendaCancelada] = await prisma.$transaction([
      prisma.venda.update({
        where: { id: req.params.id },
        data: { cancelada: true },
      }),
      prisma.produto.update({
        where: { id: venda.produtoId },
        data: { quantidade: { increment: venda.quantidade } },
      }),
    ]);

    logger.info({ vendaId: req.params.id }, 'Venda cancelada');
    res.json({ mensagem: 'Venda cancelada com sucesso', venda: vendaCancelada });
  } catch (err) {
    next(err);
  }
}

// Lista vendas do dia atual (não canceladas)
async function listarVendasDia(req, res, next) {
  try {
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 0, 0, 0);
    const fim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);

    const vendas = await prisma.venda.findMany({
      where: {
        dataHora: { gte: inicio, lte: fim },
      },
      include: { produto: { select: { nome: true, tamanho: true, cor: true } } },
      orderBy: { dataHora: 'desc' },
    });

    res.json(vendas);
  } catch (err) {
    next(err);
  }
}

// Retorna métricas do dia para os cards do topo
async function metricasDia(req, res, next) {
  try {
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 0, 0, 0);
    const fim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);

    const vendas = await prisma.venda.findMany({
      where: { cancelada: false, dataHora: { gte: inicio, lte: fim } },
    });

    const totalFaturamento = vendas.reduce((acc, v) => acc + Number(v.valorTotal), 0);
    const totalPecas = vendas.reduce((acc, v) => acc + v.quantidade, 0);
    const ticketMedio = vendas.length > 0 ? totalFaturamento / vendas.length : 0;

    const produtosBaixoEstoque = await prisma.produto.count({
      where: { ativo: true, quantidade: { lte: 3 } },
    });

    res.json({
      faturamentoTotal: totalFaturamento,
      totalPecas,
      ticketMedio,
      produtosBaixoEstoque,
    });
  } catch (err) {
    next(err);
  }
}

// Fecha o caixa do dia
async function fecharCaixa(req, res, next) {
  try {
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 0, 0, 0);
    const fim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);

    // Verifica se o caixa já foi fechado hoje
    const fechamentoExistente = await prisma.fechamentoCaixa.findFirst({
      where: { data: { gte: inicio, lte: fim } },
    });
    if (fechamentoExistente) {
      return res.status(400).json({ erro: 'O caixa já foi fechado hoje' });
    }

    const vendas = await prisma.venda.findMany({
      where: { cancelada: false, caixaId: null, dataHora: { gte: inicio, lte: fim } },
    });

    let totalGeral = 0, totalPix = 0, totalDinheiro = 0, totalDebito = 0, totalCredito = 0;
    let totalPecas = 0;

    for (const v of vendas) {
      const valor = Number(v.valorTotal);
      totalGeral += valor;
      totalPecas += v.quantidade;

      let formas = [];
      try { formas = JSON.parse(v.formasPagamento); } catch { }

      for (const fp of formas) {
        const fv = Number(fp.valor);
        if (fp.forma === 'PIX') totalPix += fv;
        else if (fp.forma === 'Dinheiro') totalDinheiro += fv;
        else if (fp.forma === 'Débito') totalDebito += fv;
        else if (fp.forma === 'Crédito') totalCredito += fv;
      }
    }

    // Cria o fechamento e associa as vendas em transação
    const fechamento = await prisma.$transaction(async (tx) => {
      const fc = await tx.fechamentoCaixa.create({
        data: {
          data: hoje,
          totalGeral,
          totalPix,
          totalDinheiro,
          totalDebito,
          totalCredito,
          totalPecas,
        },
      });

      // Associa as vendas do dia ao fechamento
      await tx.venda.updateMany({
        where: { id: { in: vendas.map((v) => v.id) } },
        data: { caixaId: fc.id },
      });

      return fc;
    });

    logger.info({ fechamentoId: fechamento.id }, 'Caixa fechado');
    res.status(201).json(fechamento);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  registrarVenda,
  cancelarVenda,
  listarVendasDia,
  metricasDia,
  fecharCaixa,
};
