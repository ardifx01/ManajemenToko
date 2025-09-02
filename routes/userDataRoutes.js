const express = require("express");
const router = express.Router();
const userDataValidator = require("../middlewares/userDataMiddlewares");
const { uploadsUser } = require("../middlewares/uploadGambar");
const verifyAdmin = require("../middlewares/verifyAdmin");
const authMiddlewares = require("../middlewares/authMiddlewares");
const userDataController = require("../controller/userDataController");

// Rute Terproteksi untuk Pengguna Login: Mengelola data sendiri
router.get(
  "/userData/me",
  authMiddlewares,
  userDataController.userDataByIdUser
);

router.put(
  "/userData/me",
  authMiddlewares,
  uploadsUser.single("foto_profil"),
  userDataValidator,
  userDataController.addOrEditUserData
);

// Rute Terproteksi untuk Admin: Mengelola data pengguna lain
router.get(
  "/userData/:id",
  authMiddlewares,
  verifyAdmin,
  userDataController.getUserDataById
);

module.exports = router;
