# 📊 MODELAGEM DE DADOS - SGAM

## 🧩 PASSO 1: IDENTIFICAR AS "COISAS" (ENTIDADES)

**Pergunta:** O que preciso guardar no sistema?

Pensando no objetivo do SGAM (gerenciar pedidos de uma agência), temos:

```
👤 PESSOAS que usam o sistema
   (clientes, colaboradores, admins)
   └─► Vão virar a tabela: USUARIOS

📋 SERVIÇOS solicitados pelos clientes
   (pedidos de design, desenvolvimento, etc)
   └─► Vão virar a tabela: PEDIDOS
```

## 📋 PASSO 2: DEFINIR OS CAMPOS DE CADA TABELA

Agora vamos detalhar **o que guardar** sobre cada "coisa" identificada.

### 📦 **Tabela: USUARIOS**

**O que guardar sobre uma pessoa?**

```
┌─────────────────────────────────────┐
│              USUARIOS               │
├─────────────────────────────────────┤
│ 🔑 id            → Identificador    │
│ 👤 nome          → "João Silva"     │
│ 📧 email         → Login único      │
│ 🔒 senha         → Criptografada    │
│ 🎭 nivel_acesso  → Tipo usuário     │
│ ✅ ativo         → Pode entrar?     │
│ 🕐 ultimo_login  → Última vez       │
│ 📅 criado_em     → Quando criou     │
│ 🔄 atualizado_em → Última mudança   │
└─────────────────────────────────────┘
```
**🔐 Regras de Segurança e Cadastro:**

```
📝 AO CADASTRAR UM NOVO USUÁRIO:

1. Email único
   └─► Sistema verifica se o email já existe no banco
   └─► Se existir → Erro: "Email já cadastrado"

2. Senha criptografada
   └─► NUNCA guardar senha em texto puro
   └─► Usar bcrypt para gerar hash
   └─► Exemplo: "senha123" vira "$2a$10$N9qo8uLOickgx2ZMRZoMye..."

3. Valores iniciais automáticos
   └─► nivel_acesso = 'cliente' (sempre)
   └─► ativo = true (sempre)
   └─► criado_em = timestamp atual
```

**⚠️ Regra de Inatividade Automática:**

```
🕐 VERIFICAÇÃO DIÁRIA:

Para cada usuário no banco:
  
  SE nivel_acesso == 'colaborador'
  E ultimo_login > 30 dias atrás
  ENTÃO
    └─► ativo = false
    └─► Conta desativada automaticamente

⚡ IMPORTANTE:
  - Admin e Cliente são IMUNES a essa regra
  - Apenas colaboradores são afetados
  - Objetivo: manter equipe ativa atualizada
```

**🚫 Bloqueio de Acesso:**

```
🔐 AO FAZER LOGIN:

1. Verificar se email existe → ✅
2. Verificar se senha está correta → ✅
3. Verificar se ativo = false → ❌

SE ativo == false:
  └─► Bloquear login
  └─► Mensagem: "Sua conta está desativada. Contate o administrador."
  └─► Não importa se a senha está correta!
```

**Detalhes Técnicos:**

| Campo         | Tipo          | Restrições                    | Por que?                                    |
|---------------|---------------|-------------------------------|---------------------------------------------|
| id            | INT           | PK, AUTO_INCREMENT            | Número único gerado automaticamente         |
| nome          | VARCHAR(255)  | NOT NULL                      | Nome obrigatório, até 255 caracteres        |
| email         | VARCHAR(255)  | NOT NULL, UNIQUE              | Email obrigatório e único (login)           |
| senha         | VARCHAR(255)  | NOT NULL                      | Bcrypt gera hash de 60 chars (sempre hash!) |
| nivel_acesso  | ENUM          | DEFAULT 'cliente'             | Só aceita: admin, colaborador, cliente      |
| ativo         | BOOLEAN       | DEFAULT true                  | true ou false (conta ativa/inativa)         |
| ultimo_login  | TIMESTAMP     | NULL                          | Data/hora do último acesso (pode ser nulo)  |
| criado_em     | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP     | Preenche automaticamente ao criar           |
| atualizado_em | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP     | Atualiza automaticamente ao modificar       |

### 📦 **Tabela: PEDIDOS**

**O que guardar sobre um pedido?**

```
┌─────────────────────────────────────┐
│           PEDIDOS                   │
├─────────────────────────────────────┤
│ 🔑 id             → Identificador   │
│ 👤 cliente_id (FK)   → Quem pediu   │
│ 👤 responsavel_id (FK) → Quem assumiu│
│ 📝 titulo         → "Logo Nova"     │
│ 🏷️ tipo_servico   → "Design"        │
│ 📄 descricao      → Detalhes        │
│ 💰 orcamento      → R$ 5.000        │
│ 📅 prazo_entrega  → 2026-01-20      │
│ 🚦 status         → Estado atual     │
│ ⚡ prioridade     → Importância     │
│ ✅ data_conclusao → Quando acabou   │
│ 📅 criado_em      → Quando criou    │
│ 🔄 atualizado_em  → Última mudança  │
└─────────────────────────────────────┘
```

#### **📝 Regras ao Criar Pedido (CLIENTE):**

```
🆕 QUANDO O CLIENTE CLICA "NOVO PEDIDO":

┌─────────────────────────────────────────┐
│ Formulário de Criação                   │
├─────────────────────────────────────────┤
│ Título:        [__________________] ✅ │ ← Obrigatório
│ Tipo Serviço:  [Design ▼          ] ✅ │ ← Obrigatório
│ Descrição:     [__________________] ✅ │ ← Obrigatório
│ Orçamento:     [R$ _______________] ✅ │ ← Obrigatório
│ Prazo:         [📅 __/__/____     ] ✅ │ ← Obrigatório
│                                         │
│           [ Criar Pedido ]              │
└─────────────────────────────────────────┘

💾 AO CLICAR "CRIAR PEDIDO", O BANCO SALVA:

PEDIDOS:
  ├─► titulo = "valor digitado"           ✅ Obrigatório
  ├─► cliente_id = 3                      🤖 Automático (ID do usuário logado)
  ├─► responsavel_id = NULL               🤖 Automático (ainda não foi assumido)
  ├─► status = 'pendente'                 🤖 Automático (sempre começa assim)
  ├─► tipo_servico = "valor digitado"     ✅ Obrigatório
  ├─► descricao = "valor digitado"        ✅ Obrigatório
  ├─► orcamento = 5000.00                 ✅ Obrigatório
  ├─► prazo_entrega = '2026-01-20'        ✅ Obrigatório
  ├─► prioridade = NULL                   🤖 Automático (NULL por padrão até que o responsável escolha a prioridade)
  └─► criado_em = CURRENT_TIMESTAMP       🤖 Automático (Data atual)
```

#### **📝 Regras ao Criar Pedido (COLABORADOR/ADMINISTRADOR):**

