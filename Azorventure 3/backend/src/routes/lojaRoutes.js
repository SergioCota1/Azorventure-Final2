const router = require("express").Router();
const auth = require("../middleware/auth");
const lojaController = require("../controllers/lojaController");


router.get("/produtos", lojaController.listarProdutos);


router.post("/produtos", auth("admin", "organizador"), lojaController.criarProduto);
router.put("/produtos/:produtoId", auth("admin", "organizador"), lojaController.atualizarProduto);
router.delete("/produtos/:produtoId", auth("admin", "organizador"), lojaController.removerProduto);


router.post("/produtos/:produtoId/comprar", auth(), lojaController.comprarProduto);


router.get("/transacoes", auth(), lojaController.listarTransacoes);

router.get("/saldo", auth(), lojaController.saldoPontos);


module.exports = router;
