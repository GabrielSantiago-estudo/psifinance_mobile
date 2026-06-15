-- PsiFinance schema and seed data for PostgreSQL (NeonDB/Supabase)
-- Generated from the previous static seed records, preserving the original values.

BEGIN;

DROP TABLE IF EXISTS transacoes CASCADE;
DROP TABLE IF EXISTS sessoes CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS valores_consultas CASCADE;

CREATE TABLE valores_consultas (
  tipo TEXT PRIMARY KEY,
  valor NUMERIC(12,2) NOT NULL CHECK (valor >= 0),
  sessoes INTEGER CHECK (sessoes IS NULL OR sessoes > 0),
  validade INTEGER CHECK (validade IS NULL OR validade > 0)
);

CREATE TABLE clientes (
  id TEXT PRIMARY KEY CHECK (length(trim(id)) > 0),
  nome TEXT NOT NULL CHECK (length(trim(nome)) > 0),
  email TEXT NOT NULL DEFAULT '',
  telefone TEXT NOT NULL CHECK (length(trim(telefone)) > 0),
  data_cadastro DATE NOT NULL,
  status_cadastro TEXT NOT NULL CHECK (status_cadastro IN ('Ativo', 'Inativo')),
  status_pagamento TEXT NOT NULL CHECK (status_pagamento IN ('Pendente', 'Pago', 'Isento', 'Estornado', 'Em dia', 'Inadimplente')),
  observacoes TEXT
);

