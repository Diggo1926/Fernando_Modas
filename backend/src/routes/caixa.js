// Rotas do módulo Caixa
const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const { limitadorRestrito } = require('../middlewares/rateLimiter');
const {
  registrarVenda,
  cancelarVenda,
  listarVendasDia,
  metricasDia,
  fecharCaixa,
} = require('../controllers/caixaController');

// GET /caixa/metricas — métricas do dia para os cards
router.get('/metricas', metricasDia);

// GET /caixa/vendas — lista vendas do dia
router.get('/vendas', listarVendasDia);

// POST /caixa/vendas — registra nova venda
router.post(
  '/vendas',
  [
    body('produtoId').isUUID().withMessage('ID de produto inválido'),
    body('quantidade').isInt({ min: 1 }).withMessage('Quantidade deve ser ao menos 1'),
    body('valorTotal').isFloat({ min: 0.01 }).withMessage('Valor total inválido'),
    body('formasPagamento')
      .isArray({ min: 1 })
      .withMessage('Informe ao menos uma forma de pagamento'),
    body('formasPagamento.*.forma')
      .isIn(['PIX', 'Dinheiro', 'Débito', 'Crédito'])
      .withMessage('Forma de pagamento inválida'),
    body('formasPagamento.*.valor')
      .isFloat({ min: 0.01 })
      .withMessage('Valor da forma de pagamento inválido'),
    body('parcelas')
      .optional()
      .isInt({ min: 1, max: 12 })
      .withMessage('Parcelas deve ser entre 1 e 12'),
  ],
  registrarVenda
);

// DELETE /caixa/vendas/:id — cancela uma venda
router.delete(
  '/vendas/:id',
  [param('id').isUUID().withMessage('ID de venda inválido')],
  cancelarVenda
);

// POST /caixa/fechar — fecha o caixa do dia
router.post('/fechar', limitadorRestrito, fecharCaixa);

module.exports = router;
