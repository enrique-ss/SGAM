# 🎯 SGAM - Sistema de Gerenciamento de Agência de Marketing

> Projeto desenvolvido no programa "RSTI: Desenvolvimento Backend" para gerenciar o fluxo de trabalho de agências criativas

## 🤔 O que é isso?

O SGAM (Sistema de Gerenciamento de Agência de Marketing) é um sistema completo desenvolvido como projeto final do programa "RSTI Backend". Ele nasceu a partir das necessidades reais da nossa cliente, que precisava de uma solução para organizar pedidos de serviços criativos (design, desenvolvimento web, social media, SEO) e gerenciar o fluxo de trabalho entre clientes e colaboradores.

O sistema permite que clientes solicitem serviços, acompanhem o andamento em tempo real, enquanto colaboradores assumem e gerenciam os pedidos, e administradores controlam toda a operação da agência.

## 💡 Por que fiz essa modelagem?

Este projeto foi desenvolvido no contexto do programa "RSTI Backend", onde tínhamos uma cliente real com necessidades específicas de gestão. Durante o desenvolvimento, enfrentei um desafio interessante:

- Comecei criando três interfaces diferentes (Backend API, CLI e Web)
- Cada interface tinha suas próprias regras e comportamentos
- Isso gerou inconsistências: o backend validava de um jeito, o CLI de outro, e o frontend de outro
- Eu mesmo ficava confuso sobre qual era o comportamento "correto" 😅

**A virada de chave:** Parei de codificar e comecei a documentar. Criei uma modelagem de dados completa que serve como fonte única da verdade para todas as interfaces. Foi a melhor decisão do projeto!

Agora todas as interfaces seguem as mesmas regras, o código ficou mais organizado, e qualquer pessoa consegue entender o sistema lendo a documentação.

## 📚 Documentação

A parte mais importante desse projeto é a **[documentação de modelagem](docs/MODELAGEM.md)**. Lá eu explico:

- Por que decidi fazer essa documentação
- Como funciona o sistema inteiro
- Quais são as regras de cada coisa
- Como os dados se relacionam

Recomendo ler ela antes de mexer no código!

## 🛠️ Tecnologias que estou usando

- **Backend:** Node.js com TypeScript e Express
- **Banco:** MySQL com Knex.js (query builder)
- **Frontend Web:** HTML, CSS e JavaScript puros (sem frameworks)
- **CLI:** TypeScript (interface de linha de comando)

**Responsabilidades:**
- **Controllers**: Recebem requisições e retornam respostas
- **Services**: Contêm a lógica de negócio
- **Models**: Interagem com o banco de dados
- **DTOs**: Validam e tipam dados de entrada
- **Middlewares**: Interceptam requisições (auth, logs, validação)
- **Exceptions**: Tratam erros de forma estruturada

## 📁 Estrutura do Projeto

