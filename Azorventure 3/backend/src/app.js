const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json({ limit: '20mb' }));

// app.use((req, res, next) => {
//   console.log(`Request: ${req.method} ${req.url}`);
//   next();
// });

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/eventos", require("./routes/eventosRoutes"));
app.use("/api/favoritos", require("./routes/favoritosRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/bilhetes", require("./routes/bilhetesRoutes"));
app.use("/api/pagamentos", require("./routes/pagamentoRoutes"));
app.use("/api/loja", require("./routes/lojaRoutes"));

app.get("/", (req, res) => {
  res.send("Backend Azorventure");
});

app.use((err, req, res, next) => {
  console.error('Error handler:', err.stack);
  res.status(500).json({ error: "Erro interno do servidor" });
});

module.exports = app;
