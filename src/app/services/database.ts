import { useSyncExternalStore } from 'react';
import { Cliente, Sessao, StatusPagamento, Transacao, ValorConsulta } from '../types';
import { getLocalDateInputValue } from '../utils/dates';

export interface DatabaseState {
  valoresConsultas: ValorConsulta[];
  clientes: Cliente[];
  sessoes: Sessao[];
  transacoes: Transacao[];
}

const emptyState: DatabaseState = {
  valoresConsultas: [],
  clientes: [],
  sessoes: [],
  transacoes: [],
};

const listeners = new Set<() => void>();
let state: DatabaseState = emptyState;
let loadingPromise: Promise<void> | null = null;

function emitChange() {
  listeners.forEach((listener) => listener());
}

function normalizeStatusPagamento(status?: StatusPagamento): StatusPagamento {
  if (status === 'Em dia') return 'Pago';
  if (status === 'Inadimplente') return 'Pendente';
  if (status === 'Pago' || status === 'Isento' || status === 'Estornado') return status;
  return 'Pendente';
}

function normalizeCliente(cliente: Cliente): Cliente {
  return {
    ...cliente,
    statusCadastro: cliente.statusCadastro === 'Inativo' ? 'Inativo' : 'Ativo',
    statusPagamento: normalizeStatusPagamento(cliente.statusPagamento),
  };
}

function normalizeTransacoes(transacoes: Transacao[]) {
  const seenAutomaticSessionIds = new Set<string>();

  return transacoes
    .map((transacao) => ({
      ...transacao,
      origem: transacao.origem ?? (transacao.sessaoId ? 'SessaoAutomatica' : 'Manual'),
    }))
    .filter((transacao) => {
      if (!transacao.sessaoId || transacao.origem !== 'SessaoAutomatica') return true;
      if (seenAutomaticSessionIds.has(transacao.sessaoId)) return false;
      seenAutomaticSessionIds.add(transacao.sessaoId);
      return true;
    });
}

function normalizeState(input: Partial<DatabaseState>): DatabaseState {
  const valoresConsultas = Array.isArray(input.valoresConsultas) ? input.valoresConsultas : [];
  const clientes = Array.isArray(input.clientes) ? input.clientes : [];
  const transacoes = normalizeTransacoes(Array.isArray(input.transacoes) ? input.transacoes : []);
  const sessoes = Array.isArray(input.sessoes) ? input.sessoes : [];
  const sessoesComFinanceiro = new Set(
    transacoes
      .filter((transacao) => transacao.origem === 'SessaoAutomatica')
      .map((transacao) => transacao.sessaoId)
      .filter(Boolean)
  );

  return {
    valoresConsultas,
    clientes: clientes.map(normalizeCliente),
    sessoes: sessoes.map((sessao) => {
      const temReceitaVinculada = sessoesComFinanceiro.has(sessao.id);
      const statusPagamento = sessao.statusPagamento
        ?? (sessao.valorCobrado === 0 ? 'Isento' : temReceitaVinculada ? 'Pago' : 'Pendente');

      return {
        ...sessao,
        statusPagamento: normalizeStatusPagamento(statusPagamento),
        financeiroGerado: sessao.status === 'Realizada' && (sessao.financeiroGerado || temReceitaVinculada),
      };
    }),
    transacoes,
  };
}

function setState(next: Partial<DatabaseState>) {
  state = normalizeState(next);
  emitChange();
}

async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? 'Erro ao acessar o banco de dados.');
  }

  return response.json() as Promise<T>;
}

async function loadDatabase() {
  if (loadingPromise) return loadingPromise;

  loadingPromise = apiRequest<DatabaseState>('/api/database')
    .then(setState)
    .finally(() => {
      loadingPromise = null;
    });

  return loadingPromise;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  void loadDatabase().catch((error) => {
    console.error(error);
  });
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return JSON.stringify(state);
}

function createSessaoTransacao(sessao: Sessao): Omit<Transacao, 'id'> {
  return {
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

export function useDatabase() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const currentState = JSON.parse(snapshot) as DatabaseState;

  return {
    ...currentState,

    async refreshDatabase() {
      await loadDatabase();
      return state;
    },

    async addCliente(input: Omit<Cliente, 'id' | 'dataCadastro'> & { dataCadastro?: string }) {
      const cliente = await apiRequest<Cliente>('/api/clientes', {
        method: 'POST',
        body: JSON.stringify({
          dataCadastro: input.dataCadastro ?? getLocalDateInputValue(),
          ...input,
          statusPagamento: normalizeStatusPagamento(input.statusPagamento),
        }),
      });

      setState({
        ...state,
        clientes: [cliente, ...state.clientes],
      });

      return cliente;
    },

    async addSessao(input: Omit<Sessao, 'id' | 'clienteNome'> & { clienteNome?: string }) {
      const sessao = await apiRequest<Sessao>('/api/sessoes', {
        method: 'POST',
        body: JSON.stringify(input),
      });

      setState({
        ...state,
        sessoes: [sessao, ...state.sessoes],
      });

      return sessao;
    },

    async updateCliente(id: string, input: Partial<Omit<Cliente, 'id' | 'dataCadastro'>>) {
      const updated = await apiRequest<Cliente>(`/api/clientes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          ...input,
          statusPagamento: input.statusPagamento ? normalizeStatusPagamento(input.statusPagamento) : undefined,
        }),
      });

      setState({
        ...state,
        clientes: state.clientes.map((cliente) => (cliente.id === id ? updated : cliente)),
        sessoes: input.nome
          ? state.sessoes.map((sessao) =>
              sessao.clienteId === id ? { ...sessao, clienteNome: input.nome as string } : sessao
            )
          : state.sessoes,
        transacoes: input.nome
          ? state.transacoes.map((transacao) =>
              transacao.clienteId === id ? { ...transacao, clienteNome: input.nome as string } : transacao
            )
          : state.transacoes,
      });

      return updated;
    },

    async updateSessao(id: string, input: Partial<Omit<Sessao, 'id' | 'clienteNome'>> & { clienteNome?: string }) {
      const updated = await apiRequest<Sessao & { financeiroMensagem?: string }>(`/api/sessoes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          ...input,
          statusPagamento: input.statusPagamento ? normalizeStatusPagamento(input.statusPagamento) : undefined,
        }),
      });

      await loadDatabase();
      return updated;
    },

    async addTransacao(input: Omit<Transacao, 'id'>) {
      const transacao = await apiRequest<Transacao>('/api/transacoes', {
        method: 'POST',
        body: JSON.stringify({
          origem: input.origem ?? 'Manual',
          ...input,
        }),
      });

      setState({
        ...state,
        transacoes: [transacao, ...state.transacoes],
      });

      return transacao;
    },

    async resetDatabase() {
      await loadDatabase();
      return state;
    },
  };
}
