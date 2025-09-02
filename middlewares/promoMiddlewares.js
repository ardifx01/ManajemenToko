const { body, validationResult } = require("express-validator");

const promoValidator = [
  body("kode_promo")
    .notEmpty()
    .withMessage("Kode promo wajib diisi.")
    .isLength({ min: 3, max: 50 })
    .withMessage("Kode promo minimal 3 karakter.")
    .isAlphanumeric()
    .withMessage("Kode promo hanya boleh berisi huruf dan angka."),
  body("nama_promo").notEmpty().withMessage("Nama promo wajib diisi."),
  body("tipe_diskon")
    .notEmpty()
    .withMessage("Tipe diskon wajib diisi.")
    .isIn(["persen", "jumlah"])
    .withMessage(
      "Tipe diskon tidak valid. Pilih antara 'persen' atau 'jumlah'."
    ),
  body("nilai_diskon")
    .notEmpty()
    .withMessage("Nilai diskon wajib diisi.")
    .isNumeric()
    .withMessage("Nilai diskon harus berupa angka."),
  body("tanggal_mulai")
    .notEmpty()
    .withMessage("Tanggal mulai wajib diisi.")
    .isISO8601()
    .withMessage("Format tanggal mulai tidak valid (gunakan YYYY-MM-DD)."),
  body("tanggal_berakhir")
    .notEmpty()
    .withMessage("Tanggal berakhir wajib diisi.")
    .isISO8601()
    .withMessage("Format tanggal berakhir tidak valid (gunakan YYYY-MM-DD).")
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.body.tanggal_mulai)) {
        throw new Error("Tanggal berakhir harus setelah tanggal mulai.");
      }
      return true;
    }),
  body("status")
    .optional()
    .isIn(["aktif", "tidak_aktif"])
    .withMessage(
      "Status tidak valid. Pilih antara 'aktif' atau 'tidak_aktif'."
    ),
  body("min_pembelian")
    .optional()
    .isNumeric()
    .withMessage("Minimum pembelian harus berupa angka."),
  body("usage_limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Batas penggunaan harus berupa angka bulat positif."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = promoValidator;
