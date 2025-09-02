const express = require("express");
const router = express.Router();
const pembelianValidator = require("../middlewares/pembelianMiddlewares");
const pembelianController = require("../controller/pembelianController");
const authMiddlewares = require("../middlewares/authMiddlewares"); // Perbaikan nama variabel
const verifyAdmin = require("../middlewares/verifyAdmin");

// Rute untuk Kasir: Menambah pembelian baru
router.post(
  "/pembelian/me",
  authMiddlewares,
  pembelianValidator,
  pembelianController.tambahPembelian
);

// Rute untuk Admin: Melihat dan Mengubah semua data pembelian
router.get(
  "/pembelian",
  authMiddlewares,
  verifyAdmin,
  pembelianController.getAllPembelian
);
router.put(
  "/pembelian/:id",
  authMiddlewares,
  verifyAdmin,
  pembelianValidator,
  pembelianController.editPembelian
);

// Rute untuk Semua Pengguna Terotentikasi: Melihat detail pembelian
router.get(
  "/pembelian/:id",
  authMiddlewares,
  pembelianController.getPembelianById
);

module.exports = router;
