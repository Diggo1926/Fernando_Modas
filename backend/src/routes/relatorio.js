// Rotas do módulo Relatório
const express = require('express');
const { param } = require('express-validator');
const router = express.Router();
const {
  resumoPeriodo,
  listarFechamentos,
  detalharFechamento,
} = require('../controllers/relatorioController');

// GET /relatorio/resumo?periodo=hoje|semana|mes|personalizado&inicio=&fim=
router.get('/resumo', resumoPeriodo);

// GET /relatorio/fechamentos — histórico de fechamentos
router.get('/fechamentos', listarFechamentos);

// GET /relatorio/fechamentos/:id — detalhe de um fechamento
router.get(
  '/fechamentos/:id',
  [param('id').isInt({ min: 1 }).withMessage('ID inválido').toInt()],
  detalharFechamento
);

module.exports = router;
