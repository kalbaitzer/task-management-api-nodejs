// Definição das rotas da API de Relatórios
// src/routes/reportRoutes.js

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

/// Rota para relatório de desempenho para as tarefas concluídas nos últimos 30 dias.
// GET /api/reports
router.get('/performance', reportController.getPerformanceReport);

module.exports = router;