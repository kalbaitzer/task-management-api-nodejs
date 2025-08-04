/**
 * @fileoverview Implementação do Serviço de Projetos.
 * 
 * @module src/services/projectService.js
 */

const Task = require('../models/taskModel');
const utils = require('../middlewares/utils');
const Project = require('../models/projectModel');
const TaskHistory = require('../models/taskHistoryModel');

/**
 * Cria um novo projeto para o usuário especídigo.
 *
 * @async
 * @param {string} userId - O ID do usuário que será o proprietário do projeto.
 * @param {object} projectData - O objeto contendo os dados do novo projeto.
 * @param {string} projectData.title - O título do projeto.
 * @param {string} projectData.description - A descrição do projeto.
 * 
 * @returns {Promise<Object>} Uma promessa que resolve para o documento do projeto recém-criado.
 * 
 * @throws {Error} Se o usuário (`userId`) não for encontrado.
 */
exports.createProject = async (userId, projectData) => {
  // Verifica se o usuário existe
  await utils.checkUser(userId);

  // Cria um objeto Project a partir dos dados contidos em projectData
  const project = new Project({
    ...projectData,
  });

  // Associa o projeto ao usuário
  project.owner = userId;

  // Grava no banco de dados
  await project.save();
  
  // Retorn o projeto criado
  return project;
};

/**
 * Lista todos os projetos de um usuário específico em um formato de resumo.
 *
 * @async
 * @param {string} userId - O ID do usuário cujos projetos serão listados.
 * 
 * @returns {Promise<Array<Object>>} Uma promessa que resolve para um array de objetos 
 * de projeto, cada um contendo: { id, name, taskCount }.
 * 
 * @throws {Error} Se o usuário (`userId`) não for encontrado.
 */
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

/**
 * Busca um projeto específico pelo seu ID.
 *
 * @async
 * @param {string} userId - O ID do usuário para verificação de permissão.
 * @param {string} projectId - O ID do projeto a ser buscado.
 * 
 * @returns {Promise<Object|null>} Uma promessa que resolve para o documento do projeto
 * com suas tarefas populadas ou `null` se não for encontrado.
 * 
 * @throws {Error} Se o usuário (`userId`) não for encontrado.
 */
exports.getProjectById = async (userId, projectId) => {
  // Verifica se o usuário existe
  await utils.checkUser(userId);

  // Retorna o projeto identificado pelo seu ID, com as tarefas populadas.
  return await Project.findById(projectId).populate('tasks');
};

/**
 * Atualiza um projeto específico pelo seu ID.
 *
 * @async
 * @param {string} userId - O ID do usuário para verificação de permissão.
 * @param {string} projectId - O ID do projeto a ser atualizado.
 * @param {object} projectData - Um objeto contendo os campos do projeto a serem atualizados.
 * 
 * @returns {Promise<Object|null>} Uma promessa que resolve para o documento do projeto
 * atualizado ou `null` se não for encontrado ou não pertencer ao usuário.
 * 
 * @throws {Error} Se o usuário (`userId`) não for encontrado.
 */
exports.updateProject = async (userId, projectId, projectData) => {
  // Verifica se o usuário existe
  await utils.checkUser(userId);

  // Retorna o projeto atualidado. A opção { new: true } garante que o documento retornado 
  // seja a versão atualizada
  return await Project.findByIdAndUpdate(projectId, projectData, { new: true });
};

// Remove um projeto específico pelo seu ID.
/**
 * Remove um projeto específico pelo seu ID e todos os seus dados associados, ou seja, tarefas e
 * históricos. após verificar se não há tarefas ativas.
 *
 * @async
 * @description Implementa a Regra de Negócio 2. Primeiro, verifica se o projeto tem tarefas
 * ativas. Se não tiver, remove o histórico das tarefas, as tarefas em si, e por último o projeto.
 * 
 * @param {string} userId - O ID do usuário para verificação de permissão.
 * @param {string} projectId - O ID do projeto a ser removido.
 * 
 * @returns {Promise<Object>} Uma promessa que resolve para o documento do projeto que foi removido.
 * 
 * @throws {Error} Se o usuário (`userId`) não for encontrado.
 * @throws {Error} Se o projeto não for encontrado para o usuário especificado.
 * @throws {Error} Se o projeto contiver tarefas pendentes ou em andamento.
 */
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