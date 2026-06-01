import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Mail, Lock, User, Activity } from 'lucide-react';
import { FinButton } from '../components/FinButton';
import { FinInput } from '../components/FinInput';

export function RegisterScreen() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }
    // Mock registration - in real app, this would create account
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-primary/30">
              <Activity size={40} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Criar Conta</h1>
              <p className="text-muted-foreground mt-2">
                Comece a gerenciar seu consultório hoje
              </p>
            </div>
          </div>

          {/* Register Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            <FinInput
              type="text"
              placeholder="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<User size={20} />}
              required
            />

            <FinInput
              type="email"
              placeholder="Endereço de email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={20} />}
              required
            />

            <FinInput
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={20} />}
              required
            />

            <FinInput
              type="password"
              placeholder="Confirmar senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock size={20} />}
              required
            />

            <FinButton type="submit" className="w-full" size="lg">
              Criar Conta
            </FinButton>
          </form>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-muted-foreground">
              Já tem uma conta?{' '}
              <button
                onClick={() => navigate('/')}
                className="text-primary font-medium hover:underline"
              >
                Entrar
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}