// Controller do módulo Estoque
const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const { enviarImagem, removerImagem } = require('../services/cloudinary');
const { sanitizarString } = require('../utils/sanitize');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

async function gerarProximoCodigo(categoria) {
  const cat = await prisma.categoria.findFirst({ where: { nome: categoria, ativo: true } });
  const sigla = cat?.sigla || 'OUT';

  const existentes = await prisma.produto.findMany({
    where: { codigo: { startsWith: `${sigla}-` } },
    select: { codigo: true },
  });

  let maxNum = 0;
  for (const p of existentes) {
    if (!p.codigo) continue;
    const match = p.codigo.match(/^[A-Z]+-(\d+)$/);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > maxNum) maxNum = n;
    }
  }

  return `${sigla}-${String(maxNum + 1).padStart(3, '0')}`;
}

// Lista produtos com filtros opcionais
async function listarProdutos(req, res, next) {
  try {
    const { categoria, tamanho, cor, busca, ordenar } = req.query;

    const where = { ativo: true };
    if (categoria) where.categoria = sanitizarString(categoria);
    if (tamanho) where.tamanho = sanitizarString(tamanho);
    if (cor) where.cor = { contains: sanitizarString(cor), mode: 'insensitive' };
    if (busca) {
      const buscaSanitizada = sanitizarString(busca);
      where.OR = [
        { nome: { contains: buscaSanitizada, mode: 'insensitive' } },
        { codigo: { contains: buscaSanitizada, mode: 'insensitive' } },
      ];
    }

    let orderBy = { nome: 'asc' };
    if (ordenar === 'preco_asc') orderBy = { precoVenda: 'asc' };
    else if (ordenar === 'preco_desc') orderBy = { precoVenda: 'desc' };
    else if (ordenar === 'quantidade_asc') orderBy = { quantidade: 'asc' };
    else if (ordenar === 'quantidade_desc') orderBy = { quantidade: 'desc' };

    const produtos = await prisma.produto.findMany({ where, orderBy });
    res.json(produtos ?? []);
  } catch (err) {
    logger.error({ err }, 'Erro ao listar produtos');
    res.json([]);
  }
}

// Busca produto por ID
async function buscarProduto(req, res, next) {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    return res.status(400).json({ erros: erros.array().map((e) => e.msg) });
  }

  try {
    const produto = await prisma.produto.findFirst({
      where: { id: req.params.id, ativo: true },
    });
    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });
    res.json(produto);
  } catch (err) {
    next(err);
  }
}

// Busca produto por código (para scanner)
async function buscarPorCodigo(req, res, next) {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    return res.status(400).json({ erros: erros.array().map((e) => e.msg) });
  }

  try {
    const codigo = sanitizarString(req.params.codigo).toUpperCase();
    const produto = await prisma.produto.findFirst({
      where: { codigo, ativo: true },
    });
    if (!produto) return res.status(404).json({ erro: 'Código não encontrado' });
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

    const categoriaSanitizada = sanitizarString(categoria);
    const categoriaValida = await prisma.categoria.findFirst({ where: { nome: categoriaSanitizada, ativo: true } });
    if (!categoriaValida) {
      return res.status(400).json({ erros: ['Categoria inválida'] });
    }

    let fotoUrl = null;
    let fotoPublicId = null;

    if (req.file) {
      const resultado = await enviarImagem(req.file.buffer, req.file.mimeTypeReal);
      fotoUrl = resultado.url;
      fotoPublicId = resultado.publicId;
    }

    const codigo = await gerarProximoCodigo(categoriaSanitizada);

    const produto = await prisma.produto.create({
      data: {
        nome: sanitizarString(nome),
        categoria: categoriaSanitizada,
        tamanho: sanitizarString(tamanho),
        cor: sanitizarString(cor),
        quantidade: parseInt(quantidade),
        precoCusto: parseFloat(precoCusto),
        precoVenda: parseFloat(precoVenda),
        fotoUrl,
        fotoPublicId,
        codigo,
      },
    });

    logger.info({ produtoId: produto.id, codigo }, 'Produto cadastrado');
    res.status(201).json(produto);
  } catch (err) {
    if (err.code === 'P2002' && err.meta?.target?.includes('codigo')) {
      return res.status(409).json({ erro: 'Conflito ao gerar código. Tente novamente.' });
    }
    next(err);
  }
}

// Atualiza produto
async function atualizarProduto(req, res, next) {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    return res.status(400).json({ erro: 'Dados inválidos', detalhes: erros.array() });
  }

  try {
    const id = parseInt(req.params.id);
    const produto = await prisma.produto.findFirst({ where: { id, ativo: true } });
    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });

    const categoriaSanitizada = sanitizarString(req.body.categoria);
    const categoriaValida = await prisma.categoria.findFirst({ where: { nome: categoriaSanitizada, ativo: true } });
    if (!categoriaValida) {
      return res.status(400).json({ erro: 'Categoria inválida' });
    }

    const dadosAtualizar = {
      nome:       sanitizarString(req.body.nome),
      categoria:  categoriaSanitizada,
      tamanho:    sanitizarString(req.body.tamanho),
      cor:        sanitizarString(req.body.cor),
      quantidade: parseInt(req.body.quantidade),
      precoCusto: parseFloat(req.body.precoCusto),
      precoVenda: parseFloat(req.body.precoVenda),
    };

    if (req.file) {
      if (produto.fotoPublicId) {
        await removerImagem(produto.fotoPublicId);
      }
      const { url, publicId } = await enviarImagem(req.file.buffer, req.file.mimeTypeReal);
      dadosAtualizar.fotoUrl = url;
      dadosAtualizar.fotoPublicId = publicId;
    }

    const atualizado = await prisma.produto.update({
      where: { id },
      data: dadosAtualizar,
    });

    logger.info({ produtoId: atualizado.id }, 'Produto atualizado');
    res.json(atualizado);
  } catch (err) {
    next(err);
  }
}

// Inativa produto (soft delete)
async function deletarProduto(req, res, next) {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    return res.status(400).json({ erros: erros.array().map((e) => e.msg) });
  }

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

// Lista produtos com estoque zerado (= 0)
async function listaBaixoEstoque(req, res, next) {
  try {
    const produtos = await prisma.produto.findMany({
      where: { ativo: true, quantidade: 0 },
      orderBy: { quantidade: 'asc' },
    });
    res.json(produtos ?? []);
  } catch (err) {
    logger.error({ err }, 'Erro ao listar baixo estoque');
    res.json([]);
  }
}

module.exports = {
  listarProdutos,
  buscarProduto,
  buscarPorCodigo,
  criarProduto,
  atualizarProduto,
  deletarProduto,
  reporEstoque,
  listaBaixoEstoque,
};
