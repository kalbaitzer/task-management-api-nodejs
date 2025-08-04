/**
 * Implementação de funções utilitárias aos Serviços.
 * src/middlewares/utils.js
 */

const User = require('../models/userModel');
const Task = require('../models/taskModel');
const Project = require('../models/projectModel');

// Verifica se o ID do usuário é válido e se está cadastrado.

/**
 * Função utilitária para verificar a existência e validade de um usuário no banco de dados.
 *
 * @async
 * @description Centraliza a lógica de verificação de um usuário. É usada para garantir que 
 * um ID foi fornecido e que ele corresponde a um usuário cadastrado antes de prosseguir com
 * uma operação principal (ex: criar um projeto para o usuário).
 *
 * @param {string} id O ID (UUID) do usuário a ser verificado.
 *
 * @returns {Promise<Object>} Uma promessa (Promise) que resolve para o documento Mongoose 
 * completo do usuário encontrado.
 *
 * @throws {Error} Lança um erro se o ID for nulo, indefinido ou inválido.
 * @throws {Error} Lança um erro se o usuário não estiver cadastrado.
 */
exports.checkUser = async (id) => {

  // Verifica se o id é nulo
  if (!id) {
    throw new Error("Usuário ausente ou inválido.")
  }

  // Obtém o usuário identificado pelo seu ID
  const user = await User.findById(id);

  // Verifica se o usuário é nulo
  if (!user) {
    throw new Error("Usuário não cadastrado.");
  }
  
  return user;
};

/**
 * Função utilitária para verificar a existência de um projeto no banco de dados.
 *
 * @async
 * @description Centraliza a lógica de verificação de um projeto. É projetada para ser
 * reutilizada por outras funções de serviço antes de realizarem operações em um 
 * projeto (ex: alterar um projeto, adicionar uma tarefa, etc.).
 *
 * @param {string} id O ID (UUID) do projeto a ser verificado.
 *
 * @returns {Promise<Object>} Uma promessa (Promise) que resolve para o documento Mongoose 
 * completo do projeto encontrado.
 *
 * @throws {Error} Lança um erro se o projeto não estiver cadastrado.
 */
exports.checkProject = async (id) => {

  // Obtém o projeto identificado pelo seu ID
  const project = await Project.findById(id);

  // Verifica se o projeto é nulo
  if (!project) {
    throw new Error("Projeto não cadastrado.");
  }
  
  return project;
};

/**
 * Função utilitária para verificar a existência de uma tarefa no banco de dados.
 *
 * @async
 * @description Centraliza a lógica de verificação de uma tarefa. É projetada para ser
 * reutilizada por outras funções de serviço antes de realizarem operações em uma 
 * tarefa (ex: remover uma tarefa, buscar o histórico de alterações da tarefa, etc.).
 *
 * @param {string} id O ID (UUID) da tarefa a ser verificada.
 *
 * @returns {Promise<Object>} Uma promessa (Promise) que resolve para o documento Mongoose 
 * completo da tarefa encontrada.
 *
 * @throws {Error} Lança um erro se a tarefa não estiver cadastrada.
 */
exports.checkTask = async (id) => {

  // Obtém a tarefa identificada pelo seu ID
  const task = await Task.findById(id);

  // Verifica se a tarefa é nula
  if (!task) {
    throw new Error("Tarefa não cadastrada.");
  }
  
  return task;
};

/**
 * Função utilitária para verificar se um usuário existe e se possui o perfil (role) 
 * de 'Manager'.
 *
 * @async
 * @description Centraliza a lógica de autorização para ações restritas a administradores.
 * Esta função deve ser chamada antes de executar qualquer operação que apenas um
 * 'Manager' pode realizar, como gerar relatórios globais.
 *
 * @param {string} id O ID (UUID) do usuário a ser verificado.
 *
 * @returns {Promise<Object>} Uma promessa (Promise) que resolve para o documento Mongoose 
 * completo do usuário, se e somente se ele existir e for um 'Manager'.
 *
 * @throws {Error} Lança um erro se o usuário não estiver cadastrado.
 * @throws {Error} Lança um erro se o usuário encontrado não tiver o perfil 'Manager'.
 */
exports.checkManager = async (id) => {

  // Obtém o usuário identificado pelo seu ID
  const user = await User.findById(id);

  // Verifica se o usuário é nulo
  if (!user) {
    throw new Error("Usuário não cadastrado.");
  }

  // Verifica se o role é igual "Manager"
  if (user.Role != "Manager") {
    throw new Error("Você não tem permissão para acessar este relatório.");
  }
  
  return task;
};

/**
 * Função de regra de negócio para validar uma transição de status de uma tarefa.
 *
 * @description Esta função síncrona centraliza a lógica de validação para qualquer
 * alteração no campo 'status' de uma tarefa. Ela verifica duas regras principais:
 * 1. O novo status deve ser um dos valores permitidos.
 * 2. Uma tarefa já concluída não pode ter seu status alterado para outro valor.
 *
 * @param {string} newValue - O novo valor de status desejado.
 * @param {string} oldValue - O valor de status atual da tarefa.
 *
 * @returns {boolean} Retorna `true` se a transição de status for válida.
 * A função não retorna um valor em caso de falha; em vez disso, ela lança um erro.
 *
 * @throws {Error} Lança um erro se `newValue` for nulo, indefinido ou não for um dos
 * status válidos ('Pendente', 'EmAndamento', 'Concluida').
 * @throws {Error} Lança um erro se houver uma tentativa de alterar o status de uma
 * tarefa que já está 'Concluida'.
 */
exports.checkTaskStatus = (newValue, oldValue) => {

  if (!newValue || (newValue != "Pendente" && newValue != "EmAndamento" && newValue != "Concluida")) {
    // Valor do status é inválido
    throw new Error("Status inválido.");
  }

  if (oldValue == "Concluida" && newValue != "Concluida") {
    // Tentativa de reabir uma tarefa concluida
    throw new Error("Não é possível reabrir uma tarefa concluída.");
  }

  return true;
};

