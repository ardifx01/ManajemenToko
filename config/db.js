// config/db.js
const mysql = require("mysql2/promise");

const dbConfig = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

dbConfig
  .getConnection()
  .then(() => console.log("Database connection established successfully."))
  .catch((err) => console.error("Database connection failed:", err.message));

module.exports = dbConfig;
