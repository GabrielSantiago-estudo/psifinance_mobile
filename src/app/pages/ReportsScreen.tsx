import React, { useState } from 'react';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { SummaryCard } from '../components/SummaryCard';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { cn } from '../components/ui/utils';
import { useDatabase } from '../services/database';
import { Transacao } from '../types';
import { getLocalMonthInputValue, getMonthLabel, parseMonthInput } from '../utils/dates';

// Preparar dados para os gráficos
const getCategoriaData = (transacoes: Transacao[]) => {
  const categorias: Record<string, { valor: number; cor: string }> = {};
  
  transacoes.forEach(transacao => {
    if (transacao.tipo === 'Despesa') {
      if (!categorias[transacao.categoria]) {
        categorias[transacao.categoria] = {
          valor: 0,
          cor: transacao.categoria === 'Consultas' ? '#6c5ce7' :
               transacao.categoria === 'Infraestrutura' ? '#ff6b6b' :
               transacao.categoria === 'Operacional' ? '#00b894' :
               transacao.categoria === 'Marketing' ? '#fdcb6e' : '#a29bfe'
        };
      }
      categorias[transacao.categoria].valor += transacao.valor;
    }
  });

  return Object.entries(categorias).map(([nome, data]) => ({
    name: nome,
    value: data.valor,
    color: data.cor
  }));
};

const getConsultasData = (transacoes: Transacao[]) => {
  const tipos: Record<string, number> = {};
  
  transacoes
    .filter(t => t.tipo === 'Receita' && t.tipoConsulta)
    .forEach(transacao => {
      const tipo = transacao.tipoConsulta!;
      tipos[tipo] = (tipos[tipo] || 0) + transacao.valor;
    });

  const cores = ['#6c5ce7', '#a29bfe', '#00b894', '#fdcb6e', '#ff6b6b'];
  return Object.entries(tipos).map(([nome, valor], index) => ({
    name: nome,
    value: valor,
    color: cores[index % cores.length]
  }));
};

const getMensalData = (transacoes: Transacao[], ano: number) => {
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  return meses.map((mes, index) => {
    const transacoesMes = transacoes.filter((transacao) => {
      return transacao.data.startsWith(`${ano}-${String(index + 1).padStart(2, '0')}`);
    });

    return {
      month: mes,
      receitas: transacoesMes.filter((item) => item.tipo === 'Receita').reduce((sum, item) => sum + item.valor, 0),
      despesas: transacoesMes.filter((item) => item.tipo === 'Despesa').reduce((sum, item) => sum + item.valor, 0),
    };
  });
};

type ChartType = 'consultas' | 'despesas' | 'mensal';

export function ReportsScreen() {
  const { transacoes: mockTransacoes, sessoes: mockSessoes } = useDatabase();
  const [chartType, setChartType] = useState<ChartType>('consultas');
  const [monthFilter, setMonthFilter] = useState(getLocalMonthInputValue());
  const { year: anoSelecionado } = parseMonthInput(monthFilter);
  const monthLabel = getMonthLabel(monthFilter);
  
  // Calcular totais do mês selecionado
  const transacoesMes = mockTransacoes.filter(t => t.data.startsWith(monthFilter));
  
  const totalReceitas = transacoesMes
    .filter(t => t.tipo === 'Receita')
    .reduce((sum, t) => sum + t.valor, 0);
  
  const totalDespesas = transacoesMes
    .filter(t => t.tipo === 'Despesa')
    .reduce((sum, t) => sum + t.valor, 0);
  
  const saldoLiquido = totalReceitas - totalDespesas;

  // Estatísticas de sessões
  const sessoesMes = mockSessoes.filter(s => s.data.startsWith(monthFilter));
  const sessoesRealizadas = sessoesMes.filter(s => s.status === 'Realizada').length;
  const sessoesAgendadas = sessoesMes.filter(s => s.status === 'Agendada').length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const consultasData = getConsultasData(transacoesMes);
  const despesasData = getCategoriaData(transacoesMes);
  const mensalData = getMensalData(mockTransacoes, anoSelecionado);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Relatórios" />

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <input
          type="month"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="w-full rounded-2xl bg-card border border-border px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        {/* Resumo Mensal */}
        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Mês selecionado</p>
            <h3 className="text-2xl font-bold text-foreground">{monthLabel}</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <SummaryCard type="income" amount={totalReceitas} label="Receitas" />
            <SummaryCard type="expense" amount={totalDespesas} label="Despesas" />
          </div>
          
          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Saldo Líquido</span>
              <span className={cn(
                "text-xl font-bold",
                saldoLiquido >= 0 ? "text-success" : "text-destructive"
              )}>
                {formatCurrency(saldoLiquido)}
              </span>
            </div>
          </div>
        </div>

        {/* Estatísticas de Sessões */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-2xl p-4 border border-border">
            <p className="text-2xl font-bold text-foreground">{sessoesMes.length}</p>
            <p className="text-xs text-muted-foreground">Sessões no mês</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border">
            <p className="text-2xl font-bold text-success">{sessoesRealizadas}</p>
            <p className="text-xs text-muted-foreground">Realizadas</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border">
            <p className="text-2xl font-bold text-secondary">{sessoesAgendadas}</p>
            <p className="text-xs text-muted-foreground">Agendadas</p>
          </div>
        </div>

        {/* Seletor de Gráfico */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setChartType('consultas')}
            className={cn(
              'px-4 py-2 rounded-xl font-medium transition-all duration-200 whitespace-nowrap',
              chartType === 'consultas'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            Por Tipo de Consulta
          </button>
          <button
            onClick={() => setChartType('despesas')}
            className={cn(
              'px-4 py-2 rounded-xl font-medium transition-all duration-200 whitespace-nowrap',
              chartType === 'despesas'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            Despesas
          </button>
          <button
            onClick={() => setChartType('mensal')}
            className={cn(
              'px-4 py-2 rounded-xl font-medium transition-all duration-200 whitespace-nowrap',
              chartType === 'mensal'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            Tendência Mensal
          </button>
        </div>

        {/* Gráficos */}
        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border">
          {chartType === 'consultas' && (
            <>
              <h4 className="text-lg font-semibold text-foreground mb-4">
                Receitas por Tipo de Consulta
              </h4>
              {consultasData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={consultasData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {consultasData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-6 space-y-2">
                    {consultasData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-foreground">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {formatCurrency(item.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-center py-8 text-muted-foreground">Sem dados de consultas</p>
              )}
            </>
          )}

          {chartType === 'despesas' && (
            <>
              <h4 className="text-lg font-semibold text-foreground mb-4">
                Despesas por Categoria
              </h4>
              {despesasData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={despesasData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {despesasData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-6 space-y-2">
                    {despesasData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-foreground">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {formatCurrency(item.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-center py-8 text-muted-foreground">Sem dados de despesas</p>
              )}
            </>
          )}

          {chartType === 'mensal' && (
            <>
              <h4 className="text-lg font-semibold text-foreground mb-4">
                Receitas vs Despesas
              </h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={mensalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8eaed" />
                  <XAxis dataKey="month" stroke="#6c757d" />
                  <YAxis stroke="#6c757d" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e8eaed',
                      borderRadius: '12px',
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="receitas" fill="#00b894" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="despesas" fill="#ff6b6b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-6 flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span className="text-sm text-foreground">Receitas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <span className="text-sm text-foreground">Despesas</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
