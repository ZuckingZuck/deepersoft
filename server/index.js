const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = 9090;
const connectionString = process.env.DB_URL;

app.use(express.json());

const authRouter = require("./router/auth");


app.use("/api/auth", authRouter);


mongoose
  .connect(connectionString)
  .then(() => {
    console.log("MongoDB bağlantısı başarılı!");

    // Basit bir test endpoint'i
    app.get("/", (req, res) => {
      res.json({ message: "API çalışıyor!" });
    });

    // Sunucuyu başlat
    app.listen(PORT, () => {
      console.log(`Sunucu ${PORT} portunda çalışıyor...`);
    });
  })
  .catch((err) => {
    console.error("MongoDB bağlantı hatası:", err);
  });
