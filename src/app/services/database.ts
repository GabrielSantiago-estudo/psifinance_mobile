import { useSyncExternalStore } from 'react';
import { Cliente, Sessao, Transacao } from '../types';
import { mockClientes, mockSessoes, mockTransacoes } from '../data/mockData';
import { getLocalDateInputValue } from '../utils/dates';

const STORAGE_KEY = 'psifinance_db_v2';

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

function normalizeCliente(cliente: Cliente): Cliente {
  return {
    ...cliente,
    statusCadastro: cliente.statusCadastro === 'Inativo' ? 'Inativo' : 'Ativo',
  };
}

function normalizeState(input: Partial<DatabaseState>): DatabaseState {
  const clientes = Array.isArray(input.clientes) ? input.clientes : initialState.clientes;
  const sessoes = Array.isArray(input.sessoes) ? input.sessoes : initialState.sessoes;
  const transacoes = Array.isArray(input.transacoes) ? input.transacoes : initialState.transacoes;
  const sessoesComFinanceiro = new Set(
    transacoes
      .map((transacao) => transacao.sessaoId)
      .filter(Boolean)
  );

  return {
    clientes: clientes.map(normalizeCliente),
    sessoes: sessoes.map((sessao) => ({
      ...sessao,
      financeiroGerado: sessao.financeiroGerado || sessoesComFinanceiro.has(sessao.id),
    })),
    transacoes,
  };
}

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readState(): DatabaseState {
  if (!isBrowser()) return initialState;

  const saved = window.localStorage.getItem(STORAGE_KEY);
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
  const next = updater(readState());
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
          updated = { ...cliente, ...input };
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
      let updated: Sessao | undefined;
      const current = readState();
      const cliente = input.clienteId
        ? current.clientes.find((item) => item.id === input.clienteId)
        : undefined;

      writeState((state) => {
        let generatedTransacao: Transacao | undefined;
        let shouldSyncLinkedTransacao = false;
        const hasLinkedTransacao = state.transacoes.some((transacao) => transacao.sessaoId === id);

        const sessoes = state.sessoes.map((sessao) => {
          if (sessao.id !== id) return sessao;
          updated = {
            ...sessao,
            ...input,
            clienteNome: input.clienteNome ?? cliente?.nome ?? sessao.clienteNome,
          };

          if ((updated.valorCobrado ?? 0) > 0 && updated.status === 'Realizada') {
            updated = { ...updated, financeiroGerado: true };

            if (hasLinkedTransacao) {
              shouldSyncLinkedTransacao = true;
            } else {
              generatedTransacao = createSessaoTransacao(updated);
            }
          }

          return updated;
        });

        let transacoes = state.transacoes;

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
