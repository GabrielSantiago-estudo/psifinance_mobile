import React, { useMemo, useState } from 'react';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { Plus, Calendar as CalendarIcon, Clock, User, Pencil, Search, X } from 'lucide-react';
import { cn } from '../components/ui/utils';
import { useDatabase } from '../services/database';
import { Sessao, StatusSessao, TipoConsulta } from '../types';
import { useNavigate } from 'react-router';
import { Badge } from '../components/ui/badge';
import { valoresConsultas } from '../data/mockData';
import { ClienteSelect } from '../components/ClienteSelect';
import { formatDatePtBr, getLocalDateInputValue } from '../utils/dates';

type FilterType = 'all' | StatusSessao;

function SessaoEditModal({ sessao, onClose }: { sessao: Sessao; onClose: () => void }) {
  const { updateSessao, clientes } = useDatabase();
  const [clienteId, setClienteId] = useState(sessao.clienteId);
  const [data, setData] = useState(sessao.data);
  const [hora, setHora] = useState(sessao.hora);
  const [duracao, setDuracao] = useState(String(sessao.duracao));
  const [tipoConsulta, setTipoConsulta] = useState<TipoConsulta>(sessao.tipoConsulta);
  const [status, setStatus] = useState<StatusSessao>(sessao.status);
  const [observacoes, setObservacoes] = useState(sessao.observacoes ?? '');
  const [valorCobrado, setValorCobrado] = useState(String(sessao.valorCobrado ?? ''));

  function save() {
    const cliente = clientes.find((item) => item.id === clienteId);
    updateSessao(sessao.id, {
      clienteId,
      clienteNome: cliente?.nome,
      data,
      hora,
      duracao: Number(duracao),
      tipoConsulta,
      status,
      observacoes: observacoes || undefined,
      valorCobrado: Number(valorCobrado) || 0,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 px-4 flex items-end sm:items-center justify-center">
      <div className="w-full max-w-md bg-background rounded-t-3xl sm:rounded-3xl border border-border p-5 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Editar sessão</h2>
            <p className="text-sm text-muted-foreground">Altere comparecimento, status e detalhes.</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"><X size={18} /></button>
        </div>

        <ClienteSelect clientes={clientes.filter((cliente) => cliente.statusCadastro !== 'Inativo')} value={clienteId} onChange={setClienteId} />

        <div className="grid grid-cols-2 gap-3">
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="rounded-2xl bg-card border border-border px-4 py-3 text-foreground" />
          <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} className="rounded-2xl bg-card border border-border px-4 py-3 text-foreground" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input type="number" value={duracao} onChange={(e) => setDuracao(e.target.value)} className="rounded-2xl bg-card border border-border px-4 py-3 text-foreground" placeholder="Duração" />
          <input type="number" value={valorCobrado} onChange={(e) => setValorCobrado(e.target.value)} className="rounded-2xl bg-card border border-border px-4 py-3 text-foreground" placeholder="Valor" />
        </div>

        <select value={tipoConsulta} onChange={(e) => setTipoConsulta(e.target.value as TipoConsulta)} className="w-full rounded-2xl bg-card border border-border px-4 py-3 text-foreground">
          {valoresConsultas.map((item) => <option key={item.tipo} value={item.tipo}>{item.tipo}</option>)}
        </select>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Status / comparecimento</p>
          <div className="grid grid-cols-2 gap-2">
            {(['Agendada', 'Realizada', 'Cancelada', 'Faltou'] as StatusSessao[]).map((item) => (
              <button key={item} type="button" onClick={() => setStatus(item)} className={cn('py-3 rounded-2xl text-sm font-medium transition-all', status === item ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground')}>
                {item === 'Realizada' ? 'Compareceu' : item === 'Faltou' ? 'Não veio' : item}
              </button>
            ))}
          </div>
        </div>

        <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} placeholder="Observações da sessão" className="w-full rounded-2xl bg-card border border-border px-4 py-3 text-foreground resize-none" />

        <button onClick={save} className="w-full rounded-2xl bg-primary text-primary-foreground py-3 font-semibold">Salvar alterações</button>
      </div>
    </div>
  );
}

export function SessoesScreen() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [editing, setEditing] = useState<Sessao | null>(null);
  const navigate = useNavigate();
  const { sessoes: mockSessoes } = useDatabase();

  const filteredSessoes = useMemo(() => {
    return mockSessoes.filter((sessao) => {
      const matchesFilter = filter === 'all' || sessao.status === filter;
      const matchesSearch = `${sessao.clienteNome} ${sessao.tipoConsulta}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = !dateFilter || sessao.data === dateFilter;
      return matchesFilter && matchesSearch && matchesDate;
    });
  }, [mockSessoes, filter, searchTerm, dateFilter]);

  const filterButtons: { label: string; value: FilterType }[] = [
    { label: 'Todas', value: 'all' },
    { label: 'Agendadas', value: 'Agendada' },
    { label: 'Compareceu', value: 'Realizada' },
    { label: 'Canceladas', value: 'Cancelada' },
    { label: 'Não veio', value: 'Faltou' },
  ];

  const getStatusBadge = (status: StatusSessao) => {
    const variants: Record<StatusSessao, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'Agendada': 'secondary',
      'Realizada': 'default',
      'Cancelada': 'outline',
      'Faltou': 'destructive',
    };
    return variants[status] || 'default';
  };

  const formatDate = (dateString: string) => formatDatePtBr(dateString, { day: '2-digit', month: 'short', year: 'numeric' });

  const groupedSessoes = filteredSessoes.reduce((groups, sessao) => {
    const today = getLocalDateInputValue();
    const groupKey = sessao.data === today ? 'Hoje' : sessao.data > today ? 'Próximas' : 'Anteriores';
    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push(sessao);
    return groups;
  }, {} as Record<string, Sessao[]>);

  Object.keys(groupedSessoes).forEach((key) => {
    groupedSessoes[key].sort((a, b) => `${a.data} ${a.hora}`.localeCompare(`${b.data} ${b.hora}`));
  });

  const orderedGroups = ['Hoje', 'Próximas', 'Anteriores'].filter((key) => groupedSessoes[key]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Sessões" action={<button onClick={() => navigate('/sessoes/nova')} className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"><Plus size={20} className="text-primary-foreground" /></button>} />

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input type="text" placeholder="Buscar por cliente ou tipo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-muted rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-full rounded-2xl bg-card border border-border px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {filterButtons.map((button) => (
            <button key={button.value} onClick={() => setFilter(button.value)} className={cn('px-4 py-2 rounded-xl font-medium transition-all duration-200 whitespace-nowrap', filter === button.value ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:text-foreground')}>
              {button.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-2">
          <div className="bg-card rounded-2xl p-3 border border-border"><p className="text-xl font-bold text-foreground">{mockSessoes.length}</p><p className="text-xs text-muted-foreground">Total</p></div>
          <div className="bg-card rounded-2xl p-3 border border-border"><p className="text-xl font-bold text-secondary">{mockSessoes.filter(s => s.status === 'Agendada').length}</p><p className="text-xs text-muted-foreground">Agend.</p></div>
          <div className="bg-card rounded-2xl p-3 border border-border"><p className="text-xl font-bold text-success">{mockSessoes.filter(s => s.status === 'Realizada').length}</p><p className="text-xs text-muted-foreground">Veio</p></div>
          <div className="bg-card rounded-2xl p-3 border border-border"><p className="text-xl font-bold text-destructive">{mockSessoes.filter(s => s.status === 'Cancelada' || s.status === 'Faltou').length}</p><p className="text-xs text-muted-foreground">Outros</p></div>
        </div>

        <div className="space-y-6">
          {orderedGroups.map((groupKey) => (
            <div key={groupKey} className="space-y-3">
              <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">{groupKey}</h3>
              <div className="space-y-3">
                {groupedSessoes[groupKey].map((sessao) => (
                  <div key={sessao.id} className="bg-card rounded-2xl p-4 border border-border hover:shadow-md transition-all">
                    <div className="flex items-start gap-3">
                      <button onClick={() => navigate(`/clientes/${sessao.clienteId}`)} className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><User size={20} className="text-primary" /></button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground truncate">{sessao.clienteNome}</h4>
                            <p className="text-sm text-muted-foreground">{sessao.tipoConsulta}</p>
                          </div>
                          <Badge variant={getStatusBadge(sessao.status)} className="text-xs">{sessao.status}</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1"><CalendarIcon size={14} /><span>{formatDate(sessao.data)}</span></div>
                          <div className="flex items-center gap-1"><Clock size={14} /><span>{sessao.hora}</span></div>
                          <span>{sessao.duracao} min</span>
                        </div>
                        {sessao.valorCobrado !== undefined && sessao.valorCobrado > 0 && (
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-success">R$ {sessao.valorCobrado.toFixed(2)}</span>
                            {sessao.financeiroGerado && <span className="text-xs px-2 py-0.5 rounded-lg bg-success/10 text-success">financeiro gerado</span>}
                          </div>
                        )}
                        {sessao.observacoes && <p className="text-sm text-muted-foreground mt-2 pt-2 border-t border-border line-clamp-2">{sessao.observacoes}</p>}
                        <button onClick={() => setEditing(sessao)} className="mt-3 px-3 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium flex items-center gap-1"><Pencil size={14} /> Editar sessão</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredSessoes.length === 0 && <div className="text-center py-12"><CalendarIcon size={48} className="mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">Nenhuma sessão encontrada</p></div>}
      </div>

      {editing && <SessaoEditModal sessao={editing} onClose={() => setEditing(null)} />}
      <BottomNav />
    </div>
  );
}
