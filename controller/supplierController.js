const db = require("../config/db");

exports.tambahSupplier = async (req, res) => {
  const { nama_supplier, kontak, alamat } = req.body;
  const conn = await db.getConnection(); // Tambahkan koneksi
  try {
    const [result] = await conn.query("INSERT INTO supplier SET ?", [
      // Ganti db.query menjadi conn.query
      { nama_supplier, kontak, alamat },
    ]);

    if (result.affectedRows === 0) {
      return res.status(500).json({ message: "Data gagal ditambahkan" }); // Ganti status 400 ke 500
    }

    res
      .status(201)
      .json({ message: "Data berhasil ditambahkan", data: result }); // Ganti status 200 ke 201
  } catch (error) {
    console.error("Gagal menambahkan data:", error); // Ganti console.log ke console.error
    res
      .status(500)
      .json({ message: "Gagal menambahkan data", error: error.message });
  } finally {
    conn.release(); // Pastikan koneksi dilepas
  }
};

exports.getAllSupplier = async (req, res) => {
  const conn = await db.getConnection(); // Tambahkan koneksi
  try {
    const [result] = await conn.query("SELECT * FROM supplier"); // Ganti db.query menjadi conn.query
    if (result.length === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" }); // Ganti status 400 ke 404
    }
    res.json({ message: "Data berhasil diambil", data: result });
  } catch (error) {
    console.error("Gagal mengambil data:", error); // Ganti console.log ke console.error
    res
      .status(500)
      .json({ message: "Gagal mengambil data", error: error.message }); // Ganti error: error ke error: error.message
  } finally {
    conn.release(); // Pastikan koneksi dilepas
  }
};

exports.getSupplierById = async (req, res) => {
  const { id } = req.params;
  const conn = await db.getConnection(); // Tambahkan koneksi
  try {
    const [result] = await conn.query(
      // Ganti db.query menjadi conn.query
      "SELECT * FROM supplier WHERE id_supplier = ?",
      [id]
    );
    if (result.length === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" }); // Ganti status 400 ke 404
    }
    res.json({ message: "Data berhasil diambil", data: result[0] }); // Ambil satu objek
  } catch (error) {
    console.error("Gagal mengambil data:", error); // Ganti console.log ke console.error
    res
      .status(500)
      .json({ message: "Gagal mengambil data supplier", error: error.message });
  } finally {
    conn.release(); // Pastikan koneksi dilepas
  }
};

exports.editSupplier = async (req, res) => {
  const { id } = req.params;
  const { nama_supplier, kontak, alamat } = req.body;
  const conn = await db.getConnection(); // Tambahkan koneksi
  try {
    const [result] = await conn.query(
      // Ganti db.query menjadi conn.query
      "UPDATE supplier SET ? WHERE id_supplier = ?",
      [{ nama_supplier, kontak, alamat }, id]
    );
    if (result.affectedRows === 0) {
      // Cek affectedRows, tidak perlu SELECT sebelumnya
      return res
        .status(404)
        .json({ message: "Supplier tidak ditemukan atau tidak ada perubahan" });
    }
    res.json({ message: "Data berhasil diubah", data: result });
  } catch (error) {
    console.error("Gagal mengubah data:", error); // Ganti console.log ke console.error
    res
      .status(500)
      .json({ message: "Gagal mengubah data supplier", error: error.message }); // Ganti error: error ke error: error.message
  } finally {
    conn.release(); // Pastikan koneksi dilepas
  }
};

exports.hapusSupplier = async (req, res) => {
  const { id } = req.params;
  const conn = await db.getConnection(); // Tambahkan koneksi
  try {
    const [result] = await conn.query(
      // Perbaiki typo dan ganti db.query menjadi conn.query
      "DELETE FROM supplier WHERE id_supplier = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      // Cek affectedRows, tidak perlu SELECT sebelumnya
      return res.status(404).json({ message: "Data supplier tidak ditemukan" }); // Ganti status 400 ke 404
    }
    res.json({ message: "Data supplier berhasil dihapus", data: result });
  } catch (error) {
    console.error("Gagal hapus data:", error); // Ganti console.log ke console.error
    res
      .status(500)
      .json({ message: "Gagal hapus data supplier", error: error.message }); // Ganti error: error ke error: error.message
  } finally {
    conn.release(); // Pastikan koneksi dilepas
  }
};
