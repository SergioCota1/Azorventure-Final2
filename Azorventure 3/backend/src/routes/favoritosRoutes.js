const router = require("express").Router();
const mongoose = require("mongoose");
const auth = require("../middleware/auth");
const {
  toggleFavorito,
  listarFavoritos,
  toggleOrganizadorFavorito,
  organizadorFavoritoStatus,
} = require("../controllers/favoritosController");


router.post(
  "/:eventoId",
  auth(),
  (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.eventoId)) {
      return res.status(400).json({ message: "ID do evento inválido" });
    }
    next();
  },
  toggleFavorito
);


router.get("/", auth(), listarFavoritos);

router.post(
  "/organizadores/:organizadorId",
  auth(),
  (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.organizadorId)) {
      return res.status(400).json({ message: "ID do organizador invalido" });
    }
    next();
  },
  toggleOrganizadorFavorito
);

router.get(
  "/organizadores/:organizadorId/status",
  auth(),
  (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.organizadorId)) {
      return res.status(400).json({ message: "ID do organizador invalido" });
    }
    next();
  },
  organizadorFavoritoStatus
);

module.exports = router;
