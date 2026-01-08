## 🧩 PASSO 1: IDENTIFICAR ENTIDADES

**Pergunta:** O que preciso guardar no sistema?

- 👤 **USUARIOS** → Pessoas que usam o sistema
- 📋 **PEDIDOS** → Serviços solicitados
- 📜 **PEDIDOS_STATUS_LOG** → Histórico de mudanças

---

## 📋 PASSO 2: DEFINIR ESTRUTURA DAS TABELAS

### **📦 Tabela: USUARIOS**

| Campo          | Tipo          | Descrição                    | Exemplo              |
|----------------|---------------|------------------------------|----------------------|
| id             | Número        | Identificador único          | 1, 2, 3...           |
| nome           | Texto (255)   | Nome completo                | "João Silva"         |
| email          | Texto (255)   | Email único (login)          | "joao@email.com"     |
| senha          | Texto (255)   | Senha criptografada          | Hash bcrypt          |
| nivel_acesso   | Opções        | cliente, colaborador, admin  | "cliente"            |
| ativo          | Sim/Não       | Pode entrar no sistema?      | true                 |
| ultimo_login   | Data e Hora   | Última vez que entrou        | 2026-01-05 14:30:00  |
| criado_em      | Data e Hora   | Quando foi cadastrado        | 2026-01-01 10:00:00  |
| atualizado_em  | Data e Hora   | Última modificação           | 2026-01-07 09:15:00  |

**⚙️ Valores aceitos (ENUM no backend):**
- `nivel_acesso`: "cliente", "colaborador", "admin" (validação obrigatória)

**Regras de negócio importantes:**
- Email deve ser único (não pode ter dois usuários com mesmo email)
- Senha sempre criptografada com bcrypt (nunca salvar texto puro)
- Ao cadastrar: `nivel_acesso = 'cliente'` e `ativo = true` por padrão
- `atualizado_em` é atualizado automaticamente sempre que o registro muda

### **🔐 Regras de Segurança**

**AO CADASTRAR:**
1. Email único (verifica se já existe)
2. Senha criptografada (bcrypt, nunca texto puro)
3. Valores iniciais automáticos: `nivel_acesso = 'cliente'`, `ativo = true`

**VERIFICAÇÃO DIÁRIA (00:00):**
```
⚠️ RECURSO FUTURO - NÃO IMPLEMENTAR NA V1

Para cada usuário:
  SE nivel_acesso == 'colaborador'
  E ultimo_login > 30 dias
  ENTÃO ativo = false
  
⚡ Admin e Cliente são IMUNES

💡 Por que deixar para depois?
• Pode gerar bloqueios indesejados sem política clara
• Melhor começar com desativação manual pelo admin
• Implementar quando houver necessidade real
```

**AO FAZER LOGIN:**
```
1. Email existe? ✅
2. Senha correta? ✅
3. ativo = false? ❌ Bloquear login com mensagem:
   "Conta desativada. Contate um Administrador."
```

**🚫 DELEÇÃO DE USUÁRIOS:**
```
❌ NUNCA deletar usuários do banco de dados
✅ Apenas marcar como ativo = false (soft delete)

Por quê?
• Preserva integridade dos dados (pedidos, logs)
• Mantém auditoria completa
• Permite reativação futura se necessário
```

---

### **📦 Tabela: PEDIDOS**

| Campo          | Tipo          | Descrição                    | Exemplo              |
|----------------|---------------|------------------------------|----------------------|
| id             | Número        | Identificador único          | 1, 2, 3...           |
| cliente_id     | Número        | Quem solicitou (ID usuário)  | 5                    |
| criado_por     | Número        | Quem criou (ID usuário)      | 12                   |
| responsavel_id | Número        | Quem está fazendo (ID usuário)| 12                  |
| titulo         | Texto (255)   | Nome do pedido               | "Logo Nova"          |
| tipo_servico   | Texto (100)   | Design, Dev, Story, SEO      | "Design"             |
| descricao      | Texto longo   | Detalhes do pedido           | "Logo minimalista..." |
| orcamento      | Dinheiro      | Valor até 99.999.999,99      | 5000.00              |
| prazo_entrega  | Data          | Data limite                  | 2026-01-20           |
| status         | Opções        | Estado atual do pedido       | "em_andamento"       |
| prioridade     | Opções        | baixa, media, alta, urgente  | "alta"               |
| concluido_em   | Data e Hora   | Quando foi finalizado        | 2026-01-20 16:45:00  |
| criado_em      | Data e Hora   | Quando foi criado            | 2026-01-01 10:00:00  |
| atualizado_em  | Data e Hora   | Última modificação           | 2026-01-07 09:15:00  |

**⚙️ Valores aceitos (ENUM no backend):**
- `status`: "pendente", "em_andamento", "atrasado", "entregue", "cancelado"
- `prioridade`: "baixa", "media", "alta", "urgente" (pode ser vazio se status = pendente)

**🔒 Regra de Integridade Crítica:**
```
SE responsavel_id está vazio (NULL)
ENTÃO status DEVE ser 'pendente'

SE responsavel_id está preenchido
ENTÃO status NÃO pode ser 'pendente'

💡 Isso evita inconsistências:
• Pedido com responsável mas status pendente ❌
• Pedido sem responsável mas status em andamento ❌
```

**Regras de negócio importantes:**
- Todos os campos são obrigatórios exceto: `responsavel_id`, `prioridade`, `concluido_em`
- `atualizado_em` é atualizado automaticamente sempre que o registro muda
- `concluido_em` só é preenchido quando status vira 'entregue' ou 'cancelado'

