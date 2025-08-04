/**
 * @fileoverview Representa um Projeto, que é um contêiner para um conjunto de tarefas.
 * 
 * @module src/models/projectModel.js
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Entidade: Project
const projectSchema = new mongoose.Schema({

  // Identificador único do projeto.
  _id: {
    type: String,
    default: uuidv4
  },

  // Nome do projeto. É um campo obrigatório.
  name: {
    type: String,
    required: true,
    trim: true
  },

  // Descrição detalhada do projeto.
  description: {
    type: String,
    required: true,
    trim: true
  },

  // Propriedade de Navegação para o usuário, o qual criou o projeto
  owner: {
    type: String,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Definição de campo virtual para número de tarefas no projeto
projectSchema.virtual('taskCount', {
  ref: 'Task',               // O Model a ser usado
  localField: '_id',         // Campo em 'Project' que corresponde
  foreignField: 'projectId', // Campo em 'Task'
  count: true                // Apenas conta o total de tarefas
});

// Definição de campo virtual para as tarefas no projeto
projectSchema.virtual('tasks', {
  ref: 'Task',               // O Model a ser usado
  localField: '_id',         // Campo em 'Project' que corresponde
  foreignField: 'projectId'  // Campo em 'Task'
});

module.exports = mongoose.model('Project', projectSchema);