// Implementação do serviço de Relatórios.
// src/services/reportService.js

const Task = require('../models/taskModel');
const utils = require('../middlewares/utils');
const TaskHistory = require('../models/taskHistoryModel');

// Gera um relatório de desempenho com a média de tarefas concluídas por usuário nos últimos 30 dias.
// Esta funcionalidade implementa a Regra de Negócio 5.
exports.getPerformanceReport = async (userId) => {
  // Verifica se o usuário existe
  const user = await utils.checkUser(userId);

	if (user && user.role != "Manager")
	{
		// Lança uma exceção de regra de negócio
		throw new Error("Você não tem permissão para acessar este relatório.");
	}

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

  // Se nenhum tarefa foi concluída retorna um relatório zerado
  if (totalTasksCompleted == 0) {

    return {
        generatedAt: new Date(),
        totalTasksCompleted: 0,
        distinctUsersWhoCompletedTasks: 0,
        averageTasksCompletedPerUser: 0
      };    
  }

  // Obtém o total de usuários (distintos) que concluiram as tarefas
  const distinctUsersWhoCompletedTasks = new Set(completedTasks.map(h => h.userId)).size;
   
  // Calcular a média
  const averageTasks = totalTasksCompleted / distinctUsersWhoCompletedTasks;

  // Retorna o relatório
  return {
    generatedAt: new Date(),
    totalTasksCompleted: totalTasksCompleted,
    distinctUsersWhoCompletedTasks: distinctUsersWhoCompletedTasks,
    averageTasksCompletedPerUser: Math.round(averageTasks * 100) / 100 // Arredonda para 2 casas
  };
};
