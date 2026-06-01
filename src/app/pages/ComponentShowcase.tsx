import React, { useState } from 'react';
import { FinButton } from '../components/FinButton';
import { FinInput } from '../components/FinInput';
import { BalanceCard } from '../components/BalanceCard';
import { SummaryCard } from '../components/SummaryCard';
import { TransactionCard, Transaction } from '../components/TransactionCard';
import { Header } from '../components/Header';
import { Mail, User, Search } from 'lucide-react';

/**
 * Component Showcase - Design System Reference
 * 
 * This page demonstrates all reusable components in the design system.
 * Use this as a reference for component usage and styling.
 */

const mockTransaction: Transaction = {
  id: '1',
  title: 'Grocery Shopping',
  category: 'Food & Dining',
  amount: -120.50,
  type: 'expense',
  date: '2026-04-06',
};

export function ComponentShowcase() {
  const [showBalance, setShowBalance] = useState(true);
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Design System" />

      <div className="max-w-md mx-auto px-4 py-6 space-y-12">
        
        {/* Buttons Section */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Buttons</h3>
          <div className="space-y-3">
            <FinButton variant="primary" className="w-full">
              Primary Button
            </FinButton>
            <FinButton variant="secondary" className="w-full">
              Secondary Button
            </FinButton>
            <FinButton variant="outline" className="w-full">
              Outline Button
            </FinButton>
            <FinButton variant="ghost" className="w-full">
              Ghost Button
            </FinButton>
            <FinButton variant="primary" disabled className="w-full">
              Disabled Button
            </FinButton>
          </div>
          
          <div className="flex gap-3">
            <FinButton variant="primary" size="sm">Small</FinButton>
            <FinButton variant="primary" size="md">Medium</FinButton>
            <FinButton variant="primary" size="lg">Large</FinButton>
          </div>
        </section>

        {/* Inputs Section */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Inputs</h3>
          <FinInput
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            icon={<Mail size={20} />}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <FinInput
            label="Full Name"
            placeholder="John Doe"
            icon={<User size={20} />}
          />
          <FinInput
            label="Search"
            placeholder="Search transactions..."
            icon={<Search size={20} />}
          />
          <FinInput
            label="With Error"
            placeholder="Invalid input"
            error="This field is required"
          />
        </section>

        {/* Cards Section */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Cards</h3>
          
          <div className="space-y-4">
            <BalanceCard
              balance={15432.75}
              showBalance={showBalance}
              onToggleBalance={() => setShowBalance(!showBalance)}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <SummaryCard type="income" amount={5800} />
              <SummaryCard type="expense" amount={4300} />
            </div>
            
            <TransactionCard transaction={mockTransaction} />
          </div>
        </section>

        {/* Color Palette */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Color Palette</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-20 bg-primary rounded-2xl shadow-md" />
              <p className="text-sm text-muted-foreground">Primary</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-20 bg-secondary rounded-2xl shadow-md" />
              <p className="text-sm text-muted-foreground">Secondary</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-20 bg-success rounded-2xl shadow-md" />
              <p className="text-sm text-muted-foreground">Success/Income</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-20 bg-destructive rounded-2xl shadow-md" />
              <p className="text-sm text-muted-foreground">Destructive/Expense</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-20 bg-warning rounded-2xl shadow-md" />
              <p className="text-sm text-muted-foreground">Warning</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-20 bg-muted rounded-2xl shadow-md" />
              <p className="text-sm text-muted-foreground">Muted</p>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Typography</h3>
          
          <div className="space-y-3 bg-card p-6 rounded-2xl border border-border">
            <h1>Heading 1 - Title</h1>
            <h2>Heading 2 - Subtitle</h2>
            <h3>Heading 3 - Section</h3>
            <h4>Heading 4 - Small</h4>
            <p className="text-base">Body text - Default paragraph text</p>
            <p className="text-sm text-muted-foreground">Caption - Helper text</p>
          </div>
        </section>

        {/* Spacing */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Spacing (8px Grid)</h3>
          
          <div className="bg-card p-6 rounded-2xl border border-border space-y-2">
            <div className="h-2 w-16 bg-primary rounded" />
            <p className="text-xs text-muted-foreground">8px (sm)</p>
            
            <div className="h-4 w-24 bg-primary rounded" />
            <p className="text-xs text-muted-foreground">16px (md)</p>
            
            <div className="h-6 w-32 bg-primary rounded" />
            <p className="text-xs text-muted-foreground">24px (lg)</p>
            
            <div className="h-8 w-40 bg-primary rounded" />
            <p className="text-xs text-muted-foreground">32px (xl)</p>
          </div>
        </section>

        {/* Border Radius */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Border Radius</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-16 bg-primary rounded-xl" />
              <p className="text-xs text-muted-foreground">12px - Small</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-16 bg-primary rounded-2xl" />
              <p className="text-xs text-muted-foreground">16px - Medium</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-16 bg-primary rounded-3xl" />
              <p className="text-xs text-muted-foreground">24px - Large</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-16 bg-primary" style={{ borderRadius: '32px' }} />
              <p className="text-xs text-muted-foreground">32px - XL</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
