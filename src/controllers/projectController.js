/**
 * @fileoverview Controller responsável por gerenciar os endpoints relacionados a Projetos.
 * 
 * @module src/controllers/projectController.js
 */

const projectService = require('../services/projectService');

/**
 * Controller para criar um novo projeto.
 * ROTA: POST /api/projects
 *
 * @async
 * @description Esta função gerencia a requisição HTTP para a criação de um novo projeto.
 * Ela extrai os dados do corpo da requisição e o ID do usuário do cabeçalho,
 * chama o serviço de criação de projeto e envia a resposta apropriada.
 *
 * @param {Request} req - O objeto de requisição do Express.
 * - O corpo da requisição (`req.body`) deve conter: { name: string, description: string }.
 * - O cabeçalho (`req.headers['x-user-id']`) deve conter o ID do usuário para verificação 
 *   de permissão, o qual também será o 'owner' do projeto.
 *
 * @param {Response} res - O objeto de resposta do Express.
 * - Em caso de sucesso, envia uma resposta com status 201 (Created) e o objeto do projeto 
 * - criado em formato JSON.
 *
 * @param {NextFunction} next - A função de middleware `next` do Express.
 * - Usada para passar os erros que ocorram para o ErrorHandler global da aplicação.
 */
exports.createProject = async (req, res, next) => {
  try {
    // Passa os dados do corpo da requisição para o serviço: name, description
    const project = await projectService.createProject(req.headers['x-user-id'], req.body);
    
    // Retorna o projeto criado na resposta (res -> Response)
    res.status(201).json(project);
  } catch (error) {
    // Se ocorrer um erro, ele é passado para o error handler global
    next(error);
  }
};

/**
 * Controller para listar os projetos de um usuário específico.
 * ROTA: GET /api/projects
 *
 * @async
 * @description Esta função gerencia a requisição HTTP para buscar uma lista de projetos.
 * Ela utiliza o ID de usuário fornecido no cabeçalho da requisição para filtrar
 * os projetos pertencentes àquele usuário e os retorna em um array.
 *
 * @param {Request} req - O objeto de requisição do Express.
 * - O cabeçalho (`req.headers['x-user-id']`) deve conter o ID do usuário para verificação 
 *   de permissão e também cujos projetos serão listados.
 *
 * @param {Response} res - O objeto de resposta do Express.
 * - Em caso de sucesso, envia uma resposta com status 200 (OK) e um array de objetos de 
 *   projeto em formato JSON.
 * - Cada objeto no array pode ter um formato de resumo, como por exemplo: { id, name, taskCount }.
 * - Se o usuário não tiver projetos, retorna um array vazio [].
 *
 * @param {NextFunction} next - A função de middleware `next` do Express.
 * - Usada para passar os erros que ocorram para o ErrorHandler global da aplicação.
 */
exports.getAllProjects = async (req, res, next) => {
  try {
    // Obtém todos os projetos do usuário
    const projects = await projectService.getAllProjects(req.headers['x-user-id'],);
    
    // Retorna a lista de projetos na resposta (res -> Response)
    res.status(200).json(projects);
  } catch (error) {
    // Se ocorrer um erro, ele é passado para o error handler global
    next(error);
  }
};

/**
 * Controller para buscar um projeto específico pelo seu ID.
 * ROTA: GET /api/projects/:id
 *
 * @async
 * @description Esta função gerencia a requisição HTTP para buscar um único projeto.
 * Ela usa o ID do projeto fornecido na URL e o ID do usuário do cabeçalho
 * para garantir que o projeto seja encontrado e pertença ao usuário correto.
 *
 * @param {Request} req - O objeto de requisição do Express.
 * - O parâmetro de rota (`req.params.id`) deve conter o ID do projeto a ser buscado.
 * - O cabeçalho (`req.headers['x-user-id']`) deve conter o ID do usuário para verificação 
 *   de permissão.
 *
 * @param {Response} res - O objeto de resposta do Express.
 * - Em caso de sucesso (projeto encontrado): envia uma resposta com status 200 (OK) e o
 *   objeto completo do projeto em formato JSON.
 * - Em caso de falha (projeto não encontrado ou não pertence ao usuário): envia uma resposta
 *   com status 404 (Not Found) e um objeto de mensagem de erro.
 *
 * @param {NextFunction} next - A função de middleware `next` do Express.
 * - Usada para passar os erros que ocorram para o ErrorHandler global da aplicação.
 */
