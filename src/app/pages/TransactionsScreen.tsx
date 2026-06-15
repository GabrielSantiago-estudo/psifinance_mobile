import React, { useState } from 'react';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { Plus, Filter, ArrowUpRight, ArrowDownLeft, Search } from 'lucide-react';
import { cn } from '../components/ui/utils';
import { useDatabase } from '../services/database';
import { useNavigate } from 'react-router';
import { formatDatePtBr } from '../utils/dates';

type FilterType = 'all' | 'Receita' | 'Despesa';

export function TransactionsScreen() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const navigate = useNavigate();
  const { transacoes } = useDatabase();
  
  const filteredTransacoes = transacoes.filter((transacao) => {
    const matchesType = filter === 'all' || transacao.tipo === filter;
    const matchesSearch = `${transacao.descricao} ${transacao.categoria} ${transacao.clienteNome ?? ''}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || transacao.data === dateFilter;
    return matchesType && matchesSearch && matchesDate;
  });

  const filterButtons: { label: string; value: FilterType }[] = [
    { label: 'Todas', value: 'all' },
    { label: 'Receitas', value: 'Receita' },
    { label: 'Despesas', value: 'Despesa' },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return formatDatePtBr(dateString, { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Agrupar transações por categoria
  const transacoesPorCategoria = filteredTransacoes.reduce((acc, transacao) => {
    const categoria = transacao.categoria;
    if (!acc[categoria]) {
      acc[categoria] = [];
    }
    acc[categoria].push(transacao);
    return acc;
  }, {} as Record<string, typeof transacoes>);

  // Calcular totais
  const totalReceitas = transacoes
    .filter(t => t.tipo === 'Receita')
    .reduce((sum, t) => sum + t.valor, 0);
  
  const totalDespesas = transacoes
    .filter(t => t.tipo === 'Despesa')
    .reduce((sum, t) => sum + t.valor, 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header
        title="Transações"
        action={
          <button 
            onClick={() => navigate('/transacoes/nova')}
            className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
          >
            <Plus size={20} className="text-primary-foreground" />
          </button>
        }
      />

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Resumo Financeiro */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-success/10 to-success/5 rounded-2xl p-4 border border-success/20">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                <ArrowDownLeft size={16} className="text-success" />
              </div>
              <p className="text-sm text-muted-foreground">Receitas</p>
            </div>
            <p className="text-xl font-bold text-success">{formatCurrency(totalReceitas)}</p>
          </div>
          
          <div className="bg-gradient-to-br from-destructive/10 to-destructive/5 rounded-2xl p-4 border border-destructive/20">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                <ArrowUpRight size={16} className="text-destructive" />
              </div>
              <p className="text-sm text-muted-foreground">Despesas</p>
            </div>
            <p className="text-xl font-bold text-destructive">{formatCurrency(totalDespesas)}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Buscar descrição, categoria ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-muted rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="w-full rounded-2xl bg-card border border-border px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />

        <div className="flex gap-2 p-1 bg-muted rounded-2xl">
          {filterButtons.map((button) => (
            <button
              key={button.value}
              onClick={() => setFilter(button.value)}
              className={cn(
                'flex-1 py-2 px-4 rounded-xl font-medium transition-all duration-200',
                filter === button.value
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {button.label}
            </button>
          ))}
        </div>

        {/* Lista de Transações por Categoria */}
        <div className="space-y-6">
          {Object.entries(transacoesPorCategoria)
            .sort(([catA], [catB]) => catA.localeCompare(catB))
            .map(([categoria, transacoes]) => {
              const totalCategoria = transacoes.reduce((sum, t) => 
                t.tipo === 'Receita' ? sum + t.valor : sum - t.valor, 0
              );
              
              return (
                <div key={categoria} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">{categoria}</h3>
                    <span className={cn(
                      'text-sm font-medium',
                      totalCategoria >= 0 ? 'text-success' : 'text-destructive'
                    )}>
                      {formatCurrency(Math.abs(totalCategoria))}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {transacoes
                      .sort((a, b) => b.data.localeCompare(a.data))
                      .map((transacao) => (
                        <div
                          key={transacao.id}
                          className="bg-card rounded-2xl p-4 border border-border hover:shadow-md transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                                transacao.tipo === 'Receita'
                                  ? 'bg-success/10 text-success'
                                  : 'bg-destructive/10 text-destructive'
                              )}
                            >
                              {transacao.tipo === 'Receita' ? (
                                <ArrowDownLeft size={18} />
                              ) : (
                                <ArrowUpRight size={18} />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-foreground">{transacao.descricao}</h4>
                                  {transacao.tipoConsulta && (
                                    <p className="text-sm text-muted-foreground">{transacao.tipoConsulta}</p>
                                  )}
                                  {transacao.clienteNome && (
                                    <p className="text-sm text-muted-foreground">{transacao.clienteNome}</p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p
                                    className={cn(
                                      'text-lg font-bold',
                                      transacao.tipo === 'Receita' ? 'text-success' : 'text-destructive'
                                    )}
                                  >
                                    {transacao.tipo === 'Receita' ? '+' : '-'} {formatCurrency(transacao.valor)}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{formatDate(transacao.data)}</span>
                                {transacao.recorrente && (
                                  <>
                                    <span>•</span>
                                    <span className="text-xs px-2 py-0.5 bg-secondary/10 text-secondary rounded-lg">
                                      {transacao.frequencia}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
        </div>

        {filteredTransacoes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma transação encontrada</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
