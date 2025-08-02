// Definição das rotas da API de Tarefas
// src/routes/taskRoutes.js

const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Rota para criar uma novo tarefa em um projeto
// POST /api/tasks/projects/:id
router.post('/projects/:id', taskController.createTaskForProject);

// Rota para buscar todas as tarefas de um projeto
// GET /api/tasks/projects/:id
router.get('/projects/:id', taskController.getTasksByProject);

// Rota para buscar uma tarefa por ID
// GET /api/tasks/:id
router.get('/:id', taskController.getTaskById);

// Rota para atualizar uma tarefa por ID
// PUT /api/tasks/:id
router.put('/:id', taskController.updateTask);

// Rota para atualizar o status de uma tarefa por ID
// PATCH /api/tasks/:id/status
router.patch('/:id/status', taskController.updateTaskStatus);

// Rota para adicionar um comentário a uma tarefa
// POST /api/tasks/:id/comments
router.post('/:id/comments', taskController.addComment);

// Rota para buscar o histórico completo de uma tarefa
// GET /api/tasks/:id/history
router.get('/:id/history', taskController.getTaskHistory);

// Rota para remover uma tarefa por ID
// DELETE /api/tasks/:id
router.delete('/:id', taskController.deleteTask);

module.exports = router;