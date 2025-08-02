// Controller responsável por gerenciar os endpoints relacionados a Usuários.
// src/controllers/userController.js

const userService = require('../services/userService');

// Cria um novo usuário, de forma a facilitar o teste da API
exports.createUser = async (req, res, next) => {
  try {
    // Passa os dados do corpo da requisição para o serviço: name, email, role
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    // Se ocorrer um erro (ex: email duplicado), ele é passado para o error handler global
    next(error);
  }
};

// Lista todos os usuários cadastrados.
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// Busca um usuário específico pelo seu ID.
exports.getUserById = async (req, res, next) => {
  try {
    // Obtém o usuário pelo seu ID
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// Atualiza um usuário específico pelo seu ID.
exports.updateUser = async (req, res, next) => {
  try {
    // Passa os dados do corpo da requisição para o serviço: ID, name, email, role
    const user = await userService.updateUser(req.params.id, req.body);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// Remove um usuário específico pelo seu ID.
exports.deleteUser = async (req, res, next) => {
  try {
    // Obtém o usuário pelo seu ID
    const user = await userService.deleteUser(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    // 204 No Content é uma resposta padrão para delete bem-sucedido
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};