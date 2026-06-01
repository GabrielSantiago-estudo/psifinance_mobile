import React, { useMemo, useState } from 'react';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { Plus, Search, User, Pencil, Phone, Mail } from 'lucide-react';
import { cn } from '../components/ui/utils';
import { useDatabase } from '../services/database';
import { Cliente, StatusCadastro } from '../types';
import { useNavigate } from 'react-router';
import { Badge } from '../components/ui/badge';
import { ClienteEditModal } from '../components/ClienteEditModal';
import { formatDatePtBr } from '../utils/dates';

type FilterType = 'all' | StatusCadastro;
type OrderType = 'nome' | 'recentes';

export function ClientesScreen() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [orderBy, setOrderBy] = useState<OrderType>('nome');
  const [editing, setEditing] = useState<Cliente | null>(null);
  const navigate = useNavigate();
  const { clientes: mockClientes, sessoes } = useDatabase();

  const filteredClientes = useMemo(() => {
    return mockClientes
      .filter((cliente) => {
        const matchesFilter = filter === 'all' || cliente.statusCadastro === filter;
        const matchesSearch = `${cliente.nome} ${cliente.email} ${cliente.telefone}`.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
      })
      .sort((a, b) => orderBy === 'nome'
        ? a.nome.localeCompare(b.nome)
        : new Date(`${b.dataCadastro}T00:00:00`).getTime() - new Date(`${a.dataCadastro}T00:00:00`).getTime());
  }, [mockClientes, filter, searchTerm, orderBy]);

  const filterButtons: { label: string; value: FilterType }[] = [
    { label: 'Todos', value: 'all' },
    { label: 'Ativos', value: 'Ativo' },
    { label: 'Inativos', value: 'Inativo' },
  ];

  const getStatusPagamentoBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      'Em dia': 'default',
      'Pendente': 'secondary',
      'Inadimplente': 'destructive',
    };
    return variants[status] || 'default';
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Clientes" action={<button onClick={() => navigate('/clientes/novo')} className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"><Plus size={20} className="text-primary-foreground" /></button>} />

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input type="text" placeholder="Buscar por nome, e-mail ou telefone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-muted rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {filterButtons.map((button) => (
            <button key={button.value} onClick={() => setFilter(button.value)} className={cn('px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap', filter === button.value ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground')}>
              {button.label}
            </button>
          ))}
        </div>

        <select value={orderBy} onChange={(e) => setOrderBy(e.target.value as OrderType)} className="w-full rounded-2xl bg-card border border-border px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40">
          <option value="nome">Ordenar por nome</option>
          <option value="recentes">Ordenar por cadastro recente</option>
        </select>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-2xl p-4 border border-border"><p className="text-2xl font-bold text-foreground">{mockClientes.length}</p><p className="text-xs text-muted-foreground">Total</p></div>
          <div className="bg-card rounded-2xl p-4 border border-border"><p className="text-2xl font-bold text-success">{mockClientes.filter(c => c.statusCadastro === 'Ativo').length}</p><p className="text-xs text-muted-foreground">Ativos</p></div>
          <div className="bg-card rounded-2xl p-4 border border-border"><p className="text-2xl font-bold text-muted-foreground">{mockClientes.filter(c => c.statusCadastro === 'Inativo').length}</p><p className="text-xs text-muted-foreground">Inativos</p></div>
        </div>

        <div className="space-y-3">
          {filteredClientes.map((cliente) => {
            const totalSessoes = sessoes.filter((sessao) => sessao.clienteId === cliente.id).length;
            return (
              <div key={cliente.id} className="bg-card rounded-2xl p-4 border border-border hover:shadow-md transition-all">
                <div className="flex items-start gap-3">
                  <button onClick={() => navigate(`/clientes/${cliente.id}`)} className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><User size={24} className="text-primary" /></button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <button onClick={() => navigate(`/clientes/${cliente.id}`)} className="text-left min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{cliente.nome}</h3>
                      </button>
                      <Badge variant={getStatusPagamentoBadge(cliente.statusPagamento)} className="text-xs shrink-0">{cliente.statusPagamento}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1"><Phone size={13} />{cliente.telefone}</p>
                    <p className="text-sm text-muted-foreground truncate flex items-center gap-1"><Mail size={13} />{cliente.email}</p>
                    <div className="flex items-center justify-between gap-2 mt-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn('inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium', cliente.statusCadastro === 'Ativo' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground')}>{cliente.statusCadastro}</span>
                        <span className="text-xs text-muted-foreground">{totalSessoes} sessões</span>
                        <span className="text-xs text-muted-foreground">{formatDatePtBr(cliente.dataCadastro, { day: '2-digit', month: 'short' })}</span>
                      </div>
                      <button onClick={() => setEditing(cliente)} className="px-3 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium flex items-center gap-1 shrink-0">
                        <Pencil size={14} /> Editar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredClientes.length === 0 && <div className="text-center py-12"><User size={48} className="mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">Nenhum cliente encontrado</p></div>}
      </div>

      {editing && <ClienteEditModal cliente={editing} onClose={() => setEditing(null)} />}
      <BottomNav />
    </div>
  );
}
