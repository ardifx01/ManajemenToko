const express = require("express");
const router = express.Router();
const authMiddlewares = require("../middlewares/authMiddlewares");
const verifyAdmin = require("../middlewares/verifyAdmin");
const restockValidator = require("../middlewares/restockMiddlewares");
const restockController = require("../controller/restockController");

router.post(
  "/restock",
  authMiddlewares,
  verifyAdmin,
  restockValidator,
  restockController.tambahRestock
);

// Tambahkan verifyAdmin ke rute GET untuk keamanan
router.get(
  "/restock",
  authMiddlewares,
  verifyAdmin,
  restockController.getAllRestock
);
router.get(
  "/restock/:id",
  authMiddlewares,
  verifyAdmin,
  restockController.getRestockById
);
router.put(
  "/restock/:id",
  authMiddlewares,
  verifyAdmin,
  restockValidator,
  restockController.editRestock
);

module.exports = router;
