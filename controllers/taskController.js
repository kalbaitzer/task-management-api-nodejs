// Controller responsável por gerenciar os endpoints relacionados a Tarefas.
// src/controllers/taskController.js

const taskService = require('../services/taskService');

// Cria uma nova tarefa.
exports.createTaskForProject = async (req, res, next) => {
  try {
    // Passa os dados do corpo da requisição para o serviço: name, description
    const task = await taskService.createTaskForProject(req.headers['x-user-id'], req.params.id, req.body);
    res.status(201).json(task);
  } catch (error) {
    // Se ocorrer um erro, ele é passado para o error handler global
    next(error);
  }
};

// Lista todas as tarefas de um projeto específico.
exports.getTasksByProject = async (req, res, next) => {
  try {
    const tasks = await taskService.getTasksByProject(req.headers['x-user-id'], req.params.id);
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

// Busca uma tarefa específica pelo seu ID.
exports.getTaskById = async (req, res, next) => {
  try {
    // Obtém a tarefa pelo seu ID
    const task = await taskService.getTaksById(req.headers['x-user-id'], req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada.' });
    }
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

// Atualiza uma tarefa específica pelo seu ID.
exports.updateTask = async (req, res, next) => {
  try {
    // Passa os dados do corpo da requisição para o serviço: ID, title, description, dueDate, status
    const task = await taskService.updateTask(req.headers['x-user-id'], req.params.id, req.body);
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada.' });
    }
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

// Atualiza o status de uma tarefa.
exports.updateTaskStatus = async (req, res, next) => {
  try {
    // Passa os dados do corpo da requisição para o serviço: ID, status
    const task = await taskService.updateTaskStatus(req.headers['x-user-id'], req.params.id, req.body);
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada.' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Adiciona um comentário a uma tarefa.
exports.addComment = async (req, res, next) => {
  try {
    // Passa os dados do corpo da requisição para o serviço: ID, comentário
    const task = await taskService.addComment(req.headers['x-user-id'], req.params.id, req.body);
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada.' });
    }
    res.status(201).send();
  } catch (error) {
    next(error);
  }
};

// Remove uma tarefa específica pelo seu ID.
exports.deleteTask = async (req, res, next) => {
  try {
    // Obtém o projeto pelo seu ID
    const task = await taskService.deleteTask(req.headers['x-user-id'], req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada.' });
    }
    // 204 No Content é uma resposta padrão para delete bem-sucedido
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Busca o histórico completo de uma tarefa.
exports.getTaskHistory = async (req, res, next) => {
  try {
    const taskHistory = await taskService.getTaskHistory(req.headers['x-user-id'], req.params.id);
    res.status(200).json(taskHistory);
  } catch (error) {
    next(error);
  }
};
