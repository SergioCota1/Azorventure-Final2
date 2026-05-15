const router = require("express").Router();
const mongoose = require("mongoose");
const auth = require("../middleware/auth");
const { comprarBilhete, validarBilhete, getMyBilhetes } = require("../controllers/bilhetesController");

router.get("/", auth(), getMyBilhetes);

router.post(
  "/eventos/:eventoId",
  auth(),
  (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.eventoId)) {
      return res.status(400).json({ message: "ID do evento inválido" });
    }
    next();
  },
  comprarBilhete
);

router.post(
  "/validar",
  auth("organizador", "admin"),
  validarBilhete
);

module.exports = router;