### **📝 Regras ao Criar Pedido**

**CLIENTE cria pedido:**
```
Formulário pede:
  • Título, Tipo Serviço, Descrição, Orçamento, Prazo

Sistema preenche automaticamente:
  • cliente_id = ID do usuário logado
  • criado_por = ID do usuário logado (mesmo que cliente_id)
  • responsavel_id = vazio (ninguém assumiu ainda)
  • status = 'pendente'
  • prioridade = vazio
  
Histórico registra:
  • "Cliente João criou pedido" (status: pendente)
```

**COLABORADOR/ADMIN cria pedido:**
```
Formulário pede:
  • Cliente (escolhe da lista), Título, Tipo, Descrição, Orçamento, Prazo, Prioridade

Sistema preenche automaticamente:
  • cliente_id = cliente escolhido
  • criado_por = ID do colaborador logado
  • responsavel_id = ID do colaborador logado (já assume o pedido)
  • status = 'em_andamento'
  • prioridade = valor escolhido
  
Histórico registra:
  • "Colaborador Maria criou e assumiu pedido" (status: em_andamento)
  
🎯 Uso: Registrar pedidos vindos de fora da plataforma (telefone, email, presencial)

💡 Por que cliente_id ≠ criado_por?
• cliente_id: de quem é o pedido (dono)
• criado_por: quem registrou no sistema (pode ser colaborador ajudando cliente)
```

---

### **📦 Tabela: PEDIDOS_STATUS_LOG**

| Campo           | Tipo        | Descrição                    | Exemplo              |
|-----------------|-------------|------------------------------|----------------------|
| id              | Número      | Identificador único          | 1, 2, 3...           |
| pedido_id       | Número      | Qual pedido (ID pedido)      | 42                   |
| status_anterior | Opções      | Estado antes da mudança      | "pendente"           |
| status_novo     | Opções      | Estado depois da mudança     | "em_andamento"       |
| alterado_por    | Número      | Quem mudou (ID usuário)      | 7                    |
| motivo          | Texto longo | Justificativa da mudança     | "Cliente solicitou cancelamento" |
| alterado_em     | Data e Hora | Quando mudou                 | 2026-01-02 14:30:00  |

**⚙️ Valores aceitos (ENUM no backend):**
- `status_anterior` e `status_novo`: "pendente", "em_andamento", "atrasado", "entregue", "cancelado"

### **🎯 Objetivo**

- **Auditoria:** Saber o que aconteceu com cada pedido
- **Rastreabilidade:** Quem fez cada mudança e quando
- **Histórico permanente:** Log nunca é apagado
- **Justificativas:** Guardar motivos de cancelamentos e decisões administrativas

### **📜 Quando Registra**

```
Criar pedido    → status_anterior = vazio, status_novo = 'pendente' ou 'em_andamento', motivo = vazio
Assumir         → 'pendente' → 'em_andamento', motivo = vazio
Atraso (AUTO)   → 'em_andamento' → 'atrasado', alterado_por = vazio, motivo = "Prazo excedido automaticamente"
Concluir        → 'em_andamento' ou 'atrasado' → 'entregue', motivo = vazio
Cancelar        → qualquer status → 'cancelado', motivo = obrigatório (usuário preenche)

⚡ alterado_por vazio = foi o SISTEMA (automático)
⚡ Job de atraso gera log APENAS UMA VEZ na primeira detecção
⚡ motivo é obrigatório APENAS para cancelamentos
```

---

## 🚦 PASSO 3: DEFINIR FLUXO DE ESTADOS

### **📊 Fluxo de Status**

```
CRIAÇÃO
   ↓
PENDENTE ──assumir──► EM_ANDAMENTO ──concluir──► ENTREGUE
   │                       │
   │                       ├──atraso (auto)──► ATRASADO ──concluir──► ENTREGUE
   │                       │                       │
   └───────cancelar────────┴───────cancelar───────┴──► CANCELADO
```

### **📊 Descrição dos Estados**

| Status           | Descrição                                          | Como chega?                                                   |
|------------------|----------------------------------------------------|---------------------------------------------------------------|
| **📝 PENDENTE**  | Aguardando alguém assumir                          | Cliente cria pedido                                           |
| **🔄 EM_ANDAMENTO** | Alguém assumiu e está trabalhando               | Colab/Admin assume OU Colab/Admin cria (assume automaticamente) |
| **⏰ ATRASADO**  | Passou do prazo, não foi entregue                  | Sistema verifica: data atual > prazo (automático, 00:00)      |
| **✅ ENTREGUE**  | Finalizado e entregue                              | Colaborador conclui                                           |
| **❌ CANCELADO** | Abortado/cancelado                                 | Cliente/Colaborador cancela (de qualquer estado)              |

### **⚠️ Atraso Automático (JOB DIÁRIO 00:00)**

```
Para cada pedido:
  SE status == 'em_andamento'
  E data_atual > prazo_entrega
  E NÃO existe log com status_novo = 'atrasado' para este pedido
  ENTÃO
    • status = 'atrasado'
    • Registra no histórico (alterado_por = vazio, motivo = "Prazo excedido automaticamente")
    
⚡ Log gerado APENAS UMA VEZ na primeira detecção de atraso
⚡ Não gera log repetido nos dias seguintes se pedido continuar atrasado

🛡️ PROTEÇÃO CRÍTICA:
Uma vez que o pedido está 'atrasado', o job não deve mais tocá-lo.
Guard clause: SE status = 'atrasado' → PULAR este pedido (não processar)
```

---

## 🔗 PASSO 4: ESTABELECER RELACIONAMENTOS

