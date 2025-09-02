const { body, validationResult } = require("express-validator");

const kategoriValidator = [
  body("nama_kategori")
    .notEmpty()
    .withMessage("Nama kategori tidak boleh kosong"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = kategoriValidator;
