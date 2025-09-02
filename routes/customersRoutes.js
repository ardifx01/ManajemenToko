const express = require("express");
const router = express.Router();
const customersController = require("../controller/customersController");
const customersValidator = require("../middlewares/customersMiddlewares");
const authMiddlewares = require("../middlewares/authMiddlewares");
const verifyAdmin = require("../middlewares/verifyAdmin");

// Public Routes (Bisa diakses tanpa login - jika diperlukan)
router.get("/customers", customersController.getAllCustomers);
router.get("/customers/:id", customersController.getCustomersById);

// Protected Routes (Hanya untuk pengguna terotentikasi, dan admin)
router.post(
  "/customers",
  authMiddlewares,
  verifyAdmin,
  customersValidator,
  customersController.tambahCustomers
);
router.put(
  "/customers/:id",
  authMiddlewares,
  verifyAdmin,
  customersValidator,
  customersController.editCustomers
);
router.delete(
  "/customers/:id",
  authMiddlewares,
  verifyAdmin,
  customersController.hapusCustomers
);

module.exports = router;