### **Como as tabelas se conectam:**

```
USUARIOS ──── PEDIDOS
   │            ├─ cliente_id: quem solicitou o pedido
   │            ├─ criado_por: quem registrou no sistema
   │            ├─ responsavel_id: quem está fazendo o pedido
   │            
   └──── PEDIDOS_STATUS_LOG
                └─ alterado_por: quem mudou o status

PEDIDOS ──── PEDIDOS_STATUS_LOG
              └─ pedido_id: qual pedido foi modificado
```

### **🔄 O que acontece quando usuário é desativado?**

**PROBLEMA RESOLVIDO: Responsável Inativo → Pedidos voltam para Pendente**

Quando um colaborador é desativado (`ativo = false`), o sistema automaticamente:

1. **Remove o responsável dos pedidos dele**
   - `responsavel_id` fica vazio

2. **Muda status para pendente**
   - Pedidos em andamento ou atrasados voltam para 'pendente'

3. **Registra no histórico**
   - "Sistema removeu responsável inativo" (alterado_por = vazio)

**Exemplo prático:**

Maria tem 3 pedidos quando é desativada:

**ANTES:**
| id | titulo      | responsavel_id | status       |
|----|-------------|----------------|--------------|
| 15 | Logo Nova   | 7 (Maria)      | em_andamento |
| 22 | Site Corp   | 7 (Maria)      | em_andamento |
| 29 | Campanha    | 7 (Maria)      | atrasado     |

**Admin desativa Maria** (`ativo = false`)

**DEPOIS (automático):**
| id | titulo      | responsavel_id | status    |
|----|-------------|----------------|-----------|
| 15 | Logo Nova   | vazio          | pendente  |
| 22 | Site Corp   | vazio          | pendente  |
| 29 | Campanha    | vazio          | pendente  |

**Histórico gerado automaticamente:**
| id | pedido_id | status_anterior | status_novo | alterado_por |
|----|-----------|-----------------|-------------|--------------|
| 87 | 15        | em_andamento    | pendente    | vazio (Sistema) |
| 88 | 22        | em_andamento    | pendente    | vazio (Sistema) |
| 89 | 29        | atrasado        | pendente    | vazio (Sistema) |

---

## 🎯 PASSO 5: CENTRALIZAR MUDANÇAS DE STATUS

### **⚠️ REGRA CRÍTICA: Uma Única Forma de Mudar Status**

**PROBLEMA:** Se o status puder ser mudado em vários lugares do código, é fácil esquecer de registrar no histórico ou aplicar regras.

**SOLUÇÃO:** Criar uma função central que SEMPRE é usada para mudar status.

### **📝 Como funciona na prática:**

**Toda mudança de status passa por este fluxo:**

```
┌─────────────────────────────────────────────┐
│  FUNÇÃO: Mudar Status do Pedido             │
├─────────────────────────────────────────────┤
│  Entrada:                                   │
│  • ID do pedido                             │
│  • Novo status                              │
│  • ID do usuário (vazio se for sistema)     │
│  • Motivo (obrigatório se cancelamento)     │
│                                             │
│  Executa:                                   │
│  1. Busca status atual do pedido            │
│  2. Atualiza status no pedido               │
│  3. Atualiza concluido_em (se aplicável)    │
│  4. Registra no histórico (SEMPRE)          │
│     - status_anterior                       │
│     - status_novo                           │
│     - alterado_por                          │
│     - motivo                                │
│     - data/hora                             │
│                                             │
│  Resultado: Garantia de histórico completo  │
└─────────────────────────────────────────────┘
```

**Exemplos de uso:**

```
1. COLABORADOR ASSUME PEDIDO:
   Mudar Status (pedido: 42, novo: 'em_andamento', usuário: 7, motivo: vazio)
   
2. SISTEMA MARCA ATRASO:
   Mudar Status (pedido: 42, novo: 'atrasado', usuário: vazio, motivo: "Prazo excedido automaticamente")
   
3. RESPONSÁVEL DESATIVADO:
   Mudar Status (pedido: 42, novo: 'pendente', usuário: vazio, motivo: "Responsável desativado")
   
4. COLABORADOR CONCLUI:
   Mudar Status (pedido: 42, novo: 'entregue', usuário: 7, motivo: vazio)
   
5. CLIENTE CANCELA:
   Mudar Status (pedido: 42, novo: 'cancelado', usuário: 5, motivo: "Mudança de escopo")
```

**Vantagens:**
- ✅ Impossível esquecer de registrar histórico
- ✅ Todas as regras em um único lugar
- ✅ Fácil de testar e manter
- ✅ Auditoria 100% confiável

---

## 👥 PASSO 6: DEFINIR PERMISSÕES POR NÍVEL

### **🔷 CLIENTE**

| Tela                 | O que vê?                                           | O que pode fazer?              |
|----------------------|-----------------------------------------------------|--------------------------------|
| **📋 Meus Pedidos**  | Seus pedidos (pendente, em_andamento, atrasado)     | Criar, Cancelar (com justificativa) |
| **✅ Minhas Entregas** | Seus pedidos (entregue, cancelado)                | Visualizar                     |
| **👤 Perfil**        | Nome, Email, Senha, Nível (apenas visualiza)        | Editar Nome e Senha            |

**Cancelamento pelo Cliente:**
```
Cliente pode cancelar pedidos com status:
  • pendente
  • em_andamento
  • atrasado

Sistema pede:
  • Motivo do cancelamento (campo obrigatório)
  
Sistema registra:
  • status = 'cancelado'
  • concluido_em = data/hora atual
  • Motivo no histórico
  • Notifica responsável (se houver)
  
⚠️ Útil para: Evitar cancelamentos sem razão, métrica de qualidade
```

