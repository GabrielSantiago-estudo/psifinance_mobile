import { createBrowserRouter } from 'react-router';
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

export const router = createBrowserRouter([
  {
    path: '/',
    Component: LoginScreen,
  },
  {
    path: '/register',
    Component: RegisterScreen,
  },
  {
    path: '/dashboard',
    Component: DashboardScreen,
  },
  {
    path: '/clientes',
    Component: ClientesScreen,
  },
  {
    path: '/clientes/novo',
    Component: NovoClienteScreen,
  },
  {
    path: '/clientes/:id',
    Component: ClienteDetalhesScreen,
  },
  {
    path: '/sessoes',
    Component: SessoesScreen,
  },
  {
    path: '/sessoes/nova',
    Component: NovaSessaoScreen,
  },
  {
    path: '/transactions',
    Component: TransactionsScreen,
  },
  {
    path: '/transacoes/nova',
    Component: AddTransactionScreen,
  },
  {
    path: '/add-transaction',
    Component: AddTransactionScreen,
  },
  {
    path: '/reports',
    Component: ReportsScreen,
  },
  {
    path: '/settings',
    Component: SettingsScreen,
  },
  {
    path: '/showcase',
    Component: ComponentShowcase,
  },
]);