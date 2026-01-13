# 📚 Aprendizados - SGAM

> Lições aprendidas durante o desenvolvimento do Sistema de Gerenciamento de Agência de Marketing

## 💡 O Momento de Virada

### **O Problema Inicial**

Comecei o projeto criando três interfaces diferentes (Backend API, CLI e Web) sem planejamento prévio. Cada interface tinha suas próprias regras e comportamentos, resultando em:

- **Inconsistências:** Backend validava de um jeito, CLI de outro, frontend de outro
- **Perda de tempo:** Precisava abrir 3 códigos diferentes para lembrar as regras
- **Bugs frequentes:** Backend aceitava dados que o frontend bloqueava
- **Confusão:** Eu mesmo não sabia mais qual era o comportamento "correto" 😅

### **A Solução**

**Parei de codificar e comecei a documentar.**

Criei uma modelagem de dados completa que serve como **fonte única da verdade** para todas as interfaces. Foi a melhor decisão do projeto!

**Resultado:**
- ✅ Todas as interfaces seguem as mesmas regras
- ✅ Código mais organizado e consistente
- ✅ Qualquer pessoa consegue entender o sistema lendo a documentação
- ✅ Mudanças são planejadas na documentação primeiro, depois implementadas

---

## 🎓 Lições Técnicas

### **1. Modelagem de Dados**
- Documentar ANTES de codificar evita retrabalho brutal
- Uma boa modelagem é a diferença entre "funciona" e "funciona bem"
- Regras de negócio devem estar escritas, não só na cabeça

### **2. Banco de Dados**
- Foreign Keys garantem integridade referencial
- Soft delete (ativo=false) é melhor que DELETE físico para auditoria
- Triggers automatizam regras complexas que seriam esquecidas no código
- ENUM vs Tabelas de Domínio: simplicidade vs flexibilidade

### **3. Arquitetura**
- Separação em camadas (Controllers → Services → Models) facilita manutenção
- DTOs evitam dados inválidos entrarem no sistema
- Exceptions customizadas tornam erros mais claros
- Barrel exports (`index.ts`) deixam imports limpos

### **4. Fluxos de Estado**
- Documentar transições de status evita bugs de lógica
- Máquinas de estado bem definidas facilitam validações
- Automações (jobs, triggers) devem ser documentadas explicitamente

### **5. Permissões (RBAC)**
- Definir permissões por papel (Cliente/Colaborador/Admin) desde o início
- Documentar o que cada nível pode ver e fazer
- Validar permissões no backend, não confiar no frontend

---

## 🏗️ Lições de Arquitetura

### **Organização de Código**
- Cada arquivo deve ter uma responsabilidade única
- Estrutura de pastas autoexplicativa evita confusão
- `src/config`, `src/controllers`, `src/services` → cada camada tem seu lugar
- Não misturar regras de negócio com rotas HTTP

### **Single Source of Truth (SSOT)**
- Mudanças críticas (ex: status de pedidos) devem passar por **uma função central**
- Se você pode esquecer de registrar histórico, sua arquitetura falhou
- Services centralizam lógica, Controllers apenas coordenam

### **Escolha de Tecnologias**
- **Knex vs ORMs:** Query builder dá mais controle, ORMs abstraem demais
- **TypeScript:** Previne bugs em tempo de desenvolvimento, não em produção
- **ENUM no banco:** Validação nativa, mas dificulta mudanças futuras
- Escolha pela necessidade real, não pelo hype

### **Decisões de Design**
- **Recursos Futuros:** Marcar claramente o que é V1 e o que fica pra depois
- Exemplo: Email e inatividade automática → V2 (evita complexidade prematura)
- MVP funcional > Sistema completo que nunca termina

### **Guard Clauses e Proteções**
- Validar estado antes de processar (ex: não processar pedidos já atrasados)
- Prevenir inconsistências com regras fortes (responsavel_id NULL = status pendente)
- Proteções no código evitam dados corrompidos

---

## 🔧 Lições de Processo

### **Trabalho em Equipe**
- Git e GitHub são essenciais: branches, pull requests, code review
- Resolver conflitos de merge faz parte do processo
- Comunicação clara evita retrabalho

### **Documentação**
- README deve ser curto e objetivo (< 5 min de leitura)
- Documentação técnica detalhada vai em `/docs`
- Código limpo começa com planejamento limpo

### **Desenvolvimento**
- TypeScript força você a pensar antes de escrever
- Testes automatizados dão confiança para refatorar
- Convenções de nomenclatura importam (muito!)
- **Planejar arquitetura antes de codificar economiza semanas de refatoração**

---

## 🐛 Erros Que Cometi (e como corrigi)

### **1. Trigger vs Regra de Negócio Duplicada**
**Erro:** Status mudava em 3 lugares diferentes (app, trigger, job)  
**Consequência:** Esquecia de registrar log em alguns casos  
**Correção:** Criar função central que TODA mudança de status passa  
**Lição:** Uma fonte de verdade previne inconsistências

### **2. Foreign Key Inútil**
**Erro:** `responsavel_id ON DELETE SET NULL` nunca disparava  
**Por quê?** Usuários são soft deleted (ativo=false), nunca deletados fisicamente  
**Correção:** Trigger que reage à desativação, não à deleção  
**Lição:** Entender como o sistema funciona de verdade, não só teoria

### **3. Campos Redundantes Sem Uso**
**Erro:** `cancelado_por` e `concluido_por` no pedido + `alterado_por` no log  
**Problema:** Duplicação sem benefício claro  
**Correção:** Se for só para queries rápidas, documentar o motivo  
**Lição:** Toda duplicação precisa justificativa

### **4. Falta de Contexto em Decisões**
**Erro:** Cliente pode cancelar pedido sem justificativa  
**Problema:** Não estava claro se precisa notificar responsável, se impacta métricas  
**Correção:** Documentar impacto e fluxo completo da ação  
**Lição:** Regra de negócio incompleta gera código incompleto

### **5. Status "Atrasado" Sem Proteção**
**Erro:** Job processava pedido atrasado todos os dias  
**Problema:** Gerava logs duplicados  
**Correção:** Guard clause: se já está atrasado, pular  
**Lição:** Proteger contra múltiplas execuções