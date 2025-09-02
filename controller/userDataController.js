const { execSync } = require("child_process");
const db = require("../config/db");
const fs = require("fs");
const path = require("path");

// Ambil User Data berdasarkan ID user (admin atau akses khusus)
exports.getUserDataById = async (req, res) => {
  const { id } = req.params;
  const conn = await db.getConnection();
  try {
    const [result] = await conn.query(
      `
      SELECT ud.*, u.username, u.email , u.role
      FROM user_data ud
      JOIN users u ON ud.id_user = u.id_user
      WHERE ud.id_user = ?
      `,
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: "User Data tidak ditemukan" });
    }

    res.status(200).json({
      message: "Data user berhasil ditemukan",
      data: result[0],
    });
  } catch (error) {
    console.error("Error getUserDataById:", error);
    res.status(500).json({ message: "Error server", error: error.message });
  } finally {
    conn.release();
  }
};

exports.userDataByIdUser = async (req, res) => {
  const userId = req.user.id_user;
  const conn = await db.getConnection();
  try {
    const [result] = await conn.query(
      `SELECT ud.* ,u.username, u.email ,u.role
      FROM user_data ud
      LEFT JOIN users u ON ud.id_user = u.id_user
      WHERE ud.id_user = ?`,
      [userId]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const userData = result[0];
    userData.email = userData.email || "Belum diisi";

    if (userData.foto_profil) {
      userData.foto_profil_url = `${req.protocol}://${req.get(
        "host"
      )}/uploads/user/${userData.foto_profil}`;
    } else {
      userData.foto_profil_url = null;
    }

    // Ini adalah respons sukses, jadi tidak perlu cek nama_lengkap atau alamat_user.
    // Jika data tidak ada, itu adalah representasi dari user yang ada, bukan error.
    res.status(200).json({
      message: "Data user berhasil ditemukan",
      data: userData,
    });
  } catch (error) {
    console.error("Error userDataByIdUser:", error);
    res.status(500).json({ message: "Error server", error: error.message });
  } finally {
    conn.release();
  }
};

// Tambah atau edit data user yang sedang login
exports.addOrEditUserData = async (req, res) => {
  const userId = req.user.id_user;
  const { nama_lengkap, alamat_user, no_hp, tanggal_lahir, bio } = req.body;
  const conn = await db.getConnection();

  try {
    const [dataLama] = await conn.query(
      "SELECT foto_profil FROM user_data WHERE id_user = ?",
      [userId]
    );

    let dataBaru = {
      nama_lengkap,
      alamat_user,
      no_hp,
      tanggal_lahir,
      bio,
    };

    if (req.file) {
      dataBaru.foto_profil = req.file.filename;
    }

    Object.keys(dataBaru).forEach((key) => {
      if (dataBaru[key] === undefined) delete dataBaru[key];
    });

    if (dataLama.length === 0) {
      dataBaru.id_user = userId;
      await conn.query("INSERT INTO user_data SET ?", dataBaru);
      return res.status(201).json({
        message: "Data user berhasil ditambahkan",
        data: dataBaru,
      });
    } else {
      if (dataLama[0].foto_profil && req.file) {
        const oldPath = path.join(
          __dirname,
          "../uploads/user",
          dataLama[0].foto_profil
        );
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      await conn.query("UPDATE user_data SET ? WHERE id_user = ?", [
        dataBaru,
        userId,
      ]);

      return res.status(200).json({
        message: "Data user berhasil diperbarui",
        data: dataBaru,
      });
    }
  } catch (error) {
    console.error("Error addOrEditUserData:", error);
    res.status(500).json({ message: "Error server", error: error.message });
  } finally {
    conn.release();
  }
};
