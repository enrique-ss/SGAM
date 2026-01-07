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

---

## 💭 Reflexão Final

> **"O tempo investido em documentação não é perda de tempo, é economia de retrabalho."**

Este projeto me ensinou que código limpo começa com planejamento limpo. Foi uma experiência valiosa desenvolver um sistema a partir de necessidades reais de uma cliente no contexto do RSTI Backend.

A maior lição: **quando você não sabe mais onde está, pare de andar e olhe o mapa.**