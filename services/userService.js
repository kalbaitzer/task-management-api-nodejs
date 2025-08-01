// Implementação do Serviço de Usuários.
// src/services/userService.js

const User = require('../models/userModel');

// Cria um novo usuário, de forma a facilitar o teste da aplicação.
exports.createUser = async (userData) => {

  const user = new User({
    ...userData
  });

  await user.save();
  return user;
};

// Lista todos os usuários cadastrados.
exports.getAllUsers = async () => {
  // Retorna todos os usuários
  return await User.find();
};

// Busca um usuário específico pelo seu ID.
exports.getUserById = async (id) => {
  return await User.findById(id);
};

// Atualiza um usuário específico pelo seu ID.
exports.updateUser = async (id, userData) => {

  return await User.findByIdAndUpdate(id, userData, { new: true });
  // { new: true } garante que o documento retornado seja a versão atualizada
};

// Remove um usuário específico pelo seu ID.
exports.deleteUser = async (id) => {
  return await User.findByIdAndDelete(id);
};