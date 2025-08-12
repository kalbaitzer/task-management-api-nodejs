/**
 * @fileoverview Implementação do Serviço de Usuários.
 *
 * @module src/services/userService.js
 */

const User = require('../models/userModel');
const utils = require('../middlewares/utils');

/**
 * Cria um novo usuário no banco de dados, de forma a facilitar o teste da aplicação.
 *
 * @async
 * @description Esta função recebe os dados de um novo usuário e salva o novo usuário no
 * banco de dados.
 * 
 * @param {object} userData - O objeto contendo os dados do novo usuário.
 * @param {string} userData.name - O nome do usuário.
 * @param {string} userData.email - O e-mail do usuário (deve ser único).
 * @param {string} [userData.role='User'] - O perfil do usuário (opcional, padrão 'User').
 *
 * @returns {Promise<Object>} Uma promessa que resolve para o objeto do usuário recém-criado, 
 * sem o campo da senha.
 * 
 * @throws {Error} Lança um erro se o e-mail já estiver em uso ou se houver erro de validação do
 * Mongoose.
 */
exports.createUser = async (userData) => {

  // Cria um objeto User a partir dos dados contidos em userData
  const user = new User({
    ...userData
  });

  // Salva o objeto no banco de dados
  await user.save();

  // Invalida o cache no Redis
  utils.invalidateCache('user', 'all');

  // Retorna o usuário cadastrado
  return user;
};

/**
 * Lista todos os usuários cadastrados no sistema.
 *
 * @async
 * @returns {Promise<Array<Object>>} Uma promessa que resolve para um array de objetos de
 * usuário. Cada objeto de usuário contém os seguinte campos: 
 * { id, name, email, role, createdAt, updatedAt }
 */
exports.getAllUsers = async () => {
  // Define uma chave única para este recurso no cache
  const cacheKey = `user:all`;

  // Tenta buscar do cache primeiro
  const cachedUsers = await utils.getCache(cacheKey);
  
  if (cachedUsers) return cachedUsers;

  // Retorna todos os usuários
  const users = await User.find();

  // Salva o resultado no cache
  await utils.setCache(cacheKey, users);

  return users;
};

/**
 * Busca um usuário específico pelo seu ID.
 *
 * @async
 * @param {string} id - O ID (UUID) do usuário a ser buscado.
 * 
 * @returns {Promise<Object|null>} Uma promessa que resolve para o objeto do usuário 
 * encontrado ou `null` se nenhum usuário for encontrado com o ID fornecido.
 */
exports.getUserById = async (id) => {
  // Define uma chave única para este recurso no cache
  const cacheKey = `user:${id}`;

  // Tenta buscar do cache primeiro
  const cachedUser = await utils.getCache(cacheKey);
  
  if (cachedUser) return cachedUser

  // Retorna o usuário específico pelo seu ID
  const user = await User.findById(id);

  // Salva o resultado no cache
  await utils.setCache(cacheKey, user);

  return user;
};

// Atualiza um usuário específico pelo seu ID.
/**
 * Atualiza os dados de um usuário específico pelo seu ID.
 *
 * @async
 * @param {string} id - O ID (UUID) do usuário a ser atualizado.
 * @param {object} userData - Um objeto contendo os campos do usuário a serem atualizados:
 * {name, email, role }.
 *
 * @returns {Promise<Object|null>} Uma promessa que resolve para o objeto do usuário 
 * atualizado ou `null` se nenhum usuário for encontrado.
 */
exports.updateUser = async (id, userData) => {
  // Retorna o usuário atualidado. A opção { new: true } garante que o documento retornado 
  // seja a versão atualizada
  const result = await User.findByIdAndUpdate(id, userData, { new: true });

  // Invalida o cache no Redis
  if (result) {
    utils.invalidateCache('user', 'all');
    utils.invalidateCache('user', id);
  }

  return result;
};

/**
 * Remove um usuário específico pelo seu ID.
 *
 * @async
 * @param {string} id - O ID (UUID) do usuário a ser removido.
 * 
 * @returns {Promise<Object|null>} Uma promessa que resolve para o objeto do usuário que foi
 * removido, ou `null` se nenhum usuário foi encontrado com o ID fornecido.
 */
exports.deleteUser = async (id) => {
  // Remover o usuário.
  const result = await User.findByIdAndDelete(id);

  // Invalida o cache no Redis
  if (result) {
    utils.invalidateCache('user', 'all');
    utils.invalidateCache('user', id);
  }

  return result;
};