# PsiFinance Mobile - Design Notes

O PsiFinance é um app mobile-first para uso recorrente em consultório. A interface prioriza leitura rápida, controles grandes para toque e navegação direta pelas cinco áreas principais: início, clientes, sessões, financeiro e relatórios.

## Diretrizes

- Layout limitado a `max-w-md` para simular uma experiência de aplicativo móvel mesmo no desktop.
- Navegação inferior fixa nas telas principais.
- Cartões com raio de borda consistente e sem aninhamento visual desnecessário.
- Botões de ação com ícones da biblioteca `lucide-react`.
- Formulários com feedback inline para evitar falhas silenciosas.
- Textos objetivos, sem blocos explicativos longos dentro da aplicação.

## Identidade

- Nome do produto: `PsiFinance`.
- Foco: gestão financeira e operacional para consultórios.
- Rotas públicas: `/login` e `/cadastro`.
- Rotas protegidas: `/dashboard`, `/clientes`, `/sessoes`, `/transacoes`, `/relatorios` e `/configuracoes`.

## Estados Financeiros

- Cadastro do cliente: `Ativo` ou `Inativo`.
- Pagamento: `Pendente`, `Pago`, `Isento` ou `Estornado`.
- Sessão: `Agendada`, `Realizada`, `Cancelada` ou `Faltou`.

Receitas automáticas são vinculadas à sessão realizada, evitando duplicidade por `sessaoId`.
