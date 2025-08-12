/**
 * @fileoverview Client para o Redis
 * 
 * @module src/config/redisClient.js
 */

const redis = require('redis');
const config = require('./index');

// Cria o cliente Redis
const redisClient = redis.createClient({
  url: `redis://${config.redis.host}:${config.redis.port}`
});

redisClient.on('error', (err) => console.error('Erro de Conexão com o Redis:', err));
redisClient.on('connect', () => console.log('Conectado ao Redis com sucesso!'));

// Conecta ao Redis assim que a aplicação inicia
(async () => {
  await redisClient.connect();
})();

module.exports = redisClient;
