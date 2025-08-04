// Implementação do Serviço de Projetos.
// src/services/projectService.js

const Task = require('../models/taskModel');
const utils = require('../middlewares/utils');
const Project = require('../models/projectModel');
const TaskHistory = require('../models/taskHistoryModel');

// Cria um novo projeto.
exports.createProject = async (userId, projectData) => {
  // Verifica se o usuário existe
  await utils.checkUser(userId);

  const project = new Project({
    ...projectData,
  });

  project.owner = userId;

  await project.save();
  return project;
};

// Lista todos os projetos cadastrados.
exports.getAllProjects = async (userId) => {
  // Verifica se o usuário existe
  await utils.checkUser(userId);

  // Retorna todos os projetos
  const projects = await Project.find({ owner: userId })
    .populate('taskCount'); // "Popula" o campo virtual com a contagem

  // Formatação da saída com os campos: id, name e taskCount
  return projects.map(p => ({
    id: p._id,
    name: p.name,
    taskCount: p.taskCount
  }));
};

// Busca um projeto específico pelo seu ID.
exports.getProjectById = async (userId, projectId) => {
  // Verifica se o usuário existe
  await utils.checkUser(userId);

  return await Project.findById(projectId).populate('tasks');
};

// Atualiza um projeto específico pelo seu ID.
exports.updateProject = async (userId, projectId, projectData) => {
  // Verifica se o usuário existe
  await utils.checkUser(userId);

  return await Project.findByIdAndUpdate(projectId, projectData, { new: true });
  // { new: true } garante que o documento retornado seja a versão atualizada
};

// Remove um projeto específico pelo seu ID.
exports.deleteProject = async (userId, projectId) => {
  // Verifica se o usuário existe
  await utils.checkUser(userId);

  // Regra de Negócio 2: Verificar se existem tarefas pendentes ou em andamento
  const queryConditions = {
    projectId: projectId,
    status: { $in: ['Pendente', 'EnAndamento'] } // 'status' deve ser um dos valores neste array
  };

  // Task.exists() retorna um booleano: true se encontrar, false se não.
  const hasActiveTasks = await Task.exists(queryConditions);

  if (hasActiveTasks) {

    // Lança uma exceção de regrade negócio
    throw new Error("Não é possível remover o projeto. Existem tarefas pendentes ou em andamento. Conclua ou remova as tarefas primeiro.");
  }

  const tasksToDelete = await Task.find({ projectId: projectId }).select('_id');
  const taskIdsToDelete = tasksToDelete.map(task => task._id); // Extrai os IDs para um array de strings

  // Verificamos se há IDs no histórico de tarefas para remover.
  if (taskIdsToDelete.length > 0) {
    await TaskHistory.deleteMany({ taskId: { $in: taskIdsToDelete } });
  }

  // Remover todas as tarefas do projeto.
  await Task.deleteMany({ projectId: projectId });

  // Remover o projeto.
  return await Project.findByIdAndDelete(projectId);
};