```
🆕 QUANDO COLABORADOR/ADMINISTRADOR CLICA "NOVO PEDIDO":

┌─────────────────────────────────────────┐
│ Formulário de Criação                   │
├─────────────────────────────────────────┤
│ Cliente:       [João Silva ▼      ] ✅ │ ← Obrigatório
│ Título:        [__________________] ✅ │ ← Obrigatório
│ Tipo Serviço:  [Design ▼          ] ✅ │ ← Obrigatório
│ Descrição:     [__________________] ✅ │ ← Obrigatório
│ Orçamento:     [R$ _______________] ✅ │ ← Obrigatório
│ Prazo:         [📅 __/__/____     ] ✅ │ ← Obrigatório
│ Prioridade:    [Alta ▼            ] ✅ │ ← Obrigatório
│                                         │
│           [ Criar Pedido ]              │
└─────────────────────────────────────────┘

💾 AO CLICAR "CRIAR PEDIDO", O BANCO SALVA:

PEDIDOS:
  ├─► cliente_id = 3                      ✅ Obrigatório
  ├─► titulo = "valor digitado"           ✅ Obrigatório
  ├─► tipo_servico = "valor digitado"     ✅ Obrigatório
  ├─► descricao = "valor digitado"        ✅ Obrigatório
  ├─► orcamento = 5000.00                 ✅ Obrigatório
  ├─► prazo_entrega = '2026-01-20'        ✅ Obrigatório
  ├─► prioridade = 'alta'                 ✅ Obrigatório
  ├─► responsavel_id = 5                  🤖 Automático / ✅ Obrigatório (Se for colab = ID do colab logado) (Se for admin = Pode se atribuir como responsável ou escolher outro colaborador/admin)
  ├─► status = 'em_andamento'             🤖 Automático (Por ter responsável)
  └─► criado_em = CURRENT_TIMESTAMP       🤖 Automático (Data atual)

✅ DIFERENÇA CRUCIAL:
  • Cliente: cria pedido → status 'pendente' → aguarda ser assumido
  • Colaborador: cria pedido → JÁ SE TORNA RESPONSÁVEL → status 'em_andamento'
  
🎯 USO PRINCIPAL:
  • Pedidos vindos de fora da plataforma
  • Colaborador registra o pedido no sistema
  • Cliente pode ou não ter conta no sistema
  • Pedido já entra em andamento com responsável definido
  • Designar funções pros colaboradores
```

**Detalhes Técnicos:**

| Campo          | Tipo          | Restrições                    | Por que?                                    |
|----------------|---------------|-------------------------------|---------------------------------------------|
| id             | INT           | PK, AUTO_INCREMENT            | Número único gerado automaticamente         |
| cliente_id     | INT           | FK, NOT NULL                  | **Conecta** com USUARIOS.id (quem criou)    |
| responsavel_id | INT           | FK, NULL                      | **Conecta** com USUARIOS.id (quem assumiu)  |
| titulo         | VARCHAR(255)  | NOT NULL                      | Nome do pedido (obrigatório)                |
| tipo_servico   | VARCHAR(100)  | NOT NULL                      | Categoria Obrigatória: Design, Dev, SEO, Copywriting    
| descricao      | TEXT          | NOT NULL                      | Texto longo obrigatório com detalhes        |
| orcamento      | DECIMAL(10,2) | NOT NULL                      | Valor obrigatório até 99.999.999,99         |
| prazo_entrega  | DATE          | NOT NULL                      | Data limite obrigatória (YYYY-MM-DD)        |
| status         | ENUM          | DEFAULT 'pendente'            | pendente, em_andamento, atrasado, entregue, cancelado 
| prioridade     | ENUM          | NOT NULL                      | baixa, media, alta, urgente (obrigatório)   |
| data_conclusao | TIMESTAMP     | NULL                          | Preenche automaticamente ao finalizar       |
| criado_em      | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP     | Preenche automaticamente ao criar           |
| atualizado_em  | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP     | Atualiza automaticamente ao modificar       |

## 🚦 PASSO 3: ESTADOS E TRANSIÇÕES DO PEDIDO (STATUS)

### **Fluxo de Estados:**

```
PENDENTE:
	• Pedido foi criado e está aguardando alguém assumir
	• Ação: Colaborador clica "Assumir" → status vai para EM_ANDAMENTO

EM_ANDAMENTO:
	• Alguém assumiu o pedido e está trabalhando nele
	• Pode seguir 3 caminhos:
		Automático: Se Data Atual > Prazo → vai para ATRASADO
		Ação: Colaborador clica "Concluir" → vai para ENTREGUE
		Ação: Colaborador/Cliente clica "Cancelar" → vai para CANCELADO

ATRASADO:
	• Pedido passou do prazo mas ainda não foi entregue
	• Ação: Colaborador clica "Concluir" → vai para ENTREGUE

ENTREGUE:
	• Pedido foi finalizado e entregue ao cliente
	• Estado final (não muda mais)

CANCELADO:
	• Pedido foi cancelado antes de ser concluído
	• Pode acontecer de QUALQUER estado (pendente, em_andamento, atrasado)
	• Estado final (não muda mais)

💡 OBSERVAÇÃO:
- CANCELADO pode acontecer de QUALQUER estado (pendente, em_andamento, atrasado)
- ATRASADO não é um "estado final" - o pedido ainda pode ser concluído
```

### **Descrição Detalhada de Cada Estado:**

| Status           | Descrição                                          | Como chega nesse estado?                                    |
|------------------|----------------------------------------------------|-------------------------------------------------------------|
| **📝 PENDENTE**  | Pedido criado, aguardando alguém assumir           | • Cliente cria pedido<br>• Admin/Colab cria pedido          |
| **🔄 EM_ANDAMENTO** | Alguém assumiu e está trabalhando               | • Colaborador clica "Assumir" em pedido pendente            |
| **⏰ ATRASADO**  | Passou do prazo e ainda não foi entregue           | • Sistema verifica: `Data Atual > prazo_entrega`            |
| **✅ ENTREGUE**  | Trabalho finalizado e entregue ao cliente          | • Colaborador clica "Concluir" (em_andamento ou atrasado)   |
| **❌ CANCELADO** | Pedido foi abortado/cancelado                      | • Cliente/Colaborador clica "Cancelar" (qualquer estado)    |

### **⚠️ Regra de Atraso Automático:**

```
🤖 JOB AUTOMÁTICO:

Para cada pedido no banco:
  
  SE status == 'em_andamento'
  E Data Atual > prazo_entrega
  ENTÃO
    └─► status muda para 'atrasado'
    └─► atualizado_em = timestamp atual

📌 EXEMPLO:

Pedido #42:
  • status = 'em_andamento'
  • prazo_entrega = 2026-01-05
  • responsavel_id = 5 (Maria)

🗓️ Dia 2026-01-06:
  └─► Sistema detecta: 06 > 05 ✅
  └─► status muda automaticamente para 'atrasado'
```

## 🔗 PASSO 4: CONECTAR AS TABELAS (RELACIONAMENTOS)

Agora que sabemos **quais campos** cada tabela tem, vamos conectá-las usando **Foreign Keys (FK)**.

### **Por que precisamos de Foreign Keys?**

```
❓ PROBLEMA:

Pedido #1: "Criar Logo"
  └─► Quem criou esse pedido?
  └─► Quem está trabalhando nele?

💡 SOLUÇÃO: Foreign Keys (Chaves Estrangeiras)

  As FKs são campos que "apontam" para registros de outra tabela!
```

### **Relacionamento 1: CLIENTE cria PEDIDO**

```
┌────────────────┐           ┌────────────────┐
│    USUARIOS    │           │    PEDIDOS     │
├────────────────┤           ├────────────────┤
│ 🔑 id = 1      │◄─────────┤ cliente_id = 1 │
│ nome: "João"   │   aponta  │ titulo: "Logo" │
│ email: ...     │           │ status: ...    │
└────────────────┘           └────────────────┘

📖 LEITURA:
"O pedido 'Logo' foi criado pelo usuário João (id=1)"
```

- **Tipo de Relacionamento:** `1:N` (Um para Muitos)
- **1 usuário** pode criar **vários pedidos**
- **1 pedido** pertence a **apenas 1 cliente**

**Exemplo Prático:**

