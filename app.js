/**
 * @fileoverview Entry point, ponto de entrada, da aplicação (API).
 * 
 * @module app.js
 */

// 1. IMPORTAÇÃO DOS MÓDULOS
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const responseTime = require('response-time');
const promClient = require('prom-client');

// Importação das rotas da aplicação
const userRoutes = require('./src/routes/userRoutes');
const projectRoutes = require('./src/routes/projectRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const reportRoutes = require('./src/routes/reportRoutes');

// 2. CONFIGURAÇÃO INICIAL
// Carrega as variáveis de ambiente do arquivo .env
dotenv.config({ path: path.join('./config', '.env') });
const app = express();
const PORT = process.env.PORT || 3000;

// 3. CONFIGURAÇÃO DAS MÉTRICAS COM PROM-CLIENT
// Cria um registro central para todas as nossas métricas.
const register = new promClient.Registry();

// Adiciona as métricas padrão do Node.js (uso de memória, CPU, etc.) ao nosso registro.
promClient.collectDefaultMetrics({ register });

// Cria um contador para o total de requisições HTTP.
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests made.',
  labelNames: ['method', 'route', 'code'], // As "dimensões" que queremos registrar.
  registers: [register],
});

// Cria um histograma para medir a duração das requisições.
const httpRequestDurationSeconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds.',
  labelNames: ['method', 'route', 'code'],
  registers: [register],
  buckets: [0.1, 0.5, 1, 1.5, 2, 5] // Buckets de tempo em segundos.
});

// 4. CONEXÃO COM O BANCO DE DADOS
// Usamos uma função assíncrona para garantir que a conexão seja estabelecida
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado ao MongoDB com sucesso!');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error.message);
    // Encerra o processo da aplicação se não conseguir conectar ao DB
    process.exit(1);
  }
};

connectDB(); // Executa a função de conexão

// 5. CONFIGURAÇÃO DOS MIDDLEWARES
// Permite que o frontend (em outro domínio) acesse sua API
app.use(cors());

// Permite que o Express entenda requisições com corpo em formato JSON
app.use(express.json());

// Middleware `response-time` para medir a duração e atualizar as métricas.
// Ele será executado para cada requisição que passar por ele.
app.use(responseTime((req, res, time) => {
  // A requisição já foi processada e a resposta está sendo enviada.
  // Agora, registramos as métricas.

  // Usamos req.route.path para obter a rota normalizada (ex: /api/users/:id)
  // e não a URL completa (ex: /api/users/123).
  // Se a rota não for encontrada, req.route será undefined, então usamos req.path.
  const route = req.route ? req.route.path : req.path;
  
  // Preenchemos as labels com os dados da requisição/resposta.
  const labels = {
    method: req.method,
    route: route,
    code: res.statusCode
  };

  // Incrementa o contador de requisições totais.
  httpRequestsTotal.inc(labels);

  // Registra a duração da requisição em segundos.
  httpRequestDurationSeconds.observe(labels, time / 1000);
}));

// Middleware simples para logar as requisições (opcional, mas útil para debug)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// 6. ROTAS DA API
// A rota /metrics DEVE ser definida aqui para expor os dados que o Prometheus irá coletar.
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});

app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reports', reportRoutes);

// 7. TRATAMENTO DE ERROS CENTRALIZADO
// Middleware para rotas não encontradas (404)
app.use((req, res, next) => {
  res.status(404).json({ message: 'Rota não encontrada.' });
});

// Middleware para tratamento de outros erros (Error Handler)
// Deve ser o último middleware a ser configurado
app.use((err, req, res, next) => {
  console.error('Erro não capturado:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Ocorreu um erro interno no servidor.',
  });
});

// 8. INICIALIZAÇÃO DO SERVIDOR
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta http://localhost:${PORT}`);
});