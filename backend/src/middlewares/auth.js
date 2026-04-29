// Middleware de autenticação via chave de API interna
const logger = require('../utils/logger');

function autenticarApiKey(req, res, next) {
  const chaveEnviada = req.headers['x-api-key'];
  const chaveEsperada = process.env.API_KEY;

  if (!chaveEnviada || chaveEnviada !== chaveEsperada) {
    logger.warn({ ip: req.ip, path: req.path }, 'Tentativa de acesso sem API Key válida');
    return res.status(401).json({ erro: 'Acesso não autorizado' });
  }

  next();
}

module.exports = { autenticarApiKey };
