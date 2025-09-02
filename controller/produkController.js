const db = require("../config/db");
const fs = require("fs");
const path = require("path");

exports.tambahProduk = async (req, res) => {
  const {
    nama_produk,
    modal_awal,
    harga_jual,
    stok,
    id_kategori,
    id_supplier,
  } = req.body;
  const gambar_produk = req.file ? req.file.filename : null;
  const conn = await db.getConnection();

  try {
    const [result] = await conn.query("INSERT INTO produk SET ?", [
      {
        nama_produk,
        modal_awal,
        harga_jual,
        stok,
        id_kategori,
        id_supplier,
        gambar_produk,
      },
    ]);

    if (result.affectedRows === 0) {
      return res.status(500).json({ message: "Gagal menambahkan produk" });
    }

    res.json({ message: "Berhasil menambahkan produk", data: result });
  } catch (error) {
    console.error("Gagal menambahkan produk:", error);
    res
      .status(500)
      .json({ message: "Gagal menambahkan produk", error: error.message });
  } finally {
    conn.release();
  }
};

exports.getAllProduk = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const [result] = await conn.query(
      `SELECT p.* , k.nama_kategori ,s.nama_supplier
      FROM produk p 
      LEFT JOIN kategori k ON p.id_kategori = k.id_kategori
      LEFT JOIN supplier s ON p.id_supplier = s.id_supplier
      `
    );
    if (result.length === 0) {
      return res.status(404).json({ message: "Tidak ada data" });
    }
    const dataWithGambarUrl = result.map((item) => {
      return {
        ...item,
        gambar_produk: item.gambar_produk
          ? `${req.protocol}://${req.get("host")}/uploads/produk/${
              item.gambar_produk
            }`
          : null,
      };
    });

    res.json({
      message: "Berhasil mengambil data",
      data: dataWithGambarUrl,
    });
  } catch (error) {
    console.error("Gagal mengambil data produk:", error);
    res
      .status(500)
      .json({ message: "Gagal mengambil data", error: error.message });
  } finally {
    conn.release();
  }
};

exports.getProdukById = async (req, res) => {
  const { id } = req.params;
  const conn = await db.getConnection();
  try {
    const [result] = await conn.query(
      `SELECT p.*, k.nama_kategori , s.nama_supplier
        FROM produk p 
        LEFT JOIN kategori k ON p.id_kategori = k.id_kategori 
        LEFT JOIN supplier s ON p.id_supplier = s.id_supplier 
        WHERE p.id_produk = ?`,
      [id]
    );
    if (result.length === 0) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }
    const dataWithGambarUrl = {
      ...result[0],
      gambar_produk: result[0].gambar_produk
        ? `${req.protocol}://${req.get("host")}/uploads/produk/${
            result[0].gambar_produk
          }`
        : null,
    };
    res.json({
      message: "Berhasil mengambil data",
      data: dataWithGambarUrl,
    });
  } catch (error) {
    console.error("Gagal mengambil data produk:", error);
    res
      .status(500)
      .json({ message: "Gagal mengambil data produk", error: error.message });
  } finally {
    conn.release();
  }
};

exports.editProduk = async (req, res) => {
  const { id } = req.params;
  const {
    nama_produk,
    modal_awal,
    harga_jual,
    stok,
    id_kategori,
    id_supplier,
  } = req.body;
  const conn = await db.getConnection();

  try {
    let produkBaru = {
      nama_produk,
      modal_awal,
      harga_jual,
      stok,
      id_kategori,
      id_supplier,
    };

    if (req.file) {
      // Ambil nama file lama sebelum update
      const [produkLama] = await conn.query(
        "SELECT gambar_produk FROM produk WHERE id_produk = ?",
        [id]
      );
      if (produkLama.length > 0 && produkLama[0].gambar_produk) {
        const oldPath = path.join(
          __dirname,
          "../uploads/produk",
          produkLama[0].gambar_produk
        );
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      produkBaru.gambar_produk = req.file.filename;
    }

    const [result] = await conn.query(
      `UPDATE produk SET ? WHERE id_produk = ?`,
      [produkBaru, id]
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({
          message: "Produk tidak ditemukan atau tidak ada perubahan data",
        });
    }
    res.json({ message: "Berhasil mengubah data", data: result });
  } catch (error) {
    console.error("Gagal mengubah data produk:", error);
    res
      .status(500)
      .json({ message: "Gagal mengubah data produk", error: error.message });
  } finally {
    conn.release();
  }
};

exports.hapusProduk = async (req, res) => {
  const { id } = req.params;
  const conn = await db.getConnection();
  try {
    // Ambil nama file gambar sebelum dihapus
    const [produkLama] = await conn.query(
      "SELECT gambar_produk FROM produk WHERE id_produk = ?",
      [id]
    );

    const [result] = await conn.query(
      `DELETE FROM produk WHERE id_produk = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    // Hapus gambar setelah data di database berhasil dihapus
    if (produkLama.length > 0 && produkLama[0].gambar_produk) {
      const oldPath = path.join(
        __dirname,
        "../uploads/produk",
        produkLama[0].gambar_produk
      );
      try {
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
          console.log("Gambar produk berhasil dihapus");
        } else console.log("Gambar produk tidak ada");
      } catch (error) {
        console.error("Gagal hapus gambar Produk", error.message);
      }
    }

    res.json({ message: "Berhasil menghapus produk", data: result });
  } catch (error) {
    console.error("Gagal menghapus produk:", error);
    res
      .status(500)
      .json({ message: "Gagal menghapus produk", error: error.message });
  } finally {
    conn.release();
  }
};