```
João (id=1) cria 3 pedidos:

┌──────────────────────────────────────┐
│ PEDIDOS                              │
├──────┬─────────────┬─────────────────┤
│ id   │ cliente_id  │ titulo          │
├──────┼─────────────┼─────────────────┤
│ 101  │     1       │ "Criar Logo"    │ 
│ 102  │     1       │ "Fazer Site"    │ 
│ 103  │     1       │ "Campanha Ads"  │
└──────┴─────────────┴─────────────────┘

Todos têm cliente_id = 1 (apontam para João)
```

**Regra de Deleção:** `ON DELETE CASCADE`

```
❌ SE deletar João do sistema:
   └─► Todos os pedidos dele também são DELETADOS
   └─► Motivo: Pedido sem cliente não faz sentido
```

### **Relacionamento 2: RESPONSÁVEL assume PEDIDO**

```
┌────────────────┐           ┌────────────────────┐
│    USUARIOS    │           │     PEDIDOS        │
├────────────────┤           ├────────────────────┤
│ 🔑 id = 5      │◄─────────┤ responsavel_id = 5 │
│ nome: "Maria"  │   aponta  │ titulo: "Logo"     │
│ nivel: colab   │           │ status: ...        │
└────────────────┘           └────────────────────┘

📖 LEITURA:
"O pedido 'Logo' está sendo feito pela colaboradora Maria (id=5)"
```

- **Tipo de Relacionamento:** `1:N` (Um para Muitos)
- **1 colaborador** pode assumir **vários pedidos**
- **1 pedido** tem **apenas 1 responsável** (ou nenhum, quando NULL)

**Exemplo Prático:**

```
Maria (id=5) assume 3 pedidos:

┌───────────────────────────────────────────┐
│ PEDIDOS                                   │
├──────┬─────────────┬────────────────┬─────┤
│ id   │ cliente_id  │ responsavel_id │ ... │
├──────┼─────────────┼────────────────┼─────┤
│ 101  │     1       │       5        │ ... │ 
│ 104  │     2       │       5        │ ... │ 
│ 107  │     3       │       5        │ ... │
└──────┴─────────────┴────────────────┴─────┘

Todos têm responsavel_id = 5 (apontam para Maria)
```

**Regra de Deleção:** `ON DELETE SET NULL`

```
❌ SE deletar Maria do sistema:
   └─► Os pedidos dela NÃO são deletados
   └─► Apenas o responsavel_id vira NULL (sem responsável)
   └─► Motivo: O pedido ainda existe, só ficou sem responsável, mas futuramente pode ser assumido por outro
   └─► Status volta para "pendente" e outros colaboradores/administradores podem encontrola-lo na aba de 'Pedidos Pendentes'
```

## 👥 PASSO 5: FUNCIONALIDADES POR NÍVEL DE ACESSO

Agora vamos ver **o que cada tipo de usuário pode fazer** no sistema.

### **🔷 NÍVEL: CLIENTE**

**Telas e Permissões:**

| Tela                 | O que vê?                                           | O que pode fazer?              |
|----------------------|-----------------------------------------------------|--------------------------------|
| **📋 Meus Pedidos**  | Pedidos `pendente`, `em_andamento` e `atrasado`     | Criar novo pedido, Cancelar pedido|
| **✅ Minhas Entregas** | Pedidos `entregue` e `cancelado`                  | Apenas visualizar              |
| **👤 Perfil**        | Nome, Email, Senha, Nível (somente leitura)         | Editar Nome e Senha            |

### **🔷 NÍVEL: COLABORADOR**

**Telas e Permissões:**

| Tela                          | O que vê?                                           | O que pode fazer?                   |
|-------------------------------|-----------------------------------------------------|-------------------------------------|
| **📊 Dashboard**              | Estatísticas pessoais e avisos                      | Apenas visualizar                   |
| **📝 Pedidos Pendentes**      | Lista global de pedidos `pendente` (sem dono)       | Assumir pedido                      |
| **🔄 Meus Pedidos**           | Pedidos que assumiu (`em_andamento` ou `atrasado`)  | Concluir, Cancelar                  |
| **✅ Finalizados**            | Pedidos que entregou/cancelou                       | Apenas visualizar                   |
| **👤 Perfil**                 | Nome, Email, Senha, Nível (somente leitura)         | Editar Nome e Senha                 |

#### **📊 Dashboard - Estatísticas e Avisos:**

```
┌───────────────────────────────────────────────────────┐
│                      📊 DASHBOARD                     │
├───────────────────────────────────────────────────────┤
│                                                       │
│  📈 ESTATÍSTICAS:                                     │
│                                                       │
│  ┌─────────────────────┐  ┌─────────────────────┐     │
│  │  Gráfico Pizza      │  │  Gráfico Barras     │     │
│  │  ───────────────    │  │  ───────────────    │     │
│  │  Pedidos por        │  │  Pedidos por        │     │
│  │  tipo_servico:      │  │  status:            │     │
│  │                     │  │                     │     │
│  │  🎨 Design: 40%    │  │  📝 Pendente: 5     │     │
│  │  💻 Dev: 35%       │  │  🔄 Andamento: 12   │     │
│  │  📱 Mobile: 25%     │  │  ⏰ Atrasado: 3     │     │
│  │                     │  │  ✅ Entregue: 45   │      │
│  └─────────────────────┘  └─────────────────────┘     │
│                                                       │
│  ⚠️ AVISOS:                                           │
│                                                       │
│  📅 PRÓXIMAS ENTREGAS (Definidos pela prioridade):    │
│  ┌───────────────────────────────────────────────┐    │
│  │ 🔴 #42 - Logo Cliente X    | 05/01 | Urgente  │    │
│  │ 🟠 #38 - Site Cliente Y    | 06/01 | Alta     │    │
│  │ 🟡 #51 - Banner Cliente Z  | 08/01 | Média    │    │
│  └───────────────────────────────────────────────┘    │
│                                                       │
│  🚨 PEDIDOS URGENTES (ATRASADOS):                     │
│  ┌───────────────────────────────────────────────┐    │
│  │ 🔴 #29 - Campanha Cliente A | Prazo: 02/01    │    │
│  │ 🔴 #33 - Identidade Cliente B | Prazo: 03/01  │    │
│  └───────────────────────────────────────────────┘    │
│                                                       │
└───────────────────────────────────────────────────────┘
```

### **🔷 NÍVEL: ADMINISTRADOR**

**Telas e Permissões:**

| Tela                          | O que vê?                                                     | O que pode fazer?                   |
|-------------------------------|---------------------------------------------------------------|-------------------------------------|
| **📊 Dashboard**              | Visão Pessoal + Visão Global da Equipe                        | Apenas visualizar                   |
| **📝 Pedidos Pendentes**      | Lista global de pedidos `pendente` (sem dono)                 | Assumir pedido                      |
| **🔄 Meus Pedidos**           | Pedidos que assumiu (`em_andamento` ou `atrasado`)            | Concluir, Cancelar                  |
| **✅ Finalizados**            | Pedidos que entregou/cancelou                                 | Apenas visualizar                   |
| **👥 Gestão de Clientes**     | Lista de usuários com `nivel_acesso = 'cliente'`              | Editar `ativo` e `nivel_acesso`     |
| **👨‍💼 Gestão de Equipe**       | Lista de usuários `nivel_acesso = 'colaborador'` ou `'admin'` | Editar `ativo` e `nivel_acesso`     |
| **📋 Todos os Pedidos**       | Lista completa de todos os pedidos do sistema                 | Visualizar, Editar qualquer campo   |
| **👤 Perfil**                 | Nome, Email, Senha, Nível (somente leitura)                   | Editar Nome e Senha                 |

