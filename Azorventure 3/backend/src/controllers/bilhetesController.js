const mongoose = require("mongoose");
const Bilhete = require("../models/Bilhete");
const Eventos = require("../models/Eventos");
const { v4: uuidv4 } = require("uuid");
const { sendEmail } = require("../services/emailService");

const { adicionarPontos } = require("./lojaController");

exports.comprarBilhete = async (req, res) => {
    try {
        const { eventoId } = req.params;
        console.log('Comprar bilhete request:', { eventoId, userId: req.user.id, userEmail: req.user.email });

        const evento = await Eventos.findById(eventoId);
        if (!evento) {
            console.log('Evento not found:', eventoId);
            return res.status(404).json({ message: "Evento não existe" });
        }

        const existe = await Bilhete.findOne({
            user: req.user.id,
            evento: eventoId,
            usado: false, // Só impede se houver bilhete não usado
        });

        if (existe) {
            console.log('Active ticket already exists for user:', req.user.id, 'event:', eventoId);
            return res.status(400).json({ message: "Já possui um bilhete ativo para este evento" });
        }

        const codigo = uuidv4();

        const bilhete = await Bilhete.create({
            user: req.user.id,
            evento: eventoId,
            qrCode: codigo,
            usado: false,
        });
        console.log('Ticket created:', bilhete._id);

        // Revenue is tracked in euros based on ticket price at purchase time.
        evento.receitaTotal = (evento.receitaTotal || 0) + (evento.preco || 0);
        await evento.save();

        await adicionarPontos(req.user.id, 10, "bilhete", bilhete._id);
        console.log('Points added for user:', req.user.id);

        // Send email with ticket info
        try {
            const emailHtml = `
                <h2>Bilhete Comprado com Sucesso!</h2>
                <p>Olá ${req.user.name},</p>
                <p>Você comprou um bilhete para o evento: <strong>${evento.titulo}</strong></p>
                <p>Data: ${new Date(evento.inicio).toLocaleString('pt-PT')}</p>
                <p>Local: ${evento.local}</p>
                <p>Código do bilhete: <strong>${codigo}</strong></p>
                <p>Apresente o QR code na app ou este código na entrada do evento.</p>
                <p>Atenciosamente,<br>AzorVenture</p>
            `;
            await sendEmail(req.user.email, `Bilhete para ${evento.titulo}`, emailHtml);
            console.log('Email sent to:', req.user.email);
        } catch (emailError) {
            console.error('Error sending email:', emailError);
            // Don't fail the purchase if email fails
        }

        res.status(201).json({
            bilheteId: bilhete._id,
            codigo,
            qrCode: codigo
        });
    } catch (err) {
        console.error('Error in comprarBilhete:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.validarBilhete = async (req, res) => {
    try {
        const { codigo } = req.body;
        console.log('validarBilhete - codigo recebido:', JSON.stringify(codigo));
        console.log('validarBilhete - codigo length:', codigo ? codigo.length : 'null');

        const bilhete = await Bilhete.findOne({ qrCode: codigo }).populate({ path: 'evento', select: 'organizador', model: Eventos });
        console.log('validarBilhete - bilhete found:', !!bilhete);
        if (!bilhete) {
            // Log all qrCodes for debug
            const all = await Bilhete.find({}).select('qrCode usado');
            console.log('validarBilhete - all qrCodes:', all.map(b => ({ qr: b.qrCode.substring(0, 40), usado: b.usado })));
            return res.status(400).json({ message: "Bilhete inválido" });
        }

        if (bilhete.usado) {
            return res.status(400).json({ message: "Bilhete já usado" });
        }

        if (
            req.user.role !== "admin" &&
            req.user.role !== "organizador" &&
            bilhete.evento.organizador.toString() !== req.user.id
        ) {
            return res.status(403).json({ message: "Acesso negado" });
        }

        bilhete.usado = true;
        await bilhete.save();

        res.json({ message: "Bilhete válido" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMyBilhetes = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
            return res.status(400).json({ message: "ID do usuário inválido" });
        }
        const bilhetes = await Bilhete.find({ user: req.user.id }).populate({ path: 'evento', select: 'titulo tituloEn inicio local', model: Eventos });
        const result = bilhetes.map(b => ({
            id: b._id,
            user: b.user,
            evento: b.evento ? b.evento._id : null,
            qrCode: b.qrCode,
            usado: b.usado,
            criadoEm: b.criadoEm,
            eventoData: b.evento ? {
                titulo: b.evento.titulo,
                tituloEn: b.evento.tituloEn,
                inicio: b.evento.inicio,
                local: b.evento.local
            } : null
        }));
        res.json(result);
    } catch (err) {
        console.error('Error in getMyBilhetes:', err);
        res.status(500).json({ error: err.message });
    }
}
