/**
 * Definição das rotas da API de Usuários
 * src/routes/userRoutes.js
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Rota para criar um novo usuário (Registro)
// POST /api/users
router.post('/', userController.createUser);

// Rota para buscar todos os usuários
// GET /api/users
router.get('/', userController.getAllUsers);

// Rota para buscar um usuário por ID
// GET /api/users/:id
router.get('/:id', userController.getUserById);

// Rota para atualizar um usuário por ID
// PUT /api/users/:id
router.put('/:id', userController.updateUser);

// Rota para remover um usuário por ID
// DELETE /api/users/:id
router.delete('/:id', userController.deleteUser);

module.exports = router;