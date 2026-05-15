const router = require("express").Router();
const auth = require("../middleware/auth");
const { guardarInteresses, guardarPushToken, removerPushToken, getPublicProfile } = require("../controllers/userController");

router.get("/public/:id", getPublicProfile);


router.post("/interesses", auth(), (req, res, next) => {
  const { topicos, subtopicos } = req.body;
  if (!Array.isArray(topicos) || !Array.isArray(subtopicos)) {
    return res.status(400).json({ message: "topicos e subtopicos devem ser arrays" });
  }
  next();
}, guardarInteresses);

router.post("/push-token", auth(), guardarPushToken);
router.delete("/push-token", auth(), removerPushToken);

module.exports = router;
