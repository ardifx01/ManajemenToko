// server/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const userDataRoutes = require("./routes/userDataRoutes");
const produkRoutes = require("./routes/produkRoutes");
const kategoriRoutes = require("./routes/kategoriRoutes");
const pembelianRoutes = require("./routes/pembelianRoutes");
const customersRoutes = require("./routes/customersRoutes");
const supplierRoutes = require("./routes/supplierRoutes"); // Nama variabel diubah
const promoRoutes = require("./routes/promoRoutes");
const returRoutes = require("./routes/returRoutes");
const supplierReturRoutes = require("./routes/supplierReturRoutes");
const restockRoutes = require("./routes/restockRoutes");
const laporanRoutes = require("./routes/laporanRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Rute API
app.get("/api/test", (req, res) => {
  console.log("Test endpoint diakses");
  res.json({ message: "API test berhasil" });
});

app.use("/api", authRoutes);
app.use("/api", userDataRoutes);
app.use("/api", produkRoutes);
app.use("/api", kategoriRoutes);
app.use("/api", pembelianRoutes);
app.use("/api", customersRoutes);
app.use("/api", supplierRoutes);
app.use("/api", promoRoutes);
app.use("/api", returRoutes);
app.use("/api", supplierReturRoutes);
app.use("/api", restockRoutes);
app.use("/api", laporanRoutes);
app.use("/uploads", express.static(path.join(__dirname, "./uploads")));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Terjadi kesalahan pada server",
    error: err.message,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
