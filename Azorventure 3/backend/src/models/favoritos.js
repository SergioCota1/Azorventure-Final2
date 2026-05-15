const mongoose = require("mongoose");

const favoritoSchema = new mongoose.Schema(
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
    }
  },
  {
    timestamps: true 
  }
);


favoritoSchema.index({ user: 1, evento: 1 }, { unique: true });

const Favorito = mongoose.models.Favorito || mongoose.model("Favorito", favoritoSchema);
module.exports = Favorito;
