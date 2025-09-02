const db = require("../config/db");

// Tambah Retur ke Supplier
exports.tambahReturSupplier = async (req, res) => {
  const { id_supplier, id_produk, kuantitas, alasan } = req.body;
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Validasi: Cek apakah produk ada dan stoknya mencukupi
    const [produkDb] = await conn.query(
      "SELECT stok FROM produk WHERE id_produk = ?",
      [id_produk]
    );
    if (produkDb.length === 0 || produkDb[0].stok < kuantitas) {
      throw new Error(
        "Stok produk tidak mencukupi atau produk tidak ditemukan."
      );
    }

    // 2. Masukkan data ke tabel 'supplier_returns'
    const [result] = await conn.query("INSERT INTO supplier_returns SET ?", {
      id_supplier,
      id_produk,
      kuantitas,
      alasan,
      status: "proses",
    });

    // 3. Kurangi stok produk
    await conn.query("UPDATE produk SET stok = stok - ? WHERE id_produk = ?", [
      kuantitas,
      id_produk,
    ]);

    await conn.commit();
    res
      .status(201)
      .json({ message: "Retur ke supplier berhasil diproses", data: result }); // Menggunakan status 201 Created
  } catch (error) {
    await conn.rollback();
    console.error("Gagal memproses retur supplier:", error);
    res.status(500).json({
      message: "Gagal memproses retur supplier",
      error: error.message,
    });
  } finally {
    conn.release();
  }
};

// Ambil Semua Retur ke Supplier
exports.getAllReturSupplier = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const [result] = await conn.query(`
      SELECT
        sr.*,
        s.nama_supplier,
        p.nama_produk
      FROM supplier_returns sr
      LEFT JOIN supplier s ON sr.id_supplier = s.id_supplier
      LEFT JOIN produk p ON sr.id_produk = p.id_produk
      ORDER BY sr.tanggal_retur DESC
    `);
    if (result.length === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }
    res.json({ message: "Data berhasil diambil", data: result });
  } catch (error) {
    console.error("Gagal mengambil data retur supplier:", error);
    res
      .status(500)
      .json({ message: "Gagal mengambil data", error: error.message });
  } finally {
    conn.release();
  }
};

// Ambil Retur ke Supplier Berdasarkan ID
exports.getReturSupplierById = async (req, res) => {
  const { id } = req.params;
  const conn = await db.getConnection();
  try {
    const [result] = await conn.query(
      `
      SELECT
        sr.*,
        s.nama_supplier,
        p.nama_produk
      FROM supplier_returns sr
      LEFT JOIN supplier s ON sr.id_supplier = s.id_supplier
      LEFT JOIN produk p ON sr.id_produk = p.id_produk
      WHERE sr.id_retur_supplier = ?
    `,
      [id]
    );
    if (result.length === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }
    res.json({ message: "Data berhasil diambil", data: result[0] });
  } catch (error) {
    console.error("Gagal mengambil data retur supplier:", error);
    res
      .status(500)
      .json({ message: "Gagal mengambil data", error: error.message });
  } finally {
    conn.release();
  }
};

// Update Retur ke Supplier
exports.editReturSupplier = async (req, res) => {
  const { id } = req.params;
  const { id_supplier, id_produk, kuantitas, alasan, status } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Ambil data retur lama untuk mendapatkan kuantitas dan id produk sebelumnya
    const [oldReturn] = await conn.query(
      "SELECT * FROM supplier_returns WHERE id_retur_supplier = ?",
      [id]
    );
    if (oldReturn.length === 0) {
      throw new Error("Data retur tidak ditemukan");
    }
    const oldKuantitas = oldReturn[0].kuantitas;
    const oldIdProduk = oldReturn[0].id_produk;

    // 2. Sesuaikan stok produk lama
    await conn.query("UPDATE produk SET stok = stok + ? WHERE id_produk = ?", [
      oldKuantitas,
      oldIdProduk,
    ]);

    // 3. Perbarui data retur
    const [result] = await conn.query(
      "UPDATE supplier_returns SET ? WHERE id_retur_supplier = ?",
      [{ id_supplier, id_produk, kuantitas, alasan, status }, id]
    );
    if (result.affectedRows === 0) {
      throw new Error("Gagal mengupdate data retur");
    }

    // 4. Periksa apakah stok mencukupi untuk kuantitas baru
    const [produkBaruDb] = await conn.query(
      "SELECT stok FROM produk WHERE id_produk = ?",
      [id_produk]
    );
    if (produkBaruDb.length === 0 || produkBaruDb[0].stok < kuantitas) {
      throw new Error(
        "Stok produk tidak mencukupi untuk kuantitas retur baru."
      );
    }

    // 5. Kurangi stok produk dengan kuantitas yang baru
    await conn.query("UPDATE produk SET stok = stok - ? WHERE id_produk = ?", [
      kuantitas,
      id_produk,
    ]);

    await conn.commit();
    res.json({ message: "Data berhasil diubah", data: result });
  } catch (error) {
    await conn.rollback();
    console.error("Gagal mengubah data retur supplier:", error);
    res
      .status(500)
      .json({ message: "Gagal mengubah data", error: error.message });
  } finally {
    conn.release();
  }
};

// Hapus Retur ke Supplier
exports.hapusReturSupplier = async (req, res) => {
  const { id } = req.params;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Ambil data retur yang akan dihapus untuk mendapatkan kuantitas
    const [oldReturn] = await conn.query(
      "SELECT * FROM supplier_returns WHERE id_retur_supplier = ?",
      [id]
    );
    if (oldReturn.length === 0) {
      throw new Error("Data retur tidak ditemukan");
    }
    const oldKuantitas = oldReturn[0].kuantitas;
    const oldIdProduk = oldReturn[0].id_produk;

    // 2. Hapus data retur
    const [result] = await conn.query(
      "DELETE FROM supplier_returns WHERE id_retur_supplier = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      throw new Error("Gagal menghapus data retur");
    }

    // 3. Tambahkan kembali stok produk yang sebelumnya dikurangi
    await conn.query("UPDATE produk SET stok = stok + ? WHERE id_produk = ?", [
      oldKuantitas,
      oldIdProduk,
    ]);

    await conn.commit();
    res.json({ message: "Data berhasil dihapus", data: result });
  } catch (error) {
    await conn.rollback();
    console.error("Gagal menghapus data retur supplier:", error);
    res
      .status(500)
      .json({ message: "Gagal menghapus data", error: error.message });
  } finally {
    conn.release();
  }
};
