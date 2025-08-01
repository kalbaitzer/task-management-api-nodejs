// Implementação do Serviço de Tarefas.
// src/services/taskService.js

const utils = require('../middlewares/utils');
const Task = require('../models/taskModel');
const TaskHistory = require('../models/taskHistoryModel');

// Cria uma nova tarefa.
exports.createTaskForProject = async (userId, projectId, taskData) => {
  // Verifica se o usuário existe
  await utils.checkUser(userId);

  // Verfica se o projeto existe
  const project = await utils.checkProject(projectId);

  // Regra de Negócio 4: Limite de tarefas por projeto
  if (project != null) {
    
    await project.populate('taskCount'); // "Popula" o campo virtual com a contagem
    
    if (project.taskCount >= 20) {
      // Lança uma exceção de regra de negócio
      throw new Error("Limite de 20 tarefas por projeto foi atingido.");
    }
  }

  const task = new Task({
    ...taskData,
  });

  task.projectId = projectId;

  await task.save();

  // Criação do histórico da tarefa
  const history = new TaskHistory({
    taskId: task.id,
    userId: userId,
    changeType: "Create",
    newValue: "Tarefa '" + task.title + "' foi criada."
  });

  await history.save();

  return task;
};

// Lista todas as tarefas de um projeto específico.
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

// Busca uma tarefa específica pelo seu ID.
exports.getTaksById = async (userId, taskId) => {
  // Verifica se o usuário existe
  await utils.checkUser(userId);

  return await Task.findById(taskId);
};

// Atualiza uma tarefa específica pelo seu ID.
exports.updateTask = async (userId, taskId, taskData) => {
  // Verifica se o usuário existe
  await utils.checkUser(userId);

  // Verifica se a tarefa existe
  const task = await utils.checkTask(taskId);

  if (!task) return;

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

  return await Task.findByIdAndUpdate(taskId, taskData, { new: true });
  // { new: true } garante que o documento retornado seja a versão atualizada
};

// Atualiza o status de uma tarefa.
exports.updateTaskStatus = async (userId, taskId, taskData) => {
  // Verifica se o usuário existe
  await utils.checkUser(userId);

  // Verifica se a tarefa existe
  const task = await utils.checkTask(taskId);

  if (!task) return;

  if (!taskData.status || (taskData.status != "Pendente" && taskData.status != "EmAndamento" && taskData.status != "Concluida")) {
    // Valor do status é inválido
    throw new Error("Status inválido.");
  }

  if (task.status == "Concluida" && taskData.status != "Concluida") {
    // Tentativa de reabir uma tarefa concluida
    throw new Error("Não é possível reabrir uma tarefa concluída.");
  }

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

  return await Task.findByIdAndUpdate(taskId, { status: taskData.status }, { new: true });
  // { new: true } garante que o documento retornado seja a versão atualizada
};

// Atualiza o status de uma tarefa.
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

  return await Task.findByIdAndUpdate(taskId, { }, { new: true });
  // { new: true } garante que o documento retornado seja a versão atualizada
};

// Remove uma tarefa específica pelo seu ID.
exports.deleteTask = async (userId, taskId) => {
  // Verifica se o usuário existe
  await utils.checkUser(userId);
  
  // Remover todos os registros de histórico associados à tarefa.
  await TaskHistory.deleteMany({ taskId: taskId });

  // Remover a tarefa principal.
  return await Task.findByIdAndDelete(taskId);
};

// Busca o histórico completo de uma tarefa.
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
