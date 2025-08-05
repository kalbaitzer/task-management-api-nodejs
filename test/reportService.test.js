/**
 * @fileoverview Testes unitários para o Serviço de Relatórios.
 * 
 * @module test/reportService.test.js
 */

const User = require('../src/models/userModel'); 
const TaskHistory = require('../src/models/taskHistoryModel');

const reportService = require('../src/services/reportService'); // Supondo que o método está em reportService.js

// Mockamos as dependências externas
jest.mock('../src/models/taskHistoryModel', () => ({
  find: jest.fn(),
}));

jest.mock('../src/models/userModel', () => ({
  findById: jest.fn(),
}));

/**
 * Suite de testes para o serviço de Relatórios.
 */
describe('Report Service', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPerformanceReport', () => {
    
    // --- TESTE PARA A REGRA DE NEGÓCIO 5 ---

    // Teste: relatórico gerado com sucesso quando as tarefas existem e com  o cálculo correto de média de tarefas
    // concluídas por usuário.
    it('should return a correctly calculated report when completed tasks exist', async () => {
      // Arrange (Arranjar)
      const mockUserId = 'user-123';
      const mockUser = { id: mockUserId, role: 'Manager' };
      
      // Configura o mock do model para "encontrar" o usuário.
      User.findById.mockReturnValue(Object.assign({}, mockUser));

      const history1 = { chanegType: 'Update', filedName: 'Status', newValue: 'Concluida', userId: 'user-111' };
      const history2 = { chanegType: 'Update', filedName: 'Status', newValue: 'Concluida', userId: 'user-111' };
      const history3 = { chanegType: 'Update', filedName: 'Status', newValue: 'Concluida', userId: 'user-111' };
      const history4 = { chanegType: 'Update', filedName: 'Status', newValue: 'Concluida', userId: 'user-222' };

      const mockHistory = [];

      mockHistory.push(history1);
      mockHistory.push(history2);
      mockHistory.push(history3);
      mockHistory.push(history4);

      // Configura o mock para retornar o resultado da agregação.
      TaskHistory.find.mockResolvedValue(mockHistory);
      
      // Act (Agir)
      const report = await reportService.getPerformanceReport(mockUserId);
      
      // Assert (Afirmar)
      expect(report).not.toBeNull();
      expect(report.totalTasksCompleted).toBe(4);
      expect(report.distinctUsersWhoCompletedTasks).toBe(2);
      expect(report.averageTasksCompletedPerUser).toBe(2.0);
    });

    // Teste: relatório gerado não contém nenhuma eestatística das terefas concluídas, possui valores zerados.
    it('should return a zeroed report when no completed tasks are found', async () => {
      // Arrange
      const mockUserId = 'user-123';
      const mockUser = { id: mockUserId, role: 'Manager' };

      // Configura o mock do model para "encontrar" o usuário.
      User.findById.mockReturnValue(Object.assign({}, mockUser));

      const mockHistory = [];

      // Configura o mock para retornar o resultado da agregação.
      TaskHistory.find.mockResolvedValue(mockHistory);

      // Act
      const report = await reportService.getPerformanceReport(mockUserId);

      // Assert
      expect(report).not.toBeNull();
      expect(report.totalTasksCompleted).toBe(0);
      expect(report.distinctUsersWhoCompletedTasks).toBe(0);
      expect(report.averageTasksCompletedPerUser).toBe(0);
    });

    // Teste: a exceção é lançada quando um usuário com Role diferente de "Manager" tenta acessar o relatório.
    it('should throw Error when the requesting user is not a manager', async () => {
      // Arrange
      const mockUserId = 'user-123';
      const mockUser = { id: mockUserId, role: 'User' };

      // Configura o mock do model para "encontrar" o usuário.
      User.findById.mockReturnValue(Object.assign({}, mockUser));
      
      // Act & Assert
      await expect(reportService.getPerformanceReport(mockUserId))
        .rejects.toThrow(Error);
        
      await expect(reportService.getPerformanceReport(mockUserId))
        .rejects.toThrow('Você não tem permissão para acessar este relatório.');
    });
  });
});