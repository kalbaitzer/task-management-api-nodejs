// Controller responsável por gerenciar os endpoints relacionados a Relatórios.
// src/controllers/reportController.js

const reportService = require('../services/reportService');

// Relatório de desempenho para as tarefas concluídas nos últimos 30 dias.
exports.getPerformanceReport = async (req, res, next) => {
  try {
    // Obtém o relatório de performance
    const report = await reportService.getPerformanceReport(req.headers['x-user-id'], req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Relatório não encontrado.' });
    }
    res.status(200).json(report);
  } catch (error) {
    next(error);
  }
};
