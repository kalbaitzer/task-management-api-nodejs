// app.js

// 1. IMPORTAÇÃO DOS MÓDULOS
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Importação das rotas da aplicação
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const reportRoutes = require('./routes/reportRoutes');

// 2. CONFIGURAÇÃO INICIAL
dotenv.config(); // Carrega as variáveis de ambiente do arquivo .env
const app = express();
const PORT = process.env.PORT || 3000;

// 3. CONEXÃO COM O BANCO DE DADOS
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

// 4. CONFIGURAÇÃO DOS MIDDLEWARES
// Permite que o frontend (em outro domínio) acesse sua API
app.use(cors());

// Permite que o Express entenda requisições com corpo em formato JSON
app.use(express.json());

// Middleware simples para logar as requisições (opcional, mas útil para debug)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// 5. ROTAS DA API
// Define um prefixo para todas as rotas de cada entidade
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reports', reportRoutes);

// 6. TRATAMENTO DE ERROS CENTRALIZADO
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

// 7. INICIALIZAÇÃO DO SERVIDOR
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta http://localhost:${PORT}`);
});