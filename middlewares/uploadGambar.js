const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/produk");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileName = Date.now() + ext;
    cb(null, fileName);
  },
});

const storageUser = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/user");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileName = Date.now() + ext;
    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Jenis file tidak valid. Hanya format JPEG, JPG, PNG, dan GIF yang diizinkan."
      ),
      false
    );
  }
};

const uploads = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }, // max 5MB
});

const uploadsUser = multer({
  storage: storageUser,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }, // max 5MB
});

module.exports = { uploads, uploadsUser };
