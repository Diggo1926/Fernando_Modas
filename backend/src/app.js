// Configuração do Express — middlewares globais e rotas
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { autenticarApiKey } = require('./middlewares/auth');
const { limitadorGeral } = require('./middlewares/rateLimiter');
const errorHandler = require('./middlewares/errorHandler');
const rotasCaixa = require('./routes/caixa');
const rotasEstoque = require('./routes/estoque');
const rotasRelatorio = require('./routes/relatorio');

const app = express();

// Força HTTPS em produção
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// Headers de segurança via helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
    },
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS restrito aos domínios configurados
const origensPermitidas = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origin (ex: Postman em dev) apenas em desenvolvimento
    if (!origin && process.env.NODE_ENV !== 'production') return callback(null, true);
    if (origensPermitidas.includes(origin)) return callback(null, true);
    return callback(new Error('Origem não permitida pelo CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-API-Key', 'X-CSRF-Token'],
  credentials: true,
}));

// Limite de body — proteção contra payloads grandes
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// Rate limiting geral
app.use(limitadorGeral);

// Health check (sem autenticação — usado pelo Railway)
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Todas as rotas da API exigem a API Key interna
app.use('/api', autenticarApiKey);

// Rotas dos módulos
app.use('/api/caixa', rotasCaixa);
app.use('/api/estoque', rotasEstoque);
app.use('/api/relatorio', rotasRelatorio);

// Rota 404
app.use((_req, res) => res.status(404).json({ erro: 'Rota não encontrada' }));

// Tratamento global de erros
app.use(errorHandler);

module.exports = app;
