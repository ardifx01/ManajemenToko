const express = require("express");
const router = express.Router();
const kategoriController = require("../controller/kategoriController");
const kategoriValidator = require("../middlewares/kategoriMiddlewares");
const authMiddlewares = require("../middlewares/authMiddlewares");
const verifyAdmin = require("../middlewares/verifyAdmin");

// Public Routes (Bisa diakses tanpa login - jika diperlukan)
router.get("/kategori", kategoriController.getAllKategori);
router.get("/kategori/:id", kategoriController.getKategoriById);

// Protected Routes (Hanya untuk pengguna terotentikasi, dan admin)
router.post(
  "/kategori",
  authMiddlewares,
  verifyAdmin,
  kategoriValidator,
  kategoriController.tambahKategori
);
router.put(
  "/kategori/:id",
  authMiddlewares,
  verifyAdmin,
  kategoriValidator,
  kategoriController.editKategori
);
router.delete(
  "/kategori/:id",
  authMiddlewares,
  verifyAdmin,
  kategoriController.hapusKategori
);

module.exports = router;
