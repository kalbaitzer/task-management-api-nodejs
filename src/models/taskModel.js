/**
 * @fileoverview Representa uma unidade de trabalho dentro de um projeto.
 * 
 * @module src/models/taskModel.js
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Entidade: Task
const taskSchema = new mongoose.Schema({

  // Identificador único da tarefa.
  _id: {
    type: String,
    default: uuidv4
  },

  // Título da tarefa. Campo obrigatório.
  title: {
    type: String,
    required: true,
    trim: true
  },

  // Descrição detalhada da tarefa. Campo opcional.
  description: {
    type: String,
    required: false,
    trim: true
  },

  // Status atual da tarefa (Pendente, Em Andamento, Concluída).
  status: {
    type: String,
    enum: ['Pendente', 'EmAndamento', 'Concluida'],
    default: 'Pendente'
  },

  // Prioridade da tarefa (Baixa, Média, Alta).
  // O 'private set' implementa a Regra de Negócio 1: a prioridade não pode ser
  // alterada após a criação, exceto por métodos dentro desta classe.
  priority: {
    type: String,
    enum: ['Baixa', 'Media', 'Alta'],
    required: true,
    immutable: true
  },

  // Data de vencimento da tarefa.
  dueDate: {
    type: Date,
    required: true
  },

  // Id do Projeto.
  projectId: {
    type: String,
    ref: 'Project',
    required: true
  },
}, {
    timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);