```
┌───────────────────────────────────────────────────────┐
│                      📊 DASHBOARD                     │
├───────────────────────────────────────────────────────┤
│                                                       │
│  📈 ESTATÍSTICAS PESSOAIS:                            │
│                                                       │
│  ┌─────────────────────┐  ┌─────────────────────┐     │
│  │  Gráfico Pizza      │  │  Gráfico Barras     │     │
│  │  ───────────────    │  │  ───────────────    │     │
│  │  Pedidos por        │  │  Pedidos por        │     │
│  │  tipo_servico:      │  │  status:            │     │
│  │                     │  │                     │     │
│  │  🎨 Design: 40%    │  │  📝 Pendente: 5     │     │
│  │  💻 Dev: 35%       │  │  🔄 Andamento: 12   │     │
│  │  📱 Mobile: 25%     │  │  ⏰ Atrasado: 3     │     │
│  │                     │  │  ✅ Entregue: 45   │      │
│  └─────────────────────┘  └─────────────────────┘     │
│                                                       │
│  ⚠️ AVISOS PESSOAIS:                                  │
│                                                       │
│  📅 PRÓXIMAS ENTREGAS PESSOAIS (Definidos pela prioridade): 
│  ┌───────────────────────────────────────────────┐    │
│  │ 🔴 #42 - Logo Cliente X    | 05/01 | Urgente  │    │
│  │ 🟠 #38 - Site Cliente Y    | 06/01 | Alta     │    │
│  │ 🟡 #51 - Banner Cliente Z  | 08/01 | Média    │    │
│  └───────────────────────────────────────────────┘    │
│                                                       │
│  🚨 PEDIDOS URGENTES PESSOAIS (ATRASADOS):             │
│  ┌───────────────────────────────────────────────┐    │
│  │ 🔴 #29 - Campanha Cliente A | Prazo: 02/01    │    │
│  │ 🔴 #33 - Identidade Cliente B | Prazo: 03/01  │    │
│  └───────────────────────────────────────────────┘    │
│                                                       │
│  📈 ESTATÍSTICAS GLOBAIS DA EQUIPE:                   │
│  ┌─────────────────────────────────────────────┐      │
│  │ 📊 Total de Pedidos: 65                     │      │
│  │ ✅ Taxa de Conclusão: 85%                   │      │
│  │ ⏰ Tempo Médio de Entrega: 7 dias           │      │
│  │ 🚨 Pedidos Atrasados: 3                     │      │
│  └─────────────────────────────────────────────┘      │
│                                                       │
│  👥 VISÃO POR RESPONSÁVEL:                            │
│  ┌───────────────────────────────────────────────┐    │
│  │ Carlos (Admin) | Em Aberto: 4  | Atrasados: 1 │    │
│  │ Maria Silva    | Em Aberto: 5  | Atrasados: 1 │    │
│  │ João Costa     | Em Aberto: 3  | Atrasados: 0 │    │
│  │ Ana Oliveira   | Em Aberto: 7  | Atrasados: 2 │    │
│  └───────────────────────────────────────────────┘    │
│                                                       │
│  ⚠️ ALERTAS DO SISTEMA:                               │
│  ┌───────────────────────────────────────────────┐    │
│  │ 🟡 Pedro Santos - 25 dias sem login           │   │
│  │ 🔴 Carlos Lima - 32 dias sem login (INATIVO)  │   │
│  └───────────────────────────────────────────────┘    │
│                                                       │
│  📊 GRÁFICOS E ESTATÍSTICAS:                          │
│  [Gráficos de pizza e barras como no dashboard do     │
│   colaborador, mostrando distribuição de tipos de     │
│   serviço e status dos pedidos]                       │
│                                                       │
└───────────────────────────────────────────────────────┘
```

## PASSO 6 **🎯 Ações em Pedido**

#### **✅ Ação: "ASSUMIR" Pedido**

```

📋 COLABORADOR MARIA ESTÁ NA TELA "PEDIDOS PENDENTES":

┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
| Título: Logo Pet Shop | Tipo: Logo | Descrição: Fazer uma logo... | Orçamento: 100 | Prazo: 02/12/26 | Cliente: João │
│     [ Assumir ]                                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

👆 Maria clica "Assumir"

↓

💾 BANCO ATUALIZA O PEDIDO #42:

ANTES:
  ├─► status = 'pendente'
  └─► responsavel_id = NULL

DEPOIS:
  ├─► status = 'em_andamento'             ← Mudou
  ├─► responsavel_id = 5                  ← ID da Maria
  └─► atualizado_em = 2026-01-04 15:00:00 ← Timestamp

📋 RESULTADO:
  • Pedido SAI da lista "Pedidos Pendentes"
  • Pedido APARECE em "Meus Pedidos" da Maria
  • João vê o pedido com status "em andamento" em "Meus Pedidos"
```

#### **✅ Ação: "CONCLUIR" Pedido**

```
🔄 MARIA ESTÁ EM "MEUS PEDIDOS (EM ABERTO)":

┌────────────────────────────────────────────────┐
│ #42 | Logo Cliente X | Em Andamento | Alta    │
│     [ Concluir ]  [ Cancelar ]                 │
└────────────────────────────────────────────────┘

👆 Maria clica "Concluir"

↓

💾 BANCO ATUALIZA O PEDIDO #42:

ANTES:
  ├─► status = 'em_andamento'
  └─► data_conclusao = NULL

DEPOIS:
  ├─► status = 'entregue'                       ← Mudou!
  ├─► data_conclusao = 2026-01-10 16:45:00      ← Timestamp do servidor
  └─► atualizado_em = 2026-01-10 16:45:00       ← Timestamp

📋 RESULTADO:
  • Pedido #42 SAI de "Meus Pedidos (Em Aberto)" da Maria
  • Pedido #42 APARECE em "Finalizados" da Maria
  • João vê o pedido em "Minhas Entregas" com status "entregue"
```

---

#### **❌ Ação: "CANCELAR" Pedido**

```
Funciona igual ao "Concluir", mas:

💾 BANCO ATUALIZA:
  ├─► status = 'cancelado'                      ← Diferente!
  ├─► data_conclusao = 2026-01-10 17:00:00      ← Timestamp do servidor
  └─► atualizado_em = 2026-01-10 17:00:00       ← Timestamp

📋 RESULTADO:
  • Pedido SAI de "Meus Pedidos (Em Aberto)"
  • Pedido APARECE em "Finalizados" com status "cancelado"
  • Cliente vê em "Minhas Entregas" com status "cancelado"
```

---



---



---

#### **👥 Gestão de Usuários:**

```
🔐 TELA "GESTÃO DE CLIENTES":

┌─────────────────────────────────────────────────────────────┐
│ ID  │ Nome          │ Email              │ Ativo │ Nível    │
├─────┼───────────────┼────────────────────┼───────┼──────────┤
│ 1   │ João Silva    │ joao@email.com     │  ✅   │ Cliente  │
│ 2   │ Maria Santos  │ maria@email.com    │  ✅   │ Cliente  │
│ 3   │ Pedro Costa   │ pedro@email.com    │  ❌   │ Cliente  │
└─────┴───────────────┴────────────────────┴───────┴──────────┘
         [ Editar ]       [ Editar ]         [ Editar ]

👆 Admin clica "Editar" em Pedro Costa

↓

📝 POPUP APARECE:

┌────────────────────────────────────────┐
│ Editar Usuário: Pedro Costa            │
├────────────────────────────────────────┤
│ Status:                                │
│   ● Ativo                              │
│   ○ Inativo                            │
│                                        │
│ Nível de Acesso:                       │
│   ● Cliente                            │
│   ○ Colaborador                        │
│   ○ Administrador                      │
│                                        │
│     [ Cancelar ]  [ Salvar ]           │
└────────────────────────────────────────┘
```

