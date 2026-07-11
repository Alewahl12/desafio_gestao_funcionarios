-- Criação da tabela Departamento
CREATE TABLE departamento (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    descricao VARCHAR(255) NOT NULL
);

-- Criação da tabela Usuário (login do sistema)
CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    login VARCHAR(100) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL
);

-- Criação da tabela Cargo
CREATE TABLE cargo (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    descricao VARCHAR(255) NOT NULL
);

-- Criação da tabela Funcionário
CREATE TABLE funcionario (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL
);

-- Criação da tabela Vínculo (com as chaves estrangeiras)
CREATE TABLE vinculo (
    id SERIAL PRIMARY KEY,
    funcionario_id INTEGER NOT NULL,
    empresa VARCHAR(255) NOT NULL,
    matricula VARCHAR(50) NOT NULL,
    cargo_id INTEGER NOT NULL,
    departamento_id INTEGER NOT NULL,
    CONSTRAINT fk_funcionario FOREIGN KEY (funcionario_id) REFERENCES funcionario(id) ON DELETE CASCADE,
    CONSTRAINT fk_cargo FOREIGN KEY (cargo_id) REFERENCES cargo(id),
    CONSTRAINT fk_departamento FOREIGN KEY (departamento_id) REFERENCES departamento(id)
);