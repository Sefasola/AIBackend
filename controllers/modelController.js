const axios = require("axios");
require("dotenv").config();

const HUGGING_FACE_API_TOKEN = process.env.HUGGING_FACE_API_TOKEN;
const HUGGING_FACE_MODEL_NAME =
  process.env.HUGGING_FACE_MODEL_NAME ||
  "reasonwang/google-flan-t5-large-alpaca";

// Kullanıcıdan gelen soruyu Hugging Face API'ye iletip cevap alma
const askModel = async (req, res) => {
  const { question } = req.body;

  // Modelin anlaması için formatlı giriş
  const formattedInput = `Answer the following question: ${question}`;

  console.log("Gönderilen soru:", question);
  console.log("Formatlı Giriş:", formattedInput);
  console.log("Kullanılan Token:", HUGGING_FACE_API_TOKEN);

  // API Token'ının mevcut olup olmadığını kontrol edin
  if (!HUGGING_FACE_API_TOKEN) {
    console.error("Hugging Face API token eksik.");
    return res
      .status(500)
      .json({ message: "Hugging Face API token is missing" });
  }

  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${HUGGING_FACE_MODEL_NAME}`,
      {
        inputs: formattedInput,
        parameters: {
          max_new_tokens: 250, // Yanıt uzunluğunu artırmak için bu değeri yükseltebilirsiniz.
          do_sample: true,
          temperature: 0.7,
          top_p: 0.9,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${HUGGING_FACE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Modelden gelen yanıt:", response.data);

    // Yanıtın formatını kontrol edin ve frontend'e gönderin
    if (response.data && response.status === 200) {
      const generatedText =
        response.data[0]?.generated_text || "Modelden yanıt alınamadı.";
      console.log("Model Yanıtı Başarıyla Alındı:", generatedText);

      res.json({
        answer: generatedText,
      });
    } else {
      console.error("Beklenmeyen yanıt yapısı:", response.data);
      res
        .status(500)
        .json({ message: "Unexpected response structure from the model" });
    }
  } catch (error) {
    console.error("Hugging Face API ile iletişimde hata:", error);

    // Hata yanıtını frontend'e gönderin
    if (error.response) {
      console.error(
        `Hugging Face API Hata Yanıtı: ${error.response.status}`,
        error.response.data
      );
      res.status(error.response.status).json({
        message:
          error.response.data.error ||
          "Modelden yanıt alınırken bir hata oluştu",
      });
    } else if (error.request) {
      console.error("Yanıt alınmadı:", error.request);
      res
        .status(500)
        .json({ message: "No response received from Hugging Face API" });
    } else {
      console.error("İstek hazırlanırken hata:", error.message);
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

module.exports = {
  askModel,
};
