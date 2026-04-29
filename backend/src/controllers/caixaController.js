// Controller do módulo Caixa
const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

// Registra uma nova venda com múltiplos itens e formas de pagamento
async function registrarVenda(req, res, next) {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    return res.status(400).json({ erros: erros.array().map((e) => e.msg) });
  }

  try {
    const { items, pagamentos, total, valorRecebido, troco } = req.body;

    // Verifica existência e estoque de todos os produtos
    for (const item of items) {
      const produto = await prisma.produto.findFirst({
        where: { id: item.produtoId, ativo: true },
      });
      if (!produto) {
        return res.status(404).json({ erro: `Produto ${item.produtoId} não encontrado` });
      }
      if (produto.quantidade < item.quantidade) {
        return res.status(400).json({ erro: `Estoque insuficiente para "${produto.nome}"` });
      }
    }

    // Cria venda, itens e pagamentos; debita estoque em transação atômica
    const venda = await prisma.$transaction(async (tx) => {
      const v = await tx.venda.create({
        data: {
          total: parseFloat(total),
          valorRecebido: valorRecebido != null ? parseFloat(valorRecebido) : null,
          troco: troco != null ? parseFloat(troco) : null,
          items: {
            create: items.map((item) => ({
              produtoId: item.produtoId,
              quantidade: parseInt(item.quantidade),
              precoUnitario: parseFloat(item.precoUnitario),
              subtotal: parseFloat(item.precoUnitario) * parseInt(item.quantidade),
            })),
          },
          pagamentos: {
            create: pagamentos.map((p) => ({
              forma: p.forma,
              valor: parseFloat(p.valor),
              parcelas: p.parcelas ? parseInt(p.parcelas) : null,
            })),
          },
        },
        include: {
          items: { include: { produto: { select: { nome: true, tamanho: true, cor: true } } } },
          pagamentos: true,
        },
      });

      for (const item of items) {
        await tx.produto.update({
          where: { id: item.produtoId },
          data: { quantidade: { decrement: parseInt(item.quantidade) } },
        });
      }

      return v;
    });

    logger.info({ vendaId: venda.id }, 'Venda registrada');
    res.status(201).json(venda);
  } catch (err) {
    next(err);
  }
}

// Cancela uma venda e devolve as quantidades ao estoque
async function cancelarVenda(req, res, next) {
  try {
    const id = parseInt(req.params.id);

    const venda = await prisma.venda.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!venda) return res.status(404).json({ erro: 'Venda não encontrada' });
    if (venda.cancelada) return res.status(400).json({ erro: 'Venda já foi cancelada' });

    const vendaCancelada = await prisma.$transaction(async (tx) => {
      const v = await tx.venda.update({ where: { id }, data: { cancelada: true } });

      for (const item of venda.items) {
        await tx.produto.update({
          where: { id: item.produtoId },
          data: { quantidade: { increment: item.quantidade } },
        });
      }

      return v;
    });

    logger.info({ vendaId: id }, 'Venda cancelada');
    res.json({ mensagem: 'Venda cancelada com sucesso', venda: vendaCancelada });
  } catch (err) {
    next(err);
  }
}

// Lista vendas do dia (canceladas e não canceladas)
async function listarVendasDia(req, res, next) {
  try {
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const fim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59, 999);

    const vendas = await prisma.venda.findMany({
      where: { createdAt: { gte: inicio, lte: fim } },
      include: {
        items: { include: { produto: { select: { nome: true, tamanho: true, cor: true } } } },
        pagamentos: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(vendas ?? []);
  } catch (err) {
    logger.error({ err }, 'Erro ao listar vendas do dia');
    res.json([]);
  }
}

// Retorna métricas do dia para os cards do dashboard
async function metricasDia(req, res, next) {
  try {
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const fim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59, 999);

    const vendas = await prisma.venda.findMany({
      where: { cancelada: false, createdAt: { gte: inicio, lte: fim } },
      include: { items: true },
    });

    const totalFaturamento = vendas.reduce((acc, v) => acc + v.total, 0);
    const totalPecas = vendas.reduce(
      (acc, v) => acc + v.items.reduce((s, i) => s + i.quantidade, 0),
      0
    );
    const ticketMedio = vendas.length > 0 ? totalFaturamento / vendas.length : 0;

    const produtosBaixoEstoque = await prisma.produto.count({
      where: { ativo: true, quantidade: { lte: 3 } },
    });

    res.json({ faturamentoTotal: totalFaturamento, totalPecas, ticketMedio, produtosBaixoEstoque });
  } catch (err) {
    logger.error({ err }, 'Erro ao calcular métricas do dia');
    res.json({ faturamentoTotal: 0, totalPecas: 0, ticketMedio: 0, produtosBaixoEstoque: 0 });
  }
}

// Fecha o caixa do dia
async function fecharCaixa(req, res, next) {
  try {
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const fim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59, 999);

    const fechamentoExistente = await prisma.fechamentoCaixa.findFirst({
      where: { data: { gte: inicio, lte: fim } },
    });
    if (fechamentoExistente) {
      return res.status(400).json({ erro: 'O caixa já foi fechado hoje' });
    }

    const vendas = await prisma.venda.findMany({
      where: { cancelada: false, fechamentoCaixaId: null, createdAt: { gte: inicio, lte: fim } },
      include: { items: true, pagamentos: true },
    });

    let totalGeral = 0, totalDinheiro = 0, totalPix = 0, totalDebito = 0, totalCredito = 0, totalPecas = 0;

    for (const v of vendas) {
      totalGeral += v.total;
      totalPecas += v.items.reduce((s, i) => s + i.quantidade, 0);

      for (const p of v.pagamentos) {
        if (p.forma === 'DINHEIRO') totalDinheiro += p.valor;
        else if (p.forma === 'PIX') totalPix += p.valor;
        else if (p.forma === 'DEBITO') totalDebito += p.valor;
        else if (p.forma === 'CREDITO') totalCredito += p.valor;
      }
    }

    const fechamento = await prisma.$transaction(async (tx) => {
      const fc = await tx.fechamentoCaixa.create({
        data: { data: hoje, totalGeral, totalDinheiro, totalPix, totalDebito, totalCredito, totalPecas },
      });

      await tx.venda.updateMany({
        where: { id: { in: vendas.map((v) => v.id) } },
        data: { fechamentoCaixaId: fc.id },
      });

      return fc;
    });

    logger.info({ fechamentoId: fechamento.id }, 'Caixa fechado');
    res.status(201).json(fechamento);
  } catch (err) {
    next(err);
  }
}

module.exports = { registrarVenda, cancelarVenda, listarVendasDia, metricasDia, fecharCaixa };
