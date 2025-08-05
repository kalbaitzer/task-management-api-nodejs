/**
 * @fileoverview Implementação do Serviço de Tarefas.
 * 
 * @module src/services/taskService.js
 */

const utils = require('../middlewares/utils');
const Task = require('../models/taskModel');
const TaskHistory = require('../models/taskHistoryModel');

/**
 * Cria uma nova tarefa para um projeto, garantindo que o limite de tarefas não seja excedido.
 * Cria também o registro de histórico inicial. A operação é atômica (usa transação).
 *
 * @async
 * @param {string} userId - O ID do usuário que está criando a tarefa (para autoria e permissão).
 * @param {string} projectId - O ID do projeto ao qual a tarefa pertence.
 * @param {object} taskData - O objeto com os dados da nova tarefa: { title, description, dueTo,
 * priority }.
 * 
 * @returns {Promise<Object>} Uma promessa que resolve para o documento da tarefa recém-criada.
 * 
 * @throws {Error} Se o usuário (`userId`) não for encontrado.
 * @throws {Error} Se o projeto (`projectId`) não for encontrado.
 * @throws {Error} Se o projeto já atingiu o limite de 20 tarefas.
 */
exports.createTaskForProject = async (userId, projectId, taskData) => {
  // Verifica se o usuário existe
  await utils.checkUser(userId);

  // Verfica se o projeto existe
  const project = await utils.checkProject(projectId);

  // Regra de Negócio 4: Limite de tarefas por projeto
  if (project != null) {
    
    if (!project.taskCount) {
      await project.populate('taskCount'); // "Popula" o campo virtual com a contagem
    }
    
    // Verifica se o total de tarefas é maior ou igual a 20
    if (project.taskCount >= 20) {
      // Lança uma exceção de regra de negócio
      throw new Error("Limite de 20 tarefas por projeto foi atingido.");
    }
  }

  // Cria um objeto Task a partir dos dados contidos em taksData
  const task = new Task({
    ...taskData,
  });

  // Associa a tarefa ao projeto (projectId)
  task.projectId = projectId;

  // Grava no banco de dados
  await task.save();

  // Criação do histórico da tarefa
  const history = new TaskHistory({
    taskId: task.id,
    userId: userId,
    changeType: "Create",
    newValue: "Tarefa '" + task.title + "' foi criada."
  });

  // Grava no banco de dados
  await history.save();

  // Retorn a tarefa criada
  return task;
};

/**
 * Lista todas as tarefas de um projeto específico.
 *
 * @async
 * @param {string} userId - O ID do usuário para verificação de permissão.
 * @param {string} projectId - O ID do projeto cujas tarefas serão listadas.
 * 
 * @returns {Promise<Array<Object>>} Um array de objetos de tarefa. Cada objeto 
 * no array representa uma tarefa e contém campos como: { id, title, description, 
 * status, priority, dueDate, etc. }.
 * 
 * @throws {Error} Se o usuário (`userId`) não for encontrado.
 * @throws {Error} Se o projeto (`projectId`) não for encontrado.
 */
exports.getTasksByProject = async (userId, projectId) => {
  // Verifica se o usuário existe
  await utils.checkUser(userId);

  // Verfica se o projeto existe
  await utils.checkProject(projectId);
  
  // Obtém a lista de tarefas do projeto
  var tasks = await Task.find({ projectId: projectId });

  // Formatação da saída com dos campos
  return tasks.map(t => ({
    id: t._id,
    title: t.title,
    description: t.description,
    dueDate: t.dueDate,
    status: t.status,
    priority: t.priority,
    projectId: t.projectId,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt
  }));
};

/**
 * Busca uma tarefa específica pelo seu ID.
 *
 * @async
 * @param {string} userId - O ID do usuário para verificação de permissão.
 * @param {string} taskId - O ID da tarefa a ser buscada.
 * 
 * @returns {Promise<Object|null>} O objeto da tarefa ou `null` se não for encontrado. 
 * O objeto da tarefa contém os seguintes campos: { id, title, description, dueDate, 
 * status, priority, projectId, createdAt, updatedAt }.
 * 
 * @throws {Error} Se o usuário (`userId`) não for encontrado.
 */
