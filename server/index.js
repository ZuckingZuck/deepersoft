const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 9090;
const connectionString = process.env.DB_URL;
app.use(cors());
app.use(express.json());

const authRouter = require("./router/auth");
const definitionsRouter = require("./router/definitions");
const projectRouter = require("./router/project");
const pozRouter = require("./router/poz");
const stockRouter = require("./router/stock");
const reqRouter = require("./router/requirements");

app.use("/api/auth", authRouter);
app.use("/api/definitions", definitionsRouter);
app.use("/api/project", projectRouter);
app.use("/api/poz", pozRouter);
app.use("/api/stock", stockRouter);
app.use("/api/req", reqRouter);

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
