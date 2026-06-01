import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Bell, DatabaseBackup, Download, EyeOff, LogOut, Moon, RotateCcw, Smartphone, User } from 'lucide-react';
import { Header } from '../components/Header';
import { FinButton } from '../components/FinButton';
import { useDatabase } from '../services/database';
import { getCurrentUser, logout } from '../services/auth';
import { useSettings } from '../services/settings';
import { cn } from '../components/ui/utils';

function ToggleRow({
  icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4">
      <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground leading-tight">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1 leading-snug">{description}</p>
      </div>
      <button
        type="button"
        aria-pressed={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-8 w-14 rounded-full transition-colors shrink-0',
          checked ? 'bg-primary' : 'bg-muted'
        )}
      >
        <span
          className={cn(
            'absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-6' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  );
}

function ActionButton({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-card rounded-2xl border border-border p-4 flex items-center gap-4 text-left active:scale-[0.99] transition-all"
    >
      <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="font-semibold text-foreground leading-tight">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1 leading-snug">{description}</p>
      </div>
    </button>
  );
}

export function SettingsScreen() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { clientes, sessoes, transacoes, resetDatabase } = useDatabase();
  const { settings, updateSetting, resetSettings } = useSettings();
  const [message, setMessage] = useState('');

  const stats = useMemo(() => [
    { label: 'Clientes', value: clientes.length },
    { label: 'Sessões', value: sessoes.length },
    { label: 'Transações', value: transacoes.length },
  ], [clientes.length, sessoes.length, transacoes.length]);

  const exportData = () => {
    const data = {
      exportadoEm: new Date().toISOString(),
      usuario: user,
      banco: { clientes, sessoes, transacoes },
      configuracoes: settings,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'psifinance-backup.json';
    link.click();
    URL.revokeObjectURL(url);
    setMessage('Backup exportado com sucesso.');
  };

  const handleResetDemo = () => {
    resetDatabase();
    setMessage('Banco restaurado com os dados de apresentação.');
  };

  const handleResetSettings = () => {
    resetSettings();
    setMessage('Preferências restauradas.');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      <Header title="Configurações" showBack />

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <div className="bg-gradient-to-br from-primary to-secondary rounded-3xl p-5 text-primary-foreground shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-white/15 flex items-center justify-center shrink-0">
              <User size={30} />
            </div>
            <div className="min-w-0">
              <p className="text-sm opacity-80">Perfil logado</p>
              <h2 className="text-xl font-bold truncate">{user?.nome ?? 'Administrador'}</h2>
              <p className="text-sm opacity-90 truncate">{user?.email ?? 'admin@admin'}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-5">
            {stats.map((item) => (
              <div key={item.label} className="rounded-2xl bg-white/10 p-3 text-center">
                <p className="text-lg font-bold">{item.value}</p>
                <p className="text-xs opacity-80">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {message && (
          <div className="rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
            {message}
          </div>
        )}

        <section className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
            Aparência e uso
          </h3>

          <ToggleRow
            icon={<Moon size={22} />}
            title="Modo escuro"
            description="Alterna o tema para apresentação em ambientes escuros."
            checked={settings.darkMode}
            onChange={(value) => updateSetting('darkMode', value)}
          />

          <ToggleRow
            icon={<Smartphone size={22} />}
            title="Modo compacto"
            description="Reduz espaçamentos para telas menores."
            checked={settings.compactMode}
            onChange={(value) => updateSetting('compactMode', value)}
          />

          <ToggleRow
            icon={<EyeOff size={22} />}
            title="Ocultar valores"
            description="Opção visual para privacidade durante demonstrações."
            checked={settings.hideValues}
            onChange={(value) => updateSetting('hideValues', value)}
          />

          <ToggleRow
            icon={<Bell size={22} />}
            title="Notificações"
            description="Mantém lembretes de sessões ligados no app."
            checked={settings.notifications}
            onChange={(value) => updateSetting('notifications', value)}
          />
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
            Dados locais
          </h3>

          <ActionButton
            icon={<Download size={22} />}
            title="Exportar backup"
            description="Baixa clientes, sessões, transações e preferências em JSON."
            onClick={exportData}
          />

          <ActionButton
            icon={<DatabaseBackup size={22} />}
            title="Restaurar dados demo"
            description="Recarrega o banco local de apresentação."
            onClick={handleResetDemo}
          />

          <ActionButton
            icon={<RotateCcw size={22} />}
            title="Restaurar preferências"
            description="Volta tema, modo compacto e privacidade ao padrão."
            onClick={handleResetSettings}
          />
        </section>

        <FinButton
          type="button"
          variant="secondary"
          className="w-full min-h-[56px] bg-destructive text-white hover:bg-destructive/90 shadow-none hover:shadow-none"
          onClick={handleLogout}
        >
          <LogOut size={20} />
          Sair da conta
        </FinButton>
      </div>
    </div>
  );
}
