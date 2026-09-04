const express = require('express');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres.mlfgluwcuzddwijffrbe:Wiegaist1403@@aws-0-us-east-1.pooler.supabase.com:5432/postgres",
  ssl: { rejectUnauthorized: false }
});

app.get('/categorias', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT DISTINCT categoria FROM public.produtos WHERE categoria IS NOT NULL ORDER BY categoria ASC');
    res.json(resultado.rows.map(r => r.categoria));
  } catch (err) {
    res.status(500).json({ erroReal: err.message });
  }
});

app.get('/produtos', async (req, res) => {
  try {
    const { categoria } = req.query;
    let query = 'SELECT * FROM public.produtos';
    let values = [];

    if (categoria && categoria !== 'todos') {
      query += ' WHERE categoria = $1';
      values.push(categoria);
    }

    query += ' ORDER BY id DESC';
    const resultado = await pool.query(query, values);
    res.json(resultado.rows);
  } catch (err) {
    res.status(500).json({ erroReal: err.message });
  }
});

app.delete('/produtos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await pool.query('DELETE FROM public.produtos WHERE id = $1 RETURNING *', [id]);
    
    if (resultado.rowCount === 0) {
      return res.status(404).json({ sucesso: false, mensagem: "Produto não encontrado." });
    }

    res.json({
      sucesso: true,
      mensagem: "Produto excluído com sucesso!",
      produtoRemovido: resultado.rows[0]
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.post('/produtos/upload', upload.fields([
  { name: 'imagem', maxCount: 1 },
  { name: 'stl', maxCount: 1 },
  { name: 'extra', maxCount: 1 }
]), async (req, res) => {
  try {
    const arquivos = req.files || {};
    let nomeProduto = "Produto 3D Padrão";
    let precoProduto = 29.90;
    let linkExterno = null;
    let categoria = "Geral";

    if (req.body) {
      if (req.body.preco) precoProduto = parseFloat(req.body.preco) || 29.90;
      if (req.body.link_externo) linkExterno = req.body.link_externo;
      if (req.body.categoria && req.body.categoria.trim() !== "") {
        categoria = req.body.categoria.trim();
      }
      if (req.body.nome && req.body.nome.trim() !== "") {
        nomeProduto = req.body.nome;
      }
    }

    let imagemNome = null;
    let stlNome = null;
    let extraNome = null;

    const primeiroArquivo = (arquivos.stl && arquivos.stl[0]) || 
                            (arquivos.imagem && arquivos.imagem[0]) || 
                            (arquivos.extra && arquivos.extra[0]);

    if (primeiroArquivo && (!req.body.nome || req.body.nome.trim() === "")) {
      nomeProduto = path.basename(primeiroArquivo.originalname, path.extname(primeiroArquivo.originalname));
    }

    if (arquivos.stl && arquivos.stl[0]) stlNome = arquivos.stl[0].filename;
    if (arquivos.imagem && arquivos.imagem[0]) imagemNome = arquivos.imagem[0].filename;
    if (arquivos.extra && arquivos.extra[0]) extraNome = arquivos.extra[0].filename;

    const query = `
      INSERT INTO public.produtos (nome, preco, imagem_url, stl_url, arquivo_extra, link_externo, categoria) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *
    `;
    const values = [nomeProduto, precoProduto, imagemNome, stlNome, extraNome, linkExterno, categoria];
    const resultado = await pool.query(query, values);

    res.json({
      sucesso: true,
      mensagem: "Produto cadastrado com sucesso!",
      produtoCadastrado: resultado.rows[0]
    });

  } catch (err) {
    console.error("ERRO COMPLETO NO UPLOAD:", err);
    res.status(500).json({ 
      sucesso: false, 
      erro: err.message || "Erro desconhecido", 
      detalhe: err.toString() 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});