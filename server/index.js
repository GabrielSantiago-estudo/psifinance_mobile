import 'dotenv/config';
import http from 'node:http';
import { URL } from 'node:url';
import { query, withTransaction } from './db.js';

const port = Number(process.env.API_PORT ?? 3001);

function sendJson(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(body));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      if (!data) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function normalizeStatusPagamento(status) {
  if (status === 'Em dia') return 'Pago';
  if (status === 'Inadimplente') return 'Pendente';
  if (status === 'Pago' || status === 'Isento' || status === 'Estornado') return status;
  return 'Pendente';
}

function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function mapValorConsulta(row) {
  return {
    tipo: row.tipo,
    valor: Number(row.valor),
    sessoes: row.sessoes ?? undefined,
    validade: row.validade ?? undefined,
  };
}

function mapCliente(row) {
  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    telefone: row.telefone,
    dataCadastro: row.data_cadastro,
    statusCadastro: row.status_cadastro,
    statusPagamento: row.status_pagamento,
    observacoes: row.observacoes ?? undefined,
  };
}

function mapSessao(row) {
  return {
    id: row.id,
    clienteId: row.cliente_id,
    clienteNome: row.cliente_nome,
    data: row.data,
    hora: row.hora,
    duracao: row.duracao,
    tipoConsulta: row.tipo_consulta,
    status: row.status,
    statusPagamento: row.status_pagamento ?? undefined,
    observacoes: row.observacoes ?? undefined,
    valorCobrado: row.valor_cobrado === null ? undefined : Number(row.valor_cobrado),
    financeiroGerado: row.financeiro_gerado ?? undefined,
  };
}

function mapTransacao(row) {
  return {
    id: row.id,
    tipo: row.tipo,
    categoria: row.categoria,
    tipoConsulta: row.tipo_consulta ?? undefined,
    descricao: row.descricao,
    valor: Number(row.valor),
    data: row.data,
    clienteId: row.cliente_id ?? undefined,
    clienteNome: row.cliente_nome ?? undefined,
    sessaoId: row.sessao_id ?? undefined,
    origem: row.origem ?? undefined,
    recorrente: row.recorrente ?? undefined,
    frequencia: row.frequencia ?? undefined,
  };
}

async function getDatabaseState(client = { query }) {
  const [valores, clientes, sessoes, transacoes] = await Promise.all([
    client.query('SELECT tipo, valor, sessoes, validade FROM valores_consultas ORDER BY array_position($1::text[], tipo), tipo', [
      ['Avaliação', 'Sessão Avulsa', 'Pacote Mensal', 'Pacote Trimestral', 'Retorno'],
    ]),
    client.query('SELECT id, nome, email, telefone, data_cadastro::text, status_cadastro, status_pagamento, observacoes FROM clientes ORDER BY regexp_replace(id, $1, $2)::integer', ['\\D', '', 'g']),
    client.query('SELECT id, cliente_id, cliente_nome, data::text, to_char(hora, $1) AS hora, duracao, tipo_consulta, status, status_pagamento, observacoes, valor_cobrado, financeiro_gerado FROM sessoes ORDER BY regexp_replace(id, $2, $3)::integer', ['HH24:MI', '\\D', '', 'g']),
    client.query('SELECT id, tipo, categoria, tipo_consulta, descricao, valor, data::text, cliente_id, cliente_nome, sessao_id, origem, recorrente, frequencia FROM transacoes ORDER BY regexp_replace(id, $1, $2)::integer', ['\\D', '', 'g']),
  ]);

  return {
    valoresConsultas: valores.rows.map(mapValorConsulta),
    clientes: clientes.rows.map(mapCliente),
    sessoes: sessoes.rows.map(mapSessao),
    transacoes: transacoes.rows.map(mapTransacao),
  };
}

function createSessaoTransacao(sessao) {
  return {
    id: createId('tra'),
    tipo: 'Receita',
    categoria: 'Consultas',
    tipoConsulta: sessao.tipoConsulta,
    descricao: `Consulta - ${sessao.clienteNome}`,
    valor: sessao.valorCobrado ?? 0,
    data: sessao.data,
    clienteId: sessao.clienteId,
    clienteNome: sessao.clienteNome,
    sessaoId: sessao.id,
    origem: 'SessaoAutomatica',
  };
}

