const jwt = require("jsonwebtoken");

const auth = (...requiredRoles) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Token não fornecido" });
    }

    const [, token] = authHeader.split(" ");

    if (!token) {
      return res.status(401).json({ message: "Token inválido" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // console.log('Auth successful for user:', decoded.id);

      // console.log('Auth check:', { requiredRoles, userRole: decoded.role });

      const hasRequiredRole = requiredRoles.length === 0 || requiredRoles.includes(decoded.role) || decoded.role === "admin";
      if (!hasRequiredRole) {
        return res.status(403).json({ message: "Acesso negado" });
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: "Token inválido" });
    }
  };
};

module.exports = auth;
