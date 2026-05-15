const User = require("../models/user");

const guardarInteresses = async (req, res) => {
  try {
    const { topicos, subtopicos } = req.body;

    if (!Array.isArray(topicos) || !Array.isArray(subtopicos)) {
      return res.status(400).json({ message: "Interesses inválidos" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }

    user.interesses = { topicos, subtopicos }; 
    await user.save();

    res.json(user.interesses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const guardarPushToken = async (req, res) => {
  try {
    const { pushToken } = req.body;

    if (!pushToken || typeof pushToken !== "string") {
      return res.status(400).json({ message: "pushToken inválido" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }

    user.pushToken = pushToken;
    await user.save();

    return res.json({ message: "Push token guardado" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const removerPushToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }

    user.pushToken = undefined;
    await user.save();

    return res.json({ message: "Push token removido" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("name email telefone profileImage role");
    if (!user) {
      return res.status(404).json({ message: "Utilizador nao encontrado" });
    }

    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { guardarInteresses, guardarPushToken, removerPushToken, getPublicProfile };
