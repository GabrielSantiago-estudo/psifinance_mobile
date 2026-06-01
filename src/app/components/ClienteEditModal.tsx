import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useDatabase } from '../services/database';
import { Cliente, StatusCadastro, StatusPagamento } from '../types';
import { formatBrazilianPhone } from '../utils/formatters';
import { cn } from './ui/utils';

interface ClienteEditModalProps {
  cliente: Cliente;
  onClose: () => void;
}

export function ClienteEditModal({ cliente, onClose }: ClienteEditModalProps) {
  const { updateCliente } = useDatabase();
  const [nome, setNome] = useState(cliente.nome);
  const [email, setEmail] = useState(cliente.email);
  const [telefone, setTelefone] = useState(cliente.telefone);
  const [statusCadastro, setStatusCadastro] = useState<StatusCadastro>(cliente.statusCadastro);
  const [statusPagamento, setStatusPagamento] = useState<StatusPagamento>(cliente.statusPagamento);
  const [observacoes, setObservacoes] = useState(cliente.observacoes ?? '');

  function save() {
    updateCliente(cliente.id, {
      nome,
      email,
      telefone,
      statusCadastro,
      statusPagamento,
      observacoes: observacoes || undefined,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 px-4 flex items-end sm:items-center justify-center">
      <div className="w-full max-w-md bg-background rounded-t-3xl sm:rounded-3xl border border-border p-5 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">Editar cliente</h2>
            <p className="text-sm text-muted-foreground">Atualize dados, status e pagamento.</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
            <X size={18} />
          </button>
        </div>

        <input value={nome} onChange={(event) => setNome(event.target.value)} className="w-full rounded-2xl bg-card border border-border px-4 py-3 text-foreground" placeholder="Nome completo" />
        <input value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl bg-card border border-border px-4 py-3 text-foreground" placeholder="Email" />
        <input value={telefone} inputMode="numeric" maxLength={19} onChange={(event) => setTelefone(formatBrazilianPhone(event.target.value))} className="w-full rounded-2xl bg-card border border-border px-4 py-3 text-foreground" placeholder="Telefone" />

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Status do cliente</p>
          <div className="grid grid-cols-2 gap-2">
            {(['Ativo', 'Inativo'] as StatusCadastro[]).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusCadastro(status)}
                className={cn(
                  'py-3 rounded-2xl text-sm font-medium transition-all',
                  statusCadastro === status ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground'
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Status de pagamento</p>
          <div className="grid grid-cols-3 gap-2">
            {(['Em dia', 'Pendente', 'Inadimplente'] as StatusPagamento[]).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusPagamento(status)}
                className={cn(
                  'py-3 rounded-2xl text-xs font-medium transition-all',
                  statusPagamento === status ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground'
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <textarea value={observacoes} onChange={(event) => setObservacoes(event.target.value)} rows={3} placeholder="Observações" className="w-full rounded-2xl bg-card border border-border px-4 py-3 text-foreground resize-none" />

        <button onClick={save} className="w-full rounded-2xl bg-primary text-primary-foreground py-3 font-semibold">
          Salvar alterações
        </button>
      </div>
    </div>
  );
}