CREATE TABLE sessoes (
  id TEXT PRIMARY KEY CHECK (length(trim(id)) > 0),
  cliente_id TEXT NOT NULL REFERENCES clientes(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  cliente_nome TEXT NOT NULL CHECK (length(trim(cliente_nome)) > 0),
  data DATE NOT NULL,
  hora TIME NOT NULL,
  duracao INTEGER NOT NULL CHECK (duracao > 0),
  tipo_consulta TEXT NOT NULL REFERENCES valores_consultas(tipo) ON UPDATE CASCADE ON DELETE RESTRICT,
  status TEXT NOT NULL CHECK (status IN ('Agendada', 'Realizada', 'Cancelada', 'Faltou')),
  status_pagamento TEXT CHECK (status_pagamento IS NULL OR status_pagamento IN ('Pendente', 'Pago', 'Isento', 'Estornado', 'Em dia', 'Inadimplente')),
  observacoes TEXT,
  valor_cobrado NUMERIC(12,2) CHECK (valor_cobrado IS NULL OR valor_cobrado >= 0),
  financeiro_gerado BOOLEAN
);

CREATE TABLE transacoes (
  id TEXT PRIMARY KEY CHECK (length(trim(id)) > 0),
  tipo TEXT NOT NULL CHECK (tipo IN ('Receita', 'Despesa')),
  categoria TEXT NOT NULL CHECK (length(trim(categoria)) > 0),
  tipo_consulta TEXT REFERENCES valores_consultas(tipo) ON UPDATE CASCADE ON DELETE RESTRICT,
  descricao TEXT NOT NULL CHECK (length(trim(descricao)) > 0),
  valor NUMERIC(12,2) NOT NULL CHECK (valor > 0),
  data DATE NOT NULL,
  cliente_id TEXT REFERENCES clientes(id) ON UPDATE CASCADE ON DELETE SET NULL,
  cliente_nome TEXT,
  sessao_id TEXT UNIQUE REFERENCES sessoes(id) ON UPDATE CASCADE ON DELETE SET NULL,
  origem TEXT CHECK (origem IS NULL OR origem IN ('Manual', 'SessaoAutomatica')),
  recorrente BOOLEAN,
  frequencia TEXT CHECK (frequencia IS NULL OR frequencia IN ('Mensal', 'Trimestral', 'Anual')),
  CONSTRAINT transacoes_consulta_cliente_consistency CHECK (
    tipo <> 'Receita'
    OR categoria <> 'Consultas'
    OR tipo_consulta IS NOT NULL
    OR sessao_id IS NULL
  )
);

CREATE UNIQUE INDEX clientes_email_unique_not_blank_idx ON clientes (lower(email)) WHERE email <> '';
CREATE UNIQUE INDEX clientes_telefone_unique_idx ON clientes (telefone);
CREATE INDEX clientes_status_cadastro_idx ON clientes (status_cadastro);
CREATE INDEX clientes_status_pagamento_idx ON clientes (status_pagamento);
CREATE INDEX sessoes_cliente_id_idx ON sessoes (cliente_id);
CREATE INDEX sessoes_data_hora_idx ON sessoes (data, hora);
CREATE INDEX sessoes_status_idx ON sessoes (status);
CREATE INDEX sessoes_tipo_consulta_idx ON sessoes (tipo_consulta);
CREATE INDEX transacoes_data_idx ON transacoes (data);
CREATE INDEX transacoes_tipo_idx ON transacoes (tipo);
CREATE INDEX transacoes_categoria_idx ON transacoes (categoria);
CREATE INDEX transacoes_cliente_id_idx ON transacoes (cliente_id);
CREATE INDEX transacoes_sessao_id_idx ON transacoes (sessao_id);

INSERT INTO valores_consultas (tipo, valor, sessoes, validade) VALUES
  ('Avaliação', 150, NULL, NULL),
  ('Sessão Avulsa', 200, NULL, NULL),
  ('Pacote Mensal', 720, 4, 30),
  ('Pacote Trimestral', 2000, 12, 90),
  ('Retorno', 100, NULL, NULL);

INSERT INTO clientes (id, nome, email, telefone, data_cadastro, status_cadastro, status_pagamento, observacoes) VALUES
  ('cli_1', 'Ana Paula Silva', 'ana.paula.silva@email.com', '(11) 97468-1791', '2026-02-23', 'Ativo', 'Em dia', 'Prefere atendimento pela manhã'),
  ('cli_2', 'Carlos Eduardo Santos', 'carlos.eduardo.santos@email.com', '(11) 92144-4943', '2026-01-25', 'Ativo', 'Pendente', 'Prefere atendimento pela manhã'),
  ('cli_3', 'Mariana Costa', 'mariana.costa@email.com', '(11) 96627-8353', '2026-01-02', 'Ativo', 'Pendente', 'Iniciou tratamento recentemente'),
  ('cli_4', 'Pedro Henrique Oliveira', 'pedro.henrique.oliveira@email.com', '(11) 92271-6140', '2026-01-29', 'Ativo', 'Em dia', 'Iniciou tratamento recentemente'),
  ('cli_5', 'Julia Ferreira', 'julia.ferreira@email.com', '(11) 97804-6878', '2025-12-27', 'Ativo', 'Pendente', 'Possui pacote ativo'),
  ('cli_6', 'Roberto Almeida', 'roberto.almeida@email.com', '(11) 97428-7521', '2026-01-20', 'Ativo', 'Inadimplente', 'Possui pacote ativo'),
  ('cli_7', 'Fernanda Lima', 'fernanda.lima@email.com', '(11) 99459-1378', '2025-11-20', 'Ativo', 'Em dia', 'Paciente em acompanhamento semanal'),
  ('cli_8', 'Gabriel Martins', 'gabriel.martins@email.com', '(11) 94612-2673', '2026-02-12', 'Ativo', 'Em dia', 'Paciente em acompanhamento semanal'),
  ('cli_9', 'Bianca Rocha', 'bianca.rocha@email.com', '(11) 99211-4940', '2026-03-23', 'Ativo', 'Pendente', NULL),
  ('cli_10', 'Lucas Pereira', 'lucas.pereira@email.com', '(11) 99318-8408', '2026-05-06', 'Ativo', 'Em dia', NULL),
  ('cli_11', 'Camila Azevedo', 'camila.azevedo@email.com', '(11) 98262-6334', '2025-11-03', 'Ativo', 'Em dia', NULL),
  ('cli_12', 'Rafael Gomes', 'rafael.gomes@email.com', '(11) 95960-3004', '2026-03-23', 'Ativo', 'Inadimplente', 'Paciente em acompanhamento semanal'),
  ('cli_13', 'Patricia Nunes', 'patricia.nunes@email.com', '(11) 95351-5455', '2026-04-20', 'Ativo', 'Em dia', 'Prefere atendimento pela manhã'),
  ('cli_14', 'Thiago Ribeiro', 'thiago.ribeiro@email.com', '(11) 94003-7968', '2026-03-06', 'Ativo', 'Em dia', 'Prefere atendimento pela manhã'),
  ('cli_15', 'Larissa Mendes', 'larissa.mendes@email.com', '(11) 93914-5432', '2026-01-08', 'Ativo', 'Inadimplente', 'Iniciou tratamento recentemente'),
  ('cli_16', 'Eduardo Vieira', 'eduardo.vieira@email.com', '(11) 91251-1302', '2026-03-13', 'Ativo', 'Em dia', NULL),
  ('cli_17', 'Isabela Cardoso', 'isabela.cardoso@email.com', '(11) 92158-5187', '2026-04-13', 'Ativo', 'Em dia', 'Possui pacote ativo'),
  ('cli_18', 'Marcelo Torres', 'marcelo.torres@email.com', '(11) 96389-9963', '2026-03-10', 'Inativo', 'Pendente', 'Iniciou tratamento recentemente'),
  ('cli_19', 'Renata Freitas', 'renata.freitas@email.com', '(11) 95909-5984', '2026-02-05', 'Inativo', 'Inadimplente', 'Paciente em acompanhamento semanal'),
  ('cli_20', 'Vinicius Barros', 'vinicius.barros@email.com', '(11) 93371-1717', '2026-04-08', 'Inativo', 'Pendente', NULL);

INSERT INTO sessoes (id, cliente_id, cliente_nome, data, hora, duracao, tipo_consulta, status, status_pagamento, observacoes, valor_cobrado, financeiro_gerado) VALUES
  ('ses_1', 'cli_1', 'Ana Paula Silva', '2026-05-02', '14:00', 50, 'Retorno', 'Realizada', NULL, 'Evolução positiva', 100, NULL),
  ('ses_2', 'cli_2', 'Carlos Eduardo Santos', '2026-03-24', '14:00', 50, 'Avaliação', 'Realizada', NULL, NULL, 150, NULL),
  ('ses_3', 'cli_2', 'Carlos Eduardo Santos', '2026-03-23', '10:00', 50, 'Avaliação', 'Realizada', NULL, NULL, 150, NULL),
  ('ses_4', 'cli_2', 'Carlos Eduardo Santos', '2026-04-04', '15:00', 50, 'Retorno', 'Realizada', NULL, 'Evolução positiva', 100, NULL),
  ('ses_5', 'cli_2', 'Carlos Eduardo Santos', '2026-05-30', '09:00', 50, 'Pacote Mensal', 'Cancelada', NULL, 'Trabalhar ansiedade', 0, NULL),
  ('ses_6', 'cli_2', 'Carlos Eduardo Santos', '2026-05-19', '18:00', 60, 'Pacote Trimestral', 'Realizada', NULL, 'Sessão sem observações relevantes', 2000, NULL),
  ('ses_7', 'cli_2', 'Carlos Eduardo Santos', '2026-04-24', '14:00', 50, 'Sessão Avulsa', 'Realizada', NULL, 'Sessão sem observações relevantes', 200, NULL),
  ('ses_8', 'cli_3', 'Mariana Costa', '2026-04-01', '16:00', 50, 'Sessão Avulsa', 'Realizada', NULL, NULL, 200, NULL),
  ('ses_9', 'cli_4', 'Pedro Henrique Oliveira', '2026-06-01', '09:00', 50, 'Pacote Trimestral', 'Agendada', NULL, NULL, 0, NULL),
  ('ses_10', 'cli_4', 'Pedro Henrique Oliveira', '2026-06-14', '18:00', 50, 'Pacote Mensal', 'Faltou', NULL, NULL, 0, NULL),
  ('ses_11', 'cli_4', 'Pedro Henrique Oliveira', '2026-06-10', '09:00', 60, 'Pacote Trimestral', 'Faltou', NULL, 'Evolução positiva', 0, NULL),
  ('ses_12', 'cli_4', 'Pedro Henrique Oliveira', '2026-04-13', '14:00', 60, 'Sessão Avulsa', 'Realizada', NULL, NULL, 200, NULL),
  ('ses_13', 'cli_4', 'Pedro Henrique Oliveira', '2026-05-19', '15:00', 50, 'Pacote Trimestral', 'Realizada', NULL, NULL, 0, NULL),
  ('ses_14', 'cli_5', 'Julia Ferreira', '2026-04-05', '14:00', 50, 'Sessão Avulsa', 'Realizada', NULL, 'Evolução positiva', 200, NULL),
  ('ses_15', 'cli_5', 'Julia Ferreira', '2026-05-18', '15:00', 50, 'Sessão Avulsa', 'Realizada', NULL, 'Evolução positiva', 200, NULL),
  ('ses_16', 'cli_5', 'Julia Ferreira', '2026-04-04', '16:00', 50, 'Pacote Mensal', 'Realizada', NULL, 'Evolução positiva', 0, NULL),
  ('ses_17', 'cli_6', 'Roberto Almeida', '2026-03-30', '09:00', 50, 'Pacote Trimestral', 'Realizada', NULL, NULL, 0, NULL),
  ('ses_18', 'cli_6', 'Roberto Almeida', '2026-04-06', '08:00', 50, 'Retorno', 'Realizada', NULL, 'Evolução positiva', 100, NULL),
  ('ses_19', 'cli_6', 'Roberto Almeida', '2026-05-28', '16:00', 50, 'Avaliação', 'Realizada', NULL, 'Evolução positiva', 150, NULL),
  ('ses_20', 'cli_6', 'Roberto Almeida', '2026-04-12', '15:00', 50, 'Sessão Avulsa', 'Realizada', NULL, 'Sessão sem observações relevantes', 200, NULL),
  ('ses_21', 'cli_6', 'Roberto Almeida', '2026-05-16', '18:00', 60, 'Pacote Trimestral', 'Realizada', NULL, NULL, 2000, NULL),
  ('ses_22', 'cli_6', 'Roberto Almeida', '2026-04-25', '16:00', 50, 'Avaliação', 'Realizada', NULL, NULL, 150, NULL),
  ('ses_23', 'cli_7', 'Fernanda Lima', '2026-04-04', '15:00', 50, 'Avaliação', 'Realizada', NULL, 'Sessão sem observações relevantes', 150, NULL),
  ('ses_24', 'cli_7', 'Fernanda Lima', '2026-05-22', '16:00', 50, 'Sessão Avulsa', 'Realizada', NULL, 'Sessão sem observações relevantes', 200, NULL),
  ('ses_25', 'cli_7', 'Fernanda Lima', '2026-06-06', '14:00', 60, 'Sessão Avulsa', 'Agendada', NULL, 'Trabalhar ansiedade', 200, NULL),
  ('ses_26', 'cli_7', 'Fernanda Lima', '2026-04-11', '08:00', 50, 'Pacote Mensal', 'Realizada', NULL, NULL, 720, NULL),
  ('ses_27', 'cli_7', 'Fernanda Lima', '2026-04-19', '16:00', 60, 'Retorno', 'Realizada', NULL, 'Sessão sem observações relevantes', 100, NULL),
  ('ses_28', 'cli_8', 'Gabriel Martins', '2026-04-11', '08:00', 60, 'Pacote Trimestral', 'Realizada', NULL, 'Sessão sem observações relevantes', 0, NULL),
  ('ses_29', 'cli_8', 'Gabriel Martins', '2026-06-27', '17:00', 50, 'Avaliação', 'Cancelada', NULL, NULL, 150, NULL),
  ('ses_30', 'cli_8', 'Gabriel Martins', '2026-04-08', '17:00', 60, 'Pacote Mensal', 'Realizada', NULL, NULL, 0, NULL),
  ('ses_31', 'cli_8', 'Gabriel Martins', '2026-06-20', '10:00', 50, 'Sessão Avulsa', 'Agendada', NULL, 'Trabalhar ansiedade', 200, NULL),
  ('ses_32', 'cli_8', 'Gabriel Martins', '2026-05-31', '18:00', 50, 'Sessão Avulsa', 'Agendada', NULL, 'Trabalhar ansiedade', 200, NULL),
  ('ses_33', 'cli_8', 'Gabriel Martins', '2026-05-26', '08:00', 50, 'Avaliação', 'Realizada', NULL, 'Trabalhar ansiedade', 150, NULL),
  ('ses_34', 'cli_8', 'Gabriel Martins', '2026-05-11', '14:00', 50, 'Sessão Avulsa', 'Realizada', NULL, 'Sessão sem observações relevantes', 200, NULL),
  ('ses_35', 'cli_9', 'Bianca Rocha', '2026-04-19', '08:00', 50, 'Sessão Avulsa', 'Realizada', NULL, NULL, 200, NULL),
  ('ses_36', 'cli_9', 'Bianca Rocha', '2026-06-09', '17:00', 50, 'Retorno', 'Cancelada', NULL, 'Trabalhar ansiedade', 100, NULL),
  ('ses_37', 'cli_9', 'Bianca Rocha', '2026-05-23', '08:00', 50, 'Pacote Trimestral', 'Realizada', NULL, 'Trabalhar ansiedade', 2000, NULL),
  ('ses_38', 'cli_9', 'Bianca Rocha', '2026-04-04', '08:00', 50, 'Avaliação', 'Realizada', NULL, NULL, 150, NULL),
  ('ses_39', 'cli_9', 'Bianca Rocha', '2026-06-25', '14:00', 50, 'Avaliação', 'Agendada', NULL, 'Sessão sem observações relevantes', 150, NULL),
  ('ses_40', 'cli_11', 'Camila Azevedo', '2026-06-13', '18:00', 50, 'Retorno', 'Agendada', NULL, 'Sessão sem observações relevantes', 100, NULL),
  ('ses_41', 'cli_11', 'Camila Azevedo', '2026-05-27', '18:00', 50, 'Sessão Avulsa', 'Realizada', NULL, NULL, 200, NULL),
  ('ses_42', 'cli_11', 'Camila Azevedo', '2026-04-01', '14:00', 60, 'Pacote Mensal', 'Realizada', NULL, 'Evolução positiva', 0, NULL),
  ('ses_43', 'cli_12', 'Rafael Gomes', '2026-04-04', '18:00', 50, 'Sessão Avulsa', 'Realizada', NULL, 'Evolução positiva', 200, NULL),
  ('ses_44', 'cli_12', 'Rafael Gomes', '2026-05-06', '14:00', 50, 'Sessão Avulsa', 'Realizada', NULL, NULL, 200, NULL),
  ('ses_45', 'cli_12', 'Rafael Gomes', '2026-05-21', '16:00', 50, 'Pacote Trimestral', 'Realizada', NULL, 'Sessão sem observações relevantes', 0, NULL),
  ('ses_46', 'cli_12', 'Rafael Gomes', '2026-03-19', '08:00', 60, 'Pacote Trimestral', 'Realizada', NULL, 'Sessão sem observações relevantes', 0, NULL),
  ('ses_47', 'cli_12', 'Rafael Gomes', '2026-05-22', '09:00', 50, 'Retorno', 'Realizada', NULL, 'Trabalhar ansiedade', 100, NULL),
  ('ses_48', 'cli_13', 'Patricia Nunes', '2026-04-20', '15:00', 60, 'Pacote Trimestral', 'Realizada', NULL, 'Trabalhar ansiedade', 2000, NULL),
  ('ses_49', 'cli_13', 'Patricia Nunes', '2026-05-24', '18:00', 50, 'Retorno', 'Realizada', NULL, 'Evolução positiva', 100, NULL),
  ('ses_50', 'cli_14', 'Thiago Ribeiro', '2026-03-19', '14:00', 50, 'Pacote Mensal', 'Realizada', NULL, 'Sessão sem observações relevantes', 0, NULL),
  ('ses_51', 'cli_14', 'Thiago Ribeiro', '2026-07-05', '17:00', 50, 'Pacote Mensal', 'Agendada', NULL, 'Trabalhar ansiedade', 720, NULL),
  ('ses_52', 'cli_14', 'Thiago Ribeiro', '2026-03-22', '09:00', 50, 'Sessão Avulsa', 'Realizada', NULL, 'Sessão sem observações relevantes', 200, NULL),
  ('ses_53', 'cli_14', 'Thiago Ribeiro', '2026-03-23', '14:00', 50, 'Pacote Mensal', 'Realizada', NULL, NULL, 0, NULL),
  ('ses_54', 'cli_16', 'Eduardo Vieira', '2026-05-21', '17:00', 60, 'Pacote Trimestral', 'Realizada', NULL, NULL, 0, NULL),
  ('ses_55', 'cli_16', 'Eduardo Vieira', '2026-05-20', '14:00', 50, 'Sessão Avulsa', 'Realizada', NULL, 'Trabalhar ansiedade', 200, NULL),
  ('ses_56', 'cli_16', 'Eduardo Vieira', '2026-07-01', '17:00', 50, 'Sessão Avulsa', 'Cancelada', NULL, 'Evolução positiva', 200, NULL),
  ('ses_57', 'cli_17', 'Isabela Cardoso', '2026-03-24', '15:00', 50, 'Pacote Trimestral', 'Realizada', NULL, 'Sessão sem observações relevantes', 2000, NULL),
  ('ses_58', 'cli_17', 'Isabela Cardoso', '2026-03-22', '15:00', 60, 'Sessão Avulsa', 'Realizada', NULL, 'Evolução positiva', 200, NULL),
  ('ses_59', 'cli_18', 'Marcelo Torres', '2026-03-21', '10:00', 50, 'Pacote Mensal', 'Realizada', NULL, 'Sessão sem observações relevantes', 0, NULL),
  ('ses_60', 'cli_18', 'Marcelo Torres', '2026-05-04', '14:00', 50, 'Pacote Mensal', 'Realizada', NULL, 'Evolução positiva', 0, NULL),
  ('ses_61', 'cli_18', 'Marcelo Torres', '2026-03-28', '10:00', 60, 'Avaliação', 'Realizada', NULL, 'Evolução positiva', 150, NULL),
  ('ses_62', 'cli_19', 'Renata Freitas', '2026-05-30', '17:00', 50, 'Sessão Avulsa', 'Cancelada', NULL, NULL, 200, NULL),
  ('ses_63', 'cli_20', 'Vinicius Barros', '2026-06-18', '08:00', 50, 'Sessão Avulsa', 'Cancelada', NULL, 'Evolução positiva', 200, NULL),
  ('ses_64', 'cli_20', 'Vinicius Barros', '2026-03-20', '17:00', 60, 'Pacote Mensal', 'Faltou', NULL, 'Evolução positiva', 720, NULL),
  ('ses_65', 'cli_20', 'Vinicius Barros', '2026-06-05', '18:00', 50, 'Sessão Avulsa', 'Agendada', NULL, 'Evolução positiva', 200, NULL),
  ('ses_66', 'cli_20', 'Vinicius Barros', '2026-05-14', '09:00', 50, 'Retorno', 'Realizada', NULL, NULL, 100, NULL),
  ('ses_67', 'cli_20', 'Vinicius Barros', '2026-04-18', '14:00', 50, 'Pacote Mensal', 'Realizada', NULL, NULL, 0, NULL),
  ('ses_68', 'cli_20', 'Vinicius Barros', '2026-05-19', '18:00', 50, 'Avaliação', 'Realizada', NULL, 'Evolução positiva', 150, NULL);

INSERT INTO transacoes (id, tipo, categoria, tipo_consulta, descricao, valor, data, cliente_id, cliente_nome, sessao_id, origem, recorrente, frequencia) VALUES
  ('tra_1', 'Receita', 'Consultas', 'Retorno', 'Consulta - Ana Paula Silva', 100, '2026-05-02', 'cli_1', 'Ana Paula Silva', 'ses_1', NULL, NULL, NULL),
  ('tra_2', 'Receita', 'Consultas', 'Avaliação', 'Consulta - Carlos Eduardo Santos', 150, '2026-03-24', 'cli_2', 'Carlos Eduardo Santos', 'ses_2', NULL, NULL, NULL),
  ('tra_3', 'Receita', 'Consultas', 'Avaliação', 'Consulta - Carlos Eduardo Santos', 150, '2026-03-23', 'cli_2', 'Carlos Eduardo Santos', 'ses_3', NULL, NULL, NULL),
  ('tra_4', 'Receita', 'Consultas', 'Retorno', 'Consulta - Carlos Eduardo Santos', 100, '2026-04-04', 'cli_2', 'Carlos Eduardo Santos', 'ses_4', NULL, NULL, NULL),
  ('tra_5', 'Receita', 'Consultas', 'Pacote Trimestral', 'Consulta - Carlos Eduardo Santos', 2000, '2026-05-19', 'cli_2', 'Carlos Eduardo Santos', 'ses_6', NULL, NULL, NULL),
  ('tra_6', 'Receita', 'Consultas', 'Sessão Avulsa', 'Consulta - Carlos Eduardo Santos', 200, '2026-04-24', 'cli_2', 'Carlos Eduardo Santos', 'ses_7', NULL, NULL, NULL),
  ('tra_7', 'Receita', 'Consultas', 'Sessão Avulsa', 'Consulta - Mariana Costa', 200, '2026-04-01', 'cli_3', 'Mariana Costa', 'ses_8', NULL, NULL, NULL),
  ('tra_8', 'Receita', 'Consultas', 'Sessão Avulsa', 'Consulta - Pedro Henrique Oliveira', 200, '2026-04-13', 'cli_4', 'Pedro Henrique Oliveira', 'ses_12', NULL, NULL, NULL),
  ('tra_9', 'Receita', 'Consultas', 'Sessão Avulsa', 'Consulta - Julia Ferreira', 200, '2026-04-05', 'cli_5', 'Julia Ferreira', 'ses_14', NULL, NULL, NULL),
  ('tra_10', 'Receita', 'Consultas', 'Sessão Avulsa', 'Consulta - Julia Ferreira', 200, '2026-05-18', 'cli_5', 'Julia Ferreira', 'ses_15', NULL, NULL, NULL),
  ('tra_11', 'Receita', 'Consultas', 'Retorno', 'Consulta - Roberto Almeida', 100, '2026-04-06', 'cli_6', 'Roberto Almeida', 'ses_18', NULL, NULL, NULL),
  ('tra_12', 'Receita', 'Consultas', 'Avaliação', 'Consulta - Roberto Almeida', 150, '2026-05-28', 'cli_6', 'Roberto Almeida', 'ses_19', NULL, NULL, NULL),
  ('tra_13', 'Receita', 'Consultas', 'Sessão Avulsa', 'Consulta - Roberto Almeida', 200, '2026-04-12', 'cli_6', 'Roberto Almeida', 'ses_20', NULL, NULL, NULL),
  ('tra_14', 'Receita', 'Consultas', 'Pacote Trimestral', 'Consulta - Roberto Almeida', 2000, '2026-05-16', 'cli_6', 'Roberto Almeida', 'ses_21', NULL, NULL, NULL),
  ('tra_15', 'Receita', 'Consultas', 'Avaliação', 'Consulta - Roberto Almeida', 150, '2026-04-25', 'cli_6', 'Roberto Almeida', 'ses_22', NULL, NULL, NULL),
  ('tra_16', 'Receita', 'Consultas', 'Avaliação', 'Consulta - Fernanda Lima', 150, '2026-04-04', 'cli_7', 'Fernanda Lima', 'ses_23', NULL, NULL, NULL),
  ('tra_17', 'Receita', 'Consultas', 'Sessão Avulsa', 'Consulta - Fernanda Lima', 200, '2026-05-22', 'cli_7', 'Fernanda Lima', 'ses_24', NULL, NULL, NULL),
  ('tra_18', 'Receita', 'Consultas', 'Pacote Mensal', 'Consulta - Fernanda Lima', 720, '2026-04-11', 'cli_7', 'Fernanda Lima', 'ses_26', NULL, NULL, NULL),
  ('tra_19', 'Receita', 'Consultas', 'Retorno', 'Consulta - Fernanda Lima', 100, '2026-04-19', 'cli_7', 'Fernanda Lima', 'ses_27', NULL, NULL, NULL),
  ('tra_20', 'Receita', 'Consultas', 'Avaliação', 'Consulta - Gabriel Martins', 150, '2026-05-26', 'cli_8', 'Gabriel Martins', 'ses_33', NULL, NULL, NULL),
  ('tra_21', 'Receita', 'Consultas', 'Sessão Avulsa', 'Consulta - Gabriel Martins', 200, '2026-05-11', 'cli_8', 'Gabriel Martins', 'ses_34', NULL, NULL, NULL),
  ('tra_22', 'Receita', 'Consultas', 'Sessão Avulsa', 'Consulta - Bianca Rocha', 200, '2026-04-19', 'cli_9', 'Bianca Rocha', 'ses_35', NULL, NULL, NULL),
  ('tra_23', 'Receita', 'Consultas', 'Pacote Trimestral', 'Consulta - Bianca Rocha', 2000, '2026-05-23', 'cli_9', 'Bianca Rocha', 'ses_37', NULL, NULL, NULL),
  ('tra_24', 'Receita', 'Consultas', 'Avaliação', 'Consulta - Bianca Rocha', 150, '2026-04-04', 'cli_9', 'Bianca Rocha', 'ses_38', NULL, NULL, NULL),
  ('tra_25', 'Receita', 'Consultas', 'Sessão Avulsa', 'Consulta - Camila Azevedo', 200, '2026-05-27', 'cli_11', 'Camila Azevedo', 'ses_41', NULL, NULL, NULL),
  ('tra_26', 'Receita', 'Consultas', 'Sessão Avulsa', 'Consulta - Rafael Gomes', 200, '2026-04-04', 'cli_12', 'Rafael Gomes', 'ses_43', NULL, NULL, NULL),
  ('tra_27', 'Receita', 'Consultas', 'Sessão Avulsa', 'Consulta - Rafael Gomes', 200, '2026-05-06', 'cli_12', 'Rafael Gomes', 'ses_44', NULL, NULL, NULL),
  ('tra_28', 'Receita', 'Consultas', 'Retorno', 'Consulta - Rafael Gomes', 100, '2026-05-22', 'cli_12', 'Rafael Gomes', 'ses_47', NULL, NULL, NULL),
  ('tra_29', 'Receita', 'Consultas', 'Pacote Trimestral', 'Consulta - Patricia Nunes', 2000, '2026-04-20', 'cli_13', 'Patricia Nunes', 'ses_48', NULL, NULL, NULL),
  ('tra_30', 'Receita', 'Consultas', 'Retorno', 'Consulta - Patricia Nunes', 100, '2026-05-24', 'cli_13', 'Patricia Nunes', 'ses_49', NULL, NULL, NULL),
  ('tra_31', 'Receita', 'Consultas', 'Sessão Avulsa', 'Consulta - Thiago Ribeiro', 200, '2026-03-22', 'cli_14', 'Thiago Ribeiro', 'ses_52', NULL, NULL, NULL),
  ('tra_32', 'Receita', 'Consultas', 'Sessão Avulsa', 'Consulta - Eduardo Vieira', 200, '2026-05-20', 'cli_16', 'Eduardo Vieira', 'ses_55', NULL, NULL, NULL),
  ('tra_33', 'Receita', 'Consultas', 'Pacote Trimestral', 'Consulta - Isabela Cardoso', 2000, '2026-03-24', 'cli_17', 'Isabela Cardoso', 'ses_57', NULL, NULL, NULL),
  ('tra_34', 'Receita', 'Consultas', 'Sessão Avulsa', 'Consulta - Isabela Cardoso', 200, '2026-03-22', 'cli_17', 'Isabela Cardoso', 'ses_58', NULL, NULL, NULL),
  ('tra_35', 'Receita', 'Consultas', 'Avaliação', 'Consulta - Marcelo Torres', 150, '2026-03-28', 'cli_18', 'Marcelo Torres', 'ses_61', NULL, NULL, NULL),
  ('tra_36', 'Receita', 'Consultas', 'Retorno', 'Consulta - Vinicius Barros', 100, '2026-05-14', 'cli_20', 'Vinicius Barros', 'ses_66', NULL, NULL, NULL),
  ('tra_37', 'Receita', 'Consultas', 'Avaliação', 'Consulta - Vinicius Barros', 150, '2026-05-19', 'cli_20', 'Vinicius Barros', 'ses_68', NULL, NULL, NULL),
  ('tra_38', 'Despesa', 'Infraestrutura', NULL, 'Aluguel da sala', 1252, '2026-01-09', NULL, NULL, NULL, NULL, NULL, NULL),
  ('tra_39', 'Despesa', 'Operacional', NULL, 'Sistema de agenda', 77, '2026-01-13', NULL, NULL, NULL, NULL, NULL, NULL),
  ('tra_40', 'Despesa', 'Marketing', NULL, 'Anúncios Instagram', 315, '2026-01-25', NULL, NULL, NULL, NULL, NULL, NULL),
  ('tra_41', 'Despesa', 'Infraestrutura', NULL, 'Internet consultório', 172, '2026-01-07', NULL, NULL, NULL, NULL, NULL, NULL),
  ('tra_42', 'Despesa', 'Operacional', NULL, 'Materiais de escritório', 72, '2026-01-18', NULL, NULL, NULL, NULL, NULL, NULL),
  ('tra_43', 'Despesa', 'Infraestrutura', NULL, 'Aluguel da sala', 1256, '2026-02-06', NULL, NULL, NULL, NULL, NULL, NULL),
  ('tra_44', 'Despesa', 'Operacional', NULL, 'Sistema de agenda', 145, '2026-02-18', NULL, NULL, NULL, NULL, NULL, NULL),
  ('tra_45', 'Despesa', 'Marketing', NULL, 'Anúncios Instagram', 286, '2026-02-12', NULL, NULL, NULL, NULL, NULL, NULL),
  ('tra_46', 'Despesa', 'Infraestrutura', NULL, 'Internet consultório', 159, '2026-02-06', NULL, NULL, NULL, NULL, NULL, NULL),
  ('tra_47', 'Despesa', 'Infraestrutura', NULL, 'Aluguel da sala', 1209, '2026-03-05', NULL, NULL, NULL, NULL, NULL, NULL),
  ('tra_48', 'Despesa', 'Marketing', NULL, 'Anúncios Instagram', 278, '2026-03-05', NULL, NULL, NULL, NULL, NULL, NULL),
  ('tra_49', 'Despesa', 'Infraestrutura', NULL, 'Aluguel da sala', 1204, '2026-04-15', NULL, NULL, NULL, NULL, NULL, NULL),
  ('tra_50', 'Despesa', 'Operacional', NULL, 'Sistema de agenda', 85, '2026-04-05', NULL, NULL, NULL, NULL, NULL, NULL),
  ('tra_51', 'Despesa', 'Marketing', NULL, 'Anúncios Instagram', 238, '2026-04-19', NULL, NULL, NULL, NULL, NULL, NULL),
  ('tra_52', 'Despesa', 'Infraestrutura', NULL, 'Internet consultório', 146, '2026-04-07', NULL, NULL, NULL, NULL, NULL, NULL),
  ('tra_53', 'Despesa', 'Operacional', NULL, 'Materiais de escritório', 145, '2026-04-19', NULL, NULL, NULL, NULL, NULL, NULL),
  ('tra_54', 'Despesa', 'Infraestrutura', NULL, 'Aluguel da sala', 1184, '2026-05-25', NULL, NULL, NULL, NULL, NULL, NULL),
  ('tra_55', 'Despesa', 'Operacional', NULL, 'Sistema de agenda', 122, '2026-05-18', NULL, NULL, NULL, NULL, NULL, NULL),
  ('tra_56', 'Despesa', 'Marketing', NULL, 'Anúncios Instagram', 240, '2026-05-03', NULL, NULL, NULL, NULL, NULL, NULL),
  ('tra_57', 'Despesa', 'Operacional', NULL, 'Materiais de escritório', 116, '2026-05-12', NULL, NULL, NULL, NULL, NULL, NULL),
  ('tra_58', 'Receita', 'Consultas', 'Sessão Avulsa', 'Pagamento pacote/consulta - Ana Paula Silva', 200, '2026-05-12', 'cli_1', 'Ana Paula Silva', NULL, NULL, NULL, NULL),
  ('tra_59', 'Receita', 'Consultas', 'Pacote Trimestral', 'Pagamento pacote/consulta - Carlos Eduardo Santos', 200, '2026-05-04', 'cli_2', 'Carlos Eduardo Santos', NULL, NULL, NULL, NULL),
  ('tra_60', 'Receita', 'Consultas', 'Pacote Mensal', 'Pagamento pacote/consulta - Mariana Costa', 150, '2026-05-11', 'cli_3', 'Mariana Costa', NULL, NULL, NULL, NULL),
  ('tra_61', 'Receita', 'Consultas', 'Pacote Mensal', 'Pagamento pacote/consulta - Pedro Henrique Oliveira', 200, '2026-05-04', 'cli_4', 'Pedro Henrique Oliveira', NULL, NULL, NULL, NULL),
  ('tra_62', 'Receita', 'Consultas', 'Sessão Avulsa', 'Pagamento pacote/consulta - Julia Ferreira', 720, '2026-05-01', 'cli_5', 'Julia Ferreira', NULL, NULL, NULL, NULL);

COMMIT;
