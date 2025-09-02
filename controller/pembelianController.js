const db = require("../config/db");

exports.tambahPembelian = async (req, res) => {
  const {
    id_customer,
    metode_pembayaran,
    status_pembayaran,
    jumblah_bayar,
    produk,
  } = req.body;
  const id_kasir = req.user.id_user;
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    let total_harga = 0;
    let produkDetail = [];

    for (const item of produk) {
      const [produkDB] = await conn.query(
        "SELECT * FROM produk WHERE id_produk = ?",
        [item.id_produk]
      );

      if (produkDB.length === 0) {
        throw new Error(`Produk dengan id ${item.id_produk} tidak ditemukan`);
      }

      if (produkDB[0].stok < item.qty) {
        throw new Error(`Stok produk ${produkDB[0].nama_produk} tidak cukup`);
      }
      const harga_satuan = produkDB[0].harga_jual;
      const subtotal = harga_satuan * item.qty;
      total_harga += subtotal;

      produkDetail.push({
        id_produk: item.id_produk,
        nama_produk: produkDB[0].nama_produk,
        harga_satuan,
        qty: item.qty,
        subtotal,
      });
    }

    let sisa_tagihan = 0;
    if (status_pembayaran === "lunas") {
      sisa_tagihan = 0;
    } else if (status_pembayaran === "hutang") {
      sisa_tagihan = total_harga;
    } else if (status_pembayaran === "dp") {
      sisa_tagihan = total_harga - jumblah_bayar;
    } else {
      throw new Error("Status pembayaran tidak valid");
    }

    const [result] = await conn.query("INSERT INTO pembelian SET ?", {
      id_kasir,
      id_customer: id_customer || null,
      metode_pembayaran,
      status_pembayaran,
      jumblah_bayar,
      sisa_tagihan,
      total_harga,
    });

    const id_pembelian = result.insertId;

    for (let item of produkDetail) {
      await conn.query(
        `INSERT INTO detail_pembelian 
        (id_pembelian, id_produk, harga_satuan, qty, subtotal) 
        VALUES (?, ?, ?, ?, ?)`,
        [
          id_pembelian,
          item.id_produk,
          item.harga_satuan,
          item.qty,
          item.subtotal,
        ]
      );

      await conn.query(
        "UPDATE produk SET stok = stok - ? WHERE id_produk = ?",
        [item.qty, item.id_produk]
      );
    }

    await conn.commit();
    res.json({
      message: "Transaksi Berhasil",
      id_pembelian,
      kasir: id_kasir,
      total_harga,
      produk: produkDetail,
    });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ message: "Transaksi Gagal", error: error.message });
  } finally {
    conn.release();
  }
};

