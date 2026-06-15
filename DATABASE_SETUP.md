# Banco de Dados

## Arquivos

- `database/psifinance.sql`: schema PostgreSQL completo com todos os INSERTs.
- `.env.example`: variáveis necessárias para a API local.
- `docker-compose.yml`: PostgreSQL local com importação automática do SQL na primeira subida.

## Opção 1: SQLTools no VS Code

1. Instale as extensões recomendadas pelo VS Code: SQLTools e SQLTools PostgreSQL Driver.
2. Crie o banco no NeonDB, Supabase ou PostgreSQL local.
3. Rode o conteúdo de `database/psifinance.sql` no SQL Editor do provedor ou pelo SQLTools.
4. Copie `.env.example` para `.env` e preencha `DATABASE_URL`.
5. Rode `npm install` para instalar `pg` e `dotenv`.
6. Rode a API em um terminal: `npm run dev:api`.
7. Rode o app em outro terminal: `npm run dev`.

## Opção 2: Docker pelo VS Code

1. Instale a extensão Docker.
2. No painel Docker/Compose, suba o serviço de `docker-compose.yml`.
3. Na primeira inicialização, o Postgres importa `database/psifinance.sql` automaticamente.
4. Use no `.env`:

```env
DATABASE_URL=postgresql://psifinance:psifinance@localhost:5432/psifinance
API_PORT=3001
```

## Fallback: NeonDB ou Supabase SQL Editor

1. Abra o SQL Editor do NeonDB ou Supabase.
2. Cole e execute todo o conteúdo de `database/psifinance.sql`.
3. Copie a connection string PostgreSQL para `DATABASE_URL` no `.env`.
4. Rode `npm install`.
5. Inicie `npm run dev:api` e `npm run dev`.
