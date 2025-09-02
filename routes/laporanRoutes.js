const express = require("express");
const router = express.Router();
const authMiddlewares = require("../middlewares/authMiddlewares");
const laporanValidator = require("../middlewares/laporanMiddlewares");
const laporanController = require("../controller/laporanController");
const verifyAdmin = require("../middlewares/verifyAdmin");

router.get(
  "/laporan/penjualan",
  authMiddlewares,
  verifyAdmin, // Ditambahkan: hanya admin yang bisa akses
  laporanValidator,
  laporanController.getLaporanPenjualan
);

router.get(
  "/laporan/stok",
  authMiddlewares,
  verifyAdmin, // Ditambahkan: hanya admin yang bisa akses
  laporanController.getLaporanStok
);

router.get(
  "/laporan/produk-terlaris",
  authMiddlewares,
  verifyAdmin, // Ditambahkan: hanya admin yang bisa akses
  laporanValidator,
  laporanController.getLaporanProdukTerlaris
);

router.get(
  "/laporan/pergerakan-stok",
  authMiddlewares,
  verifyAdmin, // Ditambahkan: hanya admin yang bisa akses
  laporanValidator,
  laporanController.getPergerakanStok
);

module.exports = router;
