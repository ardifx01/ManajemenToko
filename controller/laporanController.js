const db = require("../config/db");

// Laporan Penjualan
exports.getLaporanPenjualan = async (req, res) => {
  const { start_date, end_date, periode, range } = req.query;
  const conn = await db.getConnection();

  try {
    let query = `
            SELECT 
                DATE(p.tanggal_pembelian) AS tanggal,
                SUM(p.total_harga) AS total_penjualan,
                COUNT(p.id_pembelian) AS jumlah_transaksi
            FROM pembelian p
            WHERE 1=1
        `;
    const params = [];

    if (start_date && end_date) {
      query += ` AND DATE(p.tanggal_pembelian) BETWEEN ? AND ? `;
      params.push(start_date, end_date);
    } else if (range === "1minggu") {
      query += ` AND p.tanggal_pembelian >= DATE_SUB(NOW(), INTERVAL 7 DAY) `;
    } else if (range === "1bulan") {
      query += ` AND p.tanggal_pembelian >= DATE_SUB(NOW(), INTERVAL 1 MONTH) `;
    } else if (range === "1tahun") {
      query += ` AND p.tanggal_pembelian >= DATE_SUB(NOW(), INTERVAL 1 YEAR) `;
    }

    if (periode) {
      query += ` AND YEAR(p.tanggal_pembelian) = ? `;
      params.push(parseInt(periode));
    }

    query += `
            GROUP BY DATE(p.tanggal_pembelian)
            ORDER BY tanggal ASC
        `;

    const [laporanPenjualan] = await conn.query(query, params);
    res.json({
      message: "Laporan penjualan berhasil diambil",
      data: laporanPenjualan,
    });
  } catch (error) {
    console.error("Gagal mengambil laporan penjualan:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  } finally {
    conn.release();
  }
};

// Laporan Stok
exports.getLaporanStok = async (req, res) => {
  const conn = await db.getConnection();

  try {
    const query = `
            SELECT 
                p.id_produk,
                p.nama_produk,
                p.stok,
                p.harga,
                p.id_supplier,
                s.nama_supplier,
                CASE 
                    WHEN p.stok = 0 THEN 'Habis'
                    WHEN p.stok <= 10 THEN 'Stok Menipis'
                    ELSE 'Stok Aman'
                END AS status_stok
            FROM produk p
            JOIN supplier s ON p.id_supplier = s.id_supplier
            ORDER BY p.stok ASC
        `;

    const [laporanStok] = await conn.query(query);
    res.json({ message: "Laporan stok berhasil diambil", data: laporanStok });
  } catch (error) {
    console.error("Gagal mengambil laporan stok:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  } finally {
    conn.release();
  }
};

// Laporan Produk Terlaris
exports.getLaporanProdukTerlaris = async (req, res) => {
  const { start_date, end_date, periode, range, limit } = req.query;
  const conn = await db.getConnection();
  const maxLimit = limit ? parseInt(limit) : 20;

  try {
    let query = `
            SELECT 
                p.id_produk,
                p.nama_produk,
                SUM(dp.kuantitas) AS total_terjual
            FROM produk p
            JOIN detail_pembelian dp ON p.id_produk = dp.id_produk
            JOIN pembelian pm ON dp.id_pembelian = pm.id_pembelian
            WHERE 1=1
        `;
    const params = [];

    if (start_date && end_date) {
      query += ` AND pm.tanggal_pembelian BETWEEN ? AND ? `;
      params.push(start_date, end_date);
    } else if (range === "1minggu") {
      query += ` AND pm.tanggal_pembelian >= DATE_SUB(NOW(), INTERVAL 7 DAY) `;
    } else if (range === "1bulan") {
      query += ` AND pm.tanggal_pembelian >= DATE_SUB(NOW(), INTERVAL 1 MONTH) `;
    } else if (range === "1tahun") {
      query += ` AND pm.tanggal_pembelian >= DATE_SUB(NOW(), INTERVAL 1 YEAR) `;
    }

    if (periode) {
      query += ` AND YEAR(pm.tanggal_pembelian) = ? `;
      params.push(parseInt(periode));
    }

    query += `
            GROUP BY p.id_produk
            ORDER BY total_terjual DESC
            LIMIT ?
        `;
    params.push(maxLimit);

    const [laporanTerlaris] = await conn.query(query, params);
    res.json({
      message: "Laporan produk terlaris berhasil diambil",
      data: laporanTerlaris,
    });
  } catch (error) {
    console.error("Gagal mengambil laporan produk terlaris:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  } finally {
    conn.release();
  }
};

// Laporan Pergerakan Stok
exports.getPergerakanStok = async (req, res) => {
  const { start_date, end_date, periode, range, group_by } = req.query;
  const conn = await db.getConnection();

  try {
    let query = `
            SELECT
                p.id_produk,
                p.nama_produk,
                COALESCE(SUM(transaksi.stok_masuk), 0) AS total_stok_masuk,
                COALESCE(SUM(transaksi.stok_keluar), 0) AS total_stok_keluar,
                (COALESCE(SUM(transaksi.stok_masuk), 0) - COALESCE(SUM(transaksi.stok_keluar), 0)) AS pergerakan_stok
            FROM produk p
            LEFT JOIN (
                SELECT
                    id_produk,
                    kuantitas AS stok_masuk,
                    0 AS stok_keluar,
                    tanggal_restock AS tanggal
                FROM restock
                UNION ALL
                SELECT
                    dp.id_produk,
                    0 AS stok_masuk,
                    dp.kuantitas AS stok_keluar,
                    pm.tanggal_pembelian AS tanggal
                FROM detail_pembelian dp
                JOIN pembelian pm ON dp.id_pembelian = pm.id_pembelian
            ) AS transaksi ON p.id_produk = transaksi.id_produk
            WHERE 1=1
        `;

    const params = [];

    if (start_date && end_date) {
      query += ` AND transaksi.tanggal BETWEEN ? AND ? `;
      params.push(start_date, end_date);
    } else if (range === "1minggu") {
      query += ` AND transaksi.tanggal >= DATE_SUB(NOW(), INTERVAL 7 DAY) `;
    } else if (range === "1bulan") {
      query += ` AND transaksi.tanggal >= DATE_SUB(NOW(), INTERVAL 1 MONTH) `;
    } else if (range === "1tahun") {
      query += ` AND transaksi.tanggal >= DATE_SUB(NOW(), INTERVAL 1 YEAR) `;
    }

    if (periode) {
      query += ` AND YEAR(transaksi.tanggal) = ? `;
      params.push(parseInt(periode));
    }

    let groupByColumn = `p.id_produk`;
    if (group_by === "hari") {
      groupByColumn += `, DATE(transaksi.tanggal)`;
    } else if (group_by === "bulan") {
      groupByColumn += `, YEAR(transaksi.tanggal), MONTH(transaksi.tanggal)`;
    } else if (group_by === "tahun") {
      groupByColumn += `, YEAR(transaksi.tanggal)`;
    }

    query += ` GROUP BY ${groupByColumn}`;
    query += ` ORDER BY pergerakan_stok ASC`;

    const [laporanPergerakan] = await conn.query(query, params);
    res.json({
      message: "Laporan pergerakan stok berhasil diambil",
      data: laporanPergerakan,
    });
  } catch (error) {
    console.error("Gagal mengambil laporan pergerakan stok:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan server", error: error.message });
  } finally {
    conn.release();
  }
};
