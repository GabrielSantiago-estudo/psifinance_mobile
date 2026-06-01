import { useSyncExternalStore } from 'react';
import { Cliente, Sessao, StatusPagamento, Transacao } from '../types';
import { mockClientes, mockSessoes, mockTransacoes } from '../data/mockData';
import { getLocalDateInputValue } from '../utils/dates';

const STORAGE_KEY = 'psifinance_db_v3';
const LEGACY_STORAGE_KEYS = ['psifinance_db_v2', 'psifinance_db_v1'];

export interface DatabaseState {
  clientes: Cliente[];
  sessoes: Sessao[];
  transacoes: Transacao[];
}

const listeners = new Set<() => void>();

const initialState: DatabaseState = {
  clientes: mockClientes,
  sessoes: mockSessoes,
  transacoes: mockTransacoes,
};

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
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
  const clientes = Array.isArray(input.clientes) ? input.clientes : initialState.clientes;
  const transacoes = normalizeTransacoes(Array.isArray(input.transacoes) ? input.transacoes : initialState.transacoes);
  const sessoes = Array.isArray(input.sessoes) ? input.sessoes : initialState.sessoes;
  const sessoesComFinanceiro = new Set(
    transacoes
      .filter((transacao) => transacao.origem === 'SessaoAutomatica')
      .map((transacao) => transacao.sessaoId)
      .filter(Boolean)
  );

  return {
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

function readState(): DatabaseState {
  if (!isBrowser()) return normalizeState(initialState);

  const saved = window.localStorage.getItem(STORAGE_KEY)
    ?? LEGACY_STORAGE_KEYS.map((key) => window.localStorage.getItem(key)).find(Boolean);
  if (!saved) {
    const normalized = normalizeState(initialState);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  }

  try {
    const parsed = JSON.parse(saved) as Partial<DatabaseState>;
    const normalized = normalizeState(parsed);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch {
    const normalized = normalizeState(initialState);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  }
}

function writeState(updater: (state: DatabaseState) => DatabaseState) {
  const next = normalizeState(updater(readState()));
  if (isBrowser()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return JSON.stringify(readState());
}

function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function createSessaoTransacao(sessao: Sessao): Transacao {
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

export function useDatabase() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const state = JSON.parse(snapshot) as DatabaseState;

  return {
    ...state,

    addCliente(input: Omit<Cliente, 'id' | 'dataCadastro'> & { dataCadastro?: string }) {
      const cliente: Cliente = {
        id: createId('cli'),
        dataCadastro: input.dataCadastro ?? getLocalDateInputValue(),
        ...input,
        statusPagamento: normalizeStatusPagamento(input.statusPagamento),
      };

      writeState((current) => ({
        ...current,
        clientes: [cliente, ...current.clientes],
      }));

      return cliente;
    },

    addSessao(input: Omit<Sessao, 'id' | 'clienteNome'> & { clienteNome?: string }) {
      const current = readState();
      const cliente = current.clientes.find((item) => item.id === input.clienteId);
      const sessao: Sessao = {
        id: createId('ses'),
        clienteNome: input.clienteNome ?? cliente?.nome ?? 'Cliente não informado',
        statusPagamento: input.statusPagamento ?? (input.valorCobrado === 0 ? 'Isento' : 'Pendente'),
        ...input,
      };

      writeState((state) => ({
        ...state,
        sessoes: [sessao, ...state.sessoes],
      }));

      return sessao;
    },

    updateCliente(id: string, input: Partial<Omit<Cliente, 'id' | 'dataCadastro'>>) {
      let updated: Cliente | undefined;

      writeState((state) => ({
        ...state,
        clientes: state.clientes.map((cliente) => {
          if (cliente.id !== id) return cliente;
          updated = { ...cliente, ...input, statusPagamento: normalizeStatusPagamento(input.statusPagamento ?? cliente.statusPagamento) };
          return updated;
        }),
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
      }));

      return updated;
    },

    updateSessao(id: string, input: Partial<Omit<Sessao, 'id' | 'clienteNome'>> & { clienteNome?: string }) {
      let updated: (Sessao & { financeiroMensagem?: string }) | undefined;
      const current = readState();
      const cliente = input.clienteId
        ? current.clientes.find((item) => item.id === input.clienteId)
        : undefined;

      writeState((state) => {
        let generatedTransacao: Transacao | undefined;
        let shouldSyncLinkedTransacao = false;
        let shouldRemoveLinkedTransacao = false;
        const hasLinkedTransacao = state.transacoes.some((transacao) => transacao.sessaoId === id);

        const sessoes = state.sessoes.map((sessao) => {
          if (sessao.id !== id) return sessao;

          updated = {
            ...sessao,
            ...input,
            clienteNome: input.clienteNome ?? cliente?.nome ?? sessao.clienteNome,
            statusPagamento: normalizeStatusPagamento(input.statusPagamento ?? sessao.statusPagamento),
          };

          const shouldHaveRevenue = updated.status === 'Realizada' && (updated.valorCobrado ?? 0) > 0;

          if (shouldHaveRevenue) {
            updated = {
              ...updated,
              financeiroGerado: true,
            };

            if (hasLinkedTransacao) {
              shouldSyncLinkedTransacao = true;
              updated.financeiroMensagem = 'Receita atualizada.';
            } else {
              generatedTransacao = createSessaoTransacao(updated);
              updated.financeiroMensagem = 'Receita gerada automaticamente.';
            }
          } else {
            updated = {
              ...updated,
              financeiroGerado: false,
              statusPagamento: (updated.valorCobrado ?? 0) === 0 ? 'Isento' : updated.statusPagamento,
            };

            if (hasLinkedTransacao) {
              shouldRemoveLinkedTransacao = true;
              updated.financeiroMensagem = 'Receita removida porque a sessão deixou de ser realizada.';
            }
          }

          return updated;
        });

        let transacoes = state.transacoes;

        if (shouldRemoveLinkedTransacao) {
          transacoes = transacoes.filter((transacao) => transacao.sessaoId !== id);
        }

        if (shouldSyncLinkedTransacao && updated) {
          transacoes = transacoes.map((transacao) =>
            transacao.sessaoId === id
              ? {
                  ...transacao,
                  ...createSessaoTransacao(updated!),
                  id: transacao.id,
                }
              : transacao
          );
        }

        if (generatedTransacao) {
          transacoes = [generatedTransacao, ...transacoes];
        }

        return {
          ...state,
          sessoes,
          transacoes,
        };
      });

      return updated;
    },

    addTransacao(input: Omit<Transacao, 'id'>) {
      const current = readState();
      const cliente = input.clienteId
        ? current.clientes.find((item) => item.id === input.clienteId)
        : undefined;

      const transacao: Transacao = {
        id: createId('tra'),
        origem: input.origem ?? 'Manual',
        ...input,
        clienteNome: input.clienteNome ?? cliente?.nome,
      };

      writeState((state) => ({
        ...state,
        transacoes: [transacao, ...state.transacoes],
      }));

      return transacao;
    },

    resetDatabase() {
      if (isBrowser()) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeState(initialState)));
      }
      listeners.forEach((listener) => listener());
    },
  };
}