exports.getProjectById = async (req, res, next) => {
  try {
    // Obtém o projeto pelo seu ID
    const project = await projectService.getProjectById(req.headers['x-user-id'], req.params.id);

    // Tratamento do caso "não encontrado" no controlador.
    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado.' });
    }
    
    // Retorna o projeto identificado pelo seu ID na resposta (res -> Response)
    res.status(200).json(project);
  } catch (error) {
    // Se ocorrer um erro, ele é passado para o error handler global
    next(error);
  }
};

/**
 * Controller para atualizar um projeto existente, identificado pelo seu ID.
 * ROTA: PUT /api/projects/:id
 *
 * @async
 * @description Esta função gerencia a requisição HTTP para a atualização de um projeto.
 * Ela utiliza o ID do projeto da URL, o ID do usuário do cabeçalho e os dados de
 * atualização do corpo da requisição. O serviço chamado realiza a verificação de
 * posse antes de aplicar as alterações.
 *
 * @param {Request} req - O objeto de requisição do Express.
 * - O parâmetro de rota (`req.params.id`) deve conter o ID do projeto a ser atualizado.
 * - O corpo da requisição (`req.body`) deve conter um objeto com os campos a serem atualizados.
 * Exemplo: { "name": "Novo Nome do Projeto", "description": "Nova descrição." }
 * - O cabeçalho (`req.headers['x-user-id']`) deve conter o ID do usuário para verificação 
 *   de permissão.
 *
 * @param {Response} res - O objeto de resposta do Express.
 * - Em caso de sucesso (projeto atualizado): envia uma resposta com status 200 (OK) e o objeto
 *   do projeto com os novos dados.
 * - Em caso de falha (projeto não encontrado ou não pertence ao usuário): envia uma resposta com
 *   status 404 (Not Found) com uma mensagem de erro.
 *
 * @param {NextFunction} next - A função de middleware `next` do Express.
 * - Usada para passar os erros que ocorram para o ErrorHandler global da aplicação.
 */
exports.updateProject = async (req, res, next) => {
  try {
    // Passa os dados do corpo da requisição para o serviço: ID, name, description
    const project = await projectService.updateProject(req.headers['x-user-id'], req.params.id, req.body);
    
    // Tratamento do caso "não encontrado" no controlador.
    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado.' });
    }
    
    // Retorna o projeto atualizado na resposta (res -> Response)
    res.status(200).json(project);
  } catch (error) {
    // Se ocorrer um erro, ele é passado para o error handler global
    next(error);
  }
};

/**
 * Controller para remover um projeto existente pelo seu ID.
 * ROTA: DELETE /api/projects/:id
 *
 * @async
 * @description Esta função gerencia a requisição HTTP para a exclusão de um projeto.
 * Ela utiliza o ID do projeto da URL e o ID do usuário do cabeçalho para garantir
 * que a operação seja autorizada. O serviço correspondente é chamado para executar a lógica
 * de exclusão.
 *
 * @param {Request} req - O objeto de requisição do Express.
 * - O parâmetro de rota (`req.params.id`) deve conter o ID do projeto a ser removido.
 * - O cabeçalho (`req.headers['x-user-id']`) deve conter o ID do usuário para verificação 
 *   de permissão.
 *
 * @param {Response} res - O objeto de resposta do Express.
 * - Em caso de sucesso (projeto removido): envia uma resposta com status 204 (No Content).
 *   Esta resposta, por padrão, não possui corpo (body).
 * - Em caso de falha (projeto não encontrado ou não pertence ao usuário): envia uma resposta
 *   com status 404 (Not Found) e um objeto de mensagem de erro.
 *
 * @param {NextFunction} next - A função de middleware `next` do Express.
 * - Usada para passar os erros que ocorram para o ErrorHandler global da aplicação.
 */
exports.deleteProject = async (req, res, next) => {
  try {
    // Solicita a remoção do projeto pelo seu ID
    const project = await projectService.deleteProject(req.headers['x-user-id'], req.params.id);
    
    // Tratamento do caso "não encontrado" no controlador.
    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado.' });
    }
    
    // 204 No Content é uma resposta padrão para delete bem-sucedido
    res.status(204).send();
  } catch (error) {
    // Se ocorrer um erro, ele é passado para o error handler global
    next(error);
  }
};