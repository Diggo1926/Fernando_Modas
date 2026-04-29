// Controller do módulo Estoque
const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const { enviarImagem, removerImagem } = require('../services/cloudinary');
const { sanitizarString } = require('../utils/sanitize');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

// Lista produtos com filtros opcionais
async function listarProdutos(req, res, next) {
  try {
    const { categoria, tamanho, cor, busca, ordenar } = req.query;

    const where = { ativo: true };
    if (categoria) where.categoria = sanitizarString(categoria);
    if (tamanho) where.tamanho = sanitizarString(tamanho);
    if (cor) where.cor = { contains: sanitizarString(cor), mode: 'insensitive' };
    if (busca) where.nome = { contains: sanitizarString(busca), mode: 'insensitive' };

    let orderBy = { nome: 'asc' };
    if (ordenar === 'preco_asc') orderBy = { precoVenda: 'asc' };
    else if (ordenar === 'preco_desc') orderBy = { precoVenda: 'desc' };
    else if (ordenar === 'quantidade_asc') orderBy = { quantidade: 'asc' };
    else if (ordenar === 'quantidade_desc') orderBy = { quantidade: 'desc' };

    const produtos = await prisma.produto.findMany({ where, orderBy });
    res.json(produtos);
  } catch (err) {
    next(err);
  }
}

// Busca produto por ID
async function buscarProduto(req, res, next) {
  try {
    const produto = await prisma.produto.findFirst({
      where: { id: parseInt(req.params.id), ativo: true },
    });
    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });
    res.json(produto);
  } catch (err) {
    next(err);
  }
}

// Cria novo produto
async function criarProduto(req, res, next) {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    return res.status(400).json({ erros: erros.array().map((e) => e.msg) });
  }

  try {
    const { nome, categoria, tamanho, cor, quantidade, precoCusto, precoVenda } = req.body;

    let fotoUrl = null;
    let fotoPublicId = null;

    if (req.file) {
      const resultado = await enviarImagem(req.file.buffer, req.file.mimeTypeReal);
      fotoUrl = resultado.url;
      fotoPublicId = resultado.publicId;
    }

    const produto = await prisma.produto.create({
      data: {
        nome: sanitizarString(nome),
        categoria: sanitizarString(categoria),
        tamanho: sanitizarString(tamanho),
        cor: sanitizarString(cor),
        quantidade: parseInt(quantidade),
        precoCusto: parseFloat(precoCusto),
        precoVenda: parseFloat(precoVenda),
        fotoUrl,
        fotoPublicId,
      },
    });

    logger.info({ produtoId: produto.id }, 'Produto cadastrado');
    res.status(201).json(produto);
  } catch (err) {
    next(err);
  }
}

// Atualiza produto
async function atualizarProduto(req, res, next) {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    return res.status(400).json({ erros: erros.array().map((e) => e.msg) });
  }

  try {
    const id = parseInt(req.params.id);
    const produto = await prisma.produto.findFirst({ where: { id, ativo: true } });
    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });

    const { nome, categoria, tamanho, cor, quantidade, precoCusto, precoVenda } = req.body;

    let fotoUrl = produto.fotoUrl;
    let fotoPublicId = produto.fotoPublicId;

    if (req.file) {
      await removerImagem(produto.fotoPublicId);
      const resultado = await enviarImagem(req.file.buffer, req.file.mimeTypeReal);
      fotoUrl = resultado.url;
      fotoPublicId = resultado.publicId;
    }

    const atualizado = await prisma.produto.update({
      where: { id },
      data: {
        nome: sanitizarString(nome),
        categoria: sanitizarString(categoria),
        tamanho: sanitizarString(tamanho),
        cor: sanitizarString(cor),
        quantidade: parseInt(quantidade),
        precoCusto: parseFloat(precoCusto),
        precoVenda: parseFloat(precoVenda),
        fotoUrl,
        fotoPublicId,
      },
    });

    logger.info({ produtoId: atualizado.id }, 'Produto atualizado');
    res.json(atualizado);
  } catch (err) {
    next(err);
  }
}

// Inativa produto (soft delete)
async function deletarProduto(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const produto = await prisma.produto.findFirst({ where: { id, ativo: true } });
    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });

    await prisma.produto.update({ where: { id }, data: { ativo: false } });

    logger.info({ produtoId: id }, 'Produto inativado');
    res.json({ mensagem: 'Produto removido com sucesso' });
  } catch (err) {
    next(err);
  }
}

// Registra entrada de estoque (reposição)
async function reporEstoque(req, res, next) {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    return res.status(400).json({ erros: erros.array().map((e) => e.msg) });
  }

  try {
    const id = parseInt(req.params.id);
    const produto = await prisma.produto.findFirst({ where: { id, ativo: true } });
    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });

    const qtd = parseInt(req.body.quantidade);

    const [entrada, produtoAtualizado] = await prisma.$transaction([
      prisma.entradaEstoque.create({ data: { produtoId: id, quantidade: qtd } }),
      prisma.produto.update({ where: { id }, data: { quantidade: { increment: qtd } } }),
    ]);

    logger.info({ produtoId: id, quantidade: qtd }, 'Estoque reposto');
    res.json({ entrada, produto: produtoAtualizado });
  } catch (err) {
    next(err);
  }
}

// Lista produtos com estoque baixo (≤ 3)
async function listaBaixoEstoque(req, res, next) {
  try {
    const produtos = await prisma.produto.findMany({
      where: { ativo: true, quantidade: { lte: 3 } },
      orderBy: { quantidade: 'asc' },
    });
    res.json(produtos);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listarProdutos,
  buscarProduto,
  criarProduto,
  atualizarProduto,
  deletarProduto,
  reporEstoque,
  listaBaixoEstoque,
};
