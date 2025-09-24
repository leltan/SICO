const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Criar pasta db se não existir
const dbFolder = path.join(__dirname, 'db');
if (!fs.existsSync(dbFolder)) fs.mkdirSync(dbFolder);

// Caminho do banco
const dbPath = path.join(dbFolder, 'database.db');

// Abrir/criar banco
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) return console.error('Erro ao abrir banco:', err.message);
    console.log('Banco aberto/criado com sucesso!');
});

// Criar tabelas e coluna protocolo de forma serializada
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS ocorrencias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        data TEXT NOT NULL,
        ocorrencia TEXT NOT NULL,
        placa TEXT NOT NULL,
        situacao TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS sequencias (
        ano INTEGER PRIMARY KEY,
        ultimo_numero INTEGER
    )`);

    // Verifica se a coluna protocolo existe
    db.all(`PRAGMA table_info(ocorrencias);`, [], (err, rows) => {
        if (err) return console.error(err);
        const colunas = rows.map(r => r.name);
        if (!colunas.includes('protocolo')) {
            db.run(`ALTER TABLE ocorrencias ADD COLUMN protocolo TEXT`, (err) => {
                if (err) console.error(err);
                else console.log('Coluna "protocolo" criada com sucesso!');
            });
        } else {
            console.log('Coluna "protocolo" já existe.');
        }

        // Inserir usuário de teste
        db.run(`INSERT OR IGNORE INTO usuarios (username, password) VALUES (?, ?)`, ['admin', '123456'], (err) => {
            if (err) console.error(err);
            else console.log('Usuário de teste inserido ou já existente.');

            // Fecha o banco
            db.close((err) => {
                if (err) console.error(err.message);
                else console.log('Banco fechado com sucesso!');
            });
        });
    });
});
