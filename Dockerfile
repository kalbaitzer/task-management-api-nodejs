# ---- Estágio de Build ----
# Use uma imagem oficial do Node.js como base. A versão alpine é leve.
FROM node:18-alpine AS build

# Defina o diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Copie os arquivos de manifesto de pacotes
COPY package*.json ./

# Instale as dependências da aplicação
# Usamos '--only=production' para instalar apenas as dependências de produção e manter a imagem final pequena.
RUN npm install --only=production

# Copie todo o código fonte da aplicação
COPY . .

# ---- Estágio Final ----
# Use uma imagem menor para a execução final, para segurança e tamanho reduzido.
FROM node:18-alpine

# Defina o diretório de trabalho
WORKDIR /usr/src/app

# Copie as dependências instaladas e o código do estágio de build
COPY --from=build /usr/src/app .

# Exponha a porta em que a aplicação vai rodar (a mesma do seu .env)
EXPOSE 3000

# Defina o comando para iniciar a aplicaçãoo quando o contêiner for executado
# Este comando deve corresponder ao script "start" no seu package.json
CMD [ "node", "app.js" ]