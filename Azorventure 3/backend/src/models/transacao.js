const mongoose = require("mongoose");

const transacaoSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  produto: { type: mongoose.Schema.Types.ObjectId, ref: "Produto" }, 
  tipo: { type: String, enum: ["compra", "ganho", "bilhete"], required: true },
  pontos: { type: Number, required: true },
  criadoEm: { type: Date, default: Date.now }
});

const Transacao = mongoose.models.Transacao || mongoose.model("Transacao", transacaoSchema);
module.exports = Transacao;
