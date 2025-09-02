const { body, validationResult } = require("express-validator");

const pembelianValidator = [
  body("metode_pembayaran")
    .notEmpty()
    .withMessage("Metode pembayaran wajib diisi."),
  body("produk")
    .isArray({ min: 1 })
    .withMessage("Produk harus berupa array dan tidak boleh kosong."),
  body("produk.*.id_produk")
    .isInt({ min: 1 })
    .withMessage("ID produk harus berupa angka dan lebih dari 0."),
  body("produk.*.qty")
    .isInt({ min: 1 })
    .withMessage("Kuantitas (qty) produk harus berupa angka dan minimal 1."),
  body("status_pembayaran")
    .isIn(["lunas", "hutang", "dp"])
    .withMessage(
      "Status pembayaran tidak valid. Pilih salah satu dari: lunas, hutang, atau dp."
    ),
  body("jumblah_bayar")
    .isFloat({ min: 0 })
    .withMessage("Jumlah bayar harus berupa angka dan tidak boleh negatif."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = pembelianValidator;
