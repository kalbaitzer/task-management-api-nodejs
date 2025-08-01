// Controller responsável por gerenciar os endpoints relacionados a Projetos.
// src/controllers/projectController.js

const projectService = require('../services/projectService');

// Cria um novo projeto.
exports.createProject = async (req, res, next) => {
  try {
    // Passa os dados do corpo da requisição para o serviço: name, description
    const project = await projectService.createProject(req.headers['x-user-id'], req.body);
    res.status(201).json(project);
  } catch (error) {
    // Se ocorrer um erro, ele é passado para o error handler global
    next(error);
  }
};

// Lista todos os projetos cadastrados.
exports.getAllProjects = async (req, res, next) => {
  try {
    const projects = await projectService.getAllProjects(req.headers['x-user-id'],);
    res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
};

// Busca um projeto específico pelo seu ID.
exports.getProjectById = async (req, res, next) => {
  try {
    // Obtém o projeto pelo seu ID
    const project = await projectService.getProjectById(req.headers['x-user-id'], req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado.' });
    }
    res.status(200).json(project);
  } catch (error) {
    next(error);
  }
};

// Atualiza um projeto específico pelo seu ID.
exports.updateProject = async (req, res, next) => {
  try {
    // Passa os dados do corpo da requisição para o serviço: ID, name, description
    const project = await projectService.updateProject(req.headers['x-user-id'], req.params.id, req.body);
    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado.' });
    }
    res.status(200).json(project);
  } catch (error) {
    next(error);
  }
};

// Remove um projeto específico pelo seu ID.
exports.deleteProject = async (req, res, next) => {
  try {
    // Obtém o projeto pelo seu ID
    const project = await projectService.deleteProject(req.headers['x-user-id'], req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado.' });
    }
    // 204 No Content é uma resposta padrão para delete bem-sucedido
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};