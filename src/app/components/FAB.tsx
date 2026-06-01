import React from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router';

interface FABProps {
  to: string;
  icon?: React.ReactNode;
}

export function FAB({ to, icon = <Plus size={24} /> }: FABProps) {
  return (
    <Link
      to={to}
      className="fixed bottom-20 right-4 md:right-[calc(50%-12rem)] w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl shadow-primary/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 z-40"
    >
      {icon}
    </Link>
  );
}
