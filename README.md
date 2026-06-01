# PsiFinance Mobile

Aplicativo mobile-first em React + Vite para gestão local de clientes, sessões e finanças de um consultório.

## Acesso de apresentação

- E-mail: `admin@admin`
- Senha: `admin`

A autenticação é local e simulada, pensada apenas para demonstração acadêmica.

## Como rodar

```bash
npm install
npm run dev
```

Depois abra o endereço exibido pelo Vite.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run typecheck
```

## Banco local

O app usa `localStorage` como banco de dados local do navegador. Os dados ficam somente na máquina do usuário.

Chaves principais:

- `psifinance_auth_user_v1`: sessão local do usuário.
- `psifinance_db_v3`: clientes, sessões e transações.
- `psifinance_settings_v1`: preferências de interface.

O serviço de dados mantém compatibilidade com chaves antigas e normaliza registros legados ao abrir o app.

## Fluxo financeiro

- Clientes têm status de cadastro separado: `Ativo` ou `Inativo`.
- Status de pagamento fica explícito como `Pendente`, `Pago`, `Isento` ou `Estornado`.
- Sessões novas entram como `Agendada`.
- Ao marcar uma sessão como `Realizada` com valor cobrado maior que zero, o app gera ou atualiza automaticamente uma receita vinculada.
- Se a sessão deixa de ser realizada, a receita automática vinculada é removida.

## Rotas principais

- `/login`
- `/cadastro`
- `/dashboard`
- `/clientes`
- `/clientes/novo`
- `/sessoes`
- `/sessoes/nova`
- `/transacoes`
- `/transacoes/nova`
- `/relatorios`
- `/configuracoes`

Rotas antigas em inglês continuam redirecionando para preservar links anteriores.

## Validações

Os formulários validam campos obrigatórios, telefone brasileiro no formato `+55 (##) #####-####`, e-mail quando preenchido, valor financeiro maior que zero e duplicidade de clientes por e-mail ou telefone.
