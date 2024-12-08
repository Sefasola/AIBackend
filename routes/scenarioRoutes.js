// routes/scenarioRoutes.js
const express = require("express");
const {
  createScenario,
  listScenarios,
} = require("../controllers/scenarioController");

const router = express.Router();

// Senaryo ekleme
router.post("/", createScenario);

// Senaryoları listeleme
router.get("/", listScenarios);

module.exports = router;
