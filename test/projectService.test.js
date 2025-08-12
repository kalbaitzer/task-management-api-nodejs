/**
 * @fileoverview Testes unitários para o Serviço de Projetos.
 * 
 * @module test/projectService.test.js
 */
 
// Importa os models para que possamos mocká-los
const User = require('../src/models/userModel'); 
const Task = require('../src/models/taskModel');
const Project = require('../src/models/projectModel');

// Importa o serviço que queremos testar
const projectService = require('../src/services/projectService');

// Mocka (simula) os models para isolar o serviço do banco de dados
jest.mock('../src/models/projectModel', () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

jest.mock('../src/models/taskModel', () => ({
  find: jest.fn(),
  exists: jest.fn(),
  deleteMany: jest.fn(),
}));

jest.mock('../src/models/userModel', () => ({
  findById: jest.fn(),
}));

/**
 * Suite de testes para o serviço de Projetos.
 */
describe('Project Service', () => {

  // Bloco que executa antes de cada teste
  beforeEach(() => {
    // Limpa todos os mocks para garantir que um teste не interfira no outro
    jest.clearAllMocks();
  });

  // --- TESTES PARA O MÉTODO getProjectById ---

  describe('getProjectById', () => {

    // Teste: obtém dos detalhes do projeto quando ele existe, ou seja, está cadastrado.
    it('should return project details when the project exists and belongs to the user', async () => {
        // Arrange (Arranjar)
        const mockUserId = 'user-uuid-123';
        const mockProjectId = 'project-uuid-abc';

        // Cria a entidade de Usuário que "existe" no banco.
        const mockUser = { id: mockUserId };

        // Cria a entidade de Projeto que "existe" no banco.
        const mockProject = {
          id: mockProjectId,
          owner: mockUserId,
          title: 'Projeto de Teste',
          description: 'Descrição para o teste',
          createdAt: new Date().toISOString(),
          tasks: [], // Simulando o populate
        };

        // Configura o mock do model para "encontrar" o usuário.
        User.findById.mockReturnValue(Object.assign({}, mockUser));

        // Configura o mock do model para "encontrar" o projeto.
        // O mock para .populate() é encadeado.
        Project.findById.mockReturnValue({
          populate: jest.fn().mockResolvedValue(Object.assign({}, mockProject)),
        });

        // Act (Agir)
        const result = await projectService.getProjectById(mockUserId, mockProjectId);

        // Assert (Afirmar)
        expect(result).not.toBeNull(); // Assert.NotNull
        expect(result.id).toEqual(mockProject.id); // Assert.Equal
        expect(result.title).toEqual(mockProject.title); // Assert.Equal
        expect(result.owner).toEqual(mockProject.owner); // Assert.Equal
        expect(result.description).toEqual(mockProject.description); // Assert.Equal
    });

    // Teste: a exceção é lançada quando o projeto não existe, ou seja, não está cadastrado.
    it('should return null when the project does not exist', async () => {
        // Arrange
        const mockUserId = 'user-uuid-123';
        const mockProjectId = 'project-uuid-non-existent';

        // Cria a entidade de Usuário que "existe" no banco.
        const mockUser = { id: mockUserId };

        // Configura o mock do model para "encontrar" o usuário.
        User.findById.mockReturnValue(Object.assign({}, mockUser));

        // Configura o mock para retornar NULO, simulando que o projeto não foi encontrado.
        Project.findById.mockReturnValue({
          populate: jest.fn().mockResolvedValue(null),
        });

        // Act
        const result = await projectService.getProjectById(mockUserId, mockProjectId);

        // Assert
        expect(result).toBeNull();
    });
  });

  // --- TESTES PARA O MÉTODO deleteProject (Regra de Negócio 2) ---

  describe('deleteProject', () => {

    // Teste: a exceção é lançada quando se tenta remover um projeto com tarefas ativas, que
    // ainda não foram concluídas
    it('should throw Error when trying to delete a project with active tasks', async () => {
        // Arrange
        const mockUserId = 'user-uuid-123';
        const mockProjectId = 'project-uuid-abc';
        const mockProject = { id: mockProjectId, owner: mockUserId };

        // Cria a entidade de Usuário que "existe" no banco.
        const mockUser = { id: mockUserId };

        // Configura o mock do model para "encontrar" o usuário.
        User.findById.mockReturnValue(Object.assign({}, mockUser));

        // Simula que o projeto é encontrado
        Project.findOne.mockResolvedValue(Object.assign({}, mockProject));
        
        // Simula que Task.exists retorna 'true' (existem tarefas ativas)
        Task.exists.mockResolvedValue(true);

        // Act & Assert
        // Verificamos se o método lança a exceção esperada (Error).
        await expect(projectService.deleteProject(mockUserId, mockProjectId))
        .rejects.toThrow(Error);

        // Verifica se a mensagem da exceção é a correta.
        await expect(projectService.deleteProject(mockUserId, mockProjectId))
        .rejects.toThrow('Não é possível remover o projeto. Existem tarefas pendentes ou em andamento.');
    });

    // Teste: a exclusão de um projeto é realizada com sucesso quando ele não tem tarefas ativas,
    // ou seja, todas as suas tarefas já foram concluídas
    it('should delete project and related data when it has no active tasks', async () => {
        // Arrange
        const mockUserId = 'user-uuid-123';
        const mockProjectId = 'project-uuid-abc';
        
        // Cria a entidade de Usuário que "existe" no banco.
        const mockUser = { id: mockUserId };

        // Configura o mock do model para "encontrar" o usuário.
        User.findById.mockReturnValue(Object.assign({}, mockUser));

        // Cria a entidade de Projeto que "existe" no banco.
        const mockProject = { id: mockProjectId, owner: mockUserId };
        
        // Simula que o projeto é encontrado
        Project.findOne.mockResolvedValue(Object.assign({}, mockProject));

        Task.exists.mockResolvedValue(false); // Não há tarefas ativas
        Task.find.mockReturnValue({ select: jest.fn().mockResolvedValue([]) }); // Nenhuma tarefa encontrada para deletar
        Project.findByIdAndDelete.mockResolvedValue(mockProject); // Mock da deleção final

        // Act
        await projectService.deleteProject(mockUserId, mockProjectId);

        // Assert
        // Verificamos se os métodos corretos foram chamados (equivalente ao Moq.Verify)
        expect(Project.findByIdAndDelete).toHaveBeenCalledWith(mockProjectId);
        expect(Task.deleteMany).toHaveBeenCalledWith({ projectId: mockProjectId });

        // Verifica se a deleção do projeto foi chamada dentro da transação
        expect(Project.findByIdAndDelete).toHaveBeenCalledWith(mockProjectId);
    });
  });
});