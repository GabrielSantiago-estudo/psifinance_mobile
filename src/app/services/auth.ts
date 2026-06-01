export interface AuthUser {
  id: string;
  nome: string;
  email: string;
  role: 'admin' | 'user';
}

const AUTH_KEY = 'psifinance_auth_user_v1';

export const ADMIN_USER: AuthUser = {
  id: 'admin',
  nome: 'Administrador',
  email: 'admin@admin',
  role: 'admin',
};

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function login(email: string, password: string): AuthUser | null {
  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail === 'admin@admin' && password === 'admin') {
    if (isBrowser()) {
      window.localStorage.setItem(AUTH_KEY, JSON.stringify(ADMIN_USER));
    }
    return ADMIN_USER;
  }

  return null;
}

// Autenticação local e simulada, usada apenas para fins acadêmicos.
export function registerLocalUser(nome: string, email: string): AuthUser {
  const user: AuthUser = {
    id: `user_${Date.now()}`,
    nome: nome.trim() || 'Usuário',
    email: email.trim().toLowerCase(),
    role: 'user',
  };

  if (isBrowser()) {
    window.localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  }

  return user;
}

export function logout() {
  if (isBrowser()) {
    window.localStorage.removeItem(AUTH_KEY);
  }
}

export function getCurrentUser(): AuthUser | null {
  if (!isBrowser()) return null;

  const saved = window.localStorage.getItem(AUTH_KEY);
  if (!saved) return null;

  try {
    return JSON.parse(saved) as AuthUser;
  } catch {
    window.localStorage.removeItem(AUTH_KEY);
    return null;
  }
}