---

### **🔷 COLABORADOR**

| Tela                          | O que vê?                                           | O que pode fazer?                   |
|-------------------------------|-----------------------------------------------------|-------------------------------------|
| **📊 Dashboard**              | Estatísticas pessoais e avisos                      | Visualizar                          |
| **📝 Pedidos Pendentes**      | Todos pedidos 'pendente' (sem responsável)          | Assumir, Criar                      |
| **🔄 Meus Pedidos**           | Pedidos que assumiu (em_andamento, atrasado)        | Concluir, Cancelar (com justificativa), Ver Histórico |
| **✅ Finalizados**            | Pedidos que entregou/cancelou                       | Visualizar, Ver Histórico           |
| **👤 Perfil**                 | Nome, Email, Senha, Nível (apenas visualiza)        | Editar Nome e Senha                 |

**Dashboard Colaborador:**

```
📈 ESTATÍSTICAS PESSOAIS:
┌────────────────────────────────────────────────┐
│ Meus Pedidos por Tipo de Serviço              │
├────────────────────────────────────────────────┤
│ Design: 12 pedidos                             │
│ Desenvolvimento: 8 pedidos                     │
│ Storytelling: 5 pedidos                        │
│ SEO: 3 pedidos                                 │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ Meus Pedidos por Status                        │
├────────────────────────────────────────────────┤
│ Em Andamento: 5                                │
│ Atrasados: 2 ⚠️                                │
│ Entregues: 15                                  │
└────────────────────────────────────────────────┘

⚠️ PRÓXIMAS ENTREGAS (ordenadas por prioridade):
┌────┬──────────────┬───────────┬────────────┐
│ id │ titulo       │ prazo     │ prioridade │
├────┼──────────────┼───────────┼────────────┤
│ 42 | Logo Pet Shop│ Amanhã    │ Urgente 🔴 │
│ 38 | Site Empresa │ 3 dias    │ Alta 🟠    │
│ 51 | Banner       │ 1 semana  │ Média 🟡   │
└────┴──────────────┴───────────┴────────────┘

⚠️ MEUS PEDIDOS ATRASADOS:
┌────┬──────────────┬───────────┬─────────────┐
│ id │ titulo       │ prazo     │ dias atraso │
├────┼──────────────┼───────────┼─────────────┤
│ 29 | Campanha     │ 02/01     │ 5 dias      │
│ 33 | Identidade   │ 03/01     │ 4 dias      │
└────┴──────────────┴───────────┴─────────────┘
```

**Histórico (Colaborador):**

O colaborador vê histórico completo APENAS dos pedidos que ele está envolvido:
- Pedidos que ele assumiu
- Pedidos que ele criou (quando cria como colaborador)
- Pedidos que ele entregou ou cancelou

**Exemplo:** Maria acessa histórico do Pedido #42 que ela assumiu:

| id | status_anterior | status_novo  | alterado_por     | alterado_em         |
|----|-----------------|--------------|------------------|---------------------|
| 1  | vazio           | pendente     | João Silva       | 2026-01-01 10:00:00 |
| 2  | pendente        | em_andamento | Maria Costa      | 2026-01-02 14:30:00 |
| 3  | em_andamento    | atrasado     | Sistema          | 2026-01-06 00:00:00 |
| 4  | atrasado        | entregue     | Maria Costa      | 2026-01-10 16:45:00 |

**Cancelamento pelo Colaborador:**
```
Colaborador pode cancelar apenas pedidos que assumiu

Sistema pede:
  • Motivo do cancelamento (campo obrigatório)
  
Sistema registra:
  • status = 'cancelado'
  • concluido_em = data/hora atual
  • Motivo no histórico
  • Notifica cliente
```

---

### **🔷 ADMINISTRADOR**

**O admin é colaborador + gerente. Ele trabalha E gerencia a equipe.**

| Tela                          | O que vê?                                                     | O que pode fazer?                   |
|-------------------------------|---------------------------------------------------------------|-------------------------------------|
| **📊 Dashboard**              | Visão Pessoal (trabalho dele) + Visão Global (equipe)         | Visualizar                          |
| **📝 Pedidos Pendentes**      | Todos pedidos 'pendente'                                      | Assumir, Criar                      |
| **🔄 Meus Pedidos**           | Pedidos que ELE assumiu                                       | Concluir, Cancelar, Ver Histórico   |
| **✅ Finalizados**            | Pedidos que ELE entregou/cancelou                             | Visualizar, Ver Histórico           |
| **👥 Gestão de Clientes**     | Lista de clientes                                             | Editar ativo e nivel_acesso         |
| **👨‍💼 Gestão de Equipe**       | Lista de colaboradores e admins                               | Editar ativo e nivel_acesso         |
| **📋 Todos os Pedidos**       | Todos os pedidos do sistema (de todos)                        | Visualizar, Editar, Ver Histórico   |
| **📊 Relatórios**             | Estatísticas e análises do sistema                            | Visualizar                          |
| **👤 Perfil**                 | Nome, Email, Senha, Nível (apenas visualiza)                  | Editar Nome e Senha                 |

**Dashboard Administrador:**

