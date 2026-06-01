import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Mail, Lock, Activity } from 'lucide-react';
import { login } from '../services/auth';
import { FinButton } from '../components/FinButton';
import { FinInput } from '../components/FinInput';

export function LoginScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@admin');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = login(email, password);
    if (!user) {
      setError('E-mail ou senha inválidos. Use admin@admin / admin para acessar a apresentação.');
      return;
    }

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
              <h1 className="text-3xl font-bold text-foreground">Gestão de Consultas</h1>
              <p className="text-muted-foreground mt-2">
                Gerencie seu consultório com facilidade
              </p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
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

            {error && (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
              Acesso de apresentação: <strong className="text-foreground">admin@admin</strong> / <strong className="text-foreground">admin</strong>
            </div>

            <FinButton type="submit" className="w-full" size="lg">
              Entrar
            </FinButton>
          </form>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-muted-foreground">
              Não tem uma conta?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-primary font-medium hover:underline"
              >
                Cadastre-se
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}