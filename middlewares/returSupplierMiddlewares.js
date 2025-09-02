const { body, validationResult } = require("express-validator");

const supplierReturnsValidator = [
  body("id_supplier").notEmpty().withMessage("ID supplier wajib diisi."),
  body("id_produk").notEmpty().withMessage("ID produk wajib diisi."),
  body("kuantitas")
    .notEmpty()
    .withMessage("Kuantitas wajib diisi.")
    .isInt({ min: 1 })
    .withMessage("Kuantitas harus berupa angka positif."),
  body("alasan").notEmpty().withMessage("Alasan wajib diisi."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = supplierReturnsValidator;
