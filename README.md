# PsiFinance Mobile

Aplicativo mobile-first em React + Vite para gestão local de clientes, sessões e finanças de um consultório.
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
