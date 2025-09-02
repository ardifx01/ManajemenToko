const express = require("express");
const router = express.Router();
const authMiddlewares = require("../middlewares/authMiddlewares");
const verifyAdmin = require("../middlewares/verifyAdmin");
const supplierReturnsValidator = require("../middlewares/returSupplierMiddlewares");
const supplierReturnsController = require("../controller/supplierReturnsController");

// Semua rute di sini terproteksi dan hanya bisa diakses oleh Admin
router.post(
  "/supplier-returns",
  authMiddlewares,
  verifyAdmin,
  supplierReturnsValidator,
  supplierReturnsController.tambahReturSupplier
);

router.get(
  "/supplier-returns",
  authMiddlewares,
  verifyAdmin,
  supplierReturnsController.getAllReturSupplier
);

router.get(
  "/supplier-returns/:id",
  authMiddlewares,
  verifyAdmin,
  supplierReturnsController.getReturSupplierById
);

router.put(
  "/supplier-returns/:id",
  authMiddlewares,
  verifyAdmin,
  supplierReturnsValidator,
  supplierReturnsController.editReturSupplier
);

router.delete(
  "/supplier-returns/:id",
  authMiddlewares,
  verifyAdmin,
  supplierReturnsController.hapusReturSupplier
);

module.exports = router;
