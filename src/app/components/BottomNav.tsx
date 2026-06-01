import React from 'react';
import { Link, useLocation } from 'react-router';
import { Calendar, DollarSign, Home, PieChart, Users } from 'lucide-react';
import { cn } from './ui/utils';

export function BottomNav() {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Início' },
    { path: '/clientes', icon: Users, label: 'Clientes' },
    { path: '/sessoes', icon: Calendar, label: 'Sessões' },
    { path: '/transacoes', icon: DollarSign, label: 'Financeiro' },
    { path: '/relatorios', icon: PieChart, label: 'Relatórios' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-bottom z-40">
      <div className="max-w-md mx-auto px-1">
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-200 min-w-0',
                  isActive
                    ? 'text-primary bg-primary/5'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon size={21} />
                <span className="text-[11px] font-medium truncate max-w-full">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
