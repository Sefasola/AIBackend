// models/scenario.js
const mongoose = require("mongoose");

const scenarioSchema = new mongoose.Schema({
  author: { type: String, required: true },
  topic: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Scenario", scenarioSchema);
