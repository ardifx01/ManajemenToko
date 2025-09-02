const express = require("express");
const router = express.Router();
const authMiddlewares = require("../middlewares/authMiddlewares");
const verifyAdmin = require("../middlewares/verifyAdmin"); // Import middleware admin

const returnsValidator = require("../middlewares/returMiddlewares");
const returnsController = require("../controller/returController");

// Rute untuk Kasir & Admin: Menambah Retur
router.post(
  "/returns",
  authMiddlewares,
  returnsValidator,
  returnsController.tambahRetur
);

// Rute untuk Admin: Mengelola dan melihat semua data Retur
router.get(
  "/returns",
  authMiddlewares,
  verifyAdmin,
  returnsController.getAllReturns
);
router.put(
  "/returns/:id",
  authMiddlewares,
  verifyAdmin,
  returnsValidator,
  returnsController.editReturn
);
router.delete(
  "/returns/:id",
  authMiddlewares,
  verifyAdmin,
  returnsController.hapusReturn
);

// Rute untuk Semua Pengguna Terotentikasi: Melihat detail Retur
router.get("/returns/:id", authMiddlewares, returnsController.getReturnById);

module.exports = router;
