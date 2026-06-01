import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { FinButton } from '../components/FinButton';
import { FinInput } from '../components/FinInput';
import { User, Mail, Phone, FileText } from 'lucide-react';
import { useDatabase } from '../services/database';
import { formatBrazilianPhone } from '../utils/formatters';

export function NovoClienteScreen() {
  const navigate = useNavigate();
  const { addCliente } = useDatabase();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addCliente({
      nome,
      email,
      telefone,
      statusCadastro: 'Ativo',
      statusPagamento: 'Pendente',
      observacoes: observacoes || undefined,
    });

    navigate('/clientes');
  };

  return (
    <div className="min-h-screen bg-background pb-6">
      <Header title="Novo Cliente" showBack />

      <div className="max-w-md mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FinInput
            label="Nome Completo"
            type="text"
            placeholder="Nome do cliente"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            icon={<User size={20} />}
            required
          />

          <FinInput
            label="Email"
            type="email"
            placeholder="email@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={20} />}
            required
          />

          <FinInput
            label="Telefone"
            type="tel"
            inputMode="numeric"
            placeholder="+55 (11) 99999-9999"
            value={telefone}
            onChange={(e) => setTelefone(formatBrazilianPhone(e.target.value))}
            icon={<Phone size={20} />}
            maxLength={19}
            required
          />

          <div className="rounded-2xl bg-primary/10 border border-primary/20 p-4">
            <p className="text-sm font-medium text-primary">Status inicial automático</p>
            <p className="text-sm text-muted-foreground mt-1">
              Novos clientes entram como <strong>Ativo</strong>. Depois, use editar se precisar pausar o atendimento.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Observações</label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 text-muted-foreground" size={20} />
              <textarea
                placeholder="Observações sobre o cliente..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={4}
                className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
              />
            </div>
          </div>

          <FinButton type="submit" className="w-full">Cadastrar Cliente</FinButton>
        </form>
      </div>
    </div>
  );
}
