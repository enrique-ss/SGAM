# 🎯 SGAM - Sistema de Gerenciamento de Agência

> Projeto pessoal para aprender backend, banco de dados e integração com frontend

## 🤔 O que é isso?

Um sistema simples de gerenciamento de pedidos que criei para estudar desenvolvimento backend. A ideia é simular uma agência que recebe pedidos de clientes (tipo fazer logo, criar site, etc) e os colaboradores vão assumindo e entregando esses pedidos.

## 💡 Por que fiz isso?

Queria aprender backend na prática, então pensei: "vou fazer um sisteminha real que eu usaria no dia a dia". Comecei fazendo direto no código, mas virou uma bagunça porque:

- O backend tinha umas regras
- O CLI tinha outras regras diferentes
- O frontend web funcionava de outro jeito
- Eu mesmo não lembrava mais como deveria funcionar 😅

Aí parei tudo e fiz uma **documentação completa** antes de continuar codando. Foi a melhor decisão! Agora sei exatamente o que implementar e tudo fica consistente.

## 📚 Documentação

A parte mais importante desse projeto é a **[documentação de modelagem](docs/MODELAGEM.md)**. Lá eu explico:

- Por que decidi fazer essa documentação
- Como funciona o sistema inteiro
- Quais são as regras de cada coisa
- O que cada tipo de usuário pode fazer
- Como os dados se relacionam

Recomendo ler ela antes de mexer no código!

## 🛠️ Tecnologias que estou usando

- **Backend:** Node.js com TypeScript
- **Banco:** MySQL
- **Frontend Web:** HTML, CSS e JavaScript puros (sem frameworks)
- **CLI:** TypeScript (interface de linha de comando)

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

2. **Configure suas credenciais do MySQL:**
```bash
# Edite o arquivo de configuração com seu usuário e senha do MySQL
# Crie um .env utilizando o .env.exemple como base
```

3. **Configure o banco de dados:**
```bash
npm run setup
# Isso vai criar o banco e as tabelas automaticamente
# ⚠️ Cuidado: se já existir um banco com o nome, ele será deletado!
```

4. **Inicie o servidor:**
```bash
npm run dev
```

5. **Use a interface que preferir:**

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

- ✅ Importância de documentar ANTES de codificar
- ✅ Como fazer relacionamentos entre tabelas (Foreign Keys)
- ✅ Diferença entre regras de negócio e implementação técnica
- ✅ Como organizar permissões por tipo de usuário
- ✅ Fluxos de estados

## 🤝 Quer contribuir ou dar feedback?

Fique à vontade! Qualquer dica ou sugestão é bem-vinda. Ainda estou aprendendo, então provavelmente tem muita coisa pra melhorar.
