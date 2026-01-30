# AquecePro Backend

Backend API desenvolvido com NestJS para o sistema de gestão AquecePro.

## 🚀 Tecnologias

- **NestJS** - Framework Node.js
- **TypeORM** - ORM para TypeScript
- **MySQL** - Banco de dados
- **JWT** - Autenticação
- **Swagger** - Documentação da API
- **Passport** - Estratégias de autenticação
- **bcrypt** - Hash de senhas
- **class-validator** - Validação de DTOs

## 📋 Pré-requisitos

- Node.js (v18 ou superior)
- MySQL (v8.0 ou superior)
- npm ou yarn

## 🔧 Instalação

1. Instale as dependências:

```bash
npm install
```

2. Configure as variáveis de ambiente:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações de banco de dados e JWT.

3. Crie o banco de dados e execute as migrations:

```bash
# Criar o banco de dados
npm run db:create

# Executar as migrations
npm run migration:run

# Ou fazer tudo de uma vez:
npm run db:setup
```

## 🏃 Executando a aplicação

### Desenvolvimento

```bash
npm run start:dev
```

A aplicação estará disponível em `http://localhost:3020`

### Produção

```bash
npm run build
npm run start:prod
```

## 📚 Documentação da API

Após iniciar a aplicação, acesse a documentação Swagger em:

```
http://localhost:3020/api/docs
```

## 🗄️ Migrations

### Criar uma nova migration

```bash
npm run migration:generate -- src/database/migrations/NomeDaMigration
```

### Executar migrations

```bash
npm run migration:run
```

### Reverter última migration

```bash
npm run migration:revert
```

## 🔐 Autenticação

A API utiliza JWT para autenticação. Para acessar rotas protegidas:

1. Faça login em `/api/auth/login`
2. Use o token retornado no header: `Authorization: Bearer <token>`

## 📁 Estrutura do Projeto

```
src/
├── common/           # Recursos compartilhados
│   ├── decorators/   # Decorators customizados
│   ├── filters/      # Filtros de exceção
│   ├── guards/       # Guards de autenticação
│   └── interceptors/ # Interceptors
├── config/           # Configurações
├── database/         # Migrations
│   └── migrations/
├── modules/          # Módulos da aplicação
│   ├── auth/         # Módulo de autenticação
│   └── users/         # Módulo de usuários
├── app.module.ts     # Módulo principal
└── main.ts           # Arquivo de entrada
```

## 🛡️ Segurança

- Autenticação JWT
- Hash de senhas com bcrypt
- Rate limiting
- Validação de dados
- CORS configurado
- Guards para rotas protegidas

## 📝 Scripts Disponíveis

- `npm run start` - Inicia a aplicação
- `npm run start:dev` - Inicia em modo desenvolvimento (watch)
- `npm run start:prod` - Inicia em modo produção
- `npm run build` - Compila o projeto
- `npm run test` - Executa testes
- `npm run lint` - Executa o linter
- `npm run format` - Formata o código

## 🔄 Próximos Passos

- Adicionar módulos para:
  - Stores (Lojas)
  - Products (Produtos)
  - Proposals (Propostas)
  - Appointments (Agendamentos)
  - Cities (Cidades)
  - Categories (Categorias)

