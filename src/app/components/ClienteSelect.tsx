import React, { useMemo, useState } from 'react';
import { Check, ChevronDown, Search, User } from 'lucide-react';
import { Cliente } from '../types';
import { cn } from './ui/utils';

interface ClienteSelectProps {
  clientes: Cliente[];
  value: string;
  onChange: (value: string) => void;
}

export function ClienteSelect({ clientes, value, onChange }: ClienteSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = clientes.find((cliente) => cliente.id === value);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return clientes;
    return clientes.filter((cliente) =>
      `${cliente.nome} ${cliente.email} ${cliente.telefone}`.toLowerCase().includes(search)
    );
  }, [clientes, query]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="w-full min-h-[52px] rounded-2xl border border-border bg-card px-4 py-3 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <User size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn('font-medium truncate', selected ? 'text-foreground' : 'text-muted-foreground')}>
              {selected?.nome ?? 'Selecione um cliente'}
            </p>
            {selected && <p className="text-xs text-muted-foreground truncate">{selected.telefone}</p>}
          </div>
          <ChevronDown className={cn('text-muted-foreground transition-transform', open && 'rotate-180')} size={18} />
        </div>
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-full rounded-3xl border border-border bg-card shadow-2xl overflow-hidden">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar cliente..."
                className="w-full rounded-2xl bg-muted pl-10 pr-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-2">
            {filtered.map((cliente) => (
              <button
                key={cliente.id}
                type="button"
                onClick={() => {
                  onChange(cliente.id);
                  setOpen(false);
                  setQuery('');
                }}
                className={cn(
                  'w-full rounded-2xl px-3 py-3 flex items-center gap-3 text-left transition-all',
                  value === cliente.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'hover:bg-muted text-foreground'
                )}
              >
                <div className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                  value === cliente.id ? 'bg-white/20' : 'bg-primary/10 text-primary'
                )}>
                  <User size={17} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{cliente.nome}</p>
                  <p className={cn('text-xs truncate', value === cliente.id ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                    {cliente.email}
                  </p>
                </div>
                {value === cliente.id && <Check size={18} />}
              </button>
            ))}

            {filtered.length === 0 && (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">Nenhum cliente encontrado</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
