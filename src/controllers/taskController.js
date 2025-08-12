/**
 * @fileoverview Controller responsável por gerenciar os endpoints relacionados a Tarefas.
 * 
 * @module src/controllers/taskController.js
 */

const taskService = require('../services/taskService');

/**
 * Controller para criar uma nova tarefa e associá-la a um projeto existente.
 * ROTA: POST /api/tasks/projects/:id
 *
 * @async
 * @description Esta função gerencia a requisição HTTP para a criação de uma nova tarefa
 * dentro de um projeto específico. Ela extrai o ID do projeto da URL, os dados da nova
 * tarefa do corpo da requisição, e o ID do usuário do cabeçalho para autorização.
 *
 * @param {Request} req - O objeto de requisição do Express.
 * - O parâmetro de rota (`req.params.id`) deve conter o ID do projeto ao qual a tarefa 
 *   será adicionada.
 * - O corpo da requisição (`req.body`) deve conter o objeto da nova tarefa. Exemplo:
 *   {
 *     "title": "Nova Tarefa de Teste",
 *     "description": "Descrição detalhada da tarefa.",
 *     "dueDate": "2025-12-31T23:59:59.000Z",
 *     "priority": "Media"
 *   }
 * - O cabeçalho (`req.headers['x-user-id']`) deve conter o ID do usuário para verificação 
 *   de permissão.
 *
 * @param {Response} res - O objeto de resposta do Express.
 * - Em caso de sucesso, envia uma resposta com status 201 (Created) e o objeto completo 
 *   da tarefa recém-criada.
 *
 * @param {NextFunction} next - A função de middleware `next` do Express.
 * - Usada para passar os erros que ocorram para o ErrorHandler global da aplicação.
 */
exports.createTaskForProject = async (req, res, next) => {
  try {
    // Passa os dados do corpo da requisição para o serviço: name, description
    const task = await taskService.createTaskForProject(req.headers['x-user-id'], req.params.id, req.body);
    
    // Retorna a tarefa criada na resposta (res -> Response)
    res.status(201).json(task);
  } catch (error) {
    // Se ocorrer um erro, ele é passado para o error handler global
    next(error);
  }
};

/**
 * Controller para listar todas as tarefas de um projeto específico.
 * ROTA: GET /api/tasks/projects/:id
 *
 * @async
 * @description Esta função gerencia a requisição HTTP para buscar todas as tarefas associadas
 * a um projeto, identificado pelo seu ID na URL. A autorização é verificada usando
 * o ID de usuário do cabeçalho para garantir que o solicitante tenha acesso ao projeto.
 *
 * @param {Request} req - O objeto de requisição do Express.
 * - O parâmetro de rota (`req.params.id`) deve conter o ID do projeto cujas tarefas serão
 *   listadas.
 * - O cabeçalho (`req.headers['x-user-id']`) deve conter o ID do usuário para verificação 
 *   de permissão.
 *
 * @param {Response} res - O objeto de resposta do Express.
 * - Em caso de sucesso, envia uma resposta com status 200 (OK) e um array de objetos de tarefa.
 * - Se o projeto não tiver tarefas, retorna um array vazio [].
 * - Cada objeto no array representa uma tarefa e contém campos como: { id, title, description, 
 *   status, priority, dueDate, etc. }.
 *
 * @param {NextFunction} next - A função de middleware `next` do Express.
 * - Usada para passar os erros que ocorram para o ErrorHandler global da aplicação.
 */
exports.getTasksByProject = async (req, res, next) => {
  try {
    // Obtém todas as tarefas do projeto
    const tasks = await taskService.getTasksByProject(req.headers['x-user-id'], req.params.id);
    
    // Retorna a lista de tarefas na resposta (res -> Response)
    res.status(200).json(tasks);
  } catch (error) {
    // Se ocorrer um erro, ele é passado para o error handler global
    next(error);
  }
};

/**
 * Controller para buscar uma tarefa específica pelo seu ID.
 * ROTA: GET /api/tasks/:id
 *
 * @async
 * @description Esta função gerencia a requisição HTTP para buscar uma única tarefa.
 * Ela utiliza o ID da tarefa fornecido na URL e o ID do usuário do cabeçalho
 * para que o serviço possa realizar a busca e a verificação de permissão (garantindo
 * que o usuário tenha acesso à tarefa solicitada).
 *
 * @param {Request} req - O objeto de requisição do Express.
 * - O parâmetro de rota (`req.params.id`) deve conter o ID da tarefa a ser buscada.
 * - O cabeçalho (`req.headers['x-user-id']`) deve conter o ID do usuário para verificação
 *   de permissão.
 *
 * @param {Response} res - O objeto de resposta do Express.
 * - Em caso de sucesso (tarefa encontrada): envia uma resposta com status 200 (OK) e o 
 *   objeto completo da tarefa, com os campos: { id, title, description, dueDate, status, 
 *   priority, projectId, createdAt, updatedAt }.
 * - Em caso de falha (tarefa não encontrada ou usuário sem permissão): envia uma resposta
 *   com status 404 (Not Found) e um objeto de mensagem de erro.
 *
 * @param {NextFunction} next - A função de middleware `next` do Express.
 * - Usada para passar os erros que ocorram para o ErrorHandler global da aplicação.
 */
