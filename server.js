const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config(); // .env dosyasını yükler

const authRoutes = require("./routes/authRoutes"); // auth rotaları
const scenarioRoutes = require("./routes/scenarioRoutes"); // senaryo rotaları
const modelRoutes = require("./routes/modelRoutes"); // model API rotaları

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000", // Frontend URL'sini belirtin
    credentials: true, // Gerekli olduğunda çerezleri destekler
  })
);
app.use(express.json());

// Auth rotalarını ekleyin
app.use("/api/auth", authRoutes);

// Scenario rotalarını ekleyin
app.use("/api/scenarios", scenarioRoutes);

// Model API rotalarını ekleyin
app.use("/api/model", modelRoutes);

// Sabitler
const SECRET_KEY = "R&ThyL5$Z#v9!kP6wXqj1NtC%2f4Gm@7";

// MongoDB Cosmos DB'ye bağlanma
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
      connectTimeoutMS: 30000, // 30 saniye
      socketTimeoutMS: 45000, // 45 saniye
    }
  )
  .then(() => console.log("Connection to CosmosDB successful"))
  .catch((err) => console.error("MongoDB bağlantı hatası:", err));

// Kullanıcı şeması ve modeli
const User = mongoose.model(
  "User",
  new mongoose.Schema({
    user: String,
    pwd: String,
  })
);

// Kullanıcı Kayıt (Register) Endpoint'i
app.post("/register", async (req, res) => {
  const { user, pwd } = req.body;

  try {
    // Kullanıcı adı kontrolü (zaten var mı?)
    const userExists = await User.findOne({ user });
    if (userExists) {
      return res.status(409).json({ message: "Username already taken" });
    }

    // Şifreyi hashlemek yerine düz metin olarak saklıyoruz (güvenli değildir!)
    const newUser = new User({ user, pwd }); // pwd direkt olarak kaydediliyor
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Kullanıcı Giriş (Login) Endpoint'i
app.post("/signin", async (req, res) => {
  const { user, pwd } = req.body;

  try {
    // Kullanıcıyı bul
    const foundUser = await User.findOne({ user });
    if (!foundUser) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Şifreyi kontrol et (parolayı düz metin olarak sakladığımız için direkt karşılaştırıyoruz)
    if (pwd !== foundUser.pwd) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // JWT oluştur
    const accessToken = jwt.sign({ user }, SECRET_KEY, { expiresIn: "1h" });

    res.json({ accessToken });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// JWT doğrulama middleware fonksiyonu
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.sendStatus(401); // Token yoksa 401 Unauthorized hatası döner
  }

  // Token'ı doğrula
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403); // Token geçersizse 403 Forbidden hatası döner
    req.user = user;
    next(); // Bir sonraki middleware veya route'a geç
  });
};

// Korunan profil endpoint'i
app.get("/profile", authenticateToken, async (req, res) => {
  try {
    const userProfile = await User.findOne({ user: req.user.user });
    res.json({ name: userProfile.user, email: "user@example.com" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Backend'in çalıştığı port
app.listen(5000, () => {
  console.log("Backend 5000 portunda çalışıyor");
});
