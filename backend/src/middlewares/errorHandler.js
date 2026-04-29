// Middleware global de tratamento de erros
const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  // Loga o erro completo apenas no servidor — nunca expõe ao cliente
  logger.error({ err, path: req.path, method: req.method }, 'Erro interno no servidor');

  // Em produção, retorna mensagem genérica
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }

  // Em desenvolvimento, inclui mensagem do erro (mas não stack)
  return res.status(500).json({ erro: err.message || 'Erro interno do servidor' });
}

module.exports = errorHandler;
