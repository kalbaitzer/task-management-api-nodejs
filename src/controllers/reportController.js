/**
 * Controller responsável por gerenciar os endpoints relacionados a Relatórios.
 * src/controllers/reportController.js
 */

const reportService = require('../services/reportService');

// Relatório de desempenho para as tarefas concluídas nos últimos 30 dias.
/**
 * Controller para gerar e retornar um relatório de desempenho para as tarefas concluídas 
 * nos últimos 30 dias.
 * ROTA: GET /api/reports/performance
 *
 * @async
 * @description Esta função gerencia a requisição HTTP para a geração de um relatório de
 * desempenho para as tarefas concluídas nos últimos 30 dias.. A autorização é verificada
 * usando o ID do usuário no cabeçalho.
 *
 * @param {Request} req - O objeto de requisição do Express.
 * - O parâmetro de rota (`req.params.id`) deve conter o ID do projeto para o qual o relatório
 *   será gerado.
 * - O cabeçalho (`req.headers['x-user-id']`) deve conter o ID do usuário para verificação de
 *   permissão. Somente usuários com role igual 'Manager' podem acessar este relatório.
 *
 * @param {Response} res - O objeto de resposta do Express.
 * - Em caso de sucesso: envia uma resposta com status 200 (OK) e o objeto do relatório em formato JSON.
 *   O objeto do relatório tem a seguinte estrutura:
 *   {
 *     "generatedAt": Date,
 *     "totalTasksCompleted": number,
 *     "distinctUsersWhoCompletedTasks": number,
 *     "averageTasksCompletedPerUser": number
 *   }
 * - Em caso de falha (relatório não encontrado): envia uma resposta com status 404 (Not Found).
 *
 * @param {NextFunction} next - A função de middleware `next` do Express.
 * - Usada para passar os erros que ocorram para o ErrorHandler global da aplicação.
 */
exports.getPerformanceReport = async (req, res, next) => {
  try {
    // Obtém o relatório de performance
    const report = await reportService.getPerformanceReport(req.headers['x-user-id'], req.params.id);
    
    // Tratamento do caso "não encontrado" no controlador.
    if (!report) {
      return res.status(404).json({ message: 'Relatório não encontrado.' });
    }

    // Retorna o relatório de performance (res -> Response)
    res.status(200).json(report);
  } catch (error) {
    // Se ocorrer um erro, ele é passado para o error handler global
    next(error);
  }
};
