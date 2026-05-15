const Produto = require("../models/produto");
const Ponto = require("../models/pontos");
const Transacao = require("../models/transacao");

function normalizarImagemBase64(imagem) {
  if (typeof imagem !== "string") return imagem;

  const imagemTrim = imagem.trim();
  if (!imagemTrim) return "";
  if (imagemTrim.startsWith("data:image/")) return imagemTrim;

  // Aceita base64 puro e adiciona prefixo para o frontend renderizar corretamente.
  const base64Limpo = imagemTrim.replace(/\s/g, "");
  const padraoBase64 = /^[A-Za-z0-9+/=]+$/;
  if (padraoBase64.test(base64Limpo)) {
    return `data:image/jpeg;base64,${base64Limpo}`;
  }

  return imagemTrim;
}

async function adicionarPontos(userId, pontosAdicionar, tipo = "ganho", produtoId = null) {
  try {
    let pontos = await Ponto.findOne({ user: userId });
    if (!pontos) {
      pontos = await Ponto.create({ user: userId, saldo: 0 });
    }

    pontos.saldo += pontosAdicionar;
    await pontos.save();

    await Transacao.create({
      user: userId,
      tipo, 
      pontos: pontosAdicionar,
      produto: produtoId || undefined,
    });

    console.log(`Usuário ${userId} recebeu ${pontosAdicionar} pontos (${tipo})`);
  } catch (err) {
    console.error("Erro ao adicionar pontos:", err.message);
  }
}

module.exports = {

  listarProdutos: async (req, res) => {
    try {
      const produtos = await Produto.find({ ativo: true });
      res.json(produtos);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  criarProduto: async (req, res) => {
    try {
      const {
        nome,
        nomeEn,
        descricao,
        descricaoEn,
        imagem,
        precoPontos,
        stock,
        ativo
      } = req.body;

      const imagemNormalizada = normalizarImagemBase64(imagem);

      if (!nome || typeof precoPontos !== 'number') {
        return res.status(400).json({ message: 'nome e precoPontos são obrigatórios.' });
      }

      if (typeof imagemNormalizada === 'string' && imagemNormalizada.length > 6_000_000) {
        return res.status(400).json({ message: 'Imagem demasiado grande para o produto.' });
      }

      const produto = await Produto.create({
        nome,
        nomeEn,
        descricao,
        descricaoEn,
        imagem: imagemNormalizada,
        precoPontos,
        stock,
        ativo
      });
      res.status(201).json(produto);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  atualizarProduto: async (req, res) => {
    try {
      const { produtoId } = req.params;
      const payload = { ...req.body };

      if (typeof payload.imagem === 'string') {
        payload.imagem = normalizarImagemBase64(payload.imagem);
      }

      if (typeof payload.imagem === 'string' && payload.imagem.length > 6_000_000) {
        return res.status(400).json({ message: 'Imagem demasiado grande para o produto.' });
      }

      const produto = await Produto.findByIdAndUpdate(produtoId, payload, { new: true });
      if (!produto) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }
      return res.json(produto);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  removerProduto: async (req, res) => {
    try {
      const { produtoId } = req.params;
      const produto = await Produto.findByIdAndDelete(produtoId);
      if (!produto) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }
      return res.json({ message: 'Produto removido com sucesso' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  comprarProduto: async (req, res) => {
    try {
      const { produtoId } = req.params;
      const userId = req.user.id;

      const produto = await Produto.findById(produtoId);
      if (!produto || !produto.ativo)
        return res.status(404).json({ message: "Produto não encontrado" });
      if (produto.stock <= 0)
        return res.status(400).json({ message: "Produto esgotado" });

      let pontos = await Ponto.findOne({ user: userId });
      if (!pontos) pontos = await Ponto.create({ user: userId, saldo: 0 });

      if (pontos.saldo < produto.precoPontos)
        return res.status(400).json({ message: "Pontos insuficientes" });

      
      pontos.saldo -= produto.precoPontos;
      await pontos.save();

      
      await Transacao.create({
        user: userId,
        produto: produto._id,
        tipo: "compra",
        pontos: produto.precoPontos,
      });

     
      produto.stock -= 1;
      await produto.save();

      res.json({ message: "Produto comprado com sucesso" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  listarTransacoes: async (req, res) => {
    try {
      const transacoes = await Transacao.find({ user: req.user.id }).populate("produto");
      res.json(transacoes);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  saldoPontos: async (req, res) => {
    try {
      const pontos = await Ponto.findOne({ user: req.user.id });
      res.json({ saldo: pontos?.saldo || 0 });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  adicionarPontos, 
};
