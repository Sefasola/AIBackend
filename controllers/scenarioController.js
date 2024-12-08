// controllers/scenarioController.js
const Scenario = require("../models/scenario");

// Yeni senaryo kaydetme
const createScenario = async (req, res) => {
  const { author, topic, title, content } = req.body;

  try {
    const newScenario = new Scenario({ author, topic, title, content });
    const savedScenario = await newScenario.save();
    res
      .status(201)
      .json({ message: "Senaryo başarıyla kaydedildi", savedScenario });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Senaryo kaydedilirken bir hata oluştu" });
  }
};

// Tüm senaryoları listeleme
const listScenarios = async (req, res) => {
  try {
    const scenarios = await Scenario.find();
    res.status(200).json(scenarios);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Senaryolar listelenirken bir hata oluştu" });
  }
};

module.exports = {
  createScenario,
  listScenarios,
};
