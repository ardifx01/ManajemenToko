const express = require("express");
const router = express.Router();
const authMiddlewares = require("../middlewares/authMiddlewares");
const registerValidator = require("../middlewares/registeMiddlewares"); // Perbaikan nama file
const kasirValidator = require("../middlewares/kasirMiddlewares"); // Perbaikan nama file
const authController = require("../controller/authController");
const verifyAdmin = require("../middlewares/verifyAdmin");

// Public Routes (tidak butuh otentikasi)
router.post("/register", registerValidator, authController.register);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshToken);

// Protected Routes (butuh otentikasi)
router.get("/users", authMiddlewares, authController.getAllUsers);
router.get("/users/:id", authMiddlewares, authController.getUserById);
router.put("/users/:id", authMiddlewares, authController.editUser);
router.get("/role", authMiddlewares, authController.getRole);

// Admin-only Routes
router.post(
  "/tambahKasir",
  authMiddlewares,
  verifyAdmin,
  kasirValidator,
  authController.tambahKasir
);
router.delete(
  "/users/:id",
  authMiddlewares,
  verifyAdmin,
  authController.hapusUser
);

module.exports = router;
