const db = require("../config/db");
const bcrypt = require("bcryptjs"); // Ganti 'bcrypt' menjadi 'bcryptjs'
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

exports.register = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { username, email, password, role = "kasir" } = req.body;

    // Cek email yang sudah terdaftar
    const [cekEmail] = await conn.query(
      "SELECT email FROM users WHERE email = ?",
      [email]
    );
    if (cekEmail.length > 0) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    const hash = await bcrypt.hash(password, 10);

    const [result] = await conn.query("INSERT INTO users SET ?", {
      username,
      email,
      password: hash,
      role,
    });

    const token = jwt.sign(
      { id: result.insertId, role },
      process.env.SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );

    res.status(201).json({
      message: "Berhasil mendaftarkan user baru",
      token,
      data: { id: result.insertId, username, email, role },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal mendaftarkan user", error: error.message });
  } finally {
    conn.release();
  }
};

exports.getAllUsers = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const [result] = await conn.query(
      "SELECT id_user, username, email, role FROM users"
    );
    res.json({ message: "Berhasil mendapatkan semua user", data: result });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal mendapatkan semua user", error: error.message });
  } finally {
    conn.release();
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  const conn = await db.getConnection();
  try {
    const [result] = await conn.query(
      "SELECT id_user, username, email, role FROM users WHERE id_user = ?",
      [id]
    );
    if (result.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    res.json({ message: "Berhasil mendapatkan user", data: result[0] });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal mendapatkan user", error: error.message });
  } finally {
    conn.release();
  }
};

exports.editUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, password, role } = req.body;
  const conn = await db.getConnection();
  try {
    const [cekUser] = await conn.query(
      "SELECT * FROM users WHERE id_user = ?",
      [id]
    );
    if (cekUser.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const [cekEmail] = await conn.query(
      "SELECT email FROM users WHERE email = ? AND id_user != ?",
      [email, id]
    );
    if (cekEmail.length > 0) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    const updatedUser = { username, email, role };
    if (password && password.trim() !== "") {
      updatedUser.password = await bcrypt.hash(password, 10);
    }

    const [result] = await conn.query("UPDATE users SET ? WHERE id_user = ?", [
      updatedUser,
      id,
    ]);

    res.json({
      message: "Berhasil mengedit user",
      data: { id, username, email, role },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal mengedit user", error: error.message });
  } finally {
    conn.release();
  }
};

exports.hapusUser = async (req, res) => {
  const { id } = req.params;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [cekUsers] = await conn.query(
      "SELECT foto_profil FROM user_data WHERE id_user = ?",
      [id]
    );
    if (cekUsers.length > 0 && cekUsers[0].foto_profil) {
      const oldPath = path.join(
        __dirname,
        "../uploads/user",
        cekUsers[0].foto_profil
      );
      try {
        fs.unlinkSync(oldPath);
      } catch (err) {
        console.log("Gambar user tidak ditemukan, melewati penghapusan.");
      }
    }

    await conn.query("DELETE FROM user_data WHERE id_user = ?", [id]);
    const [result] = await conn.query("DELETE FROM users WHERE id_user = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    await conn.commit();
    res.json({ message: "User berhasil dihapus", data: { id } });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal menghapus user", error: error.message });
  } finally {
    conn.release();
  }
};

// Fungsi Login yang Diperbarui
exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE username = ? OR email =?",
      [username, username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Username atau password salah" });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Username atau password salah" });
    }

    // Buat ACCESS TOKEN (Berlaku 15 menit)
    const accessToken = jwt.sign(
      { id_user: user.id_user, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: "15m" }
    );

    // Buat REFRESH TOKEN (Berlaku 7 hari)
    const refreshToken = jwt.sign(
      { id_user: user.id_user },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // Simpan Refresh Token di database
    await db.query(
      "INSERT INTO refresh_tokens (token, id_user) VALUES (?, ?)",
      [refreshToken, user.id_user]
    );

    res.json({ accessToken, refreshToken, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

// Fungsi Refresh Token
exports.refreshToken = async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(401).json({ message: "Token tidak tersedia" });
  }

  try {
    const [rows] = await db.query(
      "SELECT * FROM refresh_tokens WHERE token = ?",
      [token]
    );
    if (rows.length === 0) {
      return res.status(403).json({ message: "Token tidak valid" });
    }

    const user = rows[0];
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    // Buat ACCESS TOKEN baru
    const newAccessToken = jwt.sign(
      { id_user: decoded.id_user, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    // Hapus token yang tidak valid dari database jika ada error
    await db.query("DELETE FROM refresh_tokens WHERE token = ?", [token]);
    return res.status(403).json({ message: "Token tidak valid" });
  }
};

// Fungsi tambahan, disatukan dari register dan tambahKasir
exports.tambahKasir = exports.register;

// Fungsi Get role
exports.getRole = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const [result] = await conn.query("SELECT DISTINCT role FROM users");
    res.json({ message: "Berhasil mendapatkan role", data: result });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal mendapatkan role", error: error.message });
  } finally {
    conn.release();
  }
};
