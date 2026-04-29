// Logger estruturado com pino — nunca loga dados sensíveis
const pino = require('pino');

const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport:
    process.env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  // Remove campos sensíveis do log automaticamente
  redact: {
    paths: ['password', 'token', 'apiKey', 'authorization', 'cookie', 'req.headers.authorization', 'req.headers.cookie', 'req.headers["x-api-key"]'],
    censor: '[REDACTED]',
  },
});

module.exports = logger;
