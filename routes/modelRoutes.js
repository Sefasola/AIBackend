const express = require("express");
const { askModel } = require("../controllers/modelController");

const router = express.Router();

// Modelle iletişim kuran endpoint
router.post("/ask", askModel);

module.exports = router;