exports.getTaskById = async (userId, taskId) => {
  // Verifica se o usuário existe
  await utils.checkUser(userId);

  // Retorna a tarefa identificada pelo seu ID.
  return await Task.findById(taskId);
};

/**
 * Atualiza uma tarefa específica pelo seu ID, criando registros de histórico para cada 
 * campo alterado.
 *
 * @async
 * @param {string} userId - O ID do usuário para verificação de permissão.
 * @param {string} taskId - O ID da tarefa a ser atualizada.
 * @param {object} taskData - Objeto com os campos a serem atualizados: { title, description,
 * dueDate, status, updatedAt }
 * 
 * @returns {Promise<Object>} O documento da tarefa atualizada.
 * 
 * @throws {Error} Se o usuário (`userId`) não for encontrado.
 * @throws {Error} Se a tarefa (`taskId`) não for encontrada.
 */
exports.updateTask = async (userId, taskId, taskData) => {
  // Verifica se o usuário existe
  await utils.checkUser(userId);

  // Verifica se a tarefa existe
  const task = await utils.checkTask(taskId);

  if (!task) return;

  // Verifica se o status da tarefa é válido
  if (!utils.checkTaskStatus(taskData.status,task.status)) return;

  // Remove o campo 'priority' de taskData
  if (taskData.priority) delete taskData.priority;

  // Regra de Negócio 3: Registrar histórico de alterações

  // Histórico: alteração do título da tarefa
  if (taskData.title && task.title != taskData.title) {

    const history = new TaskHistory({
      taskId: taskId,
      userId: userId,
      changeType: "Update",
      fieldName: "Title",
      oldValue: task.title,
      newValue: taskData.title
    });

    await history.save();
  }

  // Histórico: alteração da descriçãp da tarefa
  if (taskData.description && task.description != taskData.description) {

    const history = new TaskHistory({
      taskId: taskId,
      userId: userId,
      changeType: "Update",
      fieldName: "Description",
      oldValue: task.description,
      newValue: taskData.description
    });

    await history.save();
  }

  // Histórico: alteração da data de vencimento da tarefa
  if (taskData.dueDate && task.dueDate != taskData.dueDate) {

    const history = new TaskHistory({
      taskId: taskId,
      userId: userId,
      changeType: "Update",
      fieldName: "DueTo",
      oldValue: task.dueDate,
      newValue: taskData.dueDate
    });

    await history.save();
  }

  // Histórico: alteração do status da tarefa
  if (taskData.status && task.status != taskData.status) {

    const history = new TaskHistory({
      taskId: taskId,
      userId: userId,
      changeType: "Update",
      fieldName: "Status",
      oldValue: task.status,
      newValue: taskData.status
    });

    await history.save();
  }

  // Retorna a tarefa atualidada. A opção { new: true } garante que o documento retornado 
  // seja a versão atualizada
  return await Task.findByIdAndUpdate(taskId, taskData, { new: true });
};

// Atualiza o status de uma tarefa.
/**
 * Atualiza especificamente o status de uma tarefa e registrando a alteração no histórico.
 *
 * @async
 *
 * @param {string} userId - O ID do usuário para verificação de permissão.
 * @param {string} taskId - O ID da tarefa cujo status será atualizado.
 * @param {object} taskData - O objeto contendo o novo status. Ex: `{ status: 'Concluida' }`.
 *
 * @returns {Promise<Object>} Uma promessa que resolve para o documento da tarefa com o status 
 * atualizado.
 *
 * @throws {Error} Se o usuário (`userId`) não for encontrado.
 * @throws {Error} Se a tarefa (`taskId`) não for encontrada.
 * @throws {Error} Lança um erro se a transição de status for inválida (lançado por `checkTaskStatus`).
 */
