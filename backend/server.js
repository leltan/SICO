const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: 'chave-secreta',
    resave: false,
    saveUninitialized: true,
  })
);

app.use(
  cors({
    origin: `http://localhost:${PORT}`,
    credentials: true,
  })
);

// Serve arquivos do frontend
app.use(express.static(path.join(__dirname, '../Frontend')));

// Conecta ao banco
const db = new sqlite3.Database('./db/database.db', (err) => {
  if (err) console.error('Erro ao conectar ao banco:', err.message);
  else console.log('Banco conectado.');
});

// Cria tabela sequencias se não existir
db.run(`CREATE TABLE IF NOT EXISTS sequencias (
  ano INTEGER PRIMARY KEY,
  ultimo_numero INTEGER
)`);

// Função para gerar protocolo
function gerarProtocolo(callback) {
  const anoAtual = new Date().getFullYear();
  db.serialize(() => {
    db.run('BEGIN IMMEDIATE');
    db.get('SELECT ultimo_numero FROM sequencias WHERE ano = ?', [anoAtual], (err, row) => {
      if (err) { db.run('ROLLBACK'); return callback(err); }
      let numero = row ? row.ultimo_numero + 1 : 1;
      if (row) {
        db.run('UPDATE sequencias SET ultimo_numero = ? WHERE ano = ?', [numero, anoAtual]);
      } else {
        db.run('INSERT INTO sequencias (ano, ultimo_numero) VALUES (?, ?)', [anoAtual, numero]);
      }
      db.run('COMMIT', (err) => {
        if (err) return callback(err);
        const numeroFormatado = String(numero).padStart(5, '0');
        callback(null, `${numeroFormatado}/${anoAtual}`);
      });
    });
  });
}

// Rotas de login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM usuarios WHERE username = ? AND password = ?', [username, password], (err, user) => {
    if (err) return res.status(500).json({ error: 'Erro no servidor' });
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });
    req.session.userId = user.id;
    res.json({ message: 'Login bem-sucedido!' });
  });
});

app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Erro ao encerrar sessão' });
    res.json({ message: 'Logout realizado com sucesso' });
  });
});

function authMiddleware(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Não autorizado' });
  next();
}

// Ocorrencias
app.get('/ocorrencias', authMiddleware, (req, res) => {
  db.all('SELECT * FROM ocorrencias ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/ocorrencias', authMiddleware, (req, res) => {
  const { data, ocorrencia, placa, situacao, empresa } = req.body;
  gerarProtocolo((err, protocolo) => {
    if (err) return res.status(500).json({ error: 'Erro ao gerar protocolo' });
    db.run(
      'INSERT INTO ocorrencias (data, ocorrencia, placa, situacao, protocolo, empresa) VALUES (?, ?, ?, ?, ?, ?)',
      [data, ocorrencia, placa, situacao, protocolo, empresa],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, protocolo });
      }
    );
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
''