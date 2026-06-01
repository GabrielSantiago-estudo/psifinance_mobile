import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Phone, Mail, Calendar, User, Edit, Clock } from 'lucide-react';
import { useDatabase } from '../services/database';
import { cn } from '../components/ui/utils';
import { Badge } from '../components/ui/badge';
import { BottomNav } from '../components/BottomNav';
import { ClienteEditModal } from '../components/ClienteEditModal';
import { formatDatePtBr } from '../utils/dates';

export function ClienteDetalhesScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clientes: mockClientes, sessoes: mockSessoes } = useDatabase();
  const [editing, setEditing] = useState(false);

  const cliente = mockClientes.find(c => c.id === id);
  const sessoesCliente = mockSessoes.filter(s => s.clienteId === id);

  if (!cliente) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cliente não encontrado</p>
      </div>
    );
  }

  const getStatusPagamentoBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      'Pago': 'default',
      'Em dia': 'default',
      'Pendente': 'secondary',
      'Isento': 'secondary',
      'Estornado': 'destructive',
      'Inadimplente': 'destructive',
    };
    return variants[status] || 'default';
  };

  const getStatusSessaoBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'Agendada': 'secondary',
      'Realizada': 'default',
      'Cancelada': 'outline',
      'Faltou': 'destructive',
    };
    return variants[status] || 'default';
  };

  const formatDate = (dateString: string) => {
    return formatDatePtBr(dateString, { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const sessoesRealizadas = sessoesCliente.filter(s => s.status === 'Realizada').length;
  const proximaSessao = sessoesCliente.find(s => s.status === 'Agendada');

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-secondary">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/clientes')}
              className="w-10 h-10 rounded-xl bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
            >
              <ArrowLeft size={20} className="text-primary-foreground" />
            </button>
            <button
              onClick={() => setEditing(true)}
              className="w-10 h-10 rounded-xl bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
            >
              <Edit size={20} className="text-primary-foreground" />
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-primary-foreground/10 flex items-center justify-center">
              <User size={40} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground mb-1">{cliente.nome}</h1>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium',
                    cliente.statusCadastro === 'Ativo'
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-primary-foreground/10 text-primary-foreground/70'
                  )}
                >
                  {cliente.statusCadastro}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Status de Pagamento */}
        <div className="bg-card rounded-2xl p-4 border border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status de Pagamento</span>
            <Badge variant={getStatusPagamentoBadge(cliente.statusPagamento)}>
              {cliente.statusPagamento}
            </Badge>
          </div>
        </div>

        {/* Informações de Contato */}
        <div className="bg-card rounded-2xl p-4 border border-border space-y-3">
          <h3 className="font-semibold text-foreground mb-3">Informações de Contato</h3>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Phone size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Telefone</p>
              <p className="text-sm font-medium text-foreground">{cliente.telefone}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Mail size={18} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium text-foreground truncate">{cliente.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cadastrado em</p>
              <p className="text-sm font-medium text-foreground">{formatDate(cliente.dataCadastro)}</p>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-2xl p-4 border border-border">
            <p className="text-3xl font-bold text-primary">{sessoesRealizadas}</p>
            <p className="text-sm text-muted-foreground">Sessões Realizadas</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border">
            <p className="text-3xl font-bold text-secondary">{sessoesCliente.length}</p>
            <p className="text-sm text-muted-foreground">Total de Sessões</p>
          </div>
        </div>

        {/* Próxima Sessão */}
        {proximaSessao && (
          <div className="bg-gradient-to-br from-secondary/10 to-primary/10 rounded-2xl p-4 border border-primary/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock size={18} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground mb-1">Próxima Sessão</p>
                <p className="text-lg font-bold text-primary">{formatDate(proximaSessao.data)} às {proximaSessao.hora}</p>
                <p className="text-sm text-muted-foreground">{proximaSessao.tipoConsulta}</p>
              </div>
            </div>
          </div>
        )}

        {/* Observações */}
        {cliente.observacoes && (
          <div className="bg-card rounded-2xl p-4 border border-border">
            <h3 className="font-semibold text-foreground mb-2">Observações</h3>
            <p className="text-sm text-muted-foreground">{cliente.observacoes}</p>
          </div>
        )}

        {/* Histórico de Sessões */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Histórico de Sessões</h3>
          
          {sessoesCliente.length > 0 ? (
            <div className="space-y-2">
              {sessoesCliente
                .sort((a, b) => b.data.localeCompare(a.data) || b.hora.localeCompare(a.hora))
                .map((sessao) => (
                  <div
                    key={sessao.id}
                    className="bg-card rounded-2xl p-4 border border-border"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-foreground">{sessao.tipoConsulta}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(sessao.data)} às {sessao.hora}
                        </p>
                      </div>
                      <Badge variant={getStatusSessaoBadge(sessao.status)} className="text-xs">
                        {sessao.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{sessao.duracao} min</span>
                      {sessao.valorCobrado !== undefined && sessao.valorCobrado > 0 && (
                        <span className="text-success font-medium">
                          R$ {sessao.valorCobrado.toFixed(2)}
                        </span>
                      )}
                      {sessao.financeiroGerado && (
                        <span className="text-success font-medium">
                          Financeiro gerado
                        </span>
                      )}
                    </div>
                    {sessao.observacoes && (
                      <p className="text-sm text-muted-foreground mt-2 pt-2 border-t border-border">
                        {sessao.observacoes}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-muted/50 rounded-2xl">
              <p className="text-muted-foreground">Nenhuma sessão registrada</p>
            </div>
          )}
        </div>
      </div>

      {editing && <ClienteEditModal cliente={cliente} onClose={() => setEditing(false)} />}
      <BottomNav />
    </div>
  );
}
