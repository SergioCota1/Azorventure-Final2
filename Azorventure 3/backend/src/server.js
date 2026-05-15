require("dotenv").config();
const mongoose = require("mongoose");
const dns = require("dns");
require("./firebase"); // initializes Firebase Admin SDK on startup

// Use Google DNS to resolve MongoDB Atlas SRV records (fixes local DNS issues)
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const PORT = process.env.PORT || 5000;

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // process.exit(1);
});

process.on('exit', (code) => {
  console.log('Process exited with code', code);
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    
    // Ensure models are registered after connection
    require("./models/Eventos");
    require("./models/Bilhete");
    require("./models/user");
    require("./models/favoritos");
    require("./models/pontos");
    require("./models/produto");
    require("./models/transacao");
    require("./models/Pagamento");
    
    const app = require("./app");
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor a correr na porta ${PORT}`);
      console.log('Server started successfully');
    });
    
    server.on('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    });
    
    server.on('close', () => {
      console.log('Server closed');
      process.exit(1);
    });
    
    console.log('Server object:', !!server);
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });

