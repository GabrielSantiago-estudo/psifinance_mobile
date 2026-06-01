import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { FinButton } from '../components/FinButton';
import { FinInput } from '../components/FinInput';
import { Calendar, Clock, FileText, Receipt } from 'lucide-react';
import { cn } from '../components/ui/utils';
import { valoresConsultas } from '../data/mockData';
import { useDatabase } from '../services/database';
import { TipoConsulta } from '../types';
import { ClienteSelect } from '../components/ClienteSelect';
import { getLocalDateInputValue } from '../utils/dates';

export function NovaSessaoScreen() {
  const navigate = useNavigate();
  const { clientes: mockClientes, addSessao, addTransacao } = useDatabase();
  const [clienteId, setClienteId] = useState('');
  const [data, setData] = useState(getLocalDateInputValue());
  const [hora, setHora] = useState('');
  const [duracao, setDuracao] = useState('50');
  const [tipoConsulta, setTipoConsulta] = useState<TipoConsulta>('Sessão Avulsa');
  const [observacoes, setObservacoes] = useState('');
  const [cobrarAgora, setCobrarAgora] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cliente = mockClientes.find((item) => item.id === clienteId);
    const sessao = addSessao({
      clienteId,
      data,
      hora,
      duracao: Number(duracao),
      tipoConsulta,
      status: 'Agendada',
      observacoes: observacoes || undefined,
      valorCobrado: valorConsulta?.valor ?? 0,
      financeiroGerado: cobrarAgora && Boolean(valorConsulta),
    });

    if (cobrarAgora && valorConsulta) {
      addTransacao({
        tipo: 'Receita',
        categoria: 'Consultas',
        tipoConsulta,
        descricao: `Consulta - ${cliente?.nome ?? 'Cliente'}`,
        valor: valorConsulta.valor,
        data,
        clienteId,
        clienteNome: cliente?.nome,
        sessaoId: sessao.id,
      });
    }

    navigate('/sessoes');
  };

  const valorConsulta = valoresConsultas.find(v => v.tipo === tipoConsulta);

  return (
    <div className="min-h-screen bg-background pb-6">
      <Header title="Nova Sessão" showBack />

      <div className="max-w-md mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cliente */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Cliente</label>
            <ClienteSelect
              clientes={mockClientes.filter((cliente) => cliente.statusCadastro !== 'Inativo')}
              value={clienteId}
              onChange={setClienteId}
            />
          </div>

          <div className="rounded-2xl bg-primary/10 border border-primary/20 p-4">
            <p className="text-sm font-medium text-primary">Status inicial automático</p>
            <p className="text-sm text-muted-foreground mt-1">
              Novas sessões entram como <strong>Agendada</strong>. Depois, use editar para marcar realizada, cancelada ou falta.
            </p>
          </div>

          <label className="flex items-center gap-3 rounded-2xl bg-card border border-border p-4 cursor-pointer">
            <input
              type="checkbox"
              checked={cobrarAgora}
              onChange={(event) => setCobrarAgora(event.target.checked)}
              className="w-5 h-5 rounded-lg border-2 border-muted-foreground checked:bg-primary checked:border-primary"
            />
            <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center shrink-0">
              <Receipt size={19} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Cobrar agora</p>
              <p className="text-xs text-muted-foreground">
                Gera uma receita de R$ {valorConsulta?.valor ?? 0} vinculada a esta sessão.
              </p>
            </div>
          </label>

          {/* Tipo de Consulta */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Tipo de Consulta
            </label>
            <div className="grid grid-cols-2 gap-2">
              {valoresConsultas.map((vc) => (
                <button
                  key={vc.tipo}
                  type="button"
                  onClick={() => setTipoConsulta(vc.tipo)}
                  className={cn(
                    'py-3 px-4 rounded-2xl font-medium transition-all duration-200 text-sm',
                    tipoConsulta === vc.tipo
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-card border border-border text-foreground hover:border-primary'
                  )}
                >
                  <div className="text-left">
                    <div className="font-medium">{vc.tipo}</div>
                    <div className="text-xs opacity-80">R$ {vc.valor}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Data e Hora */}
          <div className="grid grid-cols-2 gap-4">
            <FinInput
              label="Data"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              icon={<Calendar size={20} />}
              required
            />
            <FinInput
              label="Hora"
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              icon={<Clock size={20} />}
              required
            />
          </div>

          {/* Duração */}
          <FinInput
            label="Duração (minutos)"
            type="number"
            placeholder="50"
            value={duracao}
            onChange={(e) => setDuracao(e.target.value)}
            icon={<Clock size={20} />}
            required
          />

          {/* Observações */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Observações
            </label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 text-muted-foreground" size={20} />
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Anotações sobre a sessão..."
                rows={4}
                className="w-full pl-12 pr-4 py-3 bg-muted rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <FinButton type="submit" className="w-full" size="lg">
              Agendar Sessão
            </FinButton>
          </div>
        </form>
      </div>
    </div>
  );
}
