const mongoose = require("mongoose");

const bilheteSchema = new mongoose.Schema(
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
    qrCode: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    usado: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: { createdAt: "criadoEm", updatedAt: false }
  }
);

const Bilhete = mongoose.models.Bilhete || mongoose.model("Bilhete", bilheteSchema);
module.exports = Bilhete;
