# 🏗️ Arquitetura do SGAM

> Estrutura detalhada do código e responsabilidades de cada camada

## 📐 Arquitetura em Camadas

┌──────────────────────────────┐
│         HTTP Request         │
└──────────────┬───────────────┘
               │
        ┌──────▼──────┐
        │ Middlewares │  (auth, validation, logger)
        └──────┬──────┘
               │
        ┌──────▼──────┐
        │ Controllers │  Recebem requisições HTTP
        └──────┬──────┘
               │
        ┌──────▼──────┐
        │  Services   │  Lógica de negócio
        └──────┬──────┘
               │
        ┌──────▼──────┐
        │   Models    │  Interagem com o banco
        └──────┬──────┘
               │
        ┌──────▼──────┐
        │   Database  │  MySQL
        └─────────────┘

## 📂 Estrutura de Diretóriossrc/
├── config/                   # Configurações centralizadas
│   ├── database.ts          # Pool de conexões, Knex
│   ├── env.ts               # Variáveis de ambiente
│   └── express.ts           # Setup do servidor
│
├── constants/               # Valores fixos (enums)
│   ├── mensagens.ts        # Mensagens padronizadas
│   ├── nivelAcesso.ts      # CLIENTE=1, COLABORADOR=2, ADMIN=3
│   └── statusPedido.ts     # Estados dos pedidos
│
├── controllers/            # Recebem requisições HTTP
│   ├── AuthController.ts   # Login, logout, sessão
│   ├── DashboardController.ts  # Métricas
│   ├── PedidoController.ts     # CRUD pedidos
│   └── UsuarioController.ts    # CRUD usuários
│
├── database/              # Scripts de banco
│   ├── migrations/        # Versionamento do schema
│   └── seeds/             # Dados iniciais
│
├── dto/                   # Validação de entrada
│   ├── CreatePedidoDto.ts
│   ├── CreateUsuarioDto.ts
│   ├── LoginDto.ts
│   └── UpdateUsuarioDto.ts
│
├── exceptions/            # Erros customizados
│   ├── AppError.ts        # Classe base
│   ├── NotFoundError.ts   # 404
│   ├── UnauthorizedError.ts  # 401
│   └── ValidationError.ts    # 400
│
├── middlewares/           # Interceptam requisições
│   ├── auth.ts           # Valida JWT
│   ├── errorHandler.ts   # Trata erros
│   ├── logger.ts         # Loga requisições
│   └── validation.ts     # Valida DTOs
│
├── models/               # Representam tabelas
│   ├── Usuario.ts       # CRUD + autenticação
│   ├── Pedido.ts        # CRUD + queries complexas
│   └── PedidoStatusLog.ts  # Auditoria
│
├── routes/              # Endpoints da API
│   ├── AuthRoutes.ts    # /auth/*
│   ├── DashboardRoutes.ts  # /dashboard
│   ├── PedidoRoutes.ts     # /pedidos/*
│   └── UsuarioRoutes.ts    # /usuarios/*
│
├── services/            # Lógica de negócio
│   ├── AuthService.ts   # JWT, senha
│   ├── CronService.ts   # Jobs automáticos
│   ├── DashboardService.ts  # Estatísticas
│   ├── PedidoService.ts     # Transições de status
│   └── UsuarioService.ts    # Hash de senha
│
├── types/               # Tipos TypeScript
│   ├── Auth.types.ts
│   ├── Pedido.types.ts
│   ├── Usuario.types.ts
│   └── express.d.ts
│
├── utils/               # Funções auxiliares
│   ├── date.ts         # Formatação de datas
│   ├── jwt.ts          # Token JWT
│   ├── password.ts     # Bcrypt
│   └── validator.ts    # Validações
│
├── cli.ts              # Interface de linha de comando
├── index.ts            # Entry point da API
└── setup.ts            # Script de setup inicial

## 🎯 Responsabilidades

### **Controllers**
- Recebem requisições HTTP
- Extraem dados do request (body, params, query)
- Chamam Services para lógica de negócio
- Retornam respostas HTTP padronizadas