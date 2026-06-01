import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { LoginScreen } from './pages/LoginScreen';
import { RegisterScreen } from './pages/RegisterScreen';
import { DashboardScreen } from './pages/DashboardScreen';
import { TransactionsScreen } from './pages/TransactionsScreen';
import { AddTransactionScreen } from './pages/AddTransactionScreen';
import { ReportsScreen } from './pages/ReportsScreen';
import { ComponentShowcase } from './pages/ComponentShowcase';
import { ClientesScreen } from './pages/ClientesScreen';
import { ClienteDetalhesScreen } from './pages/ClienteDetalhesScreen';
import { NovoClienteScreen } from './pages/NovoClienteScreen';
import { SessoesScreen } from './pages/SessoesScreen';
import { NovaSessaoScreen } from './pages/NovaSessaoScreen';
import { SettingsScreen } from './pages/SettingsScreen';
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute';

function protectedElement(element: React.ReactElement) {
  return <ProtectedRoute>{element}</ProtectedRoute>;
}

function publicElement(element: React.ReactElement) {
  return <PublicOnlyRoute>{element}</PublicOnlyRoute>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: publicElement(<LoginScreen />),
  },
  {
    path: '/cadastro',
    element: publicElement(<RegisterScreen />),
  },
  {
    path: '/dashboard',
    element: protectedElement(<DashboardScreen />),
  },
  {
    path: '/clientes',
    element: protectedElement(<ClientesScreen />),
  },
  {
    path: '/clientes/novo',
    element: protectedElement(<NovoClienteScreen />),
  },
  {
    path: '/clientes/:id',
    element: protectedElement(<ClienteDetalhesScreen />),
  },
  {
    path: '/sessoes',
    element: protectedElement(<SessoesScreen />),
  },
  {
    path: '/sessoes/nova',
    element: protectedElement(<NovaSessaoScreen />),
  },
  {
    path: '/transacoes',
    element: protectedElement(<TransactionsScreen />),
  },
  {
    path: '/transacoes/nova',
    element: protectedElement(<AddTransactionScreen />),
  },
  {
    path: '/relatorios',
    element: protectedElement(<ReportsScreen />),
  },
  {
    path: '/configuracoes',
    element: protectedElement(<SettingsScreen />),
  },
  {
    path: '/showcase',
    element: protectedElement(<ComponentShowcase />),
  },
  {
    path: '/register',
    element: <Navigate to="/cadastro" replace />,
  },
  {
    path: '/transactions',
    element: <Navigate to="/transacoes" replace />,
  },
  {
    path: '/add-transaction',
    element: <Navigate to="/transacoes/nova" replace />,
  },
  {
    path: '/reports',
    element: <Navigate to="/relatorios" replace />,
  },
  {
    path: '/settings',
    element: <Navigate to="/configuracoes" replace />,
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
