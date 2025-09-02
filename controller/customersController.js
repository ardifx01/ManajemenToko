const db = require("../config/db");

// Fungsi pembantu untuk mendapatkan koneksi
const getConnection = async () => {
  return await db.getConnection();
};

exports.tambahCustomers = async (req, res) => {
  const { nama, email, no_hp, alamat } = req.body;
  const conn = await getConnection();

  try {
    const [result] = await conn.query("INSERT INTO customers SET ?", {
      nama,
      email,
      no_hp,
      alamat,
    });

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "Customer gagal ditambahkan" });
    }
    res.status(201).json({
      message: "Customer berhasil ditambahkan",
      data: { id: result.insertId, nama, email, no_hp, alamat },
    });
  } catch (error) {
    console.error("Error adding customer:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  } finally {
    conn.release();
  }
};

exports.getAllCustomers = async (req, res) => {
  const conn = await getConnection();
  try {
    const [customers] = await conn.query("SELECT * FROM customers");
    if (customers.length === 0) {
      return res.status(404).json({ message: "Data customer tidak ditemukan" });
    }
    res
      .status(200)
      .json({ message: "Data customer berhasil diambil", data: customers });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  } finally {
    conn.release();
  }
};

exports.getCustomersById = async (req, res) => {
  const { id } = req.params;
  const conn = await getConnection();
  try {
    const [customer] = await conn.query(
      "SELECT * FROM customers WHERE id_customer = ?", // Perbaiki nama kolom
      [id]
    );
    if (customer.length === 0) {
      return res.status(404).json({ message: "Customer tidak ditemukan" });
    }
    res
      .status(200)
      .json({ message: "Customer berhasil ditemukan", data: customer[0] });
  } catch (error) {
    console.error("Error fetching customer:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  } finally {
    conn.release();
  }
};

exports.editCustomers = async (req, res) => {
  const { id } = req.params;
  const { nama, email, no_hp, alamat } = req.body;
  const conn = await getConnection();

  try {
    const [result] = await conn.query(
      "UPDATE customers SET ? WHERE id_customer = ?",
      [{ nama, email, no_hp, alamat }, id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({
          message: "Customer tidak ditemukan atau tidak ada perubahan data",
        });
    }
    res.status(200).json({ message: "Data customer berhasil diubah" });
  } catch (error) {
    console.error("Error updating customer:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  } finally {
    conn.release();
  }
};

exports.hapusCustomers = async (req, res) => {
  const { id } = req.params;
  const conn = await getConnection();

  try {
    const [result] = await conn.query(
      "DELETE FROM customers WHERE id_customer = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Customer tidak ditemukan" });
    }
    res.status(200).json({ message: "Customer berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  } finally {
    conn.release();
  }
};
