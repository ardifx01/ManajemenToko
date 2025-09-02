const { body, validationResult } = require("express-validator");

const produkValidator = [
  body("nama_produk").notEmpty().withMessage("Nama produk wajib diisi."),
  body("modal_awal")
    .notEmpty()
    .withMessage("Modal awal wajib diisi.")
    .isNumeric()
    .withMessage("Modal awal harus berupa angka."),
  body("harga_jual")
    .notEmpty()
    .withMessage("Harga jual wajib diisi.")
    .isNumeric()
    .withMessage("Harga jual harus berupa angka."),
  body("id_kategori").notEmpty().withMessage("Kategori wajib diisi."),
  body("stok").optional().isNumeric().withMessage("Stok harus berupa angka."),

  (req, res, next) => {
    const errors = validationResult(req);

    // Validasi file hanya untuk metode POST
    if (req.method === "POST" && !req.file) {
      errors.errors.push({
        value: "",
        msg: "Gambar produk wajib diunggah.",
        param: "gambar_produk",
        location: "file",
      });
    }

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = produkValidator;