exports.updateTaskStatus = async (userId, taskId, taskData) => {
  // Verifica se o usuário existe
  await utils.checkUser(userId);

  // Verifica se a tarefa existe
  const task = await utils.checkTask(taskId);

  if (!task) return;

  // Verifica se o status da tarefa é válido
  if (!utils.checkTaskStatus(taskData.status,task.status)) return;

  // Regra de Negócio 3: Registrar histórico de alterações

  // Histórico: alteração do status da tarefa
  if (task.status != taskData.status) {

    const history = new TaskHistory({
      taskId: taskId,
      userId: userId,
      changeType: "Update",
      fieldName: "Status",
      oldValue: task.status,
      newValue: taskData.status
    });

    await history.save();
  }

  // Retorna a tarefa atualidada. A opção { new: true } garante que o documento retornado 
  // seja a versão atualizada
  return await Task.findByIdAndUpdate(taskId, { status: taskData.status }, { new: true });
};

/**
 * Adiciona um comentário a uma tarefa, registrando o evento no histórico.
 *
 * @async
 * @param {string} userId - O ID do usuário para verificação de permissão.
 * @param {string} taskId - O ID da tarefa a ser comentada.
 * 
 * @param {object} taskData - Objeto com o comentário. Ex: { comment: "texto" }.
 * 
 * @returns {Promise<Object>} O documento da tarefa atualizada.
 * 
 * @throws {Error} Se o usuário (`userId`) não for encontrado.
 * @throws {Error} Se a tarefa (`taskId`) não for encontrada.
 */
exports.addComment = async (userId, taskId, taskData) => {
  // Verifica se o usuário existe
  await utils.checkUser(userId);

  // Verifica se a tarefa existe
  const task = await utils.checkTask(taskId);

  if (!task) return;

  // Regra de Negócio 6: Cria o registro de histórico para o comentário
  const history = new TaskHistory({
    taskId: taskId,
    userId: userId,
    changeType: "Comment",
    comment: taskData.comment,
  });

  await history.save();

  // Retorna a tarefa atualidada. A opção { new: true } garante que o documento retornado 
  // seja a versão atualizada
  return await Task.findByIdAndUpdate(taskId, { }, { new: true });
};

/**
 * Remove uma tarefa identificada pelo seu ID e todo o seu histórico.
 *
 * @async
 * @param {string} userId - O ID do usuário para verificação de permissão.
 * @param {string} taskId - O ID da tarefa a ser removida.
 * 
 * @returns {Promise<Object>} O documento da tarefa que foi removida.
 * 
 * @throws {Error} Se o usuário (`userId`) não for encontrado.
 * @throws {Error} Se a tarefa (`taskId`) não for encontrada.
 */
exports.deleteTask = async (userId, taskId) => {
  // Verifica se o usuário existe
  await utils.checkUser(userId);
  
  // Remover todos os registros de histórico associados à tarefa.
  await TaskHistory.deleteMany({ taskId: taskId });

  // Remover a tarefa principal.
  return await Task.findByIdAndDelete(taskId);
};

/**
 * Busca o histórico completo de uma tarefa.
 *
 * @async
 * @param {string} userId - O ID do usuário para verificação de permissão.
 * @param {string} taskId - O ID da tarefa cujo histórico é desejado.
 * 
 * @returns {Promise<Array<Object>>} Um array de objetos de histórico. Se a tarefa não 
 * tiver histórico, retorna um array vazio []. Cada objeto no array tem a seguinte 
 * estrutura: { id, userId, taskId, changeDate, changeType, fieldName?, oldValue?,
 * newValue?, comment? }.
 * 
 * @throws {Error} Se o usuário (`userId`) não for encontrado.
 * @throws {Error} Se a tarefa (`taskId`) não for encontrada.
 */
exports.getTaskHistory = async (userId, taskId) => {
  // Verifica se o usuário existe
  await utils.checkUser(userId);

  // Verifica se a tarefa existe
  const task = await utils.checkTask(taskId);
  
  // Obtém a lista de tarefas do projeto
  var taskHistory = await TaskHistory.find({ taskId: taskId });

  // Formatação da saída dos campos
  return taskHistory.map(h => ({
    id: h.Id,
    changeType: h.changeType,
    fieldName: h.fieldName,
    oldValue: h.oldValue,
    newValue: h.newValue,
    comment: h.comment,
    createdAt: h.createdAt,
    userId: h.userId
  }));
};
