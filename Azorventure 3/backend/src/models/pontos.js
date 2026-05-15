const mongoose = require("mongoose");

const pontosSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  saldo: { type: Number, default: 0 }
});

const Ponto = mongoose.models.Ponto || mongoose.model("Ponto", pontosSchema);
module.exports = Ponto;