```
📈 MINHAS ESTATÍSTICAS (como colaborador):
┌────────────────────────────────────────────────┐
│ Meus Pedidos por Tipo de Serviço              │
├────────────────────────────────────────────────┤
│ Design: 8 pedidos                              │
│ Desenvolvimento: 12 pedidos                    │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ Meus Pedidos por Status                        │
├────────────────────────────────────────────────┤
│ Em Andamento: 4                                │
│ Atrasados: 1 ⚠️                                │
│ Entregues: 18                                  │
└────────────────────────────────────────────────┘

⚠️ MINHAS PRÓXIMAS ENTREGAS:
┌────┬──────────────┬───────────┬────────────┐
│ id │ titulo       │ prazo     │ prioridade │
├────┼──────────────┼───────────┼────────────┤
│ 45 | Dashboard    │ 2 dias    │ Alta 🟠    │
│ 52 | API Rest     │ 1 semana  │ Média 🟡   │
└────┴──────────────┴───────────┴────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 ESTATÍSTICAS GLOBAIS DA EQUIPE:
┌────────────────────────────────────────────────┐
│ Visão Geral do Sistema                         │
├────────────────────────────────────────────────┤
│ Total de Pedidos: 65                           │
│ Taxa de Conclusão: 85%                         │
│ Tempo Médio de Entrega: 7 dias                 │
│ Pedidos Atrasados: 3 ⚠️                        │
└────────────────────────────────────────────────┘

👥 PRODUTIVIDADE POR RESPONSÁVEL:
┌──────────────┬─────────────┬──────────────┐
│ responsavel  │ em aberto   │ atrasados    │
├──────────────┼─────────────┼──────────────┤
│ Carlos (EU)  │ 4           │ 1 ⚠️         │
│ Maria Silva  │ 5           │ 1 ⚠️         │
│ João Costa   │ 3           │ 0            │
└──────────────┴─────────────┴──────────────┘

⚠️ ALERTAS DO SISTEMA:
• Pedro Santos - 25 dias sem login (em breve será desativado)
• Carlos Lima - 32 dias sem login (DESATIVADO automaticamente)
```

### **📋 Tela: Todos os Pedidos (Admin)**

**Diferença crucial:** Admin vê pedidos de TODOS, não só os dele.

**Funcionalidades:**
- Visualizar todos os pedidos do sistema (pendentes, em andamento, atrasados, entregues, cancelados)
- Filtrar por status, cliente, responsável, tipo de serviço
- Editar qualquer campo de qualquer pedido
- **Ver histórico completo de qualquer pedido (não só os dele)**

**Exemplo:** Admin vê histórico do Pedido #42 que a Maria assumiu:

```
Pedido #42: Logo Pet Shop
Cliente: João Silva
Responsável: Maria Costa
Status: Entregue

📖 Histórico Completo:
┌────┬─────────────────┬────────────────┬──────────────────┬─────────────────────┬────────────────────────────┐
│ id │ status_anterior │ status_novo    │ alterado_por     │ alterado_em         │ motivo                     │
├────┼─────────────────┼────────────────┼──────────────────┼─────────────────────┼────────────────────────────┤
│ 1  │ vazio           │ pendente       │ João Silva       │ 2026-01-01 10:00:00 │ -                          │
│ 2  │ pendente        │ em_andamento   │ Maria Costa      │ 2026-01-02 14:30:00 │ -                          │
│ 3  │ em_andamento    │ atrasado       │ Sistema          │ 2026-01-06 00:00:00 │ Prazo excedido automaticamente │
│ 4  │ atrasado        │ entregue       │ Maria Costa      │ 2026-01-10 16:45:00 │ -                          │
└────┴─────────────────┴────────────────┴──────────────────┴─────────────────────┴────────────────────────────┘

Linha do tempo:
1. João Silva criou o pedido → status: pendente
2. Maria Costa assumiu o pedido → status: em_andamento
3. Sistema detectou atraso automático → status: atrasado (Prazo excedido automaticamente)
4. Maria Costa concluiu o pedido → status: entregue

💡 Admin vê isso mesmo não sendo o responsável pelo pedido
```

**Cancelamento pelo Admin:**
```
Admin pode cancelar QUALQUER pedido

Sistema pede:
  • Motivo do cancelamento (campo obrigatório)
  
Sistema registra:
  • status = 'cancelado'
  • concluido_em = data/hora atual
  • Motivo no histórico
  • Notifica cliente e responsável (se houver)
```

---

### **📊 Tela: Relatórios (Admin)**

**Funcionalidades:**
- Visualizar estatísticas e análises detalhadas
- Gerar relatórios de desempenho da equipe
- Identificar gargalos e oportunidades de melhoria

**Relatórios disponíveis:**

**1. Ranking de Produtividade**

Quem mais conclui pedidos:
| nome         | pedidos_concluidos |
|--------------|--------------------|
| Maria Costa  | 45                 |
| João Silva   | 32                 |
| Pedro Santos | 28                 |

**2. Taxa de Cancelamento**

Quem mais cancela pedidos (colaboradores):
| nome          | pedidos_cancelados | motivos_principais          |
|---------------|--------------------|-----------------------------|
| João Silva    | 12                 | Escopo mal definido (5)     |
| Ana Oliveira  | 8                  | Cliente não respondeu (4)   |
| Carlos Lima   | 5                  | Falta de recursos (3)       |

💡 Útil para: Identificar problemas recorrentes, treinar equipe

**3. Tempo Médio de Entrega**

Desempenho por pedido concluído:
| id | titulo        | cliente | responsavel | criacao     | conclusao   | dias_total |
|----|---------------|---------|-------------|-------------|-------------|------------|
| 42 | Logo Pet Shop | João    | Maria       | 01/01 10:00 | 10/01 16:45 | 9          |
| 38 | Site Empresa  | Ana     | Pedro       | 28/12 09:00 | 05/01 18:00 | 8          |
| 51 | Banner Promo  | Carlos  | João        | 02/01 14:00 | 08/01 10:00 | 6          |

