/**
 * @fileoverview Arquivo principal das configurações da aplicação
 * 
 * @module src/config/index.js
 */

module.exports = Object.freeze({
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  }
});