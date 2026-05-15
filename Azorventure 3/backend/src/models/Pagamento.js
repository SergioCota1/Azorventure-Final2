const mongoose = require("mongoose");

const pagamentoSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    evento: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Eventos",
      required: true,
      index: true
    },
    checkoutId: {
      type: String,
      unique: true,
      sparse: true
    },
    easypayId: {
      type: String,
      sparse: true
    },
    valor: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ["pendente", "pago", "falhou", "expirado"],
      default: "pendente",
      index: true
    },
    metodo: {
      type: String
    },
    bilhete: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bilhete",
      default: null
    }
  },
  {
    timestamps: { createdAt: "criadoEm", updatedAt: "atualizadoEm" }
  }
);

const Pagamento = mongoose.models.Pagamento || mongoose.model("Pagamento", pagamentoSchema);
module.exports = Pagamento;
