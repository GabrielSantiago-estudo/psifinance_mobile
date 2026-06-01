import React from 'react';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { cn } from './ui/utils';

interface SummaryCardProps {
  type: 'income' | 'expense';
  amount: number;
  label?: string;
}

export function SummaryCard({ type, amount, label }: SummaryCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            type === 'income'
              ? 'bg-success/10 text-success'
              : 'bg-destructive/10 text-destructive'
          )}
        >
          {type === 'income' ? (
            <ArrowDownLeft size={18} />
          ) : (
            <ArrowUpRight size={18} />
          )}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">
            {label || (type === 'income' ? 'Receitas' : 'Despesas')}
          </p>
          <p
            className={cn(
              'text-lg font-semibold',
              type === 'income' ? 'text-success' : 'text-destructive'
            )}
          >
            {formatCurrency(amount)}
          </p>
        </div>
      </div>
    </div>
  );
}