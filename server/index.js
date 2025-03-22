const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = 9090;
const connectionString = process.env.DB_URL;

app.use(express.json());

const authRouter = require("./router/auth");
const definitionsRouter = require("./router/definitions");
const projectRouter = require("./router/project");

app.use("/api/auth", authRouter);
app.use("/api/definitions", definitionsRouter);
app.use("/api/project", projectRouter);


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
