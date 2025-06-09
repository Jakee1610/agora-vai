const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const host = '0.0.0.0';

const app = express();
app.use(cors());
app.use(express.json());

const dataDir = path.join(__dirname, 'data');

function lerJSON(nomeArquivo) {
  const file = path.join(dataDir, nomeArquivo);
  if (!fs.existsSync(file)) return null;
  const conteudo = fs.readFileSync(file);
  return JSON.parse(conteudo);
}

function salvarJSON(nomeArquivo, data) {
  const file = path.join(dataDir, nomeArquivo);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Garantir pasta data
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

// --- Itens ---
app.get('/itens', (req, res) => {
  const itens = lerJSON('itens.json') || [];
  res.json(itens);
});

app.post('/itens', (req, res) => {
  const itens = lerJSON('itens.json') || [];
  const novoItem = req.body;
  if (itens.find(i => i.nome.toLowerCase() === novoItem.nome.toLowerCase())) {
    return res.status(400).json({ error: 'Item já existe' });
  }
  itens.push(novoItem);
  salvarJSON('itens.json', itens);
  res.json({ success: true });
});

app.put('/itens/:nome', (req, res) => {
  const itens = lerJSON('itens.json') || [];
  const nome = req.params.nome.toLowerCase();
  const index = itens.findIndex(i => i.nome.toLowerCase() === nome);
  if (index === -1) return res.status(404).json({ error: 'Item não encontrado' });
  itens[index] = { ...itens[index], ...req.body };
  salvarJSON('itens.json', itens);
  res.json({ success: true });
});

app.delete('/itens/:nome', (req, res) => {
  let itens = lerJSON('itens.json') || [];
  const nome = req.params.nome.toLowerCase();
  itens = itens.filter(i => i.nome.toLowerCase() !== nome);
  salvarJSON('itens.json', itens);
  res.json({ success: true });
});

// --- Config ---
app.get('/config', (req, res) => {
  const config = lerJSON('config.json') || {
    titulo: 'Festinha da Brubru',
    fundo: '',
    cores: {
      titulo: '#ff69b4',
      texto: '#333',
      container: '#fff0f6',
      item: '#ffd1e8'
    }
  };
  res.json(config);
});

app.put('/config', (req, res) => {
  salvarJSON('config.json', req.body);
  res.json({ success: true });
});

// --- Registros ---
app.get('/registros', (req, res) => {
  const registros = lerJSON('registros.json') || [];
  res.json(registros);
});

app.post('/registros', (req, res) => {
  const registros = lerJSON('registros.json') || [];
  registros.push(req.body);
  salvarJSON('registros.json', registros);
  res.json({ success: true });
});

app.delete('/registros', (req, res) => {
  salvarJSON('registros.json', []);
  res.json({ success: true });
});

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


