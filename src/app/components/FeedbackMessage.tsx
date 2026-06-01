import React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from './ui/utils';

type FeedbackType = 'success' | 'error' | 'info';

interface FeedbackMessageProps {
  type?: FeedbackType;
  children: React.ReactNode;
}

export function FeedbackMessage({ type = 'info', children }: FeedbackMessageProps) {
  const Icon = type === 'success' ? CheckCircle2 : type === 'error' ? AlertCircle : Info;

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={cn(
        'rounded-2xl border px-4 py-3 text-sm leading-snug flex items-start gap-3',
        type === 'success' && 'border-success/20 bg-success/10 text-success',
        type === 'error' && 'border-destructive/20 bg-destructive/10 text-destructive',
        type === 'info' && 'border-primary/20 bg-primary/10 text-primary'
      )}
    >
      <Icon size={18} className="mt-0.5 shrink-0" />
      <div className="min-w-0 space-y-1">{children}</div>
    </div>
  );
}
