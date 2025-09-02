const db = require("../config/db");

exports.tambahKategori = async (req, res) => {
  const { nama_kategori } = req.body;
  const conn = await db.getConnection();

  try {
    const [existing] = await conn.query(
      "SELECT * FROM kategori WHERE nama_kategori = ?",
      [nama_kategori]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Kategori sudah ada" });
    }

    const [result] = await conn.query(
      "INSERT INTO kategori (nama_kategori) VALUES (?)",
      [nama_kategori]
    );
    res
      .status(201)
      .json({ message: "Kategori berhasil ditambahkan", data: result });
  } catch (error) {
    console.error("Gagal menambahkan kategori:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan", error: error.message });
  } finally {
    conn.release();
  }
};

exports.getAllKategori = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const [result] = await conn.query("SELECT * FROM kategori");
    if (result.length === 0) {
      return res.status(404).json({ message: "Data Kategori tidak ditemukan" });
    }
    res.json({ message: "Berhasil menampilkan data kategori", data: result });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  } finally {
    conn.release();
  }
};

exports.getKategoriById = async (req, res) => {
  const { id } = req.params;
  const conn = await db.getConnection();
  try {
    const [result] = await conn.query(
      "SELECT * FROM kategori WHERE id_kategori = ?", // Gunakan id_kategori
      [id]
    );
    if (result.length === 0) {
      return res.status(404).json({ message: "Data Kategori tidak ditemukan" });
    }
    res.json({
      message: "Berhasil menampilkan data kategori",
      data: result[0],
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  } finally {
    conn.release();
  }
};

exports.editKategori = async (req, res) => {
  const { id } = req.params;
  const { nama_kategori } = req.body;
  const conn = await db.getConnection();

  try {
    const [result] = await conn.query(
      `UPDATE kategori SET ? WHERE id_kategori = ?`,
      [
        // Perbaiki nama kolom
        { nama_kategori },
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Kategori tidak ditemukan atau tidak ada perubahan" });
    }
    res.json({ message: "Berhasil mengupdate data kategori", data: result });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  } finally {
    conn.release();
  }
};

exports.hapusKategori = async (req, res) => {
  const { id } = req.params;
  const conn = await db.getConnection();

  try {
    const [result] = await conn.query(
      "DELETE FROM kategori WHERE id_kategori = ?",
      [id]
    ); // Perbaiki nama kolom

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Data Kategori tidak ditemukan" });
    }
    res.json({ message: "Berhasil menghapus data kategori", data: result });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  } finally {
    conn.release();
  }
};
