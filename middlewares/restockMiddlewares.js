const { body, validationResult } = require("express-validator");

const restockValidator = [
  body("id_supplier")
    .notEmpty()
    .withMessage("ID supplier wajib diisi.")
    .isInt()
    .withMessage("ID supplier harus berupa angka."),
  body("produk")
    .notEmpty()
    .withMessage("Daftar produk wajib diisi.")
    .isArray({ min: 1 })
    .withMessage("Produk harus berupa array dan tidak boleh kosong."),
  body("produk.*.id_produk")
    .notEmpty()
    .withMessage("ID produk wajib diisi.")
    .isInt()
    .withMessage("ID produk harus berupa angka."),
  body("produk.*.kuantitas")
    .notEmpty()
    .withMessage("Kuantitas wajib diisi.")
    .isInt({ min: 1 })
    .withMessage("Kuantitas produk tidak boleh kurang dari satu."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = restockValidator;
