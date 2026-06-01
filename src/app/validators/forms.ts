import { Cliente, StatusSessao, TipoConsulta } from '../types';

export function isValidEmail(email: string) {
  if (!email.trim()) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

export function isValidBrazilianPhone(phone: string) {
  const digits = onlyDigits(phone);
  return digits.length === 13 && digits.startsWith('55');
}

export function validateClienteInput(input: {
  nome: string;
  email: string;
  telefone: string;
  clientes: Cliente[];
  currentId?: string;
}) {
  const errors: string[] = [];
  const nome = input.nome.trim();
  const email = input.email.trim().toLowerCase();
  const phoneDigits = onlyDigits(input.telefone);

  if (!nome) errors.push('Informe o nome do cliente.');
  if (email && !isValidEmail(email)) errors.push('Informe um e-mail válido.');
  if (!isValidBrazilianPhone(input.telefone)) errors.push('Informe um telefone no formato +55 (##) #####-####.');

  const duplicate = input.clientes.find((cliente) => {
    if (cliente.id === input.currentId) return false;
    const sameEmail = email && cliente.email.trim().toLowerCase() === email;
    const samePhone = phoneDigits && onlyDigits(cliente.telefone) === phoneDigits;
    return sameEmail || samePhone;
  });

  if (duplicate) errors.push('Já existe um cliente com este e-mail ou telefone.');

  return errors;
}

export function validateSessaoInput(input: {
  clienteId: string;
  data: string;
  hora: string;
  duracao: number;
  valorCobrado: number;
  status: StatusSessao;
  tipoConsulta: TipoConsulta | '';
}) {
  const errors: string[] = [];

  if (!input.clienteId) errors.push('Selecione um cliente.');
  if (!input.data) errors.push('Informe a data da sessão.');
  if (!input.hora) errors.push('Informe o horário da sessão.');
  if (!input.tipoConsulta) errors.push('Selecione o tipo de consulta.');
  if (!input.status) errors.push('Selecione o status da sessão.');
  if (!Number.isFinite(input.duracao) || input.duracao <= 0) errors.push('A duração deve ser maior que zero.');
  if (!Number.isFinite(input.valorCobrado) || input.valorCobrado < 0) errors.push('O valor não pode ser negativo.');

  return errors;
}

export function validateTransacaoInput(input: {
  descricao: string;
  valor: number;
  tipo: 'Receita' | 'Despesa';
  data: string;
  categoria: string;
}) {
  const errors: string[] = [];

  if (!input.descricao.trim()) errors.push('Informe a descrição da transação.');
  if (!Number.isFinite(input.valor) || input.valor <= 0) errors.push('O valor deve ser maior que zero.');
  if (input.tipo !== 'Receita' && input.tipo !== 'Despesa') errors.push('Selecione o tipo da transação.');
  if (!input.data) errors.push('Informe a data da transação.');
  if (!input.categoria) errors.push('Selecione uma categoria.');

  return errors;
}
