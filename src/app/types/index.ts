// Tipos de dados para o sistema de gestão de consultas

export type StatusCadastro = 'Ativo' | 'Inativo';
export type StatusPagamento = 'Em dia' | 'Pendente' | 'Inadimplente';
export type StatusSessao = 'Agendada' | 'Realizada' | 'Cancelada' | 'Faltou';
export type TipoConsulta = 'Avaliação' | 'Sessão Avulsa' | 'Pacote Mensal' | 'Pacote Trimestral' | 'Retorno';

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  dataCadastro: string;
  statusCadastro: StatusCadastro;
  statusPagamento: StatusPagamento;
  observacoes?: string;
}

export interface Sessao {
  id: string;
  clienteId: string;
  clienteNome: string;
  data: string;
  hora: string;
  duracao: number;
  tipoConsulta: TipoConsulta;
  status: StatusSessao;
  observacoes?: string;
  valorCobrado?: number;
  financeiroGerado?: boolean;
}

export interface Transacao {
  id: string;
  tipo: 'Receita' | 'Despesa';
  categoria: string;
  tipoConsulta?: TipoConsulta;
  descricao: string;
  valor: number;
  data: string;
  clienteId?: string;
  clienteNome?: string;
  sessaoId?: string;
  recorrente?: boolean;
  frequencia?: 'Mensal' | 'Trimestral' | 'Anual';
}

export interface ValorConsulta {
  tipo: TipoConsulta;
  valor: number;
  sessoes?: number; // para pacotes
  validade?: number; // dias de validade
}
