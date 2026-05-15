const mongoose = require("mongoose");

const produtoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  nomeEn: { type: String },
  descricao: { type: String },
  descricaoEn: { type: String },
  imagem: { type: String },
  precoPontos: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  ativo: { type: Boolean, default: true },
  criadoEm: { type: Date, default: Date.now }
});

const Produto = mongoose.models.Produto || mongoose.model("Produto", produtoSchema);
module.exports = Produto;
