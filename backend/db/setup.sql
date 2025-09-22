-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);

-- Tabela de ocorrências
CREATE TABLE IF NOT EXISTS ocorrencias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TEXT NOT NULL,
    ocorrencia TEXT NOT NULL,
    placa TEXT NOT NULL,
    situacao TEXT NOT NULL,
    protocolo TEXT UNIQUE
);

-- Tabela de sequências por ano
CREATE TABLE IF NOT EXISTS sequencias (
    ano INTEGER PRIMARY KEY,
    ultimo_numero INTEGER
);

-- Inserir usuário de teste
INSERT OR IGNORE INTO usuarios (username, password) VALUES ('admin', '123456');
