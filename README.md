# API de Gerenciamento de Tarefas

![Node.js](https://img.shields.io/badge/22.0%2B-x?style=flat&logo=Node.js&logoColor=green&label=Node.js&color=green)
![MongoDB](https://img.shields.io/badge/MongoDB-8-green)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)
![Arquitetura](https://img.shields.io/badge/Arquitetura-Clean-orange)
![Visual Studio Code](https://custom-icon-badges.demolab.com/badge/Visual%20Studio%20Code-0078d7.svg?logo=vsc&logoColor=white)

## Sobre o Projeto

Este repositório contém o código-fonte de uma API RESTful completa para um sistema de gerenciamento de tarefas. A API permite que os usuários organizem seus projetos e tarefas diárias, colaborem com colegas e monitorem o progresso.

O projeto foi desenvolvido com **Node.js** e **MongoDB**, seguindo os princípios da **Clean Architecture** para garantir um código limpo, testável, escalável e de fácil manutenção. Toda a aplicação, incluindo o banco de dados, está pronta para ser executada em contêineres **Docker**.

---

## Funcionalidades e Regras de Negócio

A API implementa as seguintes regras de negócio:

- **Organização por Projetos e Tarefas**: A estrutura principal se baseia em `Projetos` que contêm múltiplas `Tarefas`.
- **Prioridades de Tarefas**: Cada tarefa possui uma prioridade (`Baixa`, `Média`, `Alta`) que é imutável após a sua criação.
- **Restrições de Remoção**: Um projeto não pode ser removido se ainda possuir tarefas pendentes ou em andamento.
- **Histórico de Alterações**: Todas as atualizações em uma tarefa (detalhes, status, etc.) são registradas em um histórico de alterações, incluindo quem fez a alteração, o que foi alterado e quando.
- **Limite de Tarefas**: Cada projeto pode conter no máximo 20 tarefas.
- **Relatórios de Desempenho**: Um endpoint especial, acessível apenas por usuários com a função de "Gerente", fornece a média de tarefas concluídas nos últimos 30 dias.
- **Comentários**: Usuários podem adicionar comentários às tarefas, que são salvos no histórico de alterações.

---

## Tecnologias Utilizadas

- **Backend**: Node.js 22 e Express.js 5
- **Persistência de Dados**: Mongoose (ODM - Object Document Mapper)
- **Banco de Dados**: MongoDB 8 (Não-Relacional, Orientado a Documentos)
- **Arquitetura**: Clean Architecture
- **Conteinerização**: Docker
- **Ambiente de Desenvolvimento**: Visual Studio Code
- **Versionamento de Código**: Git e GitHub
- **Teste da API**: routes.http

---

## Arquitetura

O projeto está estruturado em quatro camadas principais, seguindo os princípios da Clean Architecture, o que garante uma clara separação de preocupações.

```
/src
+-- models/         # Definições do Mongoose (Schemas)
+-- controllers/    # Lógica de requisição/resposta (req, res)
+-- services/       # Lógica de negócio (regras da aplicação)
+-- routes/         # Definição das rotas da API
+-- middlewares/    # Funções utilitárias, logs, erros, etc.
app.js              # Ponto de entrada da aplicação
package.json
```

---

## Como Executar o Projeto no Docker

Esta é a maneira mais simples e recomendada de executar toda a aplicação.

### Pré-requisitos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e em execução.

### Passos
1. **Criação do arquivo `Dockerfile`**: Na raiz do projeto, crie um arquivo com nome `Dockerfile` com o seguinte conteúdo:
   ```yaml
      # Estágio 1: Build (Compilação)
      # Usamos a imagem do SDK completo do .NET 9 para compilar a aplicação
      FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
      WORKDIR /

      # Copia os arquivos de projeto (.csproj) e o arquivo de solução (.sln) primeiro
      COPY ["TaskManagementAPI.API/TaskManagementAPI.API.csproj", "TaskManagementAPI.API/"]
      COPY ["TaskManagementAPI.Application/TaskManagementAPI.Application.csproj", "TaskManagementAPI.Application/"]
      COPY ["TaskManagementAPI.Core/TaskManagementAPI.Core.csproj", "TaskManagementAPI.Core/"]
      COPY ["TaskManagementAPI.Infrastructure/TaskManagementAPI.Infrastructure.csproj", "TaskManagementAPI.Infrastructure/"]
      COPY ["TaskManagementAPI.sln", "."]

      # Restaura as dependências NuGet (isso é feito antes para aproveitar o cache do Docker)
      RUN dotnet restore TaskManagementAPI.sln

      # Copia todo o resto do código fonte
      COPY . .

      # Publica a aplicação em modo de Release, otimizada para produção
      WORKDIR "TaskManagementAPI.API"
      RUN dotnet publish "TaskManagementAPI.API.csproj" -c Release -o /app/publish

      # Estágio 2: Final (Execução)
      # Usamos a imagem do ASP.NET, que é menor
      FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
      WORKDIR /app

      # Copia apenas os arquivos publicados do estágio de build
      COPY --from=build /app/publish .

      # Define o ponto de entrada, o comando que será executado quando o contêiner iniciar
      ENTRYPOINT ["dotnet", "TaskManagementAPI.API.dll"]
   ```
   Este arquivo está disponível na raiz do projeto.

2. **Criação do arquivo `docker-compose.yml`**: Na raiz do projeto, crie um arquivo `docker-compose.yml` com o seguinte conteúdo:
   ```yaml
      # Configuração do container para o ambiente (computador) de desenvolvimento

      services:
        # Serviço do Banco de Dados PostgreSQL
        db:
          image: postgres:16 # Usa a imagem oficial do PostgreSQL
          container_name: task-management-db
          restart: always
          environment:
            - POSTGRES_USER=postgres
            - POSTGRES_PASSWORD=sql_pass # Use a mesma senha do seu appsettings
            - POSTGRES_DB=task_management_db
          ports:
            - "5433:5432" # Mapeia a porta 5432 do contêiner para a porta 5433 da sua máquina
          volumes:
            - postgres_data:/var/lib/postgresql/data # Garante que os dados do banco persistam

        # Serviço da sua API .NET
        api:
          container_name: task-management-api
          build:
            context: . # Constrói a imagem usando o Dockerfile na pasta atual
            dockerfile: Dockerfile
          ports:
            - "5000:8080" # Mapeia a porta 8080 do contêiner para a porta 5000 da sua máquina
          environment:
            - ASPNETCORE_URLS=http://+:8080 # Diz à API para rodar na porta 8080 dentro do contêiner
            - ConnectionStrings__DefaultConnection=Host=db;Port=5432;Database=task_management_db;Username=postgres;Password=sql_pass
          depends_on:
            - db # Diz ao Docker para iniciar o contêiner 'db' antes do contêiner 'api'

      # Define o volume nomeado para persistir os dados do PostgreSQL
      volumes:
        postgres_data:
   ```
   Este arquivo está disponível na raiz do projeto.

3. **Criação dos contêineres**: No terminal, na raiz do projeto, execute:
   ```bash
      docker-compose up --build -d
   ```
   Serão criados dois contêineres: um para a API e outro para o PostgreSQL.
   A aplicação irá iniciar, e as migrações do banco de dados serão aplicadas automaticamente na primeira inicialização, criando todas as tabelas.

4. **Acesso à API**: A api está disponível em:
   **[http://localhost:5000/](http://localhost:5000/)**

5. **Publicação no Docker Hub**: Para publicar no Docker Hub é necessário apenas o contêiner da API, pois o Docker baixa automaticmente a imagem do banco de dados (`PostgreSQL`) quando for executado em outros computadores. Para a publicação é necessário a execução dos seguintes comandos através do terminal, na raiz do projeto:
   ```bash
      docker login
      docker-compose build
      docker tag src-api kalbaitzer/task-management-api:1.0
      docker push kalbaitzer/task-management-api:1.0
   ```

6. **Execução do contêiner em outros computadores**: Para executar o contêiner em outros computadores é necessário executar os seguintes passos:
   
   1. Crie uma pasta no computador onde o contêiner será executado com o nome `task-management-api`
   
   2. Crie um arquivo na pasta `task-management-api` com o nome `docker-compose.yml` com o seguinte conteúdo:
      ```yaml
         # Configuração do container para execução em outros computadores

         services:
         # O serviço do banco de dados não muda nada.
         db:
            image: postgres:16
            container_name: task-management-db
            restart: always
            environment:
               - POSTGRES_USER=postgres
               - POSTGRES_PASSWORD=sql_pass
               - POSTGRES_DB=task_management_db
            ports:
               - "5433:5432"
            volumes:
               - postgres_data:/var/lib/postgresql/data

         # O serviço da API é modificado
         api:
            container_name: task-management-api
            image: kalbaitzer/task-management-api:1.0
            ports:
               - "5000:8080"
            environment:
               - ASPNETCORE_URLS=http://+:8080
               - ConnectionStrings__DefaultConnection=Host=db;Port=5432;Database=task_management_db;Username=postgres;Password=sql_pass
            depends_on:
               - db

         volumes:
         postgres_data:
      ```
      O conteúdo deste arquivo é diferente do usado no computador de desenvolvimento.
      Este arquivo está disponível na raiz do projeto com o nome `docker-compose-runtime.yml`.

   3. No terminal, na pasta `task-management-api`, execute:
      ```bash
         docker-compose up -d
      ```

      É importante que o [Docker Desktop](https://www.docker.com/products/docker-desktop/) esteja instalado e em execução neste computador onde a imagem do contêiner será executada.
---

## Documentação da API (Endpoints)

A API assume um modelo de autenticação externa, onde a identidade do usuário é passada através de cabeçalhos HTTP.

**Cabeçalho Obrigatório para as requisições:**
- `X-User-Id`: O GUID do usuário que está fazendo a requisição. Para facilitar os testes da API, foram criados os endpoints de `Usuários`, os quais não precisam deste cabeçalho `X-User-Id`. Isso é muito útil para se testar a aplicação em um computador onde um cliente do `MongoDB` não esteja instalado.

<details>
<summary><strong>Endpoints de Usuários: /api/users</strong></summary>

| Verbo | Rota | Descrição |
| :--- | :--- | :--- |
| `POST` | `/api/users` | Cria um novo usuário para teste da API. |
| `GET` | `/api/users` | Lista todos os usuários cadastrados. |
| `GET` | `/api/users/{userId}` | Busca os detalhes de um usuário específico. |
| `PUT` | `/api/users/{userId}` | Atualiza os dados de um usuário específico. |
| `DELETE` | `/api/users/{userId}` | Remove um usuário. |

</details>

<details>
<summary><strong>Endpoints de Projetos: /api/projects</strong></summary>

| Verbo | Rota | Descrição |
| :--- | :--- | :--- |
| `POST` | `/api/projects` | Cria um novo projeto para o usuário identificado no header `X-User-Id`. |
| `GET` | `/api/projects` | Lista todos os projetos do usuário identificado no header `X-User-Id`. |
| `GET` | `/api/projects/{projectId}` | Busca os detalhes de um projeto específico. |
| `PUT` | `/api/projects/{projectId}` | Atualiza os dados de um projeto específico. |
| `DELETE` | `/api/projects/{projectId}` | Remove um projeto (se não houver tarefas ativas). |

</details>

<details>
<summary><strong>Endpoints de Tarefas: /api/tasks</strong></summary>

| Verbo | Rota | Descrição |
| :--- | :--- | :--- |
| `POST` | `/api/tasks/projects/{projectId}` | Cria uma nova tarefa dentro de um projeto específico. |
| `GET` | `/api/tasks/projects/{projectId}` | Lista todas as tarefas de um projeto específico. |
| `GET` | `/api/tasks/{taskId}` | Busca os detalhes de uma tarefa específica. |
| `PUT` | `/api/tasks/{taskId}` | Atualiza os detalhes (título, descrição, data e status) de uma tarefa. |
| `PATCH` | `/api/tasks/{taskId}/status` | Atualiza apenas o status de uma tarefa. |
| `DELETE` | `/api/tasks/{taskId}` | Remove uma tarefa. |
| `POST` | `/api/tasks/{taskId}/comments` | Adiciona um comentário a uma tarefa. |
| `GET` | `/api/tasks/{taskId}/history` | Lista todo o histórico de alterações e comentários de uma tarefa. |

</details>

<details>
<summary><strong>Endpoints de Relatórios: /api/reports</strong></summary>

| Verbo | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/reports/performance`| Gera um relatório de desempenho. Somente usuários com Role `Manager`. |

</details>

---

## Perguntas para o Product Owner

### 1. Funcionalidades do Usuário e Colaboração
Estas perguntas aprofundam o `core` do produto: o gerenciamento de tarefas.

- **Como os usuários devem colaborar numa mesma tarefa? Apenas uma pessoa é responsável por vez, ou podemos ter múltiplos responsáveis?**
Define se o relacionamento entre `User` e `Task` é um-para-muitos ou muitos-para-muitos, o que muda significativamente o esquema do banco de dados.

- **Os usuários precisam de 'subtarefas' dentro de uma tarefa principal?**
Isso introduz uma estrutura hierárquica (árvore) no nosso modelo de dados, o que requer uma lógica mais complexa para consultas e atualizações.

- **Existe a necessidade de anexar arquivos (imagens, documentos, etc) a uma tarefa ou a um projeto?**
Isso ajuda a decidir se precisamos de um serviço de armazenamento de objetos como `Amazon S3` ou `Azure Blob Storage` e como isso impacta a nossa arquitetura e custos.

- **Como funciona o convite e o compartilhamento de um projeto? Um usuário pode convidar outro para um projeto com diferentes níveis de permissão (ex: apenas 'visualizar' vs. 'editar')?**
Isso vai muito além do nosso sistema simples de Role (`User`, `Manager`) e sugere a necessidade de uma lista de controle de acesso (`ACL`) por projeto, o que é um grande incremento na complexidade da autorização.

### 2. Notificações e Engajamento
Como mantemos os usuários informados e engajados?

- **Quando e como um usuário deve ser notificado? (Ex: quando uma tarefa é atribuída a ele, quando o status muda, quando uma data de vencimento se aproxima?)**
Define a necessidade de um sistema de notificações, que pode envolver serviços de e-mail (`SendGrid`), push notifications (`Firebase`) e/ou a criação de uma fila de mensagens (`RabbitMQ`, `SQS`) para processar esses eventos de forma assíncrona.

### 3. Dados, Relatórios e Inteligência
Já temos um relatório básico. O que mais podemos fazer com os dados?

- **Além da média de tarefas, que outras métricas ou KPIs (Key Performance Indicators) são importantes para um 'Gerente' visualizar num dashboard?**
Ajuda a projetar o futuro do módulo de relatórios. Pode indicar a necessidade de visualizações de dados mais complexas, gráficos, ou até mesmo um serviço de BI (`Business Intelligence`).

- **Precisaremos exportar dados de projetos ou relatórios para formatos como CSV ou PDF?**
A geração de arquivos pode ser uma operação demorada. Isso pode exigir a implementação de `background jobs` (tarefas em segundo plano) com ferramentas como Hangfire ou `Quartz.NET` para não bloquear a API.

### 4. Escalabilidade e Requisitos Não-Funcionais
Estas perguntas ajudam a preparar a infraestrutura para o futuro.

- **Qual é a nossa meta de usuários e de tarefas ativas no primeiro ano? Serão centenas, milhares ou milhões de registros?**
Impacta diretamente as decisões sobre o tipo de banco de dados, estratégias de cache, otimização de consultas e a infraestrutura de nuvem necessária.

- **A API precisará se integrar com sistemas de terceiros no futuro? (Ex: Google Calendar para sincronizar datas de vencimento, ou Trello/Jira para importar tarefas).**
Planejar integrações desde cedo pode influenciar o design da API, tornando-a mais flexível e aberta, talvez exigindo o uso de padrões como `Webhooks` ou `OAuth` para autenticação de terceiros.

---

## O que pode ser melhorado no projeto

### 1. Arquitetura e Design de Código
O objetivo aqui é melhorar a manutenibilidade e a clareza do código à medida que o sistema cresce.

- **Implementar o Padrão CQRS (Command Query Responsibility Segregation):**

   - Atualmente, nossos Services fazem tudo: leem dados, validam, e escrevem dados. `CQRS` sugere separar as operações de escrita (`Commands`) das operações de leitura (`Queries`).

   - O modelo que você precisa para criar ou atualizar uma tarefa (com validações, entidades ricas) é muito diferente do modelo que você precisa para simplesmente listar tarefas (um DTO "achatado" e otimizado para leitura). Separar isso simplifica radicalmente a lógica.

   - Usando uma biblioteca como a MediatR, que é quase um padrão de facto em projetos .NET modernos para implementar `CQRS` e outros padrões de mensageria interna.

- **Automatizar o Mapeamento de Objetos com AutoMapper:**

   - No momento, nós mapeamos manualmente as entidades para DTOs nos nossos serviços (ex: new TaskDto { Id = taskEntity.Id, ... }).

   - Isso é repetitivo e propenso a erros. Se você adicionar um campo na entidade e no DTO, pode se esquecer de adicioná-lo no mapeamento. O `AutoMapper` é uma biblioteca que automatiza essa conversão com base em convenções.

   - Você define "perfis" de mapeamento uma vez (ex: "mapeie TaskEntity para TaskDto") e depois, no serviço, o código se resume a uma única linha: _mapper.Map<TaskDto>(taskEntity).

- **Validação Avançada com FluentValidation:**

   - Usamos `Data Annotations` (`[Required]`, `[MaxLength]`) nos nossos DTOs, o que é bom. O FluentValidation é uma biblioteca que leva a validação para o próximo nível.

   - Ele permite criar regras de validação muito mais complexas e expressivas usando expressões lambda, desacoplando as regras de validação dos DTOs e tornando-as mais fáceis de testar unitariamente.

### 2. Qualidade e Testes
Já temos testes de unidade, o que é excelente. O próximo passo é garantir que as partes integradas funcionem.

- **Implementar Testes de Integração:**

   - São testes que verificam se as diferentes camadas da nossa aplicação funcionam juntas. O teste principal seria iniciar uma versão em memória da nossa API e fazer chamadas HTTP reais aos controllers.

   - Isso nos permite testar o fluxo completo: `Controller` -> `Service` -> `Repository` -> `Banco de Dados` (em memória ou um de teste). É a melhor forma de testar a autorização baseada em headers, o roteamento e a serialização JSON.

   - Usando a classe `WebApplicationFactory` do `ASP.NET Core`, que é projetada especificamente para este fim.

### 3. Performance e Escalabilidade
À medida que o número de usuários e dados cresce, precisamos garantir que a API continue rápida.

- **Implementar Paginação:**

   - Atualmente, nossos endpoints GET que listam projetos ou tarefas retornam todos os registros de uma vez. Se um usuário tiver `10.000` tarefas, isso será inviável.

   - A paginação (ex: `GET /api/projects?page=1&pageSize=20`) é essencial para garantir que as respostas da API sejam rápidas e que não sobrecarreguem nem o servidor nem o cliente.

- **Implementar Estratégia de Cache:**

   - Armazenar em memória resultados de requisições que são frequentes e cujos dados não mudam a todo instante.

   - Para dados que são muito lidos, como a lista de projetos de um usuário, o cache pode reduzir drasticamente o número de acessos ao banco de dados, melhorando a performance de forma impressionante.

   - Podemos começar com cache em memória (`IMemoryCache`) e, para um ambiente com múltiplas instâncias da API, evoluir para um cache distribuído com `Redis`.

### 4. Infraestrutura e Deploy (Visão de Cloud)
Nosso docker-compose é ótimo para desenvolvimento e para rodar em uma única máquina. Para um ambiente de produção real na nuvem (`AWS`, `Azure`, `Google Cloud`), podemos profissionalizar o deploy.

- **CI/CD (Continuous Integration / Continuous Deployment):**

   - Um pipeline automatizado que transforma o seu git push em uma implantação em produção.

   - Build & Test: Ao fazer um push para o `GitHub`, uma ferramenta como `GitHub Actions` ou `Azure DevOps` é acionada. Ela executa dotnet build e dotnet test automaticamente. Se algum teste falhar, o processo para.

   - Build da Imagem Docker: Se os testes passarem, o pipeline constrói a sua imagem `Docker` de produção (docker build).

   - Push para um `Container Registry Privado`: A imagem é enviada para um repositório seguro, como o `Azure Container Registry` (`ACR`) ou o `Amazon ECR`.

   - Deploy: O pipeline instrui o serviço de nuvem a baixar a nova imagem e atualizar a aplicação que está no ar, muitas vezes sem nenhum tempo de inatividade (downtime).

- **Orquestração de Contêineres com Kubernetes:**

   - Para aplicações que precisam de alta disponibilidade e escalabilidade, o docker-compose não é suficiente. O `Kubernetes` (`K8s`) é o padrão da indústria para gerenciar contêineres em produção.

   - Ele gerencia automaticamente a escalabilidade (ex: "se o uso de CPU passar de 80%, crie mais um contêiner da API"), a recuperação de falhas (se um contêiner cair, ele sobe outro) e o networking avançado.

- **Banco de Dados como Serviço Gerenciado (PaaS):**

   - Em vez de rodar o `PostgreSQL` em um contêiner Docker em produção (o que exige gerenciamento de backups, atualizações, segurança, etc.), usamos um serviço gerenciado como o `Azure Database for PostgreSQL` ou o `Amazon RDS`.

   - É muito mais seguro, confiável e escalável. O provedor de nuvem cuida de toda a complexidade da infraestrutura do banco de dados para você.

- **Observabilidade (Logging, Métricas e Tracing):**

   - Logging Estruturado: Implementar bibliotecas como o Serilog para enviar logs para uma plataforma centralizada (ex: `Datadog`, `Elastic Stack`), permitindo buscas e alertas.

   - Health Checks: Criar um endpoint /health na API que verifica a saúde da aplicação e de suas dependências (como a conexão com o banco), para que os sistemas de monitoramento saibam se a aplicação está operacional.
