require("dotenv").config();
const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/lokasi", async (req, res) => {
  const kota = req.query.kota || "Padang";
  const apiKey = process.env.MAPTILER_API_KEY;
  const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(kota)}.json?key=${apiKey}&language=id&limit=1`;

  try {
    const { data } = await axios.get(url);
    if (!data.features || data.features.length === 0) {
      return res.status(404).json({ message: "Lokasi tidak ditemukan" });
    }

    const f = data.features[0];
    console.log(JSON.stringify(f.context, null, 2)); // cek struktur asli
    const ctx = f.context || [];
    const cari = (...prefix) => {
      const item = ctx.find(c => prefix.some(p => c.id.startsWith(p)));
      return item ? item.text : "-";
    };

    res.json({
      negara: cari("country"),
      provinsi: cari("region"),
      kecamatan: cari("county", "municipality", "locality"),
      longitude: f.center[0],
      latitude: f.center[1],
    });
  } catch (err) {
    console.error("Detail Error:", err.message);
    res.status(500).json({ message: "Gagal mengambil data dari MapTiler" });
  }
});

app.listen(3000, () => console.log("Server jalan di http://localhost:3000"));