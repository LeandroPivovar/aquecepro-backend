# Guia de Configuração - AquecePro Backend

## 📦 Instalação Inicial

1. **Instale as dependências:**
```bash
npm install
```

2. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=sua_senha
DB_NAME=aquecepro
JWT_SECRET=uma-chave-secreta-muito-forte-aqui
```

4. **Crie o banco de dados e execute as migrations:**
```bash
# Criar o banco de dados
npm run db:create

# Executar as migrations
npm run migration:run

# Ou fazer tudo de uma vez:
npm run db:setup
```

5. **Inicie o servidor:**
```bash
npm run start:dev
```

## 🔑 Criando o Primeiro Usuário

Você pode criar o primeiro usuário através da API:

```bash
# Primeiro, faça login (se já tiver um usuário)
POST http://localhost:3020/api/auth/login
{
  "email": "admin@example.com",
  "password": "senha123"
}

# Ou crie um usuário diretamente (requer autenticação)
POST http://localhost:3020/api/users
Authorization: Bearer <token>
{
  "email": "admin@example.com",
  "password": "senha123",
  "name": "Administrador",
  "role": "admin"
}
```

**Nota:** Para criar o primeiro usuário sem autenticação, você pode temporariamente remover o guard do endpoint de criação de usuários ou usar o TypeORM CLI para inserir diretamente no banco.

## 📚 Endpoints Principais

### Autenticação
- `POST /api/auth/login` - Fazer login (público)
- `GET /api/auth/profile` - Obter perfil (protegido)

### Usuários
- `GET /api/users` - Listar usuários (protegido)
- `GET /api/users/:id` - Buscar usuário (protegido)
- `POST /api/users` - Criar usuário (protegido)
- `PATCH /api/users/:id` - Atualizar usuário (protegido)
- `DELETE /api/users/:id` - Remover usuário (protegido)

### Health Check
- `GET /api` - Status da API (público)
- `GET /api/health` - Health check (público)

## 🔒 Segurança

- Todas as rotas são protegidas por padrão
- Use o decorator `@Public()` para tornar rotas públicas
- Senhas são hasheadas com bcrypt
- JWT tokens expiram em 7 dias (configurável)
- Rate limiting: 100 requisições por minuto

## 🛠️ Desenvolvimento

### Estrutura de Módulos

Cada módulo segue o padrão:
```
modules/
  nome-modulo/
    dto/          # Data Transfer Objects
    entities/     # Entidades TypeORM
    nome-modulo.controller.ts
    nome-modulo.service.ts
    nome-modulo.module.ts
```

### Criando um Novo Módulo

```bash
nest g module modules/nome-modulo
nest g controller modules/nome-modulo
nest g service modules/nome-modulo
```

## 🐛 Troubleshooting

### Erro de conexão com banco de dados
- Verifique se o MySQL está rodando
- Confirme as credenciais no `.env`
- Verifique se o banco de dados existe
- Certifique-se de que o usuário tem permissões para criar tabelas

### Erro de migration
- Certifique-se de que o banco está vazio ou use `synchronize: true` temporariamente
- Verifique se o charset do banco está configurado como `utf8mb4`:
```sql
CREATE DATABASE aquecepro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Erro de autenticação
- Verifique se o JWT_SECRET está configurado
- Confirme que o token está sendo enviado no header: `Authorization: Bearer <token>`

