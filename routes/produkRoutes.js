const express = require("express");
const router = express.Router();
const produkController = require("../controller/produkController");
const produkValidator = require("../middlewares/produkMiddlewares");
const { uploads } = require("../middlewares/uploadGambar");
const authMiddlewares = require("../middlewares/authMiddlewares");
const verifyAdmin = require("../middlewares/verifyAdmin");

// Rute Publik: Bisa diakses tanpa otentikasi
router.get("/produk", produkController.getAllProduk);
router.get("/produk/:id", produkController.getProdukById);

// Rute Terproteksi: Hanya bisa diakses oleh Admin
router.post(
  "/produk",
  authMiddlewares,
  verifyAdmin,
  uploads.single("gambar_produk"),
  produkValidator,
  produkController.tambahProduk
);
router.put(
  "/produk/:id",
  authMiddlewares,
  verifyAdmin,
  uploads.single("gambar_produk"),
  produkValidator,
  produkController.editProduk
);
router.delete(
  "/produk/:id",
  authMiddlewares,
  verifyAdmin,
  produkController.hapusProduk
);

module.exports = router;
