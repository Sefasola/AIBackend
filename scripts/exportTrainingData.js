const fs = require("fs");
const mongoose = require("mongoose");
require("dotenv").config({ path: "./backend/.env" }); // .env dosyasının doğru yolunu ekledik

// MongoDB bağlantısı
mongoose
  .connect(
    `mongodb://${process.env.COSMOSDB_HOST}:${process.env.COSMOSDB_PORT}/${process.env.COSMOSDB_DBNAME}?ssl=true&replicaSet=globaldb`,
    {
      auth: {
        username: process.env.COSMOSDB_USER,
        password: process.env.COSMOSDB_PASSWORD,
      },
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: false,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    }
  )
  .then(() => console.log("MongoDB'ye bağlanıldı"))
  .catch((err) => {
    console.error("MongoDB bağlantı hatası:", err);
    process.exit(1); // Script'in çalışmasını durdur
  });

// Senaryo şeması ve modeli
const Scenario = mongoose.model(
  "Scenario",
  new mongoose.Schema({
    author: String,
    topic: String,
    title: String,
    content: String,
    date: Date,
  })
);

// Eğitim verilerini dışa aktarma fonksiyonu
async function exportTrainingData() {
  try {
    // Tüm senaryoları al
    const scenarios = await Scenario.find({}).lean();

    // Verileri eğitim formatına dönüştür
    const trainingData = scenarios.map((scenario) => ({
      input: `Explain the topic: ${scenario.topic}. Title: ${scenario.title}.`,
      output: scenario.content,
    }));

    // JSON dosyasını kaydet
    fs.writeFileSync(
      "training_data.json",
      JSON.stringify(trainingData, null, 2)
    );
    console.log("Eğitim verileri başarıyla dışa aktarıldı!");
  } catch (error) {
    console.error("Veriler dışa aktarılırken bir hata oluştu:", error);
  } finally {
    mongoose.connection.close();
  }
}

// Script'i çalıştır
exportTrainingData();
