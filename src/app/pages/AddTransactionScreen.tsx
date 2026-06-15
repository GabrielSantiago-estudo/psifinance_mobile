import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { FinButton } from '../components/FinButton';
import { FinInput } from '../components/FinInput';
import { DollarSign, Calendar, User, FileText } from 'lucide-react';
import { cn } from '../components/ui/utils';
import { useDatabase } from '../services/database';
import { TipoConsulta } from '../types';
import { getLocalDateInputValue } from '../utils/dates';
import { validateTransacaoInput } from '../validators/forms';
import { FeedbackMessage } from '../components/FeedbackMessage';

const categoriasReceita = ['Consultas', 'Outras Receitas'];
const categoriasDespesa = ['Infraestrutura', 'Operacional', 'Marketing', 'Impostos', 'Outras'];

export function AddTransactionScreen() {
  const navigate = useNavigate();
  const { clientes, valoresConsultas, addTransacao } = useDatabase();
  const [tipo, setTipo] = useState<'Receita' | 'Despesa'>('Receita');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('');
  const [tipoConsulta, setTipoConsulta] = useState<TipoConsulta | ''>('');
  const [clienteId, setClienteId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState(getLocalDateInputValue());
  const [recorrente, setRecorrente] = useState(false);
  const [frequencia, setFrequencia] = useState<'Mensal' | 'Trimestral' | 'Anual'>('Mensal');
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valorNumerico = Number(valor);
    const validationErrors = validateTransacaoInput({
      tipo,
      categoria,
      descricao,
      valor: valorNumerico,
      data,
    });

    if (mostrarTipoConsulta && !tipoConsulta) {
      validationErrors.push('Selecione o tipo de consulta.');
    }

    if (mostrarTipoConsulta && !clienteId) {
      validationErrors.push('Selecione o cliente da consulta.');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    const cliente = clientes.find((item) => item.id === clienteId);
    await addTransacao({
      tipo,
      categoria,
      tipoConsulta: tipoConsulta || undefined,
      descricao: descricao.trim(),
      valor: valorNumerico,
      data,
      clienteId: clienteId || undefined,
      clienteNome: cliente?.nome,
      recorrente,
      frequencia: recorrente ? frequencia : undefined,
    });
    navigate('/transacoes');
  };

  // Quando categoria é "Consultas", preencher automaticamente o valor baseado no tipo
  const handleTipoConsultaChange = (novoTipo: TipoConsulta) => {
    setTipoConsulta(novoTipo);
    const valorConsulta = valoresConsultas.find(v => v.tipo === novoTipo);
    if (valorConsulta) {
      setValor(valorConsulta.valor.toString());
    }
  };

  const categorias = tipo === 'Receita' ? categoriasReceita : categoriasDespesa;
  const mostrarTipoConsulta = tipo === 'Receita' && categoria === 'Consultas';

  return (
    <div className="min-h-screen bg-background pb-6">
      <Header title="Nova Transação" showBack />

      <div className="max-w-md mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.length > 0 && (
            <FeedbackMessage type="error">
              {errors.map((error) => (
                <p key={error}>{error}</p>
              ))}
            </FeedbackMessage>
          )}

          {/* Tipo Toggle */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Tipo de Transação
            </label>
            <div className="flex gap-3 p-1 bg-muted rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setTipo('Receita');
                  setCategoria('');
                  setTipoConsulta('');
                }}
                className={cn(
                  'flex-1 py-3 rounded-xl font-medium transition-all duration-200',
                  tipo === 'Receita'
                    ? 'bg-success text-white shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Receita
              </button>
              <button
                type="button"
                onClick={() => {
                  setTipo('Despesa');
                  setCategoria('');
                  setTipoConsulta('');
                }}
                className={cn(
                  'flex-1 py-3 rounded-xl font-medium transition-all duration-200',
                  tipo === 'Despesa'
                    ? 'bg-destructive text-white shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Despesa
              </button>
            </div>
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Categoria
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categorias.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategoria(cat);
                    if (cat !== 'Consultas') {
                      setTipoConsulta('');
                      setClienteId('');
                    }
                  }}
                  className={cn(
                    'py-3 px-4 rounded-2xl font-medium transition-all duration-200 text-sm',
                    categoria === cat
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-card border border-border text-foreground hover:border-primary'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tipo de Consulta - apenas para Receitas de Consultas */}
          {mostrarTipoConsulta && (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Tipo de Consulta
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {valoresConsultas.map((vc) => (
                    <button
                      key={vc.tipo}
                      type="button"
                      onClick={() => handleTipoConsultaChange(vc.tipo)}
                      className={cn(
                        'py-3 px-4 rounded-2xl font-medium transition-all duration-200 text-sm',
                        tipoConsulta === vc.tipo
                          ? 'bg-secondary text-secondary-foreground shadow-md'
                          : 'bg-card border border-border text-foreground hover:border-secondary'
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

              {/* Cliente - apenas para Consultas */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Cliente
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                  <select
                    value={clienteId}
                    onChange={(e) => setClienteId(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-muted rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                    required={mostrarTipoConsulta}
                  >
                    <option value="">Selecione um cliente</option>
                    {clientes
                      .filter(c => c.statusCadastro === 'Ativo')
                      .map((cliente) => (
                        <option key={cliente.id} value={cliente.id}>
                          {cliente.nome}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Valor */}
          <FinInput
            label="Valor"
            type="number"
            step="0.01"
            placeholder="0,00"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            icon={<DollarSign size={20} />}
            required
          />

          {/* Descrição */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Descrição
            </label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 text-muted-foreground" size={20} />
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Adicione uma descrição..."
                rows={3}
                className="w-full pl-12 pr-4 py-3 bg-muted rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                required
              />
            </div>
          </div>

          {/* Data */}
          <FinInput
            label="Data"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            icon={<Calendar size={20} />}
            required
          />

          {/* Recorrente */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={recorrente}
                onChange={(e) => setRecorrente(e.target.checked)}
                className="w-5 h-5 rounded-lg border-2 border-muted-foreground checked:bg-primary checked:border-primary"
              />
              <span className="text-sm font-medium text-foreground">
                Transação Recorrente
              </span>
            </label>

            {recorrente && (
              <div className="flex gap-2 pl-8">
                {(['Mensal', 'Trimestral', 'Anual'] as const).map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setFrequencia(freq)}
                    className={cn(
                      'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                      frequencia === freq
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <FinButton type="submit" className="w-full" size="lg">
              Salvar Transação
            </FinButton>
          </div>
        </form>
      </div>
    </div>
  );
}