**🔐 Regras de Segurança:**

```
⚠️ RESTRIÇÕES PARA PROTEGER O SISTEMA:

1. Admin NÃO pode alterar próprio nivel_acesso
   └─► Evita perder acesso admin acidentalmente

2. Admin NÃO pode desativar própria conta
   └─► Evita ficar bloqueado do sistema

3. Ao mudar cliente → colaborador
   └─► Usuário ganha acesso a Dashboard, Pedidos Pendentes, etc

4. Ao mudar colaborador → cliente
   └─► Usuário perde acesso a pedidos de outras pessoas
   └─► Se tiver pedidos em aberto como responsável, avisar!

5. Ao desativar colaborador com pedidos em aberto
   └─► Sistema deve avisar: "Este usuário tem X pedidos em aberto"
   └─► Admin decide se realmente quer desativar
```

---

#### **📊 Dashboard Admin (Visão Completa):**

```
┌───────────────────────────────────────────────────────────┐
│                  📊 DASHBOARD ADMIN                       │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  👤 MEUS PEDIDOS (PESSOAL):                               │
│  ┌─────────────────────────────────────────────┐         │
│  │ 🔄 Em Aberto: 4 pedidos                     │         │
│  │ ⏰ Atrasados: 1 pedido                      │         │
│  │ 📅 Próximas Entregas (7 dias): 2 pedidos   │         │
│  └─────────────────────────────────────────────┘         │
│                                                           │
│  📅 MEUS PRÓXIMOS PRAZOS:                                 │
│  ┌───────────────────────────────────────────────┐       │
│  │ 🔴 #15 - Site Cliente A    | 05/01 | Urgente  │       │
│  │ 🟠 #23 - Logo Cliente B    | 07/01 | Alta     │       │
│  └───────────────────────────────────────────────┘       │
│                                                           │
│  ─────────────────────────────────────────────────────── │
│                                                           │
│  📈 ESTATÍSTICAS GLOBAIS DA EQUIPE:                       │
│  ┌─────────────────────────────────────────────┐         │
│  │ 📊 Total de Pedidos: 65                     │         │
│  │ ✅ Taxa de Conclusão: 85%                   │         │
│  │ ⏰ Tempo Médio de Entrega: 7 dias           │         │
│  │ 🚨 Pedidos Atrasados: 3                     │         │
│  └─────────────────────────────────────────────┘         │
│                                                           │
│  👥 VISÃO POR RESPONSÁVEL:                                │
│  ┌───────────────────────────────────────────────┐       │
│  │ Carlos (Admin) | Em Aberto: 4  | Atrasados: 1 │       │
│  │ Maria Silva    | Em Aberto: 5  | Atrasados: 1 │       │
│  │ João Costa     | Em Aberto: 3  | Atrasados: 0 │       │
│  │ Ana Oliveira   | Em Aberto: 7  | Atrasados: 2 │       │
│  └───────────────────────────────────────────────┘       │
│                                                           │
│  ⚠️ ALERTAS DO SISTEMA:                                   │
│  ┌───────────────────────────────────────────────┐       │
│  │ 🟡 Pedro Santos - 25 dias sem login           │       │
│  │ 🔴 Carlos Lima - 32 dias sem login (INATIVO)  │       │
│  └───────────────────────────────────────────────┘       │
│                                                           │
│  📊 GRÁFICOS E ESTATÍSTICAS:                              │
│  [Gráficos de pizza e barras como no dashboard do        │
│   colaborador, mostrando distribuição de tipos de        │
│   serviço e status dos pedidos]                          │
│                                                           │
└───────────────────────────────────────────────────────────┘

💡 CONCEITO:
O Admin tem DUAS VISÕES no dashboard:
  1. VISÃO PESSOAL (topo): Seus próprios pedidos como colaborador
  2. VISÃO GLOBAL (meio/baixo): Estatísticas de toda a equipe

Isso permite que o Admin:
  ✅ Trabalhe nos próprios pedidos (como colaborador)
  ✅ Monitore o desempenho da equipe toda
  ✅ Identifique gargalos e problemas rapidamente
```

---



---

## 🔄 PASSO 6: WORKFLOW COMPLETO DE UM PEDIDO

Vamos acompanhar o **ciclo de vida completo** de um pedido, do início ao fim.

---

### **📖 Cenário 1: Cliente cria pedido (fluxo normal)**

```
┌─────────────────────────────────────────────────────────────┐
│ PASSO 1: CRIAÇÃO                                            │
└─────────────────────────────────────────────────────────────┘

👤 João (id=3, cliente) faz login
    ↓
📝 Vai em "Meus Pedidos" → clica "Novo Pedido"
    ↓
✍️ Preenche formulário:
    • Título: "Criação de Logo"
    • Tipo: "Design"
    • Descrição: "Logo moderna para empresa de tecnologia"
    • Orçamento: R$ 2.500,00
    • Prazo: 2026-01-20
    • Prioridade: "alta"
    ↓
💾 BANCO DE DADOS recebe INSERT:

INSERT INTO PEDIDOS (
  cliente_id,
  responsavel_id,
  titulo,
  tipo_servico,
  descricao,
  orcamento,
  prazo_entrega,
  prioridade,
  status,
  criado_em
) VALUES (
  3,                          ← ID do João (automático)
  NULL,                       ← Ainda não foi assumido
  'Criação de Logo',
  'Design',
  'Logo moderna para empresa de tecnologia',
  2500.00,
  '2026-01-20',
  'alta',
  'pendente',                 ← Status inicial (automático)
  '2026-01-04 14:30:00'       ← Timestamp (automático)
);

↓

📋 PEDIDO #42 FOI CRIADO!
    • João vê em "Meus Pedidos" com status "pendente"
    • Todos os colaboradores veem em "Pedidos Pendentes"


┌─────────────────────────────────────────────────────────────┐
│ PASSO 2: ASSUMINDO O PEDIDO                                 │
└─────────────────────────────────────────────────────────────┘

👨‍💼 Maria (id=5, colaboradora) faz login
    ↓
👀 Vai em "Pedidos Pendentes"
    ↓
📋 Vê o pedido #42 "Criação de Logo" criado por João
    ↓
🎯 Clica "Assumir"
    ↓
💾 BANCO DE DADOS recebe UPDATE:

UPDATE PEDIDOS
SET
  responsavel_id = 5,          ← ID da Maria
  status = 'em_andamento',     ← Mudou de 'pendente'
  atualizado_em = '2026-01-04 15:00:00'
WHERE id = 42;

↓

📋 RESULTADO:
    • Pedido #42 SAI da lista "Pedidos Pendentes"
    • Maria vê em "Meus Pedidos (Em Aberto)"
    • João vê status mudou para "em andamento"


┌─────────────────────────────────────────────────────────────┐
│ PASSO 3: TRABALHANDO NO PEDIDO                              │
└─────────────────────────────────────────────────────────────┘

[Maria trabalha na logo durante 6 dias...]

📅 Dia 2026-01-05: Tudo bem, dentro do prazo
📅 Dia 2026-01-10: Logo ficou pronta!


┌─────────────────────────────────────────────────────────────┐
│ PASSO 4: CONCLUINDO O PEDIDO                                │
└─────────────────────────────────────────────────────────────┘

👨‍💼 Maria vai em "Meus Pedidos (Em Aberto)"
    ↓
✅ Clica "Concluir" no pedido #42
    ↓
💾 BANCO DE DADOS recebe UPDATE:

UPDATE PEDIDOS
SET
  status = 'entregue',                   ← Finalizado!
  data_conclusao = '2026-01-10 16:45:00', ← Timestamp do servidor
  atualizado_em = '2026-01-10 16:45:00'
WHERE id = 42;

↓

📋 RESULTADO FINAL:
    • Maria vê em "Finalizados" com status "entregue"
    • João vê em "Minhas Entregas" com status "entregue"
    • Pedido concluído em 6 dias (dentro do prazo ✅)
```

