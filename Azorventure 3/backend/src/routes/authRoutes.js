// const { body, validationResult } = require("express-validator");
const router = require("express").Router();
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");

router.post("/registar", authController.registar);

router.post("/login", authController.login);

router.post("/forgot-password", authController.requestPasswordReset);

router.post("/reset-password", authController.resetPassword);

router.post("/logout", (req, res) => {
  res.json({ message: "Logout successful" });
});

router.get("/profile", auth(), authController.getProfile);
router.put("/profile", auth(), authController.updateProfile);

module.exports = router;
