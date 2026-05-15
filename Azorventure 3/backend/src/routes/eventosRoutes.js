
const router = require("express").Router();
const mongoose = require("mongoose");
const eventosController = require("../controllers/eventosController");
const auth = require("../middleware/auth");

const validarObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "ID do evento inválido" });
  }
  next();
};


router.get("/", auth(), eventosController.listarEventosUser);
router.get("/mapa", eventosController.eventosMapa);


router.get("/user/lista", auth(), eventosController.listarEventosUser);
router.get("/user/recomendados", auth(), eventosController.recomendados);


router.post("/", auth("organizador", "admin"), eventosController.criarEvento);
router.put("/:id", auth("organizador", "admin"), validarObjectId, eventosController.editarEvento);
router.delete("/:id", auth("organizador", "admin"), validarObjectId, eventosController.apagarEvento);


router.get("/meus-eventos", auth("organizador", "admin"), eventosController.listarMeusEventos);
router.get("/:id/estatisticas", auth("organizador", "admin"), validarObjectId, eventosController.estatisticasEvento);


router.get("/:id", eventosController.getEvento);

module.exports = router;
