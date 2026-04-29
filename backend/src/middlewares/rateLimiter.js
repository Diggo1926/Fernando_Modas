// Rate limiting por IP usando express-rate-limit
const rateLimit = require('express-rate-limit');

// Limite geral para todas as rotas
const limitadorGeral = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas requisições. Tente novamente em alguns minutos.' },
});

// Limite mais restrito para rotas sensíveis (upload, fechamento de caixa)
const limitadorRestrito = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas requisições para esta operação. Aguarde 10 minutos.' },
});

module.exports = { limitadorGeral, limitadorRestrito };
