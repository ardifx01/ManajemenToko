const { query, validationResult } = require("express-validator");

const laporanValidator = [
  query("group_by")
    .optional()
    .isIn(["hari", "bulan", "tahun"])
    .withMessage(
      "Pengelompokan (group_by) harus salah satu dari: hari, bulan, atau tahun."
    ),
  query("start_date")
    .optional()
    .isISO8601()
    .withMessage(
      "Format tanggal awal (start_date) tidak valid. Gunakan format YYYY-MM-DD."
    ),
  query("end_date")
    .optional()
    .isISO8601()
    .withMessage(
      "Format tanggal akhir (end_date) tidak valid. Gunakan format YYYY-MM-DD."
    ),
  query("periode")
    .optional()
    .matches(/^\d{4}$/)
    .withMessage("Periode harus dalam format tahun empat digit (YYYY)."),
  query("range")
    .optional()
    .isIn(["1minggu", "1bulan", "1tahun"])
    .withMessage(
      "Rentang waktu (range) harus salah satu dari: 1minggu, 1bulan, atau 1tahun."
    ),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { start_date, end_date } = req.query;
    if (start_date && end_date && new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({
        message:
          "Tanggal awal (start_date) tidak boleh lebih besar dari tanggal akhir (end_date).",
      });
    }
    next();
  },
];

module.exports = laporanValidator;
