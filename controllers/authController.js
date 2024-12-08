const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const users = require("../users/users");

const SECRET_KEY = "R&ThyL5$Z#v9!kP6wXqj1NtC%2f4Gm@7"; // JWT için secret key

// Kayıt İşlemi
const register = async (req, res) => {
  const { user, pwd } = req.body;

  // Kullanıcı adı kontrolü
  const userExists = users.find((u) => u.user === user);
  if (userExists) {
    return res.status(409).json({ message: "Username already taken" });
  }

  // Şifreyi hashle
  const hashedPwd = await bcrypt.hash(pwd, 10);

  // Kullanıcıyı kaydet
  users.push({ user, pwd: hashedPwd });

  res.status(201).json({ message: "User registered successfully" });
};

// Giriş İşlemi
const signIn = async (req, res) => {
  const { user, pwd } = req.body;

  // Kullanıcıyı bul
  const foundUser = users.find((u) => u.user === user);
  if (!foundUser) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Şifreyi kontrol et
  const match = await bcrypt.compare(pwd, foundUser.pwd);
  if (!match) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // JWT oluştur
  const accessToken = jwt.sign({ user }, SECRET_KEY, { expiresIn: "1h" });

  res.json({ accessToken });
};

// Export işlemleri
module.exports = {
  register,
  signIn,
};
