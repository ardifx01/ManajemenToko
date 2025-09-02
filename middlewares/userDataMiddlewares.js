const { body, validationResult } = require("express-validator");

const userDataValidator = [
  body("nama_lengkap")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Nama lengkap wajib diisi dan minimal 3 karakter.")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Nama lengkap hanya boleh berisi huruf dan spasi."),
  body("alamat_user").trim().notEmpty().withMessage("Alamat wajib diisi."),
  body("no_hp")
    .trim()
    .notEmpty()
    .withMessage("Nomor HP wajib diisi.")
    .isNumeric()
    .withMessage("Nomor HP harus berupa angka."),
  body("tanggal_lahir")
    .notEmpty()
    .withMessage("Tanggal lahir wajib diisi.")
    .isISO8601()
    .withMessage("Format tanggal lahir tidak valid (gunakan YYYY-MM-DD)."),
  body("bio")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Bio wajib diisi dan maksimal 1000 karakter."),

  (req, res, next) => {
    const errors = validationResult(req);
    if (req.method === "POST" && !req.file) {
      errors.errors.push({
        value: "",
        msg: "Foto profil wajib diunggah.",
        param: "foto_profil",
        location: "file",
      });
    }

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = userDataValidator;