---

### **📖 Cenário 2: Pedido atrasa (fluxo com problema)**

```
┌─────────────────────────────────────────────────────────────┐
│ SITUAÇÃO INICIAL                                            │
└─────────────────────────────────────────────────────────────┘

📋 Pedido #55:
  ├─► cliente_id = 8 (Ana)
  ├─► responsavel_id = 5 (Maria)
  ├─► titulo = "Desenvolvimento de Site"
  ├─► status = 'em_andamento'
  ├─► prazo_entrega = '2026-01-05'
  └─► prioridade = 'alta'


┌─────────────────────────────────────────────────────────────┐
│ DIA 2026-01-06 às 00:00 - JOB AUTOMÁTICO RODA              │
└─────────────────────────────────────────────────────────────┘

🤖 SISTEMA VERIFICA TODOS OS PEDIDOS:

Para pedido #55:
  └─► status == 'em_andamento'? ✅ SIM
  └─► Data Atual (06) > prazo_entrega (05)? ✅ SIM

↓

💾 BANCO DE DADOS recebe UPDATE:

UPDATE PEDIDOS
SET
  status = 'atrasado',                   ← Mudou automaticamente!
  atualizado_em = '2026-01-06 00:00:01'
WHERE id = 55;

↓

📋 RESULTADO:
  • Status mudou de 'em_andamento' para 'atrasado'
  • Pedido aparece em VERMELHO no Dashboard de Maria
  • Pedido aparece em "Urgentes" no Dashboard
  • Ana (cliente) vê status "atrasado" em "Meus Pedidos"


┌─────────────────────────────────────────────────────────────┐
│ DIA 2026-01-08 - MARIA TERMINA O TRABALHO                  │
└─────────────────────────────────────────────────────────────┘

👨‍💼 Maria clica "Concluir" no pedido #55
    ↓
💾 BANCO DE DADOS recebe UPDATE:

UPDATE PEDIDOS
SET
  status = 'entregue',                   ← Entregue com atraso!
  data_conclusao = '2026-01-08 10:30:00',
  atualizado_em = '2026-01-08 10:30:00'
WHERE id = 55;

↓

📋 RESULTADO FINAL:
  • Pedido foi concluído 3 dias APÓS o prazo (08 - 05 = 3)
  • Maria vê em "Finalizados"
  • Ana vê em "Minhas Entregas" com data de conclusão
  • Admin pode analisar: entregue, mas atrasado
```

---

### **📖 Cenário 3: Colaborador cria pedido (WhatsApp)**

```
┌─────────────────────────────────────────────────────────────┐
│ CRIAÇÃO POR COLABORADOR (Pedido externo)                   │
└─────────────────────────────────────────────────────────────┘

📱 CONTEXTO:
  • Cliente ligou no WhatsApp pedindo um serviço
  • Colaborador Maria quer registrar no sistema

👨‍💼 Maria (id=5, colaboradora) faz login
    ↓
📝 Vai em "Pedidos Pendentes" → clica "Novo Pedido"
    ↓
🔽 FORMULÁRIO COMPLETO:

┌───────────────────────────────────────┐
│ Cliente:      [João Silva ▼     ] ✅ │ ← Dropdown de clientes
│ Título:       [Manutenção Site  ] ✅ │
│ Tipo Serviço: [Desenvolvimento  ] ✅ │
│ Descrição:    [Correção bugs... ] ✅ │
│ Orçamento:    [R$ 1.500,00      ] ✅ │
│ Prazo:        [2026-01-10       ] ✅ │
│ Prioridade:   [Urgente ▼        ] ✅ │
└───────────────────────────────────────┘

✍️ Maria preenche:
    • Cliente: João Silva (id=3)
    • Título: "Manutenção Site"
    • Tipo: "Desenvolvimento"
    • Descrição: "Correção de bugs no checkout"
    • Orçamento: R$ 1.500,00
    • Prazo: 2026-01-10
    • Prioridade: "urgente"
    ↓
💾 BANCO DE DADOS recebe INSERT:

INSERT INTO PEDIDOS (
  cliente_id,
  responsavel_id,
  titulo,
  tipo_servico,
  descricao,
  orcamento,
  prazo_entrega,
  prioridade,
  status,
  criado_em
) VALUES (
  3,                          ← João (selecionado pela Maria)
  5,                          ← ID da Maria (automático!)
  'Manutenção Site',
  'Desenvolvimento',
  'Correção de bugs no checkout',
  1500.00,
  '2026-01-10',
  'urgente',
  'em_andamento',             ← JÁ COMEÇA EM ANDAMENTO!
  '2026-01-04 10:00:00'
);

↓

📋 RESULTADO:
  • Pedido #67 criado
  • Maria JÁ É A RESPONSÁVEL (não precisa assumir)
  • Pedido JÁ ESTÁ "em andamento"
  • João vê em "Meus Pedidos" com status "em andamento"
  • Pedido NÃO aparece em "Pedidos Pendentes" (já foi assumido)
  
🎯 VANTAGEM:
  • Pedidos externos entram direto no fluxo de trabalho
  • Colaborador que registrou já se torna responsável
  • Centraliza TODOS os pedidos em um único sistema
```

---

## 🛡️ PASSO 7: VALIDAÇÕES E REGRAS DE SEGURANÇA

Agora vamos ver **todas as validações** que o sistema deve fazer.

---

### **🔐 Validações no Banco de Dados (SQL):**

```sql
-- 1. Email único (não pode repetir)
CREATE UNIQUE INDEX idx_email ON USUARIOS(email);

-- 2. Foreign Keys com regras de deleção
ALTER TABLE PEDIDOS
  ADD CONSTRAINT fk_cliente
    FOREIGN KEY (cliente_id)
    REFERENCES USUARIOS(id)
    ON DELETE CASCADE;           ← Deleta pedidos se deletar cliente

ALTER TABLE PEDIDOS
  ADD CONSTRAINT fk_responsavel
    FOREIGN KEY (responsavel_id)
    REFERENCES USUARIOS(id)
    ON DELETE SET NULL;          ← Apenas remove responsável

-- 3. Valores válidos de ENUM
ALTER TABLE USUARIOS
  ADD CONSTRAINT check_nivel
    CHECK (nivel_acesso IN ('admin', 'colaborador', 'cliente'));

ALTER TABLE PEDIDOS
  ADD CONSTRAINT check_status
    CHECK (status IN ('pendente', 'em_andamento', 'atrasado', 'entregue', 'cancelado'));

ALTER TABLE PEDIDOS
  ADD CONSTRAINT check_prioridade
    CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente'));

-- 4. Orçamento positivo
ALTER TABLE PEDIDOS
  ADD CONSTRAINT check_orcamento
    CHECK (orcamento > 0);
```

---

### **✅ Validações na Aplicação (Backend):**

