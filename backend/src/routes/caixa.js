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
    body('items').isArray({ min: 1 }).withMessage('Informe ao menos um item'),
    body('items.*.produtoId').isInt({ min: 1 }).withMessage('ID de produto inválido'),
    body('items.*.quantidade').isInt({ min: 1 }).withMessage('Quantidade deve ser ao menos 1'),
    body('items.*.precoUnitario').isFloat({ min: 0.01 }).withMessage('Preço unitário inválido'),
    body('total').isFloat({ min: 0.01 }).withMessage('Total inválido'),
    body('valorRecebido').optional().isFloat({ min: 0 }).withMessage('Valor recebido inválido'),
    body('troco').optional().isFloat({ min: 0 }).withMessage('Troco inválido'),
    body('pagamentos').isArray({ min: 1 }).withMessage('Informe ao menos uma forma de pagamento'),
    body('pagamentos.*.forma')
      .isIn(['DINHEIRO', 'PIX', 'DEBITO', 'CREDITO'])
      .withMessage('Forma de pagamento inválida'),
    body('pagamentos.*.valor').isFloat({ min: 0.01 }).withMessage('Valor da forma de pagamento inválido'),
    body('pagamentos.*.parcelas')
      .optional()
      .isInt({ min: 1, max: 12 })
      .withMessage('Parcelas deve ser entre 1 e 12'),
  ],
  registrarVenda
);

// DELETE /caixa/vendas/:id — cancela uma venda
router.delete(
  '/vendas/:id',
  [param('id').isInt({ min: 1 }).withMessage('ID de venda inválido').toInt()],
  cancelarVenda
);

// POST /caixa/fechar — fecha o caixa do dia
router.post('/fechar', limitadorRestrito, fecharCaixa);

module.exports = router;
