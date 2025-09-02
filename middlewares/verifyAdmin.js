module.exports = (req, res, next) => {
  const user = req.user;
  if (user && user.role === "admin") {
    next();
  } else {
    res
      .status(403)
      .json({
        message: "Akses ditolak. Anda tidak memiliki izin sebagai admin.",
      });
  }
};