```javascript
// 1. Ao criar pedido (qualquer usuário)
function validarCriacaoPedido(dados) {
  // Campos obrigatórios
  if (!dados.titulo || dados.titulo.trim() === '') {
    throw new Error('Título é obrigatório');
  }
  
  if (!dados.tipo_servico) {
    throw new Error('Tipo de serviço é obrigatório');
  }
  
  if (!dados.descricao || dados.descricao.trim() === '') {
    throw new Error('Descrição é obrigatória');
  }
  
  if (!dados.orcamento || dados.orcamento <= 0) {
    throw new Error('Orçamento deve ser maior que zero');
  }
  
  if (!dados.prazo_entrega) {
    throw new Error('Prazo de entrega é obrigatório');
  }
  
  if (!dados.prioridade) {
    throw new Error('Prioridade é obrigatória');
  }
  
  // Prazo deve ser data futura
  const prazo = new Date(dados.prazo_entrega);
  const hoje = new Date();
  
  if (prazo < hoje) {
    throw new Error('Prazo de entrega deve ser uma data futura');
  }
  
  return true;
}

// 2. Ao editar pedido (verificar permissões)
function validarEdicaoPedido(usuario, pedido, alteracoes) {
  // Cliente só pode editar seus próprios pedidos
  if (usuario.nivel_acesso === 'cliente') {
    if (pedido.cliente_id !== usuario.id) {
      throw new Error('Você não tem permissão para editar este pedido');
    }
    
    // Cliente não pode alterar status ou responsável
    if (alteracoes.status || alteracoes.responsavel_id) {
      throw new Error('Você não pode alterar estes campos');
    }
  }
  
  // Colaborador só pode editar pedidos que assumiu
  if (usuario.nivel_acesso === 'colaborador') {
    if (pedido.responsavel_id !== usuario.id) {
      throw new Error('Você só pode editar pedidos que assumiu');
    }
  }
  
  // Admin pode editar qualquer coisa
  return true;
}

// 3. Ao assumir pedido
function validarAssumirPedido(usuario, pedido) {
  // Apenas colaboradores podem assumir
  if (usuario.nivel_acesso !== 'colaborador' && usuario.nivel_acesso !== 'admin') {
    throw new Error('Apenas colaboradores podem assumir pedidos');
  }
  
  // Pedido deve estar pendente
  if (pedido.status !== 'pendente') {
    throw new Error('Este pedido já foi assumido');
  }
  
  return true;
}

// 4. Ao concluir pedido
function validarConcluirPedido(usuario, pedido) {
  // Deve ser o responsável
  if (pedido.responsavel_id !== usuario.id && usuario.nivel_acesso !== 'admin') {
    throw new Error('Apenas o responsável pode concluir este pedido');
  }
  
  // Pedido deve estar em andamento ou atrasado
  if (pedido.status !== 'em_andamento' && pedido.status !== 'atrasado') {
    throw new Error('Este pedido não pode ser concluído no estado atual');
  }
  
  return true;
}

// 5. Ao cancelar pedido
function validarCancelarPedido(usuario, pedido) {
  // Cliente pode cancelar seus próprios pedidos
  if (usuario.nivel_acesso === 'cliente' && pedido.cliente_id !== usuario.id) {
    throw new Error('Você só pode cancelar seus próprios pedidos');
  }
  
  // Não pode cancelar pedidos já finalizados
  if (pedido.status === 'entregue' || pedido.status === 'cancelado') {
    throw new Error('Este pedido já foi finalizado');
  }
  
  return true;
}
```

---

## 📊 PASSO 8: QUERIES SQL IMPORTANTES

Consultas SQL que você vai usar frequentemente no sistema.

---

### **1️⃣ Listar Pedidos Pendentes (Para Colaboradores)**

```sql
-- Mostra todos os pedidos esperando ser assumidos
SELECT 
  p.id,
  p.titulo,
  p.tipo_servico,
  p.prioridade,
  p.prazo_entrega,
  u.nome AS cliente_nome,
  p.criado_em
FROM PEDIDOS p
INNER JOIN USUARIOS u ON p.cliente_id = u.id
WHERE p.status = 'pendente'
ORDER BY 
  FIELD(p.prioridade, 'urgente', 'alta', 'media', 'baixa'),
  p.prazo_entrega ASC;
```

---

### **2️⃣ Listar Meus Pedidos Em Aberto (Para Colaborador)**

```sql
-- Mostra pedidos que o colaborador assumiu e ainda não finalizou
SELECT 
  p.id,
  p.titulo,
  p.tipo_servico,
  p.status,
  p.prioridade,
  p.prazo_entrega,
  u.nome AS cliente_nome,
  DATEDIFF(p.prazo_entrega, CURDATE()) AS dias_restantes
FROM PEDIDOS p
INNER JOIN USUARIOS u ON p.cliente_id = u.id
WHERE p.responsavel_id = ? -- ID do colaborador logado
  AND p.status IN ('em_andamento', 'atrasado')
ORDER BY 
  p.status = 'atrasado' DESC,
  p.prazo_entrega ASC;
```

---

### **3️⃣ Listar Meus Pedidos (Para Cliente)**

```sql
-- Mostra pedidos do cliente que ainda não foram concluídos
SELECT 
  p.id,
  p.titulo,
  p.tipo_servico,
  p.status,
  p.prioridade,
  p.prazo_entrega,
  u.nome AS responsavel_nome,
  p.criado_em
FROM PEDIDOS p
LEFT JOIN USUARIOS u ON p.responsavel_id = u.id
WHERE p.cliente_id = ? -- ID do cliente logado
  AND p.status IN ('pendente', 'em_andamento', 'atrasado')
ORDER BY p.criado_em DESC;
```

---

### **4️⃣ Dashboard - Estatísticas Globais (Para Admin)**

```sql
-- Total de pedidos por status
SELECT 
  status,
  COUNT(*) AS total
FROM PEDIDOS
GROUP BY status;

-- Taxa de conclusão
SELECT 
  ROUND((COUNT(CASE WHEN status = 'entregue' THEN 1 END) * 100.0 / COUNT(*)), 2) AS taxa_conclusao
FROM PEDIDOS;

-- Tempo médio de entrega (em dias)
SELECT 
  ROUND(AVG(DATEDIFF(data_conclusao, criado_em)), 1) AS tempo_medio_dias
FROM PEDIDOS
WHERE status = 'entregue';

-- Pedidos atrasados
SELECT COUNT(*) AS total_atrasados
FROM PEDIDOS
WHERE status = 'atrasado';
```

---

### **5️⃣ Dashboard - Pedidos por Responsável (Para Admin)**

```sql
-- Visão geral da carga de trabalho de cada colaborador (INCLUINDO O PRÓPRIO ADMIN)
SELECT 
  u.id,
  u.nome,
  u.nivel_acesso,
  COUNT(CASE WHEN p.status IN ('em_andamento', 'atrasado') THEN 1 END) AS em_aberto,
  COUNT(CASE WHEN p.status = 'atrasado' THEN 1 END) AS atrasados,
  COUNT(CASE WHEN p.status = 'entregue' THEN 1 END) AS concluidos
FROM USUARIOS u
LEFT JOIN PEDIDOS p ON u.id = p.responsavel_id
WHERE u.nivel_acesso IN ('colaborador', 'admin')
  AND u.ativo = true
GROUP BY u.id, u.nome, u.nivel_acesso
ORDER BY em_aberto DESC;
```

---

### **5.1️⃣ Dashboard - Meus Pedidos Pessoais (Para Admin)**

```sql
-- Estatísticas pessoais do admin (como colaborador)
SELECT 
  COUNT(CASE WHEN status IN ('em_andamento', 'atrasado') THEN 1 END) AS meus_em_aberto,
  COUNT(CASE WHEN status = 'atrasado' THEN 1 END) AS meus_atrasados,
  COUNT(CASE WHEN status = 'entregue' THEN 1 END) AS meus_concluidos,
  COUNT(CASE WHEN status IN ('em_andamento', 'atrasado') 
             AND prazo_entrega BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) 
             THEN 1 END) AS proximas_entregas_7dias
FROM PEDIDOS
WHERE responsavel_id = ?; -- ID do admin logado

-- Próximos prazos do admin (7 dias)
SELECT 
  p.id,
  p.titulo,
  p.prioridade,
  p.prazo_entrega,
  u.nome AS cliente_nome,
  DATEDIFF(p.prazo_entrega, CURDATE()) AS dias_restantes
FROM PEDIDOS p
INNER JOIN USUARIOS u ON p.cliente_id = u.id
WHERE p.responsavel_id = ? -- ID do admin logado
  AND p.status IN ('em_andamento', 'atrasado')
  AND p.prazo_entrega BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
ORDER BY p.prazo_entrega ASC;
```

