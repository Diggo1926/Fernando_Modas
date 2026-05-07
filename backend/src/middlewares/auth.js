// Middleware de autenticação via chave de API interna
const crypto = require('crypto');
const logger = require('../utils/logger');

function autenticarApiKey(req, res, next) {
  // Preflight CORS não carrega headers de autenticação — não bloquear
  if (req.method === 'OPTIONS') return next();

  const chaveEnviada = req.headers['x-api-key'] || '';
  const chaveEsperada = process.env.API_KEY || '';

  // timingSafeEqual previne timing attacks por comparação de comprimento constante
  let autorizado = false;
  try {
    if (chaveEnviada.length > 0 && chaveEnviada.length === chaveEsperada.length) {
      autorizado = crypto.timingSafeEqual(
        Buffer.from(chaveEnviada),
        Buffer.from(chaveEsperada)
      );
    }
  } catch {
    autorizado = false;
  }

  if (!autorizado) {
    logger.warn({ ip: req.ip, path: req.path }, 'Tentativa de acesso sem API Key válida');
    return res.status(401).json({ erro: 'Acesso não autorizado' });
  }

  next();
}

module.exports = { autenticarApiKey };
