const mongoose = require("mongoose");
const Pagamento = require("../models/Pagamento");
const Eventos = require("../models/Eventos");
const Bilhete = require("../models/Bilhete");
const { v4: uuidv4 } = require("uuid");
const { sendEmail } = require("../services/emailService");
const { adicionarPontos } = require("./lojaController");
const easypayService = require("../services/easypayService");

/**
 * POST /api/pagamentos/checkout
 * Creates an EasyPay checkout session for an event ticket
 */
exports.criarCheckout = async (req, res) => {
  try {
    const { eventoId } = req.body;

    if (!eventoId || !mongoose.Types.ObjectId.isValid(eventoId)) {
      return res.status(400).json({ message: "ID do evento inválido" });
    }

    const evento = await Eventos.findById(eventoId);
    if (!evento) {
      return res.status(404).json({ message: "Evento não encontrado" });
    }

    if (!evento.preco || evento.preco <= 0) {
      return res.status(400).json({ message: "Este evento é gratuito" });
    }

    // Check for existing active ticket
    const ticketExistente = await Bilhete.findOne({
      user: req.user.id,
      evento: eventoId,
      usado: false
    });
    if (ticketExistente) {
      return res.status(400).json({ message: "Já possui um bilhete ativo para este evento" });
    }

    // Expire any old pending payments for same user+event
    await Pagamento.updateMany(
      { user: req.user.id, evento: eventoId, status: "pendente" },
      { status: "expirado" }
    );

    const key = `bil-${Date.now()}`;

    // Create EasyPay checkout session
    const manifest = await easypayService.createCheckoutSession({
      valor: evento.preco,
      descricao: `Bilhete: ${evento.titulo}`,
      customer: {
        name: req.user.name,
        email: req.user.email
      },
      key
    });

    // Save payment record
    const pagamento = await Pagamento.create({
      user: req.user.id,
      evento: eventoId,
      checkoutId: manifest.id,
      easypayId: manifest.session,
      valor: evento.preco,
      status: "pendente"
    });

    console.log("Checkout session created:", manifest.id, "for event:", evento.titulo);

    res.json({
      manifest,
      pagamentoId: pagamento._id
    });
  } catch (err) {
    console.error("Error creating checkout:", err.response?.status, err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
};

/**
 * POST /api/pagamentos/confirmar
 * Called by frontend after successful checkout to create the ticket
 */
exports.confirmarPagamento = async (req, res) => {
  try {
    const { pagamentoId } = req.body;

    if (!pagamentoId || !mongoose.Types.ObjectId.isValid(pagamentoId)) {
      return res.status(400).json({ message: "ID do pagamento inválido" });
    }

    const pagamento = await Pagamento.findById(pagamentoId);
    if (!pagamento) {
      return res.status(404).json({ message: "Pagamento não encontrado" });
    }

    if (pagamento.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    if (pagamento.status === "pago" && pagamento.bilhete) {
      return res.json({ message: "Pagamento já confirmado", bilheteId: pagamento.bilhete });
    }

    // Update payment status
    pagamento.status = "pago";

    const evento = await Eventos.findById(pagamento.evento);
    if (!evento) {
      return res.status(404).json({ message: "Evento não encontrado" });
    }

    // Create the ticket
    const codigo = uuidv4();
    const bilhete = await Bilhete.create({
      user: req.user.id,
      evento: pagamento.evento,
      qrCode: codigo,
      usado: false
    });

    pagamento.bilhete = bilhete._id;
    await pagamento.save();

    // Add points
    await adicionarPontos(req.user.id, 10, "bilhete", bilhete._id);

    // Send email
    try {
      const emailHtml = `
        <h2>Bilhete Comprado com Sucesso!</h2>
        <p>Olá ${req.user.name},</p>
        <p>O seu pagamento foi confirmado.</p>
        <p>Evento: <strong>${evento.titulo}</strong></p>
        <p>Data: ${new Date(evento.inicio).toLocaleString("pt-PT")}</p>
        <p>Local: ${evento.local}</p>
        <p>Valor: ${pagamento.valor}€</p>
        <p>Código do bilhete: <strong>${codigo}</strong></p>
        <p>Apresente o QR code na app ou este código na entrada do evento.</p>
        <p>Atenciosamente,<br>AzorVenture</p>
      `;
      await sendEmail(req.user.email, `Bilhete para ${evento.titulo}`, emailHtml);
    } catch (emailError) {
      console.error("Error sending email:", emailError);
    }

    console.log("Payment confirmed, ticket created:", bilhete._id);

    res.json({
      bilheteId: bilhete._id,
      codigo,
      qrCode: codigo
    });
  } catch (err) {
    console.error("Error confirming payment:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/pagamentos/webhook
 * EasyPay webhook - receives payment notifications
 */
exports.webhook = async (req, res) => {
  try {
    // Respond immediately
    res.status(200).send("OK");

    const notification = req.body;
    console.log("EasyPay webhook received:", JSON.stringify(notification));

    if (!notification.id) {
      console.error("Webhook missing id");
      return;
    }

    // Find pagamento by checkoutId
    const pagamento = await Pagamento.findOne({ checkoutId: notification.id });
    if (!pagamento) {
      console.log("Webhook: no matching payment for id:", notification.id);
      return;
    }

    if (notification.status === "success" && notification.type === "capture") {
      if (pagamento.status !== "pago") {
        pagamento.status = "pago";

        // Create ticket if not yet created (backup for frontend confirmation)
        if (!pagamento.bilhete) {
          const evento = await Eventos.findById(pagamento.evento);
          const user = await mongoose.model("User").findById(pagamento.user);

          if (evento && user) {
            const codigo = uuidv4();
            const bilhete = await Bilhete.create({
              user: pagamento.user,
              evento: pagamento.evento,
              qrCode: codigo,
              usado: false
            });

            pagamento.bilhete = bilhete._id;
            await adicionarPontos(pagamento.user, 10, "bilhete", bilhete._id);

            try {
              const emailHtml = `
                <h2>Bilhete Comprado com Sucesso!</h2>
                <p>Olá ${user.name},</p>
                <p>O seu pagamento foi confirmado.</p>
                <p>Evento: <strong>${evento.titulo}</strong></p>
                <p>Data: ${new Date(evento.inicio).toLocaleString("pt-PT")}</p>
                <p>Local: ${evento.local}</p>
                <p>Valor: ${pagamento.valor}€</p>
                <p>Código do bilhete: <strong>${codigo}</strong></p>
                <p>Apresente o QR code na app.</p>
                <p>Atenciosamente,<br>AzorVenture</p>
              `;
              await sendEmail(user.email, `Bilhete para ${evento.titulo}`, emailHtml);
            } catch (emailError) {
              console.error("Webhook email error:", emailError);
            }
          }
        }

        await pagamento.save();
        console.log("Webhook: payment confirmed for:", pagamento._id);
      }
    } else if (notification.status === "failed") {
      pagamento.status = "falhou";
      await pagamento.save();
      console.log("Webhook: payment failed for:", pagamento._id);
    }
  } catch (err) {
    console.error("Webhook error:", err);
  }
};

/**
 * GET /api/pagamentos/:id
 * Get payment status
 */
exports.getStatus = async (req, res) => {
  try {
    const pagamento = await Pagamento.findById(req.params.id);
    if (!pagamento) {
      return res.status(404).json({ message: "Pagamento não encontrado" });
    }

    if (pagamento.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    res.json({
      id: pagamento._id,
      status: pagamento.status,
      valor: pagamento.valor,
      bilhete: pagamento.bilhete,
      criadoEm: pagamento.criadoEm
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
