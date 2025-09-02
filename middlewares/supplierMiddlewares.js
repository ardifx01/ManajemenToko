const { body, validationResult } = require("express-validator");

const supplierValidator = [
  body("nama_supplier").notEmpty().withMessage("Nama supplier wajib diisi."),
  body("kontak").notEmpty().withMessage("Kontak wajib diisi."),
  body("alamat").notEmpty().withMessage("Alamat wajib diisi."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = supplierValidator;
