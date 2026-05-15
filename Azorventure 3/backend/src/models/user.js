const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  telefone: { type: String },
  pontos: { type: Number, default: 0 },

  role: {
    type: String,
    enum: ["user", "organizador", "admin"],
    default: "user"
  },

  interesses: {
    topicos: [String],
    subtopicos: [String]
  },

  profileImage: { type: String },

  pushToken: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = User;
