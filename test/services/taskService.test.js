/**
 * @fileoverview Testes unitários para o Serviço de Tarefas.
 * 
 * @module test/services/taskService.test.js
 */

// Importações dos Mocks e do Serviço
const User = require('../../src/models/userModel'); 
const Task = require('../../src/models/taskModel');
const Project = require('../../src/models/projectModel');
const TaskHistory = require('../../src/models/taskHistoryModel');

// Importa o serviço que queremos testar
const taskService = require('../../src/services/taskService');

// Mocka (simula) os models para isolar o serviço do banco de dados
jest.mock('../../src/models/projectModel', () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

jest.mock('../../src/models/taskModel', () => ({
  find: jest.fn(),
  save: jest.fn(),
  exists: jest.fn(),
  findById: jest.fn(),
  deleteMany: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

jest.mock('../../src/models/taskHistoryModel', () => {
  // Criamos uma função de mock para o método .save() da instância
  const mockSave = jest.fn().mockResolvedValue(true);

  // A simulação do módulo agora é uma FUNÇÃO CONSTRUTORA simulada
  const mockConstructor = jest.fn().mockImplementation(() => {
    // Quando 'new TaskHistory()' for chamado, ele retorna este objeto...
    return {
      // ... que é a "instância" com o método .save() mockado.
      save: mockSave,
    };
  });

  // Anexamos os MÉTODOS ESTÁTICOS ao nosso construtor mockado
  mockConstructor.deleteMany = jest.fn().mockResolvedValue({ deletedCount: 1 });

  // Retornamos o construtor mockado completo
  return mockConstructor;
});

jest.mock('../../src/models/userModel', () => ({
  findById: jest.fn(),
}));

/**
 * Suite de testes para o serviço de Tarefas.
 */
describe('Task Service', () => {

  // Bloco que executa antes de cada teste
  beforeEach(() => {
    // Limpa todos os mocks para garantir que um teste не interfira no outro
    jest.clearAllMocks();
  });

  // --- TESTES PARA O MÉTODO getTaskById ---

  describe('getTaskById', () => {

    // Teste: obtém dos detalhes da tarefa quando ela existe, ou seja, está cadastrada.
    it('should return task details when the task exists and the user has permission', async () => {
      // Arrange
      const mockUserId = 'user-123';
      const mockTaskId = 'task-xyz';
      const mockProjectId = 'project-abc';
      const mockUser = { id: mockUserId };
      const mockTask = { id: mockTaskId, title: 'Tarefa de Teste', projectId: mockProjectId, priority: "Baixa" };

      // Configura o mock do model para "encontrar" o usuário.
      User.findById.mockReturnValue(Object.assign({}, mockUser));

      // Configura o mock do model para "encontrar" a tarefa.
      Task.findById.mockReturnValue(Object.assign({}, mockTask));

      // Act
      const result = await taskService.getTaskById(mockUserId, mockTaskId);

      // Assert
      expect(result).not.toBeNull();
      expect(result.id).toEqual(mockTask.id);
      expect(result.title).toEqual(mockTask.title);
      expect(result.projectId).toEqual(mockTask.projectId);
      expect(result.priority).toEqual(mockTask.priority);
      expect(Task.findById).toHaveBeenCalledWith(mockTaskId);
    });

    // Teste: a exceção é lançada quando a tarefa não existe, ou seja, não está cadastrada.
    it('should return null when task does not exist', async () => {
      // Arrange
      const mockUserId = 'user-123';
      const mockTaskId = 'non-existent-task';
      const mockUser = { id: mockUserId };

      // Configura o mock do model para "encontrar" o usuário.
      User.findById.mockReturnValue(Object.assign({}, mockUser));

      // Configura o mock do model para "não encontrar" a tarefa.
      Task.findById.mockReturnValue(null);

      // Act
      const result = await taskService.getTaskById(mockUserId, mockTaskId);

      // Assert
      expect(result).toBeNull();
    });
  });

  // --- TESTE PARA A REGRA DE NEGÓCIO 1 (Prioridade Imutável) ---

  describe('updateTask', () => {
    
    // Teste: a prioridade da tarefa não é modificada quando os detalhes da tarefa são alterados.
    it('should not allow priority to be changed', async () => {
      // Arrange
      const mockUserId = 'user-123';
      const mockTaskId = 'task-xyz';
      const mockUser = { id: mockUserId };
      
      // Tentativa de dados de atualização que inclui a prioridade (que é imutável)
      const updateData = { title: 'Título Atualizado', priority: 'Baixa', status: 'EmAndamento' }; 
      const originalTask = { id: mockTaskId, title: 'Original', priority: 'Alta', status: 'Pendente' };

      // Configura o mock do model para "encontrar" o usuário.
      User.findById.mockReturnValue(Object.assign({}, mockUser));

      // Configura o mock do model para "encontrar" a tarefa.
      Task.findById.mockReturnValue(Object.assign({}, originalTask));

      // Act
      await taskService.updateTask(mockUserId, mockTaskId, updateData);

      // Assert
      expect(Task.findByIdAndUpdate).toHaveBeenCalledWith(mockTaskId, expect.not.objectContaining({ priority: 'Baixa' }), expect.any(Object));
      expect(Task.findByIdAndUpdate).toHaveBeenCalledWith(mockTaskId, expect.objectContaining({ status: 'EmAndamento' }), expect.any(Object));
      expect(Task.findByIdAndUpdate).toHaveBeenCalledWith(mockTaskId, expect.objectContaining({ title: 'Título Atualizado' }), expect.any(Object));
    });

    // --- TESTE PARA A REGRA DE NEGÓCIO 3 (Criação de Histórico) ---

    // Teste: é gerado um histórico quando quando uma informação da tarefa é alterada, como por exemplo o título.
    it('should create a history record when a field is changed', async () => {
      // Arrange
      const mockUserId = 'user-123';
      const mockTaskId = 'task-xyz';
      const mockUser = { id: mockUserId };
      const originalTitle = 'Título Original';
      const newTitle = 'Título Atualizado';
      const originalTask = { id: mockTaskId, title: originalTitle, status: 'Pendente' };
      const updateData = { title: newTitle, status: 'Concluida' };

      // Configura o mock do model para "encontrar" o usuário.
      User.findById.mockReturnValue(Object.assign({}, mockUser));

      // Configura o mock do model para "encontrar" a tarefa.
      Task.findById.mockReturnValue(Object.assign({}, originalTask));
      
      jest.spyOn(taskService, 'getTaskById').mockResolvedValue(originalTask);
      Task.findByIdAndUpdate.mockResolvedValue({ ...originalTask, ...updateData });

      // Configura construtor do TaskHistory para poder verificar a instância salva
      const mockHistoryInstance = { save: jest.fn().mockResolvedValue(true) };
      TaskHistory.mockImplementation(() => mockHistoryInstance);

      // Act
      await taskService.updateTask(mockUserId, mockTaskId, updateData);

      // Assert
      // Equivalente ao Moq.Verify com It.Is<...>(...)
      expect(TaskHistory).toHaveBeenCalledTimes(2);
      expect(TaskHistory).toHaveBeenCalledWith(expect.objectContaining({
        fieldName: 'Title',
        oldValue: originalTitle,
        newValue: newTitle,
        userId: mockUserId,
        taskId: mockTaskId,
      }));
      expect(mockHistoryInstance.save).toHaveBeenCalledTimes(2);
    });
  });

  // --- TESTE PARA A REGRA DE NEGÓCIO 4 (Limite de Tarefas) ---
  
  describe('createTaskForProject', () => {

    // Teste: a exceção é lançada quando se tenta incluir mais que 20 tarefas em um projeto.
    it('should throw Error when project task limit is reached', async () => {
      // Arrange
      const mockUserId = 'user-123';
      const mockProjectId = 'project-abc';
      const mockUser = { id: mockUserId };
      const mockProject = { id: mockProjectId, owner: mockUserId, taskCount: 20 };
      const newTaskData = { title: 'A 21ª Tarefa', description: '...', priority: 'Media' };

      // Configura o mock do model para "encontrar" o usuário.
      User.findById.mockReturnValue(Object.assign({}, mockUser));

      // Simula que o projeto foi encontrado e já tem 20 tarefas
      Project.findById.mockReturnValue(Object.assign({}, mockProject));

      // Act & Assert
      await expect(taskService.createTaskForProject(mockUserId, mockProjectId, newTaskData))
        .rejects.toThrow(Error);
        
      await expect(taskService.createTaskForProject(mockUserId, mockProjectId, newTaskData))
        .rejects.toThrow("Limite de 20 tarefas por projeto foi atingido.");

      // Garante que a tarefa não foi salva se o limite foi atingido
      expect(Task.save).not.toHaveBeenCalled(); 
    });
  });

  // --- TESTE PARA A REGRA DE NEGÓCIO 6 (Adicionar Comentário) ---
  
  describe('addComment', () => {

    // Teste: é possível adicionar comentários em uma tarefa quando ela existe.
    it('should create a comment history record', async () => {
      // Arrange
      const mockUserId = 'user-123';
      const mockTaskId = 'task-xyz';
      const mockUser = { id: mockUserId };
      const mockTask = { id: mockTaskId };
      const mockComment = 'Este é um comentário de teste.';
      
      // Configura o mock do model para "encontrar" o usuário.
      User.findById.mockReturnValue(Object.assign({}, mockUser));

      // Configura o mock do model para "encontrar" a tarefa.
      Task.findById.mockReturnValue(Object.assign({}, mockTask));

      const mockHistoryInstance = { save: jest.fn().mockResolvedValue(true) };
      TaskHistory.mockImplementation(() => mockHistoryInstance);

      // Act
      await taskService.addComment(mockUserId, mockTaskId, { comment: mockComment });

      // Assert
      expect(TaskHistory).toHaveBeenCalledTimes(1);
      expect(TaskHistory).toHaveBeenCalledWith(expect.objectContaining({
        changeType: 'Comment',
        comment: mockComment,
        userId: mockUserId,
        taskId: mockTaskId,
      }));
    });

    // Teste: a exceção é lançada quando se tenta adicionar um comentário a uma tarefa que não existe.
    it('should throw Error when trying to comment on a non-existent task', async () => {
      // Arrange
      const mockUserId = 'user-123';
      const mockTaskId = 'task-xyz';
      const mockUser = { id: mockUserId };
      const mockTask = { id: mockTaskId };
      const mockComment = 'Este é um comentário de teste.';

      // Configura o mock do model para "encontrar" o usuário.
      User.findById.mockReturnValue(Object.assign({}, mockUser));

      // Configura o mock do model para "não encontrar" a tarefa.
      Task.findById.mockReturnValue(null);

      // Act & Assert
      await expect(taskService.addComment(mockUserId, mockTaskId, { comment: '...' }))
        .rejects.toThrow(Error);
    });
  });
});