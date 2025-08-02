// Definição das rotas da API de Projetos
// src/routes/protectRoutes.js

const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

// Rota para criar um novo projeto (Registro)
// POST /api/projects
router.post('/', projectController.createProject);

// Rota para buscar todos os projetos
// GET /api/projects
router.get('/', projectController.getAllProjects);

// Rota para buscar um projeto por ID
// GET /api/projects/:id
router.get('/:id', projectController.getProjectById);

// Rota para atualizar um projeto por ID
// PUT /api/projects/:id
router.put('/:id', projectController.updateProject);

// Rota para remover um projeto por ID
// DELETE /api/projects/:id
router.delete('/:id', projectController.deleteProject);

module.exports = router;