💡 Útil para: Planejar prazos realistas, identificar colaboradores rápidos/lentos

**4. Análise de Atrasos**

Pedidos que atrasaram:
| id | titulo     | responsavel | prazo | dias_atraso | concluido? |
|----|------------|-------------|-------|-------------|------------|
| 29 | Campanha   | Carlos      | 02/01 | 5           | Não        |
| 33 | Identidade | Ana         | 03/01 | 4           | Não        |
| 18 | Logo Nova  | Maria       | 28/12 | 3           | Sim (entregue) |

💡 Útil para: Identificar sobrecarga de colaboradores, prazos irrealistas

**5. Motivos de Cancelamento (Clientes)**

Por que clientes cancelam:
| motivo                    | quantidade |
|---------------------------|------------|
| Mudança de escopo         | 8          |
| Orçamento insuficiente    | 5          |
| Prazo muito longo         | 3          |
| Encontrou outra solução   | 2          |

💡 Útil para: Melhorar processo de orçamento, ajustar prazos

---

## 🎯 PASSO 7: DEFINIR AÇÕES EM PEDIDOS

### **✅ Assumir Pedido**

```
Quem pode: Colaborador/Admin
Status atual: 'pendente'
Status novo: 'em_andamento'

Sistema atualiza:
  • status = 'em_andamento'
  • responsavel_id = ID do colaborador
  
Histórico registra:
  • "Maria Costa assumiu o pedido"
  • status_anterior = 'pendente'
  • status_novo = 'em_andamento'
  • alterado_por = ID do colaborador
  • motivo = vazio
```

---

### **✅ Concluir Pedido**

```
Quem pode: Colaborador/Admin (apenas o responsável do pedido)
Status atual: 'em_andamento' ou 'atrasado'
Status novo: 'entregue'

Sistema atualiza:
  • status = 'entregue'
  • concluido_em = data/hora atual
  
Histórico registra:
  • "Maria Costa concluiu o pedido"
  • status_anterior = 'em_andamento' ou 'atrasado'
  • status_novo = 'entregue'
  • alterado_por = ID do colaborador
  • motivo = vazio

Sistema notifica:
  • Cliente recebe notificação: "Seu pedido foi entregue!"
```

---

### **❌ Cancelar Pedido**

**CLIENTE pode cancelar:**
```
Status permitidos: 'pendente', 'em_andamento', 'atrasado'
Status novo: 'cancelado'

Sistema pede:
  • Motivo do cancelamento (obrigatório, mínimo 10 caracteres)
  
Sistema atualiza:
  • status = 'cancelado'
  • concluido_em = data/hora atual
  
Histórico registra:
  • "João Silva cancelou o pedido"
  • Motivo: "Mudança de escopo"
  • status_anterior = status atual
  • status_novo = 'cancelado'
  • alterado_por = ID do cliente

Sistema notifica:
  • Responsável recebe notificação (se houver)
```

**COLABORADOR pode cancelar:**
```
Apenas pedidos que ele assumiu
Status permitidos: 'em_andamento', 'atrasado'
Status novo: 'cancelado'

Sistema pede:
  • Motivo do cancelamento (obrigatório, mínimo 10 caracteres)
  
Sistema atualiza:
  • status = 'cancelado'
  • concluido_em = data/hora atual
  
Histórico registra:
  • "Maria Costa cancelou o pedido"
  • Motivo: "Cliente não respondeu contato"
  • status_anterior = status atual
  • status_novo = 'cancelado'
  • alterado_por = ID do colaborador

Sistema notifica:
  • Cliente recebe notificação
```

**ADMIN pode cancelar:**
```
Qualquer pedido
Status permitidos: qualquer (exceto 'entregue' e 'cancelado')
Status novo: 'cancelado'

Sistema pede:
  • Motivo do cancelamento (obrigatório, mínimo 10 caracteres)
  
Sistema atualiza:
  • status = 'cancelado'
  • concluido_em = data/hora atual
  
Histórico registra:
  • "Carlos Admin cancelou o pedido"
  • Motivo: "Decisão administrativa"
  • status_anterior = status atual
  • status_novo = 'cancelado'
  • alterado_por = ID do admin

Sistema notifica:
  • Cliente recebe notificação
  • Responsável recebe notificação (se houver)
```

---

## 🔐 PASSO 8: DEFINIR GESTÃO DE USUÁRIOS

### **👥 Gestão (Admin)**

**Telas:**
- **Gestão de Clientes:** Lista usuários com `nivel_acesso = 'cliente'`
- **Gestão de Equipe:** Lista usuários com `nivel_acesso = 'colaborador'` ou `'admin'`

**O que pode editar:**
- `ativo` (Sim/Não)
- `nivel_acesso` (cliente, colaborador, admin)

**🚫 O que NUNCA pode editar (campos protegidos):**
- `cliente_id` (dono do pedido)
- `criado_por` (quem registrou)
- `criado_em` (data de criação)
- Histórico (PEDIDOS_STATUS_LOG)

**✅ O que pode editar em pedidos:**
- `titulo`, `tipo_servico`, `descricao`
- `orcamento`, `prazo_entrega`, `prioridade`
- `responsavel_id` (transferir para outro colaborador)
- `status` (apenas seguindo regras de transição válidas)

### **🔐 Restrições de Segurança**

