import { useSyncExternalStore } from 'react';

export interface AppSettings {
  darkMode: boolean;
  notifications: boolean;
  compactMode: boolean;
  hideValues: boolean;
  language: 'pt-BR';
}

const SETTINGS_KEY = 'psifinance_settings_v1';

const defaultSettings: AppSettings = {
  darkMode: false,
  notifications: true,
  compactMode: false,
  hideValues: false,
  language: 'pt-BR',
};

const listeners = new Set<() => void>();

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function applySettings(settings: AppSettings) {
  if (!isBrowser()) return;
  document.documentElement.classList.toggle('dark', settings.darkMode);
  document.documentElement.classList.toggle('compact', settings.compactMode);
}

function readSettings(): AppSettings {
  if (!isBrowser()) return defaultSettings;

  const saved = window.localStorage.getItem(SETTINGS_KEY);
  if (!saved) {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
    applySettings(defaultSettings);
    return defaultSettings;
  }

  try {
    const parsed = JSON.parse(saved) as Partial<AppSettings>;
    const settings = { ...defaultSettings, ...parsed };
    applySettings(settings);
    return settings;
  } catch {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
    applySettings(defaultSettings);
    return defaultSettings;
  }
}

function writeSettings(next: AppSettings) {
  if (isBrowser()) {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  }
  applySettings(next);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return JSON.stringify(readSettings());
}

export function initializeSettings() {
  readSettings();
}

export function useSettings() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const settings = JSON.parse(snapshot) as AppSettings;

  return {
    settings,
    updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
      writeSettings({ ...readSettings(), [key]: value });
    },
    resetSettings() {
      writeSettings(defaultSettings);
    },
  };
}
