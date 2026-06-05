const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const { sanitizarString } = require('../utils/sanitize');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

async function listarCategorias(req, res) {
  try {
    const categorias = await prisma.categoria.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
    });
    res.json(categorias);
  } catch (err) {
    logger.error({ err }, 'Erro ao listar categorias');
    res.json([]);
  }
}

async function criarCategoria(req, res, next) {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    return res.status(400).json({ erros: erros.array().map((e) => e.msg) });
  }

  try {
    const nome = sanitizarString(req.body.nome);
    const temTamanhoUnico = req.body.temTamanhoUnico === 'true' || req.body.temTamanhoUnico === true;

    // Gera sigla a partir do nome (primeiras letras, sem acentos)
    const base = nome
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zA-Z]/g, '')
      .substring(0, 3)
      .toUpperCase() || 'CAT';

    // Garante unicidade da sigla
    let sigla = base;
    let contador = 1;
    while (await prisma.categoria.findFirst({ where: { sigla } })) {
      sigla = base.substring(0, 2) + String(contador);
      contador++;
    }

    const categoria = await prisma.categoria.create({
      data: { nome, sigla, temTamanhoUnico },
    });

    logger.info({ categoriaId: categoria.id, nome, sigla }, 'Categoria criada');
    res.status(201).json(categoria);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ erro: 'Já existe uma categoria com este nome' });
    }
    next(err);
  }
}

module.exports = { listarCategorias, criarCategoria };
