const express = require("express");
const { register, signIn } = require("../controllers/authController");

const router = express.Router();

// Kayıt rotası
router.post("/register", register);

// Giriş rotası
router.post("/signin", signIn);

module.exports = router;
