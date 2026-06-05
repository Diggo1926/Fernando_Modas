const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { listarCategorias, criarCategoria } = require('../controllers/categoriasController');

// GET /categorias — lista categorias ativas
router.get('/', listarCategorias);

// POST /categorias — cria nova categoria
router.post(
  '/',
  [
    body('nome')
      .trim()
      .isLength({ min: 2, max: 60 })
      .withMessage('Nome deve ter entre 2 e 60 caracteres'),
  ],
  criarCategoria
);

module.exports = router;
