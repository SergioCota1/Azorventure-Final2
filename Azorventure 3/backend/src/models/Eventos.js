const mongoose = require("mongoose");

const eventosSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },

    tituloEn: {
      type: String,
      trim: true,
      maxlength: 120
    },

    descricao: {
      type: String,
      maxlength: 2000
    },

    descricaoEn: {
      type: String,
      maxlength: 2000
    },

    topico: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true
    },

    subtopico: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true
    },

    organizador: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    local: {
      type: String,
      trim: true,
      maxlength: 200
    },

    lat: {
      type: Number,
      min: -90,
      max: 90
    },

    lng: {
      type: Number,
      min: -180,
      max: 180
    },

    preco: {
      type: Number,
      min: 0,
      default: 0
    },

    receitaTotal: {
      type: Number,
      min: 0,
      default: 0
    },

    gratuito: {
      type: Boolean,
      default: true
    },

    capacidadeMaxima: {
      type: Number,
      min: 1
    },

    telefone: {
      type: String,
      match: /^[0-9+\s()-]{9,20}$/
    },

    imagens: {
      type: [String],
      default: [],
      validate: {
        validator: v => v.length <= 5,
        message: "Máximo de 5 imagens"
      }
    },

    inicio: {
      type: Date,
      required: true
    },

    fim: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["ativo", "cancelado", "encerrado"],
      default: "ativo",
      index: true
    }
  },
  {
    timestamps: { createdAt: "criadoEm", updatedAt: "atualizadoEm" }
  }
);


eventosSchema.index({ topico: 1, subtopico: 1 });
eventosSchema.index({ inicio: 1 });

const Eventos = mongoose.models.Eventos || mongoose.model("Eventos", eventosSchema);
module.exports = Eventos;