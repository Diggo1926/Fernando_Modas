// Ponto de entrada do servidor
require('dotenv').config();
const app = require('./app');
const logger = require('./utils/logger');

const PORTA = parseInt(process.env.PORT, 10) || 3001;

app.listen(PORTA, () => {
  logger.info({ porta: PORTA, ambiente: process.env.NODE_ENV }, 'Servidor RM Modas iniciado');
});
