const mongoose = require("mongoose");
const Eventos = require("../models/Eventos");
// Force model recompilation
if (mongoose.models.Eventos) {
  delete mongoose.models.Eventos;
}
const Favorito = require("../models/favoritos");
const User = require("../models/user");
const OrganizadorFavorito = require("../models/organizadorFavorito");
const { adicionarPontos } = require("./lojaController"); 
const { sendPushNotificationToTokens } = require("../services/pushService");

module.exports = {
  criarEvento: async (req, res) => {
    try {
      const data = { ...req.body, organizador: req.user.id };
      data.gratuito = !data.preco || data.preco === 0;
      const evento = await Eventos.create(data);
      await notificarUsuarios(evento);
      await notificarSeguidoresOrganizador(evento);
      res.status(201).json(evento);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  editarEvento: async (req, res) => {
    try {
      const evento = await Eventos.findById(req.params.id);
      if (!evento)
        return res.status(404).json({ message: "Evento não encontrado" });

      if (evento.organizador.toString() !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Acesso negado" });
      }

      Object.assign(evento, req.body);
      await evento.save();
      const eventoObj = evento.toObject();
      res.json({ id: evento._id, ...eventoObj });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  apagarEvento: async (req, res) => {
    try {
      const evento = await Eventos.findById(req.params.id);
      if (!evento)
        return res.status(404).json({ message: "Evento não encontrado" });

      if (evento.organizador.toString() !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Acesso negado" });
      }

      await evento.deleteOne();
      res.json({ message: "Evento apagado com sucesso" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  listarMeusEventos: async (req, res) => {
    try {
      const eventos = await Eventos.find({ organizador: req.user.id })
        .populate("organizador", "name email")
        .sort({ inicio: -1 });

      const resultado = eventos.map(ev => {
        const statusEfetivo = ev.status === 'ativo' && ev.fim < new Date() ? 'encerrado' : ev.status;
        return {
          id: ev._id,
          titulo: ev.titulo,
          tituloEn: ev.tituloEn,
          descricao: ev.descricao,
          descricaoEn: ev.descricaoEn,
          inicio: ev.inicio,
          fim: ev.fim,
          local: ev.local,
          preco: ev.preco,
          gratuito: ev.gratuito,
          capacidadeMaxima: ev.capacidadeMaxima,
          status: statusEfetivo,
          organizador: ev.organizador
        };
      });

      res.json(resultado);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  estatisticasEvento: async (req, res) => {
    try {
      const evento = await Eventos.findById(req.params.id);
      if (!evento) return res.status(404).json({ message: "Evento não encontrado" });

      if (evento.organizador.toString() !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const Bilhete = require("../models/Bilhete");

      const bilhetesVendidos = await Bilhete.countDocuments({ evento: req.params.id });
      const bilhetesUsados = await Bilhete.countDocuments({ evento: req.params.id, usado: true });

      const receitaTotal = (evento.receitaTotal ?? 0) > 0
        ? evento.receitaTotal
        : bilhetesVendidos * (evento.preco || 0);

      res.json({
        evento: {
          id: evento._id,
          titulo: evento.titulo,
          capacidadeMaxima: evento.capacidadeMaxima
        },
        estatisticas: {
          bilhetesVendidos,
          bilhetesUsados,
          bilhetesDisponiveis: evento.capacidadeMaxima - bilhetesVendidos,
          receitaTotal,
          taxaOcupacao: evento.capacidadeMaxima > 0 ? ((bilhetesVendidos / evento.capacidadeMaxima) * 100).toFixed(1) : 0
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  listarEventosUser: async (req, res) => {
    try {
      const Bilhete = require("../models/Bilhete");
      const eventos = await Eventos.find()
        .populate("organizador", "name email")
        .sort({ inicio: 1 });

      const favoritos = await Favorito.find({ user: req.user.id }).select("evento");
      const favIds = new Set(favoritos.map(f => f.evento.toString()));

      // Buscar interesses do usuário
      const user = await User.findById(req.user.id).select("interesses");
      const userInteresses = user?.interesses || { topicos: [], subtopicos: [] };

      const resultado = await Promise.all(eventos.map(async (ev) => {
        const obj = ev.toObject();
        // Use stored lat/lng or default to Terceira
        const lat = ev.lat !== undefined ? ev.lat : 38.7223;
        const lng = ev.lng !== undefined ? ev.lng : -27.2211;

        const bilhetesVendidos = await Bilhete.countDocuments({ evento: ev._id });
        const capacidadeDisponivel = Math.max((ev.capacidadeMaxima || 0) - bilhetesVendidos, 0);

        // Verificar se o evento corresponde aos interesses do usuário (case-insensitive)
        const interesseUsuario = userInteresses.topicos.some(topico =>
                                topico.toLowerCase() === ev.topico.toLowerCase()) ||
                                userInteresses.subtopicos.some(subtopico =>
                                subtopico.toLowerCase() === ev.subtopico.toLowerCase());

        const statusEfetivo = ev.status === 'ativo' && ev.fim < new Date() ? 'encerrado' : ev.status;

        return {
          id: ev._id,
          titulo: ev.titulo,
          tituloEn: ev.tituloEn,
          descricao: ev.descricao,
          descricaoEn: ev.descricaoEn,
          inicio: ev.inicio,
          fim: ev.fim,
          local: ev.local,
          preco: ev.preco,
          gratuito: ev.gratuito,
          capacidadeMaxima: ev.capacidadeMaxima,
          bilhetesVendidos,
          capacidadeDisponivel,
          telefone: ev.telefone,
          imagens: ev.imagens,
          topico: ev.topico,
          subtopico: ev.subtopico,
          status: statusEfetivo,
          organizador: ev.organizador,
          lat: lat,
          lng: lng,
          favorito: favIds.has(ev._id.toString()),
          interesseUsuario: interesseUsuario
        };
      })).then(items => items.filter(evento => evento.status !== "encerrado"));

      res.json(resultado);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  eventosMapa: async (req, res) => {
    try {
      const { lat, lng, raio = 10 } = req.query;

      const eventos = await Eventos.find({
        localizacao: {
          $near: {
            $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: raio * 1000
          }
        }
      }).select("_id titulo topico subtopico localizacao");

      res.json(eventos);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  recomendados: async (req, res) => {
    try {
      const favoritos = await Favorito.find({ user: req.user.id })
        .populate("evento");

      const topicos = favoritos.map(f => f.evento.topico);

      const eventos = await Eventos.find({
        topico: { $in: topicos }
      }).populate("organizador", "name email");

      const favIds = new Set(favoritos.map(f => f.evento._id.toString()));
      const resultado = eventos.map(ev => ({
        ...ev.toObject(),
        favorito: favIds.has(ev._id.toString())
      }));

      res.json(resultado);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getEvento: async (req, res) => {
    try {
      const evento = await Eventos.findById(req.params.id)
        .populate("organizador", "name email");

      if (!evento) return res.status(404).json({ message: "Evento não encontrado" });

      let favorito = false;
      if (req.user) {
        const fav = await Favorito.findOne({ user: req.user.id, evento: evento._id });
        favorito = !!fav;

       
        await adicionarPontos(req.user.id, 5, "evento", evento._id);
      }

      res.json({ id: evento._id, ...evento.toObject(), favorito });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

async function notificarUsuarios(evento) {
  try {
    console.log('[PUSH] notificarUsuarios called for evento:', evento._id, 'topico:', evento.topico, 'subtopico:', evento.subtopico);

    if (!evento.topico && !evento.subtopico) {
      console.log('[PUSH] Evento sem topico/subtopico, skip');
      return;
    }

    const usersWithPush = await User.find({
      pushToken: { $exists: true, $nin: [null, ""] }
    }).select("email pushToken interesses");

    console.log('[PUSH] Users with push token:', usersWithPush.length);

    const eventoTopico = (evento.topico || "").toLowerCase();
    const eventoSubtopico = (evento.subtopico || "").toLowerCase();

    const interestedUsers = usersWithPush.filter((u) => {
      const topicos = (u.interesses?.topicos || []).map((t) => String(t).toLowerCase());
      const subtopicos = (u.interesses?.subtopicos || []).map((s) => String(s).toLowerCase());
      console.log(`[PUSH] User ${u.email} topicos:`, topicos, 'subtopicos:', subtopicos);
      return topicos.includes(eventoTopico) || subtopicos.includes(eventoSubtopico);
    });

    const tokens = interestedUsers.map((u) => u.pushToken).filter(Boolean);
    if (tokens.length === 0) {
      return;
    }

    const payloadData = {
      type: "NEW_INTEREST_EVENT",
      eventId: String(evento._id),
      topico: String(evento.topico || ""),
      subtopico: String(evento.subtopico || ""),
    };

    const result = await sendPushNotificationToTokens({
      tokens,
      title: "Novo evento para ti",
      body: `${evento.titulo} corresponde aos teus interesses.`,
      data: payloadData,
    });

    if (result.invalidTokens.length > 0) {
      await User.updateMany(
        { pushToken: { $in: result.invalidTokens } },
        { $unset: { pushToken: 1 } }
      );
    }

    console.log(`Push notification result: sent=${result.sentCount}, invalidTokens=${result.invalidTokens.length}`);

  } catch (err) {
    console.error("Erro ao notificar usuários:", err.message);
  }
}

async function notificarSeguidoresOrganizador(evento) {
  try {
    const seguidores = await OrganizadorFavorito.find({ organizador: evento.organizador })
      .populate({ path: "user", select: "pushToken" });

    const tokens = seguidores
      .map((s) => s.user?.pushToken)
      .filter((token) => !!token);

    if (tokens.length === 0) {
      return;
    }

    const organizador = await User.findById(evento.organizador).select("name");
    const organizerName = organizador?.name || "Organizador";

    const result = await sendPushNotificationToTokens({
      tokens,
      title: "Novo evento de organizador favorito",
      body: `${organizerName} criou o evento ${evento.titulo}.`,
      data: {
        type: "FAVORITE_ORGANIZER_NEW_EVENT",
        eventId: String(evento._id),
        organizerId: String(evento.organizador),
      },
    });

    if (result.invalidTokens.length > 0) {
      await User.updateMany(
        { pushToken: { $in: result.invalidTokens } },
        { $unset: { pushToken: 1 } }
      );
    }
  } catch (err) {
    console.error("Erro ao notificar seguidores do organizador:", err.message);
  }
}
