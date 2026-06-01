import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  action?: React.ReactNode;
}

export function Header({ title, showBack = false, action }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="text-foreground hover:text-primary transition-colors p-2 -ml-2 rounded-xl hover:bg-muted"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        </div>
        {action && <div>{action}</div>}
      </div>
    </header>
  );
}