exports.getTaskById = async (req, res, next) => {
  try {
    // Obtém a tarefa pelo seu ID
    const task = await taskService.getTaskById(req.headers['x-user-id'], req.params.id);
    
    // Tratamento do caso "não encontrado" no controlador.
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada.' });
    }
    
    // Retorna a tarefa identificada pelo seu ID na resposta (res -> Response)
    res.status(200).json(task);
  } catch (error) {
    // Se ocorrer um erro, ele é passado para o error handler global
    next(error);
  }
};

/**
 * Controller para atualizar uma tarefa existente, identificada pelo seu ID.
 * ROTA: PUT /api/tasks/:id
 *
 * @async
 * @description Esta função gerencia a requisição HTTP para a atualização de uma tarefa.
 * Ela utiliza o ID da tarefa da URL, o ID do usuário do cabeçalho para autorização,
 * e os dados de atualização do corpo da requisição para chamar o serviço que aplica 
 * as alterações.
 *
 * @param {Request} req - O objeto de requisição do Express.
 * - O parâmetro de rota (`req.params.id`) deve conter o ID da tarefa a ser atualizada.
 * - O corpo da requisição (`req.body`) deve conter um objeto com os campos a serem 
 *   atualizados:  { title, description, dueDate, status, updatedAt }
 * - O cabeçalho (`req.headers['x-user-id']`) deve conter o ID do usuário para verificação 
 *   de permissão.
 *
 * @param {Response} res - O objeto de resposta do Express.
 * - Em caso de sucesso (tarefa atualizada): envia uma resposta com status 200 (OK) e o
 *   objeto da tarefa com os novos dados.
 * - Em caso de falha (tarefa não encontrada ou usuário sem permissão): envia uma resposta 
 *   com status 404 (Not Found).
 *
 * @param {NextFunction} next - A função de middleware `next` do Express.
 * - Usada para passar os erros que ocorram para o ErrorHandler global da aplicação.
 */
exports.updateTask = async (req, res, next) => {
  try {
    // Passa os dados do corpo da requisição para o serviço: ID, title, description, dueDate, status
    const task = await taskService.updateTask(req.headers['x-user-id'], req.params.id, req.body);
    
    // Tratamento do caso "não encontrado" no controlador.
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada.' });
    }

    // Retorna a tarefa atualizada na resposta (res -> Response)
    res.status(200).json(task);
  } catch (error) {
    // Se ocorrer um erro, ele é passado para o error handler global
    next(error);
  }
};

/**
 * Controller para atualizar especificamente o status de uma tarefa.
 * ROTA: PATCH /api/tasks/:id/status
 *
 * @async
 * @description Esta função gerencia uma requisição HTTP para uma mudança de estado específica:
 * a atualização do status de uma tarefa. Ela chama um serviço dedicado para aplicar a
 * alteração, o que também aciona a criação de um registro de histórico.
 *
 * @param {Request} req - O objeto de requisição do Express.
 * - O parâmetro de rota (`req.params.id`) deve conter o ID da tarefa a ser atualizada.
 * - O corpo da requisição (`req.body`) deve conter um objeto apenas com o novo status.
 *   Exemplo: { "status": "Concluida" }
 *   Valores válidos para status: 'Pendente', 'EmAndamento', 'Concluida'.
 * - O cabeçalho (`req.headers['x-user-id']`) deve conter o ID do usuário para verificação 
 *   de permissão.
 *
 * @param {Response} res - O objeto de resposta do Express.
 * - Em caso de sucesso (status da tarefa atualizado): envia uma resposta com status 204 
 *   (No Content). Esta resposta não possui corpo (body), indicando que a ação foi bem-sucedida.
 * - Em caso de falha (tarefa não encontrada ou usuário sem permissão): envia uma resposta com 
 *   status 404 (Not Found).
 *
 * @param {NextFunction} next - A função de middleware `next` do Express.
 * - Usada para passar os erros que ocorram para o ErrorHandler global da aplicação.
 */
exports.updateTaskStatus = async (req, res, next) => {
  try {
    // Passa os dados do corpo da requisição para o serviço: ID, status
    const task = await taskService.updateTaskStatus(req.headers['x-user-id'], req.params.id, req.body);

    // Tratamento do caso "não encontrado" no controlador.
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada.' });
    }

    // Status code 204 (No Content) na resposta (res -> Response)
    res.status(204).send();
  } catch (error) {
    // Se ocorrer um erro, ele é passado para o error handler global
    next(error);
  }
};