exports.editPembelian = async (req, res) => {
  const { id } = req.params;
  const {
    id_customer,
    metode_pembayaran,
    status_pembayaran,
    jumblah_bayar,
    produk,
  } = req.body;
  const id_kasir = req.user.id_user; // dari JWT login

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Ambil data pembelian lama
    const [oldPembelian] = await conn.query(
      "SELECT * FROM pembelian WHERE id_pembelian = ?",
      [id]
    );
    if (oldPembelian.length === 0) {
      throw new Error("Data Pembelian Tidak Ditemukan");
    }

    // 2. Rollback stok lama
    const [oldDetail] = await conn.query(
      "SELECT id_produk, qty FROM detail_pembelian WHERE id_pembelian = ?",
      [id]
    );

    for (let item of oldDetail) {
      await conn.query(
        "UPDATE produk SET stok = stok + ? WHERE id_produk = ?",
        [item.qty, item.id_produk]
      );
    }

    // 3. Hapus detail lama
    await conn.query("DELETE FROM detail_pembelian WHERE id_pembelian = ?", [
      id,
    ]);

    // 4. Hitung ulang total harga dan buat detail baru
    let total_harga = 0;
    let produkDetail = [];

    for (const item of produk) {
      const [produkDB] = await conn.query(
        "SELECT * FROM produk WHERE id_produk = ?",
        [item.id_produk]
      );

      if (produkDB.length === 0) {
        throw new Error(`Produk dengan id ${item.id_produk} tidak ditemukan`);
      }

      if (produkDB[0].stok < item.qty) {
        throw new Error(`Stok produk ${produkDB[0].nama_produk} tidak cukup`);
      }

      const harga_satuan = produkDB[0].harga_jual;
      const subtotal = harga_satuan * item.qty;
      total_harga += subtotal;

      produkDetail.push({
        id_produk: item.id_produk,
        harga_satuan,
        qty: item.qty,
        subtotal,
      });
    }

    // 5. Hitung sisa tagihan
    let sisa_tagihan = 0;
    if (status_pembayaran === "lunas") {
      sisa_tagihan = 0;
    } else if (status_pembayaran === "hutang") {
      sisa_tagihan = total_harga;
    } else if (status_pembayaran === "dp") {
      sisa_tagihan = total_harga - jumblah_bayar;
    } else {
      throw new Error("Status pembayaran tidak valid");
    }

    // 6. Update data pembelian
    await conn.query("UPDATE pembelian SET ? WHERE id_pembelian = ?", [
      {
        id_kasir,
        id_customer: id_customer || null,
        metode_pembayaran,
        status_pembayaran,
        jumblah_bayar,
        sisa_tagihan,
        total_harga,
      },
      id,
    ]);

    // 7. Insert detail baru & kurangi stok
    for (let item of produkDetail) {
      await conn.query(
        `INSERT INTO detail_pembelian 
        (id_pembelian, id_produk, harga_satuan, qty, subtotal) 
        VALUES (?, ?, ?, ?, ?)`,
        [id, item.id_produk, item.harga_satuan, item.qty, item.subtotal]
      );

      await conn.query(
        "UPDATE produk SET stok = stok - ? WHERE id_produk = ?",
        [item.qty, item.id_produk]
      );
    }

    await conn.commit();
    res.json({
      message: "Transaksi Berhasil Diedit",
      id_pembelian: id,
      kasir: id_kasir,
      total_harga,
      produk: produkDetail,
    });
  } catch (error) {
    await conn.rollback();
    console.error("Pembelian Gagal", error);
    res.status(500).json({ message: "Error", error: error.message });
  } finally {
    await conn.release();
  }
};

exports.getAllPembelian = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const [result] = await conn.query(
      `SELECT p.*, u.username AS kasir, c.nama AS customer 
      FROM pembelian p 
      LEFT JOIN users u ON p.id_kasir = u.id_user 
      LEFT JOIN customers c ON p.id_customer = c.id_customer
      ORDER BY p.tanggal_pembelian DESC` // Tambahkan order by agar data lebih rapi
    );
    if (result.length === 0) {
      return res
        .status(404)
        .json({ message: "Data Pembelian Tidak Ditemukan" });
    }

    const [details] = await conn.query(
      `SELECT dp.*, p.nama_produk 
      FROM detail_pembelian dp 
      JOIN produk p ON dp.id_produk = p.id_produk`
    );

    // Kumpulkan detail ke setiap pembelian
    const hasil = result.map((pembelian) => {
      return {
        ...pembelian,
        detail: details.filter(
          (d) => d.id_pembelian === pembelian.id_pembelian
        ),
      };
    });

    res.json({ message: "Data Pembelian Ditemukan", data: hasil });
  } catch (error) {
    console.error("Error fetching all purchases:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  } finally {
    conn.release();
  }
};

exports.getPembelianById = async (req, res) => {
  const { id } = req.params;
  const conn = await db.getConnection();
  try {
    const [result] = await conn.query(
      `SELECT p.*, u.username AS kasir, c.nama AS customer 
      FROM pembelian p 
      LEFT JOIN users u ON p.id_kasir = u.id_user 
      LEFT JOIN customers c ON p.id_customer = c.id_customer 
      WHERE p.id_pembelian = ?`,
      [id]
    );
    if (result.length === 0) {
      return res
        .status(404)
        .json({ message: "Data Pembelian Tidak Ditemukan" });
    }

    const [details] = await conn.query(
      `SELECT dp.*, p.nama_produk 
      FROM detail_pembelian dp 
      JOIN produk p ON dp.id_produk = p.id_produk 
      WHERE dp.id_pembelian = ?`,
      [id]
    );

    res.json({
      message: "Data Pembelian Ditemukan",
      data: {
        ...result[0], // Ambil satu objek
        detail: details, // Langsung tambahkan detail
      },
    });
  } catch (error) {
    console.error("Error fetching purchase by ID:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  } finally {
    conn.release();
  }
};
