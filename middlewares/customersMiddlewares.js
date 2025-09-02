const { body, validationResult } = require("express-validator");

const customersValidator = [
  body("nama").notEmpty().withMessage("Nama customer wajib diisi."),
  body("email")
    .notEmpty()
    .withMessage("Email customer wajib diisi.")
    .isEmail()
    .withMessage("Format email customer tidak valid."),
  body("no_hp")
    .notEmpty()
    .withMessage("Nomor HP customer wajib diisi.")
    .isNumeric()
    .withMessage("Nomor HP customer harus berupa angka."),
  body("alamat").notEmpty().withMessage("Alamat customer wajib diisi."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = customersValidator;