/**
 * Controller para adicionar um novo comentário a uma tarefa existente.
 * ROTA: POST /api/tasks/:id/comments
 *
 * @async
 * @description Esta função gerencia a requisição HTTP para adicionar um comentário a uma
 * tarefa. A ação de adicionar um comentário também cria um registro correspondente no histórico
 * da tarefa.
 *
 * @param {Request} req - O objeto de requisição do Express.
 * - O parâmetro de rota (`req.params.id`) deve conter o ID da tarefa que está sendo comentada.
 * - O corpo da requisição (`req.body`) deve conter um objeto com o texto do comentário.
 *   Exemplo: { "comment": "Por favor, verificar a documentação antes de iniciar." }
 * - O cabeçalho (`req.headers['x-user-id']`) deve conter o ID do usuário para verificação 
 *   de permissão.
 *
 * @param {Response} res - O objeto de resposta do Express.
 * - Em caso de sucesso (comentário adicionado): envia uma resposta com status 201 (Created).
 *   Esta resposta não possui corpo (body), apenas confirma a criação do recurso.
 * - Em caso de falha (tarefa não encontrada ou usuário sem permissão): envia uma resposta com
 *   status 404 (Not Found).
 *
 * @param {NextFunction} next - A função de middleware `next` do Express.
 * - Usada para passar os erros que ocorram para o ErrorHandler global da aplicação.
 */
exports.addComment = async (req, res, next) => {
  try {
    // Passa os dados do corpo da requisição para o serviço: ID, comentário
    const task = await taskService.addComment(req.headers['x-user-id'], req.params.id, req.body);

    // Tratamento do caso "não encontrado" no controlador.
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada.' });
    }

    // Status code 201 (Created) na resposta (res -> Response)
    res.status(201).send();
  } catch (error) {
    // Se ocorrer um erro, ele é passado para o error handler global
    next(error);
  }
};

/**
 * Controller para remover uma tarefa identificada pelo seu ID.
 * ROTA: DELETE /api/tasks/:id
 *
 * @async
 * @description Esta função gerencia a requisição HTTP para a exclusão de uma tarefa.
 * Ela invoca o serviço que é responsável por remover a tarefa e todos os seus
 * dados associados, como o histórico de alterações.
 *
 * @param {Request} req - O objeto de requisição do Express.
 * - O parâmetro de rota (`req.params.id`) deve conter o ID da tarefa a ser removida.
 * - O cabeçalho (`req.headers['x-user-id']`) deve conter o ID do usuário para verificação 
 *   de permissão.
 *
 * @param {Response} res - O objeto de resposta do Express.
 * - Em caso de sucesso (tarefa removida): envia uma resposta com status 204 (No Content), que
 *   não possui corpo.
 * - Em caso de falha (tarefa não encontrada ou usuário sem permissão): envia uma resposta com 
 *   status 404 (Not Found).
 *
 * @param {NextFunction} next - A função de middleware `next` do Express.
 * - Usada para passar os erros que ocorram para o ErrorHandler global da aplicação.
 */
exports.deleteTask = async (req, res, next) => {
  try {
    // Solicita a remoção da tarefa pelo seu ID
    const task = await taskService.deleteTask(req.headers['x-user-id'], req.params.id);

    // Tratamento do caso "não encontrado" no controlador.
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada.' });
    }

    // 204 No Content é uma resposta padrão para delete bem-sucedido
    res.status(204).send();
  } catch (error) {
    // Se ocorrer um erro, ele é passado para o error handler global
    next(error);
  }
};

/**
 * Controller para listar o histórico completo de alterações de uma tarefa específica.
 * ROTA: GET /api/tasks/:id/history
 *
 * @async
 * @description Esta função gerencia a requisição HTTP para buscar o histórico de alterações
 * uma tarefa, identificada pelo seu ID na URL.
 *
 * @param {Request} req - O objeto de requisição do Express.
 * - O parâmetro de rota (`req.params.id`) deve conter o ID da tarefa cujo histórico será listado.
 * - O cabeçalho (`req.headers['x-user-id']`) deve conter o ID do usuário para verificação 
 *   de permissão.
 *
 * @param {Response} res - O objeto de resposta do Express.
 * - Em caso de sucesso, envia uma resposta com status 200 (OK) e um array de objetos de histórico.
 * - Se a tarefa não tiver histórico, retorna um array vazio [].
 * - Cada objeto no array tem a seguinte estrutura:
 *   {
 *     id: string,
 *     userId: string,
 *     taskId: string,
 *     changeDate: Date,
 *     changeType: string, // "Create", "Update", "Comment"
 *     fieldName?: string,  // ex: "Status"
 *     oldValue?: string,   // ex: "Pendente"
 *     newValue?: string,   // ex: "EnAndmento"
 *     comment?: string
 *   }
 *
 * @param {NextFunction} next - A função de middleware `next` do Express.
 * - Usada para passar os erros que ocorram para o ErrorHandler global da aplicação.
 */
exports.getTaskHistory = async (req, res, next) => {
  try {
    // Obtém o histórico da terafe
    const taskHistory = await taskService.getTaskHistory(req.headers['x-user-id'], req.params.id);
    
    // Retorna o histórico, um array, na resposta (res -> Response)
    res.status(200).json(taskHistory);
  } catch (error) {
    // Se ocorrer um erro, ele é passado para o error handler global
    next(error);
  }
};
