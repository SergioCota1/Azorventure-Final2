const Favorito = require("../models/favoritos");
const Eventos = require("../models/Eventos");
const User = require("../models/user");
const OrganizadorFavorito = require("../models/organizadorFavorito");

exports.toggleFavorito = async (req, res) => {
  try {
    const { eventoId } = req.params;


    const evento = await Eventos.findById(eventoId);
    if (!evento) {
      return res.status(404).json({ message: "Evento não encontrado" });
    }


    const favorito = await Favorito.findOne({
      user: req.user.id,
      evento: eventoId
    });

    if (favorito) {

      await favorito.deleteOne();
      return res.json({
        message: "Favorito removido",
        favorito: false
      });
    }

    await Favorito.create({
      user: req.user.id,
      evento: eventoId
    });

    res.status(201).json({
      message: "Favorito adicionado",
      favorito: true
    });

  } catch (err) {

    res.status(500).json({ error: err.message });
  }
};

exports.listarFavoritos = async (req, res) => {
  try {

    const favoritos = await Favorito.find({ user: req.user.id })
      .populate({
        path: "evento",
        select: "titulo topico subtopico inicio fim localizacao preco imagens"
      })
      .sort({ criadoEm: -1 });

    res.json(favoritos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.toggleOrganizadorFavorito = async (req, res) => {
  try {
    const { organizadorId } = req.params;

    if (req.user.id === organizadorId) {
      return res.status(400).json({ message: "Nao pode favoritar o proprio perfil." });
    }

    const organizador = await User.findById(organizadorId).select("_id role");
    if (!organizador) {
      return res.status(404).json({ message: "Organizador nao encontrado" });
    }

    const existente = await OrganizadorFavorito.findOne({
      user: req.user.id,
      organizador: organizadorId,
    });

    if (existente) {
      await existente.deleteOne();
      return res.json({ message: "Organizador removido dos favoritos", favorito: false });
    }

    await OrganizadorFavorito.create({
      user: req.user.id,
      organizador: organizadorId,
    });

    return res.status(201).json({ message: "Organizador adicionado aos favoritos", favorito: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.organizadorFavoritoStatus = async (req, res) => {
  try {
    const { organizadorId } = req.params;

    const favorito = await OrganizadorFavorito.findOne({
      user: req.user.id,
      organizador: organizadorId,
    }).select("_id");

    return res.json({ favorito: !!favorito });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
