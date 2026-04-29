// Rotas do módulo Estoque
const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const { upload, validarMimeReal } = require('../middlewares/upload');
const { limitadorRestrito } = require('../middlewares/rateLimiter');
const {
  listarProdutos,
  buscarProduto,
  criarProduto,
  atualizarProduto,
  deletarProduto,
  reporEstoque,
  listaBaixoEstoque,
} = require('../controllers/estoqueController');

const CATEGORIAS_VALIDAS = ['Vestido', 'Blusa', 'Calça', 'Saia', 'Conjunto', 'Acessório', 'Outro'];
const TAMANHOS_VALIDOS = ['PP', 'P', 'M', 'G', 'GG', 'Único'];

const validacoesProduto = [
  body('nome').trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('categoria').isIn(CATEGORIAS_VALIDAS).withMessage('Categoria inválida'),
  body('tamanho').isIn(TAMANHOS_VALIDOS).withMessage('Tamanho inválido'),
  body('cor').trim().isLength({ min: 2, max: 50 }).withMessage('Cor deve ter entre 2 e 50 caracteres'),
  body('quantidade').isInt({ min: 0 }).withMessage('Quantidade deve ser um número inteiro positivo'),
  body('precoCompra').isFloat({ min: 0 }).withMessage('Preço de custo inválido'),
  body('precoVenda').isFloat({ min: 0.01 }).withMessage('Preço de venda inválido'),
];

// GET /estoque — lista produtos
router.get('/', listarProdutos);

// GET /estoque/baixo-estoque — produtos com quantidade ≤ 3
router.get('/baixo-estoque', listaBaixoEstoque);

// GET /estoque/:id — busca produto por ID
router.get('/:id', [param('id').isUUID()], buscarProduto);

// POST /estoque — cadastra produto
router.post(
  '/',
  limitadorRestrito,
  upload.single('foto'),
  validarMimeReal,
  validacoesProduto,
  criarProduto
);

// PUT /estoque/:id — atualiza produto
router.put(
  '/:id',
  limitadorRestrito,
  upload.single('foto'),
  validarMimeReal,
  [param('id').isUUID(), ...validacoesProduto],
  atualizarProduto
);

// DELETE /estoque/:id — inativa produto
router.delete('/:id', [param('id').isUUID()], deletarProduto);

// POST /estoque/:id/repor — repõe estoque
router.post(
  '/:id/repor',
  [
    param('id').isUUID(),
    body('quantidade').isInt({ min: 1 }).withMessage('Quantidade de reposição deve ser ao menos 1'),
  ],
  reporEstoque
);

module.exports = router;
