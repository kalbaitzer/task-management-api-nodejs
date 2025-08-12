/**
 * @fileoverview Implementação do serviço de Relatórios.
 * 
 * @module src/services/reportService.js
 */

const utils = require('../middlewares/utils');
const TaskHistory = require('../models/taskHistoryModel');

/**
 * Gera um relatório de desempenho com a média de tarefas concluídas por usuário nos últimos 30 dias.
 * Esta funcionalidade é restrita a usuários com o perfil 'Manager'.
 *
 * @async
 * @description Implementa a Regra de Negócio 5. Utiliza uma pipeline de agregação do MongoDB
 * para calcular eficientemente o total de tarefas concluídas, o número de usuários distintos
 * que as concluíram, e a média de tarefas por usuário, tudo diretamente no banco de dados.
 *
 * @param {string} requesterId - O ID do usuário que está solicitando o relatório.
 * Este ID é usado para verificar se o usuário tem a permissão necessária ('Manager').
 *
 * @returns {Promise<Object>} Uma promessa que resolve para o objeto do relatório de desempenho.
 * A estrutura do objeto é:
 * {
 *   "generatedAt": Date,
 *   "totalTasksCompleted": number,
 *   "distinctUsersWhoCompletedTasks": number,
 *   "averageTasksCompletedPerUser": number
 * }
 *
 * @throws {Error} Lança um erro se o usuário não for encontrado.
 * @throws {Error} Lança um erro se o usuário não tiver o perfil 'Manager'.
 */
exports.getPerformanceReport = async (userId) => {
  // Define uma chave única para este recurso no cache
  const cacheKey = `report:performance`;

  // Verifica se o usuário existe
  const user = await utils.checkUser(userId);

  if (user && user.role != "Manager")
  {
	// Lança uma exceção de regra de negócio
	throw new Error("Você não tem permissão para acessar este relatório.");
  }

  // Tenta buscar do cache primeiro
  const cachedReport = await utils.getCache(cacheKey);
  
  if (cachedReport) return cachedReport;

  // Query para consulta de tarefas concluídas nos últimos 30 dias no histórico
  const query = {
    changeDate: { $gte: new Date().getDate() - 30 },
    changeType: 'Update',
    fieldName: 'Status',
    newValue: 'Concluida'
  };

  // Obtém o array de tarefas concluídas
  const completedTasks = await TaskHistory.find(query);

  // Obtém o total de tarefas concluídas
  const totalTasksCompleted = completedTasks.length;

  var report;

  // Se nenhum tarefa foi concluída retorna um relatório zerado
  if (totalTasksCompleted == 0) {

    report = {
      generatedAt: new Date(),
      totalTasksCompleted: 0,
      distinctUsersWhoCompletedTasks: 0,
      averageTasksCompletedPerUser: 0
    };    
  }
  else {

    // Obtém o total de usuários (distintos) que concluiram as tarefas
    const distinctUsersWhoCompletedTasks = new Set(completedTasks.map(h => h.userId)).size;
   
    // Calcular a média
    const averageTasks = totalTasksCompleted / distinctUsersWhoCompletedTasks;

    // Retorna o relatório
    report = {
      generatedAt: new Date(),
      totalTasksCompleted: totalTasksCompleted,
      distinctUsersWhoCompletedTasks: distinctUsersWhoCompletedTasks,
      averageTasksCompletedPerUser: Math.round(averageTasks * 100) / 100 // Arredonda para 2 casas
    };
  }

  // Salva o resultado no cache
  await utils.setCache(cacheKey, report);

  return report;
};
