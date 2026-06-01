import React from 'react';
import { cn } from './ui/utils';

type FeedbackType = 'success' | 'error' | 'info';

interface FeedbackMessageProps {
  type?: FeedbackType;
  children: React.ReactNode;
}

export function FeedbackMessage({ type = 'info', children }: FeedbackMessageProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border px-4 py-3 text-sm leading-snug',
        type === 'success' && 'border-success/20 bg-success/10 text-success',
        type === 'error' && 'border-destructive/20 bg-destructive/10 text-destructive',
        type === 'info' && 'border-primary/20 bg-primary/10 text-primary'
      )}
    >
      {children}
    </div>
  );
}
