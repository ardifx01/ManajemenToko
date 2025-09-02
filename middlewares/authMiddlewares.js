const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Akses ditolak. Token tidak ditemukan atau format salah.",
    });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    console.log("User di middleware:", req.user);
    next();
  } catch (error) {
    console.error("Kesalahan otentikasi token:", error.message);
    res.status(401).json({
      message: "Akses ditolak. Token tidak valid.",
      error: error.message,
    });
  }
};

module.exports = authMiddleware;
