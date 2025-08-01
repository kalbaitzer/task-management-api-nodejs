// Implementação de funções utilitárias aos Serviços.
// src/middlewares/utils.js

const User = require('../models/userModel');
const Task = require('../models/taskModel');
const Project = require('../models/projectModel');

// Verifica se o ID do usuário é válido e se está cadastrado.
exports.checkUser = async (id) => {

  if (!id) {
    throw new Error("Usuário ausente ou inválido.")
  }

  const user = await User.findById(id);

  if (!user){
    throw new Error("Usuário não cadastrado.");
  }
  
  return user;
};

// Verifica se o projeto está cadastrado.
exports.checkProject = async (id) => {

  const project = await Project.findById(id);

  if (!project){
    throw new Error("Projeto não cadastrado.");
  }
  
  return project;
};

// Verifica se a tarefa está cadastrada.
exports.checkTask = async (id) => {

  const task = await Task.findById(id);

  if (!task){
    throw new Error("Tarefa não cadastrada.");
  }
  
  return task;
};

// Verifica se o usuário está cadastrado e se é um gerente (Manager).
exports.checkManager = async (id) => {

  const user = await User.findById(id);

  if (!user){
    if (user.Role != "Manager") {
      throw new Error("Você não tem permissão para acessar este relatório.");
    }
  }
  
  return task;
};
