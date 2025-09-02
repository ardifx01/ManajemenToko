const express = require("express");
const router = express.Router();
const authMiddlewares = require("../middlewares/authMiddlewares");
const verifyAdmin = require("../middlewares/verifyAdmin");
const supplierValidator = require("../middlewares/supplierMiddlewares");
const supplierController = require("../controller/supplierController");

// Semua rute di sini terproteksi dan hanya bisa diakses oleh Admin
router.post(
  "/supplier",
  authMiddlewares,
  verifyAdmin,
  supplierValidator,
  supplierController.tambahSupplier
);

router.get(
  "/supplier",
  authMiddlewares,
  verifyAdmin,
  supplierController.getAllSupplier
);

router.get(
  "/supplier/:id",
  authMiddlewares,
  verifyAdmin,
  supplierController.getSupplierById
);

router.put(
  "/supplier/:id",
  authMiddlewares,
  verifyAdmin,
  supplierValidator,
  supplierController.editSupplier
);

router.delete(
  "/supplier/:id",
  authMiddlewares,
  verifyAdmin,
  supplierController.hapusSupplier
);

module.exports = router;