```
1. Admin NÃO pode alterar próprio nivel_acesso
   → Evita perder acesso admin acidentalmente

2. Admin NÃO pode desativar própria conta
   → Evita ficar bloqueado do sistema

3. Ao desativar colaborador com pedidos em aberto
   → Sistema avisa: "Este usuário tem X pedidos em aberto que voltarão para pendente"
   → Admin decide se continua
   → Se continuar, pedidos voltam automaticamente para pendente (automação)

4. 🚫 NUNCA permitir deletar usuários
   → Apenas desativação (ativo = false)
   → Preserva integridade dos dados históricos
```

---

## 🔔 PASSO 9: SISTEMA DE NOTIFICAÇÕES

### **Quando enviar notificações:**

| Evento                      | Quem recebe                    | Mensagem                                           |
|-----------------------------|--------------------------------|----------------------------------------------------|
| **Pedido criado (cliente)** | Cliente                        | "Seu pedido foi criado! Aguarde um colaborador assumir." |
| **Pedido assumido**         | Cliente                        | "Maria Costa assumiu seu pedido 'Logo Pet Shop'!" |
| **Pedido concluído**        | Cliente                        | "Seu pedido 'Logo Pet Shop' foi entregue!"        |
| **Pedido cancelado**        | Cliente + Responsável          | "Pedido 'Logo Pet Shop' foi cancelado. Motivo: [motivo]" |
| **Pedido atrasado**         | Responsável + Admin            | "Pedido 'Logo Pet Shop' está atrasado (5 dias)"   |
| **Colaborador desativado**  | Colaborador                    | "Sua conta foi desativada. Seus pedidos foram liberados." |

### **Onde exibir notificações:**

```
🔔 Sino de Notificações (topo da tela)
  • Badge com número de notificações não lidas
  • Dropdown com últimas 10 notificações
  • Link "Ver todas" → Página de notificações
```

### **📧 Email (Recurso Futuro - Não implementar na V1):**

```
⚠️ Deixar para versões futuras

Por quê?
• Requer configuração de servidor SMTP
• Pode virar ruído se mal configurado
• Melhor validar necessidade real com uso
• Notificações in-app são suficientes para começar

💡 Quando implementar:
• Admin pode configurar quais eventos enviam email
• Usuários podem escolher receber ou não
```

---

## 📊 PASSO 10: RESUMO DO FLUXO COMPLETO

### **Jornada do Pedido:**

```
1. CLIENTE CRIA PEDIDO
   └─> status = 'pendente'
   └─> Notifica: "Pedido criado!"

2. COLABORADOR VÊ PEDIDOS PENDENTES
   └─> Lista todos os pedidos sem responsável

3. COLABORADOR ASSUME PEDIDO
   └─> status = 'em_andamento'
   └─> responsavel_id = ID do colaborador
   └─> Notifica cliente: "Maria assumiu seu pedido!"

4. SISTEMA VERIFICA ATRASO (00:00)
   SE prazo passou E status = 'em_andamento'
   └─> status = 'atrasado'
   └─> Notifica responsável e admin: "Pedido atrasado!"

5. COLABORADOR CONCLUI PEDIDO
   └─> status = 'entregue'
   └─> concluido_em = data/hora atual
   └─> Notifica cliente: "Pedido entregue!"

OU

5. ALGUÉM CANCELA PEDIDO
   └─> status = 'cancelado'
   └─> concluido_em = data/hora atual
   └─> Pede motivo (obrigatório)
   └─> Notifica cliente e/ou responsável
```

---

## 🎨 PASSO 11: DECISÕES DE DESIGN E UX

### **Cores por Status:**

| Status       | Cor      | Uso                           |
|--------------|----------|-------------------------------|
| Pendente     | 🔵 Azul  | Badge, cards, filtros         |
| Em Andamento | 🟡 Amarelo | Badge, cards, filtros       |
| Atrasado     | 🔴 Vermelho | Badge, cards, alertas       |
| Entregue     | 🟢 Verde | Badge, cards, filtros         |
| Cancelado    | ⚫ Cinza | Badge, cards, filtros         |

### **Prioridades:**

| Prioridade | Ícone | Cor      |
|------------|-------|----------|
| Urgente    | 🔴    | Vermelho |
| Alta       | 🟠    | Laranja  |
| Média      | 🟡    | Amarelo  |
| Baixa      | 🟢    | Verde    |

### **Cards de Pedidos:**

```
┌─────────────────────────────────────────────┐
│ 🔴 URGENTE                    📝 PENDENTE   │
│                                             │
│ Logo Pet Shop                        #42    │
│ Design • R$ 5.000,00                        │
│                                             │
│ 👤 João Silva                               │
│ 📅 Prazo: Amanhã                            │
│                                             │
│ [Assumir Pedido]                            │
└─────────────────────────────────────────────┘
```

### **Histórico Visual:**

```
Pedido #42: Logo Pet Shop

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 Histórico de Status

🟢 Entregue
   Maria Costa • 10/01/2026 16:45
   "Pedido concluído com sucesso"
   
⬆️

🔴 Atrasado
   Sistema • 06/01/2026 00:00
   "Prazo de entrega excedido"
   
⬆️

🟡 Em Andamento
   Maria Costa • 02/01/2026 14:30
   "Assumiu o pedido"
   
⬆️

🔵 Pendente
   João Silva • 01/01/2026 10:00
   "Pedido criado"
```

---

## ⚙️ PASSO 12: TAREFAS AUTOMÁTICAS DO SISTEMA

### **Job Diário (00:00):**

