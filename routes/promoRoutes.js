const express = require("express");
const router = express.Router();
const authMiddlewares = require("../middlewares/authMiddlewares");
const verifyAdmin = require("../middlewares/verifyAdmin");
const promoValidator = require("../middlewares/promoMiddlewares");
const promoController = require("../controller/promoController");

// Rute Terproteksi untuk Admin
router.post(
  "/promo",
  authMiddlewares,
  verifyAdmin,
  promoValidator,
  promoController.tambahPromo
);

router.put(
  "/promo/:id",
  authMiddlewares,
  verifyAdmin,
  promoValidator,
  promoController.editPromo
);

router.delete(
  "/promo/:id",
  authMiddlewares,
  verifyAdmin,
  promoController.hapusPromo
);

// Rute Terproteksi untuk Semua Pengguna Terotentikasi
router.get("/promo", authMiddlewares, promoController.getAllPromo);
router.get("/promo/:id", authMiddlewares, promoController.getPromoById);

module.exports = router;