```
sgam/
├── docs/
│   └── MODELAGEM.md              # Documentação completa da modelagem
│
├── public/
│   ├── index.html                # Interface web
│   ├── script.js                 # Lógica do frontend
│   └── style.css                 # Estilos
│
├── src/
│   ├── config/                   # Configurações do sistema
│   │   ├── database.ts           # Configuração do banco de dados
│   │   ├── env.ts                # Variáveis de ambiente
│   │   └── express.ts            # Configuração do Express
│   │
│   ├── constants/                # Constantes do sistema
│   │   ├── mensagens.ts          # Mensagens de erro/sucesso
│   │   ├── nivelAcesso.ts        # Níveis de acesso (cliente, colaborador, admin)
│   │   └── statusPedido.ts       # Status dos pedidos
│   │
│   ├── controllers/              # Controladores da API
│   │   ├── AuthController.ts     # Autenticação e login
│   │   ├── DashboardController.ts # Estatísticas e dashboard
│   │   ├── PedidoController.ts   # Gerenciamento de pedidos
│   │   └── UsuarioController.ts  # Gerenciamento de usuários
│   │
│   ├── database/                 # Migrations e seeds
│   │   ├── migrations/           # Criação das tabelas
│   │   │   ├── 001_create_usuarios.ts
│   │   │   ├── 002_create_pedidos.ts
│   │   │   └── 003_create_pedidos_status_log.ts
│   │   └── seeds/                # Dados iniciais
│   │       ├── usuarios.ts
│   │       └── pedidos.ts
│   │
│   ├── dto/                      # Data Transfer Objects (validação de entrada)
│   │   ├── CreatePedidoDto.ts
│   │   ├── CreateUsuarioDto.ts
│   │   ├── LoginDto.ts
│   │   ├── UpdateUsuarioDto.ts
│   │   └── index.ts              # Barrel export
│   │
│   ├── exceptions/               # Erros customizados
│   │   ├── AppError.ts           # Erro base
│   │   ├── NotFoundError.ts      # 404
│   │   ├── UnauthorizedError.ts  # 401
│   │   ├── ValidationError.ts    # 400
│   │   └── index.ts              # Barrel export
│   │
│   ├── middlewares/              # Middlewares do Express
│   │   ├── auth.ts               # Autenticação JWT
│   │   ├── errorHandler.ts       # Tratamento de erros
│   │   ├── logger.ts             # Logs de requisições
│   │   └── validation.ts         # Validação de dados
│   │
│   ├── models/                   # Modelos do banco de dados
│   │   ├── Usuario.ts            # Model de usuários
│   │   ├── Pedido.ts             # Model de pedidos
│   │   ├── PedidoStatusLog.ts    # Model de histórico
│   │   └── index.ts              # Barrel export
│   │
│   ├── routes/                   # Rotas da API REST
│   │   ├── AuthRoutes.ts         # Rotas de autenticação
│   │   ├── DashboardRoutes.ts    # Rotas de dashboard
│   │   ├── PedidoRoutes.ts       # Rotas de pedidos
│   │   ├── UsuarioRoutes.ts      # Rotas de usuários
│   │   └── index.ts              # Centralizador de rotas
│   │
│   ├── services/                 # Lógica de negócio
│   │   ├── AuthService.ts        # Serviço de autenticação
│   │   ├── CronService.ts        # Jobs automáticos (atraso, inatividade)
│   │   ├── DashboardService.ts   # Serviço de estatísticas
│   │   ├── PedidoService.ts      # Serviço de pedidos
│   │   └── UsuarioService.ts     # Serviço de usuários
│   │
│   ├── types/                    # Tipos TypeScript
│   │   ├── Auth.types.ts         # Tipos de autenticação
│   │   ├── Pedido.types.ts       # Tipos de pedidos
│   │   ├── Usuario.types.ts      # Tipos de usuários
│   │   ├── express.d.ts          # Extensões do Express
│   │   └── index.ts              # Barrel export
│   │
│   ├── utils/                    # Funções auxiliares
│   │   ├── date.ts               # Formatação de datas
│   │   ├── jwt.ts                # Geração e validação de JWT
│   │   ├── password.ts           # Hash e comparação de senhas
│   │   ├── validator.ts          # Validações customizadas
│   │   └── index.ts              # Barrel export
│   │
│   ├── cli.ts                    # Interface de linha de comando
│   ├── index.ts                  # Entry point da API
│   └── setup.ts                  # Script de setup do banco
│
├── tests/                        # Testes automatizados
│   ├── integration/              # Testes de integração
│   │   ├── auth.test.ts
│   │   ├── pedido.test.ts
│   │   └── usuario.test.ts
│   └── unit/                     # Testes unitários
│       ├── services/
│       └── utils/
│
├── .env                          # Variáveis de ambiente (não commitado)
├── .env.example                  # Exemplo de configuração
├── .gitattributes                # Configuração do Git
├── .gitignore                    # Arquivos ignorados pelo Git
├── package.json                  # Dependências do projeto
├── package-lock.json             # Lock de dependências
├── README.md                     # Este arquivo
├── SGAM-final.pdf                # Documentação final do projeto
└── tsconfig.json                 # Configuração do TypeScript
```

## 🚀 Como rodar

### Requisitos
- Node.js 16+
- MySQL instalado e rodando

### Passos

1. **Clone o projeto:**
```bash
git clone https://github.com/seu-usuario/sgam.git
cd sgam
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure suas credenciais do MySQL:**
```bash
# Crie o arquivo .env em seu projeto seguindo o ".env.example"
```

4. **Configure o banco de dados:**
```bash
npm run setup
# Isso vai criar o banco e as tabelas automaticamente
# ⚠️ Cuidado: se já existir um banco com o nome, ele será deletado!
```

5. **Inicie o servidor:**
```bash
npm run dev
```

6. **Use a interface que preferir:**

**Interface Web:**
```bash
npm run web
# Abre o HTML no navegador
```

**Interface CLI:**
```bash
npm run cli
# Abre a interface de linha de comando
```

## 📖 O que aprendi até agora

- ✅ Importância de documentar ANTES de codificar (evita retrabalho)
- ✅ Como fazer relacionamentos entre tabelas (Foreign Keys) no MySQL
- ✅ Uso do Knex.js para query builder e migrations
- ✅ Diferença entre regras de negócio e implementação técnica
- ✅ Como organizar permissões por tipo de usuário (RBAC)
- ✅ Fluxos de estado e transições (pedido: pendente → em_andamento → entregue)
- ✅ Desenvolvimento com TypeScript e Express
- ✅ Importância de manter consistência entre múltiplas interfaces
- ✅ Trabalho em equipe usando Git e GitHub (branches, pull requests, code review)
- ✅ Como resolver conflitos de merge e manter o código sincronizado
- ✅ Arquitetura em camadas (Controllers → Services → Models)
- ✅ Uso de DTOs para validação e tipagem forte
- ✅ Tratamento de erros com exceptions customizadas
- ✅ Padrão Barrel Export para imports limpos

## 🤝 Quer contribuir ou dar feedback?

Fique à vontade! Qualquer dica ou sugestão é bem-vinda. Ainda estou aprendendo, então provavelmente tem muita coisa pra melhorar.

💭 **Reflexão pessoal:** Este projeto me ensinou que código limpo começa com planejamento limpo. O tempo investido em documentação não é perda de tempo, é economia de retrabalho. Foi uma experiência valiosa desenvolver um sistema a partir de necessidades reais de uma cliente no contexto do RSTI Backend.
