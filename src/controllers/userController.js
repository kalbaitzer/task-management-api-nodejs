/**
 * @fileoverview Controller responsável por gerenciar os endpoints relacionados a Usuários.
 * 
 * @module src/controllers/userController.js
 */

const userService = require('../services/userService');

/**
 * Controller para criar um novo usuário no sistema, de forma a facilitar o teste da API.
 * ROTA: POST /api/users
 *
 * @async
 * @description Esta função gerencia a requisição HTTP para a criação de um novo usuário.
 * Ela recebe os dados do novo usuário no corpo da requisição, chama o serviço que valida
 * este dados e armazena em banco de dados.
 *
 * @param {Request} req - O objeto de requisição do Express.
 * - O corpo da requisição (`req.body`) deve conter o objeto do novo usuário.
 *   Exemplo:
 *   {
 *     "name": "João da Silva",
 *     "email": "joao.silva@example.com",
 *     "role": "User" ou "Manager"
 *   }
 *
 * @param {Response} res - O objeto de resposta do Express.
 * - Em caso de sucesso: envia uma resposta com status 201 (Created) e o objeto do
 *   usuário criado em formato JSON.
 *
 * @param {NextFunction} next - A função de middleware `next` do Express.
 * - Usada para passar os erros que ocorram para o ErrorHandler global da aplicação.
 */
exports.createUser = async (req, res, next) => {
  try {
    // Passa os dados do corpo da requisição para o serviço: name, email, role
    const user = await userService.createUser(req.body);
    
    // Retorna o projeto criado na resposta (res -> Response)
    res.status(201).json(user);
  } catch (error) {
    // Se ocorrer um erro, ele é passado para o error handler global
    next(error);
  }
};

/**
 * Controller para listar todos os usuários cadastrados no sistema.
 * ROTA: GET /api/users
 *
 * @async
 * @description Esta função gerencia a requisição HTTP para buscar uma lista completa de
 * todos os usuários.
 *
 * @param {Request} req - O objeto de requisição do Express.
 * - Esta requisição não espera parâmetros de rota ou corpo (body).
 *
 * @param {Response} res - O objeto de resposta do Express.
 * - Em caso de sucesso: envia uma resposta com status 200 (OK) e um array de objetos
 *   de usuário.
 * - Cada objeto no array contém os seguintes campos:
 *   {
 *     "id": "uuid-do-usuario",
 *     "name": "Nome do Usuário",
 *     "email": "usuario@example.com",
 *     "role": "User" ou "Member",
 *     "createdAt": "2025-08-04T15:20:00.000Z"
 *     "updatedAte": "2025-08-04T15:20:00.000Z"
 *   }
 *
 * @param {NextFunction} next - A função de middleware `next` do Express.
 * - Usada para passar os erros que ocorram para o ErrorHandler global da aplicação.
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    // Obtém todos os usuários
    const users = await userService.getAllUsers();

    // Retorna a lista de projetos na resposta (res -> Response)
    res.status(200).json(users);
  } catch (error) {
    // Se ocorrer um erro, ele é passado para o error handler global
    next(error);
  }
};

/**
 * Controller para buscar um usuário específico pelo seu ID.
 * ROTA: GET /api/users/:id
 *
 * @async
 * @description Esta função gerencia a requisição HTTP para buscar os dados de um único
 * usuário. Ela utiliza o ID do usuário fornecido na URL.
 *
 * @param {Request} req - O objeto de requisição do Express.
 * - O parâmetro de rota (`req.params.id`) deve conter o ID do usuário a ser buscado.
 *
 * @param {Response} res - O objeto de resposta do Express.
 * - Em caso de sucesso (usuário encontrado): envia uma resposta com status 200 (OK) e o
 *   objeto do usuário em formato JSON.
 * - Em caso de falha (usuário não encontrado): envia uma resposta com status 404 (Not Found).
 *
 * @param {NextFunction} next - A função de middleware `next` do Express.
 * - Usada para passar os erros que ocorram para o ErrorHandler global da aplicação.
 */
exports.getUserById = async (req, res, next) => {
  try {
    // Obtém o usuário pelo seu ID
    const user = await userService.getUserById(req.params.id);
    
    // Tratamento do caso "não encontrado" no controlador.
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    
    // Retorna o usuários identificado pelo seu ID na resposta (res -> Response)
    res.status(200).json(user);
  } catch (error) {
    // Se ocorrer um erro, ele é passado para o error handler global
    next(error);
  }
};

/**
 * Controller para atualizar os dados de um usuário existente.
 * ROTA: PUT /api/users/:id
 *
 * @async
 * @description Esta função gerencia a requisição HTTP para a atualização dos dados de um
 * usuário. Ela utiliza o ID do usuário da URL e os novos dados do corpo da requisição.
 *
 * @param {Request} req - O objeto de requisição do Express.
 * - O parâmetro de rota (`req.params.id`) deve conter o ID do usuário a ser atualizado.
 * - O corpo da requisição (`req.body`) deve conter um objeto com os campos a serem 
 *   atualizados: {name, email, role }.
 *
 * @param {Response} res - O objeto de resposta do Express.
 * - Em caso de sucesso (usuário atualizado): envia uma resposta com status 200 (OK) e o objeto
 *   do usuário atualizado.
 * - Em caso de falha (usuário não encontrado): envia uma resposta com status 404 (Not Found).
 *
 * @param {NextFunction} next - A função de middleware `next` do Express.
 * - Usada para passar os erros que ocorram para o ErrorHandler global da aplicação.
 */
exports.updateUser = async (req, res, next) => {
  try {
    // Passa os dados do corpo da requisição para o serviço: ID, name, email, role
    const user = await userService.updateUser(req.params.id, req.body);

    // Tratamento do caso "não encontrado" no controlador.
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Retorna o usuário atualizado na resposta (res -> Response)
    res.status(200).json(user);
  } catch (error) {
    // Se ocorrer um erro, ele é passado para o error handler global
    next(error);
  }
};

/**
 * Controller para remover um usuário existente no sistema pelo seu ID.
 * ROTA: DELETE /api/users/:id
 *
 * @async
 * @description Esta função gerencia a requisição HTTP para a exclusão de um usuário.
 *
 * @param {Request} req - O objeto de requisição do Express.
 * - O parâmetro de rota (`req.params.id`) deve conter o ID do usuário a ser removido.
 *
 * @param {Response} res - O objeto de resposta do Express.
 * - Em caso de sucesso (usuário removido): envia uma resposta com status 204 (No Content),
 *   que não possui corpo.
 * - Em caso de falha (usuário não encontrado): envia uma resposta com status 404 (Not Found).
 *
 * @param {NextFunction} next - A função de middleware `next` do Express.
 * - Usada para passar os erros que ocorram para o ErrorHandler global da aplicação.
 */
exports.deleteUser = async (req, res, next) => {
  try {
    // Solicita a remoção do usuário pelo seu ID
    const user = await userService.deleteUser(req.params.id);

    // Tratamento do caso "não encontrado" no controlador.
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // 204 No Content é uma resposta padrão para delete bem-sucedido
    res.status(204).send();
  } catch (error) {
    // Se ocorrer um erro, ele é passado para o error handler global
    next(error);
  }
};