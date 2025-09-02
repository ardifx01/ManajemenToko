const { body, validationResult } = require("express-validator");

const kasirValidator = [
  body("username")
    .notEmpty()
    .withMessage("Username wajib diisi.")
    .isLength({ min: 6 })
    .withMessage("Username minimal 6 karakter."),
  body("email")
    .notEmpty()
    .withMessage("Email wajib diisi.")
    .isEmail()
    .withMessage("Format email tidak valid."),
  body("password")
    .notEmpty()
    .withMessage("Password wajib diisi.")
    .isLength({ min: 6 })
    .withMessage("Password minimal 6 karakter."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = kasirValidator;