async function insertTransacao(client, input) {
  const id = input.id ?? createId('tra');
  const result = await client.query(
    `INSERT INTO transacoes (id, tipo, categoria, tipo_consulta, descricao, valor, data, cliente_id, cliente_nome, sessao_id, origem, recorrente, frequencia)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING id, tipo, categoria, tipo_consulta, descricao, valor, data::text, cliente_id, cliente_nome, sessao_id, origem, recorrente, frequencia`,
    [
      id,
      input.tipo,
      input.categoria,
      input.tipoConsulta ?? null,
      input.descricao,
      input.valor,
      input.data,
      input.clienteId ?? null,
      input.clienteNome ?? null,
      input.sessaoId ?? null,
      input.origem ?? 'Manual',
      input.recorrente ?? null,
      input.frequencia ?? null,
    ],
  );

  return mapTransacao(result.rows[0]);
}

async function handleRequest(req, res) {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const parts = url.pathname.split('/').filter(Boolean);

  try {
    if (req.method === 'GET' && url.pathname === '/api/database') {
      sendJson(res, 200, await getDatabaseState());
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/clientes') {
      const input = await readJson(req);
      const id = input.id ?? createId('cli');
      const result = await query(
        `INSERT INTO clientes (id, nome, email, telefone, data_cadastro, status_cadastro, status_pagamento, observacoes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, nome, email, telefone, data_cadastro::text, status_cadastro, status_pagamento, observacoes`,
        [
          id,
          input.nome,
          input.email ?? '',
          input.telefone,
          input.dataCadastro,
          input.statusCadastro,
          normalizeStatusPagamento(input.statusPagamento),
          input.observacoes ?? null,
        ],
      );
      sendJson(res, 201, mapCliente(result.rows[0]));
      return;
    }

    if (req.method === 'PATCH' && parts[0] === 'api' && parts[1] === 'clientes' && parts[2]) {
      const input = await readJson(req);
      const updated = await withTransaction(async (client) => {
        const current = await client.query('SELECT nome FROM clientes WHERE id = $1', [parts[2]]);
        if (current.rowCount === 0) return null;

        const result = await client.query(
          `UPDATE clientes
           SET nome = COALESCE($2, nome),
               email = COALESCE($3, email),
               telefone = COALESCE($4, telefone),
               status_cadastro = COALESCE($5, status_cadastro),
               status_pagamento = COALESCE($6, status_pagamento),
               observacoes = $7
           WHERE id = $1
           RETURNING id, nome, email, telefone, data_cadastro::text, status_cadastro, status_pagamento, observacoes`,
          [
            parts[2],
            input.nome ?? null,
            input.email ?? null,
            input.telefone ?? null,
            input.statusCadastro ?? null,
            input.statusPagamento ? normalizeStatusPagamento(input.statusPagamento) : null,
            input.observacoes ?? null,
          ],
        );

        if (input.nome) {
          await client.query('UPDATE sessoes SET cliente_nome = $2 WHERE cliente_id = $1', [parts[2], input.nome]);
          await client.query('UPDATE transacoes SET cliente_nome = $2 WHERE cliente_id = $1', [parts[2], input.nome]);
        }

        return mapCliente(result.rows[0]);
      });

      if (!updated) {
        sendJson(res, 404, { error: 'Cliente não encontrado.' });
        return;
      }

      sendJson(res, 200, updated);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/sessoes') {
      const input = await readJson(req);
      const id = input.id ?? createId('ses');
      const clienteNome = input.clienteNome ?? (await query('SELECT nome FROM clientes WHERE id = $1', [input.clienteId])).rows[0]?.nome ?? 'Cliente não informado';
      const result = await query(
        `INSERT INTO sessoes (id, cliente_id, cliente_nome, data, hora, duracao, tipo_consulta, status, status_pagamento, observacoes, valor_cobrado, financeiro_gerado)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING id, cliente_id, cliente_nome, data::text, to_char(hora, 'HH24:MI') AS hora, duracao, tipo_consulta, status, status_pagamento, observacoes, valor_cobrado, financeiro_gerado`,
        [
          id,
          input.clienteId,
          clienteNome,
          input.data,
          input.hora,
          input.duracao,
          input.tipoConsulta,
          input.status,
          normalizeStatusPagamento(input.statusPagamento),
          input.observacoes ?? null,
          input.valorCobrado ?? null,
          input.financeiroGerado ?? null,
        ],
      );
      sendJson(res, 201, mapSessao(result.rows[0]));
      return;
    }

    if (req.method === 'PATCH' && parts[0] === 'api' && parts[1] === 'sessoes' && parts[2]) {
      const input = await readJson(req);
      const updated = await withTransaction(async (client) => {
        const current = await client.query(
          `SELECT id, cliente_id, cliente_nome, data::text, to_char(hora, 'HH24:MI') AS hora, duracao, tipo_consulta, status, status_pagamento, observacoes, valor_cobrado, financeiro_gerado
           FROM sessoes WHERE id = $1`,
          [parts[2]],
        );
        if (current.rowCount === 0) return null;

        const clienteNome = input.clienteNome
          ?? (input.clienteId ? (await client.query('SELECT nome FROM clientes WHERE id = $1', [input.clienteId])).rows[0]?.nome : undefined)
          ?? current.rows[0].cliente_nome;

        const result = await client.query(
          `UPDATE sessoes
           SET cliente_id = COALESCE($2, cliente_id),
               cliente_nome = $3,
               data = COALESCE($4, data),
               hora = COALESCE($5, hora),
               duracao = COALESCE($6, duracao),
               tipo_consulta = COALESCE($7, tipo_consulta),
               status = COALESCE($8, status),
               status_pagamento = COALESCE($9, status_pagamento),
               observacoes = $10,
               valor_cobrado = COALESCE($11, valor_cobrado)
           WHERE id = $1
           RETURNING id, cliente_id, cliente_nome, data::text, to_char(hora, 'HH24:MI') AS hora, duracao, tipo_consulta, status, status_pagamento, observacoes, valor_cobrado, financeiro_gerado`,
          [
            parts[2],
            input.clienteId ?? null,
            clienteNome,
            input.data ?? null,
            input.hora ?? null,
            input.duracao ?? null,
            input.tipoConsulta ?? null,
            input.status ?? null,
            input.statusPagamento ? normalizeStatusPagamento(input.statusPagamento) : null,
            input.observacoes ?? null,
            input.valorCobrado ?? null,
          ],
        );

        let sessao = mapSessao(result.rows[0]);
        const linked = await client.query('SELECT id FROM transacoes WHERE sessao_id = $1 LIMIT 1', [sessao.id]);
        const hasLinkedTransacao = linked.rowCount > 0;
        const shouldHaveRevenue = sessao.status === 'Realizada' && (sessao.valorCobrado ?? 0) > 0;
        let financeiroMensagem;

        if (shouldHaveRevenue) {
          sessao = { ...sessao, financeiroGerado: true };
          await client.query('UPDATE sessoes SET financeiro_gerado = TRUE WHERE id = $1', [sessao.id]);

          const transacaoInput = createSessaoTransacao(sessao);
          if (hasLinkedTransacao) {
            await client.query(
              `UPDATE transacoes
               SET tipo = $2, categoria = $3, tipo_consulta = $4, descricao = $5, valor = $6, data = $7, cliente_id = $8, cliente_nome = $9, origem = $10
               WHERE sessao_id = $1`,
              [
                sessao.id,
                transacaoInput.tipo,
                transacaoInput.categoria,
                transacaoInput.tipoConsulta,
                transacaoInput.descricao,
                transacaoInput.valor,
                transacaoInput.data,
                transacaoInput.clienteId,
                transacaoInput.clienteNome,
                transacaoInput.origem,
              ],
            );
            financeiroMensagem = 'Receita atualizada.';
          } else {
            await insertTransacao(client, transacaoInput);
            financeiroMensagem = 'Receita gerada automaticamente.';
          }
        } else {
          const statusPagamento = (sessao.valorCobrado ?? 0) === 0 ? 'Isento' : sessao.statusPagamento;
          sessao = { ...sessao, financeiroGerado: false, statusPagamento };
          await client.query('UPDATE sessoes SET financeiro_gerado = FALSE, status_pagamento = $2 WHERE id = $1', [sessao.id, statusPagamento]);

          if (hasLinkedTransacao) {
            await client.query('DELETE FROM transacoes WHERE sessao_id = $1', [sessao.id]);
            financeiroMensagem = 'Receita removida porque a sessão deixou de ser realizada.';
          }
        }

        return { ...sessao, financeiroMensagem };
      });

      if (!updated) {
        sendJson(res, 404, { error: 'Sessão não encontrada.' });
        return;
      }

      sendJson(res, 200, updated);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/transacoes') {
      const input = await readJson(req);
      const clienteNome = input.clienteNome
        ?? (input.clienteId ? (await query('SELECT nome FROM clientes WHERE id = $1', [input.clienteId])).rows[0]?.nome : undefined);
      const transacao = await withTransaction((client) => insertTransacao(client, { ...input, clienteNome }));
      sendJson(res, 201, transacao);
      return;
    }

    sendJson(res, 404, { error: 'Rota não encontrada.' });
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: error.message ?? 'Erro interno.' });
  }
}

http.createServer(handleRequest).listen(port, () => {
  console.log(`PsiFinance API listening on http://localhost:${port}`);
});
