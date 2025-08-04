/**
 * @fileoverview Registra uma alteração ou um comentário em uma tarefa, servindo como log de auditoria.
 * 
 * @module src/models/taskHistoryModel.js
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Entidade: TaskHistory
const taskHistorySchema = new mongoose.Schema({

  // Identificador único do registro de histórico.
  _id: {
    type: String,
    default: uuidv4
  },

  // Identificador da tarefa.
  taskId: {
    type: String, // Referência à Task por seu UUID
    ref: 'Task',
    required: true,
    index: true // Essencial para performance ao buscar o histórico de uma tarefa
  },

  // Identificador do usuário.
  userId: {
    type: String, // Referência ao User por seu UUID
    ref: 'User',
    required: true
  },

  // O tipo de alteração. Ex: "Create", "Update", "Comment".
  // Facilita a filtragem do histórico.
  changeType: {
    type: String,
    required: true
  },

  // O nome do campo que foi alterado (ex: "Status", "Title").
  // Será nulo para eventos como "Create" ou "Comment".
  fieldName: {
    type: String
  },

  // O valor antigo do campo. Nulo se não aplicável (ex: criação, comentário).
  oldValue: {
    type: String
  },

  // O novo valor do campo ou uma descrição da criação.
  newValue: {
    type: String
  },

  // O conteúdo de um comentário. Será preenchido apenas se ChangeType for "Comment".
  comment: {
    type: String,
    trim: true
  }
}, {
  // Usamos a opção 'timestamps' do Mongoose para criar automaticamente
  // um campo para a data, que chamaremos de 'changeDate' para manter a consistência.
  timestamps: { createdAt: 'changeDate', updatedAt: false }
});

module.exports = mongoose.model('TaskHistory', taskHistorySchema);