```
1. VERIFICAR ATRASOS
   Para cada pedido com status = 'em_andamento':
     SE data_atual > prazo_entrega
     E não existe log de atraso para este pedido
     ENTÃO:
       • Mudar status para 'atrasado' (via função central)
       • Enviar notificação para responsável e admin

   🛡️ PROTEÇÃO: Pedidos já 'atrasados' são ignorados (guard clause)
```

### **⚠️ Recurso Futuro - Não implementar na V1:**

```
2. VERIFICAR INATIVIDADE DE COLABORADORES
   Para cada usuário com nivel_acesso = 'colaborador':
     SE ultimo_login > 30 dias
     E ativo = true
     ENTÃO:
       • ativo = false
       • Pedidos dele voltam para 'pendente' (automação)
       • Enviar notificação para o colaborador

💡 Por que deixar para depois?
• Pode gerar bloqueios indesejados sem política clara
• Melhor começar com desativação manual pelo admin
• Implementar quando houver necessidade real de segurança/contrato
```

---

## 🛡️ PASSO 13: REGRAS DE VALIDAÇÃO

### **Ao criar/editar pedido:**

```
✅ Título: obrigatório, mínimo 5 caracteres
✅ Tipo Serviço: obrigatório, uma das opções (Design, Dev, Story, SEO)
✅ Descrição: obrigatório, mínimo 20 caracteres
✅ Orçamento: obrigatório, valor > 0
✅ Prazo: obrigatório, data >= data atual
✅ Cliente: obrigatório (se colab/admin criar)
✅ Prioridade: obrigatória (se colab/admin criar)
```

### **Ao cadastrar usuário:**

```
✅ Nome: obrigatório, mínimo 3 caracteres
✅ Email: obrigatório, formato válido, único
✅ Senha: obrigatório, mínimo 8 caracteres
✅ Confirmação de senha: deve ser igual à senha
```

### **Ao cancelar pedido:**

```
✅ Motivo: obrigatório, mínimo 10 caracteres
```

---

## 📱 PASSO 14: RESPONSIVIDADE

### **O sistema deve funcionar em:**

- 💻 Desktop (1920px+)
- 💻 Laptop (1366px - 1920px)
- 📱 Tablet (768px - 1366px)
- 📱 Mobile (320px - 768px)

### **Adaptações mobile:**

```
📱 Menu lateral → Menu hamburguer (☰)
📱 Tabelas → Cards empilhados
📱 Dashboard → Gráficos simplificados
📱 Formulários → Campos em coluna única
```

---

## 🎯 CONCLUSÃO: CHECKLIST FINAL

### **Funcionalidades Essenciais:**

- ✅ Cadastro e login de usuários
- ✅ 3 níveis de acesso (cliente, colaborador, admin)
- ✅ CRUD de pedidos
- ✅ Sistema de status (5 estados)
- ✅ Histórico completo (log de mudanças com motivos)
- ✅ Dashboard personalizado por nível
- ✅ Gestão de usuários (admin)
- ✅ Relatórios (admin)
- ✅ Notificações in-app
- ✅ Verificação automática de atrasos
- ✅ Pedidos voltam para pendente quando responsável é desativado
- ✅ Campo `concluido_em` para relatórios precisos
- ✅ Campo `criado_por` para rastreabilidade
- ✅ Campo `motivo` no log para justificativas

### **Segurança:**

- ✅ Senhas criptografadas
- ✅ Soft delete (nunca deletar usuários)
- ✅ Validação de permissões
- ✅ Histórico imutável
- ✅ Admin não pode se auto-desativar
- ✅ Admin não pode editar campos protegidos (cliente_id, criado_por, criado_em, histórico)
- ✅ Regra forte: responsavel_id NULL = status pendente obrigatório

### **Experiência do Usuário:**

- ✅ Interface intuitiva
- ✅ Feedback visual (cores, badges)
- ✅ Notificações em tempo real
- ✅ Histórico visual com motivos
- ✅ Responsivo (mobile, tablet, desktop)
- ✅ Centralização de mudança de status (uma função única)

### **Recursos Futuros (V2):**

- ⏳ Notificações por email
- ⏳ Desativação automática por inatividade de 30 dias

---

## 📝 NOTAS FINAIS PARA IMPLEMENTAÇÃO

### **Ordem recomendada de desenvolvimento:**

```
1. Backend básico
   └─> Tabelas, models, migrations
   └─> Função central de mudança de status
   └─> Validações ENUM

2. Autenticação e autorização
   └─> Login, registro
   └─> Middlewares de permissão por nível

3. CRUD de pedidos
   └─> Criar, assumir, concluir, cancelar
   └─> Log automático em cada ação

4. Dashboard e relatórios
   └─> Estatísticas por nível
   └─> Gráficos e tabelas

5. Notificações in-app
   └─> Sistema de notificações
   └─> Badge com contador

6. Job de atraso
   └─> Task agendada diária
   └─> Guard clause para não processar atrasados

7. Gestão de usuários (admin)
   └─> Edição de ativo e nivel_acesso
   └─> Validações de segurança

8. Refinamentos de UX
   └─> Responsividade
   └─> Loading states
   └─> Mensagens de erro/sucesso
```

## 🎯 TECNOLOGIAS ESCOLHIDAS

### **Backend:**
- **Node.js + Express** → Servidor web
- **TypeScript** → JavaScript com tipos
- **MySQL** → Banco de dados
- **Knex.js** → Query builder e migrations
- **bcrypt** → Criptografia de senhas
- **node-cron** → Agendamento de tarefas
- **jsonwebtoken** → Autenticação via tokens

### **Frontend:**
- **HTML5** → Estrutura
- **CSS3** → Estilização
- **JavaScript** → Interatividade