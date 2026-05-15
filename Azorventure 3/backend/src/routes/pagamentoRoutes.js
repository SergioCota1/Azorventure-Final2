const router = require("express").Router();
const auth = require("../middleware/auth");
const {
  criarCheckout,
  confirmarPagamento,
  webhook,
  getStatus
} = require("../controllers/pagamentoController");

// Create checkout session (authenticated)
router.post("/checkout", auth(), criarCheckout);

// Confirm payment after successful checkout (authenticated)
router.post("/confirmar", auth(), confirmarPagamento);

// EasyPay webhook (no auth - called by EasyPay servers)
router.post("/webhook", webhook);

// Get payment status (authenticated)
router.get("/:id", auth(), getStatus);

module.exports = router;
