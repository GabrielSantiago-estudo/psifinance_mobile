# PsiFinance Mobile

Projeto React + Vite em TypeScript para controle simples de clientes, sessões e finanças.

## O que foi implementado

- Banco de dados local dentro do próprio front-end usando `localStorage`.
- Cadastro funcional de clientes.
- Cadastro funcional de sessões.
- Cadastro funcional de transações.
- Dashboard, relatórios, clientes, sessões e transações alimentados pelos dados salvos.
- Dados iniciais continuam vindo do protótipo para a aplicação não abrir vazia.

## Como rodar

```bash
npm install
npm run dev
```

Depois abra o endereço mostrado no terminal.

## Como testar

1. Entre no app.
2. Cadastre um novo cliente.
3. Cadastre uma nova sessão.
4. Marque "cobrar agora" para gerar receita automaticamente.
5. Cadastre receitas/despesas.
6. Veja os dados atualizando no dashboard, relatórios e listas.

## Observação

Este projeto usa banco local do navegador. Para um projeto simples de faculdade, isso evita precisar configurar servidor, hospedagem de banco ou autenticação real. Para zerar os dados, limpe o armazenamento local do navegador ou use a função `resetDatabase` em `src/app/services/database.ts`.


## Acesso de apresentação

Use o login abaixo para abrir o projeto já alimentado:

- E-mail: `admin@admin`
- Senha: `admin`

O banco local usa `localStorage` e já inicia com 20 clientes, sessões, transações e relatórios prontos para demonstração. A tela de configurações permite alternar modo escuro, modo compacto, notificações, ocultar valores, exportar backup, restaurar dados demo e sair da conta.
