import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface BalanceCardProps {
  balance: number;
  showBalance: boolean;
  onToggleBalance: () => void;
}

export function BalanceCard({ balance, showBalance, onToggleBalance }: BalanceCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  return (
    <div className="bg-gradient-to-br from-primary to-secondary rounded-3xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-2">
        <p className="text-primary-foreground/80 text-sm">Saldo Total</p>
        <button
          onClick={onToggleBalance}
          className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
        >
          {showBalance ? <Eye size={20} /> : <EyeOff size={20} />}
        </button>
      </div>
      <h1 className="text-4xl font-bold text-primary-foreground">
        {showBalance ? formatCurrency(balance) : '••••••'}
      </h1>
    </div>
  );
}