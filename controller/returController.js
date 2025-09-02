const db = require("../config/db");

// Tambah Retur dari Pelanggan
exports.tambahRetur = async (req, res) => {
  const { id_pembelian, id_produk, kuantitas, alasan } = req.body;
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Cek kuantitas yang dibeli di transaksi asli
    const [detailPembelian] = await conn.query(
      "SELECT qty FROM detail_pembelian WHERE id_pembelian = ? AND id_produk = ?",
      [id_pembelian, id_produk]
    );

    if (detailPembelian.length === 0 || detailPembelian[0].qty < kuantitas) {
      throw new Error(
        "Kuantitas retur melebihi jumlah yang dibeli atau produk tidak ditemukan."
      );
    }

    // 2. Masukkan data ke tabel 'returns' dengan status awal
    const [result] = await conn.query("INSERT INTO returns SET ?", {
      id_pembelian,
      id_produk,
      kuantitas,
      alasan,
      status: "pending",
      status_toko_supplier: "belum_diteruskan",
    });

    // 3. Update stok produk: tambahkan kembali kuantitas yang diretur
    await conn.query("UPDATE produk SET stok = stok + ? WHERE id_produk = ?", [
      kuantitas,
      id_produk,
    ]);

    await conn.commit();
    res.status(201).json({ message: "Retur berhasil diproses", data: result });
  } catch (error) {
    await conn.rollback();
    console.error("Gagal memproses retur:", error);
    res
      .status(500)
      .json({ message: "Gagal memproses retur", error: error.message });
  } finally {
    conn.release();
  }
};

// Ambil Semua Retur dari Pelanggan
exports.getAllReturns = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const [result] = await conn.query(`
      SELECT
          r.*,
          p.tanggal_pembelian,
          cus.nama AS nama_customer,
          prod.nama_produk
      FROM returns r
      JOIN pembelian p ON r.id_pembelian = p.id_pembelian
      JOIN customers cus ON p.id_customer = cus.id_customer
      JOIN produk prod ON r.id_produk = prod.id_produk
      ORDER BY r.tanggal_retur DESC
    `);
    if (result.length === 0) {
      return res.status(404).json({ message: "Tidak ada data retur" });
    }
    res.json({ message: "Data berhasil diambil", data: result });
  } catch (error) {
    console.error("Gagal mengambil data retur:", error);
    res
      .status(500)
      .json({ message: "Gagal mengambil data", error: error.message });
  } finally {
    conn.release();
  }
};

// Ambil Retur dari Pelanggan Berdasarkan ID
exports.getReturnById = async (req, res) => {
  const { id } = req.params;
  const conn = await db.getConnection();
  try {
    const [result] = await conn.query(
      `
      SELECT
          r.*,
          p.tanggal_pembelian,
          p.total_harga,
          p.metode_pembayaran,
          cus.nama AS nama_customer,
          kasir.username AS nama_kasir,
          prod.nama_produk
      FROM returns r
      JOIN pembelian p ON r.id_pembelian = p.id_pembelian
      JOIN customers cus ON p.id_customer = cus.id_customer
      JOIN users kasir ON p.id_kasir = kasir.id_user
      JOIN produk prod ON r.id_produk = prod.id_produk
      WHERE r.id_retur = ?
    `,
      [id]
    );
    if (result.length === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }
    res.json({ message: "Data berhasil diambil", data: result[0] });
  } catch (error) {
    console.error("Gagal mengambil data retur berdasarkan ID:", error);
    res
      .status(500)
      .json({ message: "Gagal mengambil data", error: error.message });
  } finally {
    conn.release();
  }
};

// Update Retur dari Pelanggan
exports.editReturn = async (req, res) => {
  const { id } = req.params;
  const {
    id_pembelian,
    id_produk,
    kuantitas,
    alasan,
    status,
    status_toko_supplier,
  } = req.body;
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Ambil data retur lama untuk mendapatkan kuantitas sebelumnya
    const [oldReturn] = await conn.query(
      "SELECT * FROM returns WHERE id_retur = ?",
      [id]
    );
    if (oldReturn.length === 0) {
      throw new Error("Data retur tidak ditemukan");
    }
    const oldKuantitas = oldReturn[0].kuantitas;

    // 2. Kembalikan stok produk ke keadaan semula sebelum diedit
    await conn.query("UPDATE produk SET stok = stok - ? WHERE id_produk = ?", [
      oldKuantitas,
      oldReturn[0].id_produk,
    ]);

    // 3. Perbarui data retur dengan nilai baru
    const [result] = await conn.query(
      "UPDATE returns SET ? WHERE id_retur = ?",
      [
        {
          id_pembelian,
          id_produk,
          kuantitas,
          alasan,
          status,
          status_toko_supplier,
        },
        id,
      ]
    );

    if (result.affectedRows === 0) {
      throw new Error("Gagal mengubah data retur");
    }

    // 4. Tambahkan stok produk dengan kuantitas yang baru
    await conn.query("UPDATE produk SET stok = stok + ? WHERE id_produk = ?", [
      kuantitas,
      id_produk,
    ]);

    await conn.commit();
    res.json({ message: "Data berhasil diubah", data: result });
  } catch (error) {
    await conn.rollback();
    console.error("Gagal mengubah data retur:", error);
    res
      .status(500)
      .json({ message: "Gagal mengubah data", error: error.message });
  } finally {
    conn.release();
  }
};

// Hapus Retur dari Pelanggan
exports.hapusReturn = async (req, res) => {
  const { id } = req.params;
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();
    // 1. Ambil data retur yang akan dihapus untuk mendapatkan kuantitas
    const [oldReturn] = await conn.query(
      "SELECT * FROM returns WHERE id_retur = ?",
      [id]
    );
    if (oldReturn.length === 0) {
      throw new Error("Data retur tidak ditemukan");
    }
    const oldKuantitas = oldReturn[0].kuantitas;

    // 2. Hapus data retur
    const [result] = await conn.query(
      "DELETE FROM returns WHERE id_retur = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      throw new Error("Gagal menghapus data retur");
    }

    // 3. Kurangi stok produk dengan kuantitas yang dihapus
    await conn.query("UPDATE produk SET stok = stok - ? WHERE id_produk = ?", [
      oldKuantitas,
      oldReturn[0].id_produk,
    ]);

    await conn.commit();
    res.json({ message: "Data berhasil dihapus", data: result });
  } catch (error) {
    await conn.rollback();
    console.error("Gagal menghapus data retur:", error);
    res
      .status(500)
      .json({ message: "Gagal menghapus data", error: error.message });
  } finally {
    conn.release();
  }
};
