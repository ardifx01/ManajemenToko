const db = require("../config/db");

exports.tambahPromo = async (req, res) => {
  const {
    kode_promo,
    nama_promo,
    tipe_diskon,
    nilai_diskon,
    tanggal_mulai,
    tanggal_berakhir,
    status,
    min_pembelian,
    usage_limit,
  } = req.body;
  const conn = await db.getConnection();
  try {
    const [result] = await conn.query("INSERT INTO promo SET ?", [
      {
        kode_promo,
        nama_promo,
        tipe_diskon,
        nilai_diskon,
        tanggal_mulai,
        tanggal_berakhir,
        status,
        min_pembelian,
        usage_limit,
      },
    ]);

    if (result.affectedRows === 0) {
      return res.status(500).json({ message: "Gagal menambahkan promo" });
    }

    res
      .status(201)
      .json({ message: "Berhasil menambahkan data promo", data: result });
  } catch (error) {
    console.error("Terjadi kesalahan saat tambah data:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  } finally {
    conn.release();
  }
};

exports.getAllPromo = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const [result] = await conn.query("SELECT * FROM promo");
    if (result.length === 0) {
      return res.status(404).json({ message: "Tidak ada data promo" });
    }
    res.json({ message: "Berhasil mengambil data promo", data: result });
  } catch (error) {
    console.error("Gagal mengambil data promo:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  } finally {
    conn.release();
  }
};

exports.getPromoById = async (req, res) => {
  const { id } = req.params;
  const conn = await db.getConnection();
  try {
    const [result] = await conn.query(
      "SELECT * FROM promo WHERE id_promo = ?",
      [id]
    ); // Mengubah `id` menjadi `id_promo` untuk konsistensi
    if (result.length === 0) {
      return res
        .status(404)
        .json({ message: "Tidak ada data promo dengan id tersebut " });
    }
    res.json({ message: "Berhasil mengambil data promo", data: result[0] }); // Mengambil satu objek saja
  } catch (error) {
    console.error("Gagal mengambil data promo dengan id tersebut:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  } finally {
    conn.release();
  }
};

exports.editPromo = async (req, res) => {
  const { id } = req.params;
  const {
    kode_promo,
    nama_promo,
    tipe_diskon,
    nilai_diskon,
    tanggal_mulai,
    tanggal_berakhir,
    status,
    min_pembelian,
    usage_limit,
  } = req.body;
  const conn = await db.getConnection();
  try {
    const [result] = await conn.query("UPDATE promo SET ? WHERE id_promo = ?", [
      // Memperbaiki kesalahan WHERE
      {
        kode_promo,
        nama_promo,
        tipe_diskon,
        nilai_diskon,
        tanggal_mulai,
        tanggal_berakhir,
        status,
        min_pembelian,
        usage_limit,
      },
      id,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({
          message: "Data promo tidak ditemukan atau tidak ada perubahan",
        });
    }

    res.json({ message: "Berhasil mengubah data promo", data: result });
  } catch (error) {
    console.error("Gagal mengubah data promo:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  } finally {
    conn.release();
  }
};

exports.hapusPromo = async (req, res) => {
  const { id } = req.params;
  const conn = await db.getConnection();
  try {
    const [result] = await conn.query("DELETE FROM promo WHERE id_promo = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Data promo tidak ditemukan" });
    }
    res.json({ message: "Berhasil menghapus data promo", data: result });
  } catch (error) {
    console.error("Gagal menghapus data promo:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  } finally {
    conn.release();
  }
};
