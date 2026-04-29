// Controller do módulo Relatório
const { PrismaClient } = require('@prisma/client');
const { gerarResumo } = require('../services/relatorio');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

// Retorna resumo de vendas para o período selecionado
async function resumoPeriodo(req, res, next) {
  try {
    const { periodo, inicio: inicioParam, fim: fimParam } = req.query;

    const agora = new Date();
    let inicio, fim;

    if (periodo === 'semana') {
      const diaSemana = agora.getDay();
      inicio = new Date(agora);
      inicio.setDate(agora.getDate() - diaSemana);
      inicio.setHours(0, 0, 0, 0);
      fim = new Date(agora);
      fim.setHours(23, 59, 59, 999);
    } else if (periodo === 'mes') {
      inicio = new Date(agora.getFullYear(), agora.getMonth(), 1, 0, 0, 0);
      fim = new Date(agora);
      fim.setHours(23, 59, 59, 999);
    } else if (periodo === 'personalizado' && inicioParam && fimParam) {
      inicio = new Date(inicioParam);
      fim = new Date(fimParam);
      fim.setHours(23, 59, 59, 999);
      if (isNaN(inicio) || isNaN(fim)) {
        return res.status(400).json({ erro: 'Datas inválidas para o período personalizado' });
      }
    } else {
      inicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 0, 0, 0);
      fim = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 23, 59, 59, 999);
    }

    const resumo = await gerarResumo(inicio, fim);
    res.json(resumo);
  } catch (err) {
    next(err);
  }
}

// Lista histórico de fechamentos de caixa
async function listarFechamentos(req, res, next) {
  try {
    const fechamentos = await prisma.fechamentoCaixa.findMany({
      orderBy: { data: 'desc' },
      take: 90,
    });
    res.json(fechamentos ?? []);
  } catch (err) {
    logger.error({ err }, 'Erro ao listar fechamentos');
    return res.json([]);
  }
}

// Detalhe de um fechamento de caixa específico
async function detalharFechamento(req, res, next) {
  try {
    const id = parseInt(req.params.id);

    const fechamento = await prisma.fechamentoCaixa.findUnique({
      where: { id },
      include: {
        vendas: {
          where: { cancelada: false },
          include: {
            items: { include: { produto: { select: { nome: true, tamanho: true, cor: true } } } },
            pagamentos: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!fechamento) return res.status(404).json({ erro: 'Fechamento não encontrado' });
    res.json(fechamento);
  } catch (err) {
    next(err);
  }
}

module.exports = { resumoPeriodo, listarFechamentos, detalharFechamento };
