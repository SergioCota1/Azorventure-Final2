const mongoose = require("mongoose");

const organizadorFavoritoSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    organizador: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

organizadorFavoritoSchema.index({ user: 1, organizador: 1 }, { unique: true });

const OrganizadorFavorito =
  mongoose.models.OrganizadorFavorito ||
  mongoose.model("OrganizadorFavorito", organizadorFavoritoSchema);

module.exports = OrganizadorFavorito;
