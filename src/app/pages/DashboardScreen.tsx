import React, { useState } from 'react';
import { BalanceCard } from '../components/BalanceCard';
import { SummaryCard } from '../components/SummaryCard';
import { BottomNav } from '../components/BottomNav';
import { Settings, TrendingUp, Users, Calendar, Plus, UserPlus, CalendarPlus, DollarSign } from 'lucide-react';
import { useDatabase } from '../services/database';
import { getCurrentUser } from '../services/auth';
import { useNavigate } from 'react-router';
import { cn } from '../components/ui/utils';
import { formatDatePtBr, getLocalDateInputValue, getLocalMonthInputValue } from '../utils/dates';
import { formatCurrency } from '../utils/formatters';

export function DashboardScreen() {
  const [showBalance, setShowBalance] = useState(true);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const navigate = useNavigate();
  const { transacoes, clientes, sessoes } = useDatabase();
  const currentUser = getCurrentUser();
  
  // Calcular totais
  const totalReceitas = transacoes
    .filter(t => t.tipo === 'Receita')
    .reduce((sum, t) => sum + t.valor, 0);
  
  const totalDespesas = transacoes
    .filter(t => t.tipo === 'Despesa')
    .reduce((sum, t) => sum + t.valor, 0);
  
  const saldoTotal = totalReceitas - totalDespesas;
  const currentMonthKey = getLocalMonthInputValue();
  const receitasDoMes = transacoes
    .filter(t => t.tipo === 'Receita' && t.data.startsWith(currentMonthKey))
    .reduce((sum, t) => sum + t.valor, 0);

  const despesasDoMes = transacoes
    .filter(t => t.tipo === 'Despesa' && t.data.startsWith(currentMonthKey))
    .reduce((sum, t) => sum + t.valor, 0);

  // Estatísticas de clientes
  const clientesAtivos = clientes.filter(c => c.statusCadastro === 'Ativo').length;
  const clientesComPendencia = clientes.filter(c => c.statusPagamento === 'Pendente' || c.statusPagamento === 'Inadimplente').length;
  
  // Sessões do mês
  const sessoesDoMes = sessoes.filter(s => s.data.startsWith(currentMonthKey));
  
  const sessoesRealizadas = sessoesDoMes.filter(s => s.status === 'Realizada').length;
  const sessoesAgendadas = sessoes.filter(s => s.status === 'Agendada').length;
  const pendenciasSessoes = sessoes.filter((sessao) =>
    sessao.status === 'Realizada'
    && (sessao.statusPagamento ?? (sessao.valorCobrado === 0 ? 'Isento' : 'Pendente')) === 'Pendente'
  );
  const valorPendente = pendenciasSessoes.reduce((sum, sessao) => sum + (sessao.valorCobrado ?? 0), 0);

  // Próximas sessões
  const hoje = getLocalDateInputValue();
  const proximasSessoes = sessoes
    .filter(s => s.status === 'Agendada' && s.data >= hoje)
    .sort((a, b) => a.data.localeCompare(b.data) || a.hora.localeCompare(b.hora))
    .slice(0, 3);

  const formatDate = (dateString: string) => {
    return formatDatePtBr(dateString, { day: '2-digit', month: 'short' });
  };

  const quickActions = [
    { icon: CalendarPlus, label: 'Nova Sessão', path: '/sessoes/nova', color: 'bg-primary' },
    { icon: UserPlus, label: 'Novo Cliente', path: '/clientes/novo', color: 'bg-secondary' },
    { icon: DollarSign, label: 'Nova Transação', path: '/transacoes/nova', color: 'bg-success' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-background sticky top-0 z-40 border-b border-border">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Bem-vindo,</p>
            <h2 className="text-xl font-semibold text-foreground">{currentUser?.nome ?? 'Administrador'}</h2>
          </div>
          <button onClick={() => navigate('/configuracoes')} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
            <Settings size={20} className="text-foreground" />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Saldo Total */}
        <BalanceCard
          balance={saldoTotal}
          showBalance={showBalance}
          onToggleBalance={() => setShowBalance(!showBalance)}
        />

        {/* Receitas/Despesas */}
        <div className="grid grid-cols-2 gap-4">
          <SummaryCard type="income" amount={receitasDoMes} label="Receitas do mês" />
          <SummaryCard type="expense" amount={despesasDoMes} label="Despesas do mês" />
        </div>

        {/* Cards de Estatísticas Rápidas */}
        <div className="grid grid-cols-2 gap-4">
          <div 
            onClick={() => navigate('/clientes')}
            className="bg-card rounded-2xl p-4 border border-border cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users size={20} className="text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{clientesAtivos}</p>
            <p className="text-sm text-muted-foreground">Clientes Ativos</p>
            {clientesComPendencia > 0 && (
              <p className="text-xs text-destructive mt-1">
                {clientesComPendencia} com pendência
              </p>
            )}
          </div>

          <div 
            onClick={() => navigate('/sessoes')}
            className="bg-card rounded-2xl p-4 border border-border cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Calendar size={20} className="text-secondary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{sessoesAgendadas}</p>
            <p className="text-sm text-muted-foreground">Sessões Agendadas</p>
            <p className="text-xs text-muted-foreground mt-1">
              {sessoesRealizadas} realizadas este mês
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-warning/10 to-warning/5 rounded-2xl p-4 border border-warning/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <TrendingUp size={20} className="text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sessões realizadas pendentes</p>
              <p className="text-2xl font-bold text-warning">{formatCurrency(valorPendente)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {pendenciasSessoes.length === 1 ? '1 sessão' : `${pendenciasSessoes.length} sessões`} aguardando pagamento
              </p>
            </div>
          </div>
        </div>

        {/* Próximas Sessões */}
        {proximasSessoes.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                Próximas Sessões
              </h3>
              <button 
                onClick={() => navigate('/sessoes')}
                className="text-sm text-primary hover:underline"
              >
                Ver Todas
              </button>
            </div>
            
            <div className="space-y-3">
              {proximasSessoes.map((sessao) => (
                <div
                  key={sessao.id}
                  onClick={() => navigate(`/clientes/${sessao.clienteId}`)}
                  className="bg-card rounded-2xl p-4 border border-border hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-foreground">{sessao.clienteNome}</h4>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(sessao.data)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{sessao.hora}</span>
                    <span>•</span>
                    <span>{sessao.tipoConsulta}</span>
                    <span>•</span>
                    <span>{sessao.duracao} min</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {proximasSessoes.length === 0 && (
          <div className="bg-muted/50 rounded-2xl p-8 text-center">
            <Calendar size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma sessão agendada</p>
            <button 
              onClick={() => navigate('/sessoes/nova')}
              className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
            >
              Agendar Sessão
            </button>
          </div>
        )}
      </div>

      {/* FAB com Menu de Ações Rápidas */}
      <div className="fixed bottom-20 right-4 md:right-[calc(50%-12rem)] z-40">
        {showQuickActions && (
          <div className="absolute bottom-16 right-0 space-y-3 mb-2">
            {quickActions.map((action, index) => (
              <div
                key={action.path}
                className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="text-sm font-medium text-foreground bg-card px-3 py-2 rounded-xl shadow-lg border border-border whitespace-nowrap">
                  {action.label}
                </span>
                <button
                  onClick={() => {
                    navigate(action.path);
                    setShowQuickActions(false);
                  }}
                  className={cn(
                    "w-12 h-12 rounded-full text-white shadow-lg flex items-center justify-center hover:scale-110 transition-all",
                    action.color
                  )}
                >
                  <action.icon size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <button
          onClick={() => setShowQuickActions(!showQuickActions)}
          className={cn(
            "w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl shadow-primary/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200",
            showQuickActions && "rotate-45"
          )}
        >
          <Plus size={24} />
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
