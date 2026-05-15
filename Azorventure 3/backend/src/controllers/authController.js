const User = require("../models/user");
const Ponto = require("../models/pontos");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendEmail } = require("../services/emailService");

module.exports = {
 
  registar: async (req, res) => {
    try {
      const { name, email, password, role } = req.body;

     
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({ message: "Email já existe." });
      }

     
      const hashed = await bcrypt.hash(password, 10);

      const newUser = await User.create({
        name,
        email,
        password: hashed,
        role: role || "user",
      });

      const token = jwt.sign(
        {
          id: newUser._id,
          role: newUser.role,
          email: newUser.email,
          name: newUser.name,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        message: "Registo concluído!",
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          role: newUser.role,
          email: newUser.email,
          profileImage: newUser.profileImage,
          pontos: 0,
        },
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Credenciais inválidas." });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(400).json({ message: "Password incorreta." });
      }

     
      const token = jwt.sign(
        {
          id: user._id,
          role: user.role,
          email: user.email,
          name: user.name,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Buscar pontos do usuário
      const pontos = await Ponto.findOne({ user: user._id });
      const saldo = pontos ? pontos.saldo : 0;

      res.json({
        message: "Login efetuado!",
        token,
        user: {
          id: user._id,
          name: user.name,
          role: user.role,
          email: user.email,
          profileImage: user.profileImage,
          pontos: saldo,
        },
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: "Utilizador não encontrado" });
      }
      
      // Buscar pontos do usuário
      const pontos = await Ponto.findOne({ user: req.user.id });
      const saldo = pontos ? pontos.saldo : 0;
      
      res.json({
        ...user.toObject(),
        pontos: saldo
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { name, telefone, profileImage } = req.body;
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "Utilizador não encontrado" });
      }

      if (typeof name === 'string') {
        user.name = name;
      }

      if (typeof telefone === 'string') {
        user.telefone = telefone;
      }

      if (typeof profileImage === 'string') {
        if (profileImage.length > 6_000_000) {
          return res.status(400).json({ message: "Imagem demasiado grande. Escolha uma imagem menor." });
        }
        user.profileImage = profileImage;
      }

      await user.save();

      const pontos = await Ponto.findOne({ user: req.user.id });
      const saldo = pontos ? pontos.saldo : 0;

      return res.json({
        ...user.toObject(),
        pontos: saldo,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  requestPasswordReset: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email é obrigatório." });
      }

      const user = await User.findOne({ email });

      // Do not reveal if email exists for security reasons.
      if (!user) {
        return res.json({ message: "Se o email existir, receberá instruções para redefinir a password." });
      }

      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8100";
      const resetLink = `${frontendUrl}/reset-password?token=${rawToken}`;

      const html = `
        <h2>Redefinição de Password</h2>
        <p>Olá ${user.name},</p>
        <p>Recebemos um pedido para redefinir a sua password.</p>
        <p>Clique no link abaixo para criar uma nova password (válido por 1 hora):</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>Se não pediu esta alteração, ignore este email.</p>
      `;

      await sendEmail(user.email, "Redefinição de password - AzorVenture", html);

      return res.json({ message: "Se o email existir, receberá instruções para redefinir a password." });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({ message: "Token e password são obrigatórios." });
      }

      if (String(password).length < 6) {
        return res.status(400).json({ message: "A password deve ter pelo menos 6 caracteres." });
      }

      const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: new Date() }
      });

      if (!user) {
        return res.status(400).json({ message: "Token inválido ou expirado." });
      }

      user.password = await bcrypt.hash(password, 10);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return res.json({ message: "Password redefinida com sucesso." });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
};
