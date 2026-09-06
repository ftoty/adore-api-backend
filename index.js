// ==========================================
// 1. IMPORTAÇÕES E CONFIGURAÇÃO GLOBAL
// ==========================================
const express = require('express');
const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const cors = require('cors');
app.use(cors({
    origin: ['https://app.netlify.com', 'https://www.adorepersonalite.com', /\.wixsite\.com$/],
    credentials: true
}));
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Disponibilizar a pasta de uploads publicamente
app.use('/uploads', express.static('uploads'));

// ==========================================
// 2. CONFIGURAÇÃO DO MULTER (UPLOADS)
// ==========================================
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

// ==========================================
// 3. CONFIGURAÇÃO DA BASE DE DADOS (POSTGRES & SUPABASE)
// ==========================================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres.mlfgluwcuzddwijffrbe:Wiegaist1403@@aws-0-us-east-1.pooler.supabase.com:5432/postgres",
  ssl: { rejectUnauthorized: false }
});

// Inicialização do cliente Supabase para o inventário
const supabase = createClient(
  process.env.SUPABASE_URL || "https://wryyuhvuyqjxtvuxknyf.supabase.co", 
  process.env.SUPABASE_ANON_KEY || "SUA_CHAVE_ANON_AQUI"
);

// ==========================================
// 4. ROTAS DE INVENTÁRIO & MATERIAIS (SUPABASE)
// ==========================================

app.get('/api/materiais', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('materiais_inventario')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error("Erro ao buscar materiais:", err.message);
        res.status(500).json({ sucesso: false, mensagem: err.message });
    }
});

app.post('/api/materiais', async (req, res) => {
    try {
        const { nome, tipo, quantidade_atual, unidade_medida, custo_unitario, fornecedor } = req.body;

        const { data, error } = await supabase
            .from('materiais_inventario')
            .insert([{ 
                nome, 
                tipo, 
                quantidade_atual: parseFloat(quantidade_atual), 
                unidade_medida, 
                custo_unitario: parseFloat(custo_unitario), 
                fornecedor 
            }])
            .select();

        if (error) throw error;
        res.json({ sucesso: true, mensagem: "Material cadastrado com sucesso!", material: data[0] });
    } catch (err) {
        console.error("Erro ao cadastrar material:", err.message);
        res.status(500).json({ sucesso: false, mensagem: err.message });
    }
});

app.delete('/api/materiais/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('materiais_inventario')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ sucesso: true, mensagem: "Material excluído com sucesso!" });
    } catch (err) {
        console.error("Erro ao excluir material:", err.message);
        res.status(500).json({ sucesso: false, mensagem: err.message });
    }
});

// ==========================================
// 5. ROTAS DE CATEGORIAS, PRODUTOS E UPLOAD
// ==========================================

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

// ==========================================
// 6. INICIALIZAÇÃO DO SERVIDOR (Sempre no fim!)
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor a correr na porta ${PORT}`);
});