FROM node:20-alpine

WORKDIR /app

# Copiar arquivos de configuração
COPY package*.json ./
COPY prisma ./prisma/
COPY tsconfig.json ./

# Instalar dependências
RUN npm ci

# Gerar Prisma Client
RUN npx prisma generate

# Copiar código fonte
COPY src ./src

# Expor porta
EXPOSE 3000

# O arquivo principal é server.ts (que importa app.ts)
CMD ["sh", "-c", "npx prisma migrate deploy && npx ts-node-dev --respawn --transpile-only src/server.ts"]