---

### **6️⃣ Atualizar Pedidos Atrasados (Job Automático)**

```sql
-- Roda diariamente para marcar pedidos atrasados
UPDATE PEDIDOS
SET 
  status = 'atrasado',
  atualizado_em = CURRENT_TIMESTAMP
WHERE status = 'em_andamento'
  AND prazo_entrega < CURDATE();
```

---

### **7️⃣ Desativar Colaboradores Inativos (Job Automático)**

```sql
-- Roda diariamente para desativar colaboradores sem login há 30+ dias
UPDATE USUARIOS
SET 
  ativo = false,
  atualizado_em = CURRENT_TIMESTAMP
WHERE nivel_acesso = 'colaborador'
  AND ultimo_login < DATE_SUB(CURDATE(), INTERVAL 30 DAY)
  AND ativo = true;
```

---

### **8️⃣ Buscar Pedidos (Filtro Genérico)**

```sql
-- Busca com múltiplos filtros
SELECT 
  p.id,
  p.titulo,
  p.tipo_servico,
  p.status,
  p.prioridade,
  p.prazo_entrega,
  c.nome AS cliente_nome,
  r.nome AS responsavel_nome
FROM PEDIDOS p
INNER JOIN USUARIOS c ON p.cliente_id = c.id
LEFT JOIN USUARIOS r ON p.responsavel_id = r.id
WHERE 1=1
  -- Filtros opcionais (aplicar conforme necessário)
  AND (? IS NULL OR p.status = ?)
  AND (? IS NULL OR p.prioridade = ?)
  AND (? IS NULL OR p.tipo_servico = ?)
  AND (? IS NULL OR p.cliente_id = ?)
  AND (? IS NULL OR p.responsavel_id = ?)
ORDER BY p.criado_em DESC;
```

---

## 🎨 PASSO 9: ESTRUTURA DE CÓDIGO SQL COMPLETA

Script SQL completo para criar o banco de dados do zero.

---

```sql
-- ============================================
-- SGAM - Sistema de Gerenciamento de Agência
-- Script de Criação do Banco de Dados
-- ============================================

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS sgam_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE sgam_db;

-- ============================================
-- TABELA: USUARIOS
-- ============================================

CREATE TABLE USUARIOS (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  nivel_acesso ENUM('admin', 'colaborador', 'cliente') DEFAULT 'cliente',
  ativo BOOLEAN DEFAULT true,
  ultimo_login TIMESTAMP NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Índices para melhor performance
  INDEX idx_nivel_acesso (nivel_acesso),
  INDEX idx_ativo (ativo),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: PEDIDOS
-- ============================================

CREATE TABLE PEDIDOS (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  responsavel_id INT NULL,
  titulo VARCHAR(255) NOT NULL,
  tipo_servico VARCHAR(100) NOT NULL,
  descricao TEXT NOT NULL,
  orcamento DECIMAL(10,2) NOT NULL,
  prazo_entrega DATE NOT NULL,
  status ENUM('pendente', 'em_andamento', 'atrasado', 'entregue', 'cancelado') DEFAULT 'pendente',
  prioridade ENUM('baixa', 'media', 'alta', 'urgente') NOT NULL,
  data_conclusao TIMESTAMP NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  CONSTRAINT fk_cliente 
    FOREIGN KEY (cliente_id) 
    REFERENCES USUARIOS(id) 
    ON DELETE CASCADE,
    
  CONSTRAINT fk_responsavel 
    FOREIGN KEY (responsavel_id) 
    REFERENCES USUARIOS(id) 
    ON DELETE SET NULL,
  
  -- Constraints
  CONSTRAINT check_orcamento CHECK (orcamento > 0),
  
  -- Índices para melhor performance
  INDEX idx_cliente (cliente_id),
  INDEX idx_responsavel (responsavel_id),
  INDEX idx_status (status),
  INDEX idx_prioridade (prioridade),
  INDEX idx_prazo (prazo_entrega),
  INDEX idx_tipo_servico (tipo_servico)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DADOS INICIAIS (SEED)
-- ============================================

-- Inserir usuário admin padrão
-- Senha: admin123 (hash bcrypt)
INSERT INTO USUARIOS (nome, email, senha, nivel_acesso) VALUES
('Administrador', 'admin@sgam.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin');

-- Inserir alguns usuários de exemplo
INSERT INTO USUARIOS (nome, email, senha, nivel_acesso) VALUES
('Maria Silva', 'maria@sgam.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'colaborador'),
('João Costa', 'joao@sgam.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'colaborador'),
('Ana Oliveira', 'ana@cliente.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'cliente'),
('Pedro Santos', 'pedro@cliente.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'cliente');
```

---

## 📝 RESUMO FINAL DA MODELAGEM

### **✅ O que foi definido:**

1. **2 Tabelas principais:**
   - `USUARIOS` (pessoas que usam o sistema)
   - `PEDIDOS` (serviços solicitados)

2. **Relacionamentos:**
   - 1 Cliente → N Pedidos (1:N)
   - 1 Responsável → N Pedidos (1:N)

3. **Status do Pedido:**
   - `pendente` → `em_andamento` → `entregue`
   - `pendente` → `em_andamento` → `atrasado` → `entregue`
   - `cancelado` (pode acontecer de qualquer status)

4. **Níveis de Acesso:**
   - **Cliente:** Cria pedidos, vê seus pedidos
   - **Colaborador:** Assume pedidos, trabalha neles
   - **Admin:** Gerencia tudo (usuários + pedidos)

5. **Regras Automáticas:**
   - Pedidos atrasam automaticamente se passar do prazo
   - Colaboradores são desativados após 30 dias sem login
   - Pedidos são deletados se o cliente for deletado
   - Responsável é removido se o colaborador for deletado

6. **Campos Obrigatórios ao Criar Pedido:**
   - Todos os campos são obrigatórios ou preenchidos automaticamente
   - Não há campos opcionais no formulário

7. **Diferença Cliente vs Colaborador/Admin ao Criar:**
   - **Cliente:** Cria pedido → `status = pendente` → aguarda ser assumido
   - **Colab/Admin:** Cria pedido → `responsavel_id = próprio ID` → `status = em_andamento`

---

## 🎯 PRÓXIMOS PASSOS

Agora que a modelagem está completa, você pode:

1. **Criar o Banco de Dados:**
   - Executar o script SQL fornecido
   - Testar conexões e inserções

2. **Desenvolver o Backend:**
   - Criar API REST (Node.js + Express)
   - Implementar autenticação (JWT)
   - Criar rotas para cada operação

3. **Desenvolver o Frontend:**
   - Criar interface (React, Vue, etc)
   - Implementar telas por nível de acesso
   - Conectar com a API

4. **Implementar Jobs Automáticos:**
   - Job para marcar pedidos atrasados
   - Job para desativar colaboradores inativos
   - Agendar execução diária (Cron)

5. **Testes e Deploy:**
   - Testar todos os fluxos
   - Realizar testes de segurança
   - Fazer deploy em produção

---

**🎉 Documentação Completa!**

Agora você tem toda a base teórica e prática para desenvolver o SGAM do zero! 💪