const db = require("../config/db");

exports.tambahRestock = async (req, res) => {
  const { id_supplier, produk } = req.body;
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Masukkan data ke tabel induk (restock)
    const [restockResult] = await conn.query(
      "INSERT INTO restock (id_supplier) VALUES (?)",
      [id_supplier]
    );

    const id_restock = restockResult.insertId;
    let total_produk_count = 0;

    // Loop untuk memasukkan setiap produk ke tabel anak
    for (const item of produk) {
      // 2. Cek apakah produk ada di database
      const [produkDb] = await conn.query(
        "SELECT id_produk FROM produk WHERE id_produk = ?",
        [item.id_produk]
      );
      if (produkDb.length === 0) {
        throw new Error(
          "Produk dengan ID " + item.id_produk + " tidak ditemukan."
        );
      }

      // 3. Masukkan data ke detail_restock
      await conn.query("INSERT INTO detail_restock SET ?", [
        {
          id_restock,
          id_produk: item.id_produk,
          kuantitas: item.kuantitas,
        },
      ]);

      // 4. Update stok produk di tabel 'produk'
      await conn.query(
        "UPDATE produk SET stok = stok + ? WHERE id_produk = ?",
        [item.kuantitas, item.id_produk]
      );

      // 5. Tambahkan kuantitas ke total_produk_count
      total_produk_count += item.kuantitas;
    }

    // 6. Update total_produk di tabel 'restock'
    await conn.query(
      "UPDATE restock SET total_produk = ? WHERE id_restock = ?",
      [total_produk_count, id_restock]
    );

    await conn.commit();
    res.status(201).json({
      // Menggunakan status 201 untuk "Created"
      message: "Berhasil menambahkan restock",
      data: { id_restock, total_produk: total_produk_count },
    });
  } catch (error) {
    await conn.rollback();
    console.error("Error di tambahRestock:", error);
    res
      .status(500)
      .json({ message: "Gagal menambahkan restock", error: error.message });
  } finally {
    conn.release();
  }
};

exports.getAllRestock = async (req, res) => {
  const conn = await db.getConnection(); // Tambahkan koneksi
  try {
    const [restocks] = await conn.query(` // Ganti db.query menjadi conn.query
      SELECT r.*, s.id_supplier, s.nama_supplier
      FROM restock r
      LEFT JOIN supplier s ON r.id_supplier = s.id_supplier // Gunakan LEFT JOIN untuk mencegah error jika id_supplier null
      ORDER BY r.tanggal_restock DESC
    `);

    if (restocks.length === 0) {
      return res.status(404).json({ message: "Data restock tidak ditemukan" });
    }

    // ambil semua detail
    const [details] = await conn.query(` // Ganti db.query menjadi conn.query
      SELECT dr.*, p.nama_produk, p.id_produk, dr.id_restock
      FROM detail_restock dr
      JOIN produk p ON dr.id_produk = p.id_produk
    `);

    // group detail berdasarkan id_restock
    const hasil = restocks.map((restock) => {
      return {
        ...restock,
        detail: details.filter((d) => d.id_restock === restock.id_restock),
      };
    });

    res.json({ message: "Berhasil mengambil data restock", data: hasil });
  } catch (error) {
    console.error("Error di getAllRestock:", error); // Tambahkan log error
    res.status(500).json({ message: "Server Error", error: error.message });
  } finally {
    conn.release(); // Pastikan koneksi dilepas
  }
};

exports.getRestockById = async (req, res) => {
  const { id } = req.params;
  const conn = await db.getConnection(); // Tambahkan koneksi
  try {
    const [result] = await conn.query(
      // Ganti db.query menjadi conn.query
      `
      SELECT r.*, s.id_supplier, s.nama_supplier
      FROM restock r
      LEFT JOIN supplier s ON r.id_supplier = s.id_supplier // Gunakan LEFT JOIN
      WHERE r.id_restock = ?
    `,
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: "Restock tidak ditemukan" });
    }

    const [detail] = await conn.query(
      // Ganti db.query menjadi conn.query
      `
      SELECT dr.*, p.nama_produk, p.id_produk
      FROM detail_restock dr
      JOIN produk p ON dr.id_produk = p.id_produk
      WHERE dr.id_restock = ?
    `,
      [id]
    );

    const hasil = {
      ...result[0],
      detail,
    };

    res.json({ message: "Berhasil mengambil data restock", data: hasil });
  } catch (error) {
    console.error("Error di getRestockById:", error); // Tambahkan log error
    res.status(500).json({ message: "Server error", error: error.message });
  } finally {
    conn.release(); // Pastikan koneksi dilepas
  }
};

exports.editRestock = async (req, res) => {
  const { id } = req.params;
  const { id_supplier, produkBaru } = req.body;
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Cek apakah restock dengan ID tersebut ada sebelum melakukan operasi
    const [cekRestock] = await conn.query(
      "SELECT id_restock FROM restock WHERE id_restock = ?",
      [id]
    );
    if (cekRestock.length === 0) {
      throw new Error("Data restock tidak ditemukan.");
    }

    // 2. Ambil data detail restock lama
    const [oldDetails] = await conn.query(
      "SELECT * FROM detail_restock WHERE id_restock = ?",
      [id]
    );

    if (oldDetails.length === 0) {
      // Jika tidak ada detail lama, langsung proses produk baru
      await conn.query("DELETE FROM detail_restock WHERE id_restock = ?", [id]);
    } else {
      // 3. Kembalikan stok produk berdasarkan data lama
      for (const item of oldDetails) {
        await conn.query(
          "UPDATE produk SET stok = stok - ? WHERE id_produk = ?",
          [item.kuantitas, item.id_produk]
        );
      }
      // 4. Hapus semua detail restock lama
      await conn.query("DELETE FROM detail_restock WHERE id_restock = ?", [id]);
    }

    // 5. Hitung total produk baru
    let total_produk_baru = 0;
    for (const item of produkBaru) {
      total_produk_baru += item.kuantitas;
    }

    // 6. Perbarui data induk restock
    await conn.query(
      "UPDATE restock SET id_supplier = ?, total_produk = ? WHERE id_restock = ?",
      [id_supplier, total_produk_baru, id]
    );

    // 7. Masukkan detail restock yang baru dan tambahkan stok produk
    for (const item of produkBaru) {
      // Cek apakah produk ada di database
      const [produkDb] = await conn.query(
        "SELECT id_produk FROM produk WHERE id_produk = ?",
        [item.id_produk]
      );
      if (produkDb.length === 0) {
        throw new Error(`Produk dengan ID ${item.id_produk} tidak ditemukan.`);
      }

      // Masukkan data ke detail_restock
      await conn.query(
        "INSERT INTO detail_restock (id_restock, id_produk, kuantitas) VALUES (?, ?, ?)",
        [id, item.id_produk, item.kuantitas]
      );

      // Tambahkan stok produk
      await conn.query(
        "UPDATE produk SET stok = stok + ? WHERE id_produk = ?",
        [item.kuantitas, item.id_produk]
      );
    }

    await conn.commit();
    res.json({
      message: "Data restock berhasil diubah.",
      data: {
        id,
        id_supplier,
        total_produk: total_produk_baru,
        details: produkBaru,
      },
    });
  } catch (error) {
    await conn.rollback();
    console.error("Gagal mengedit restock:", error);
    res
      .status(500)
      .json({ message: "Gagal mengedit restock", error: error.message });
  } finally {
    conn.release();
  }
};
