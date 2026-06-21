const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Database connection established successfully.");
    const [rows] = await pool.query("SELECT DATABASE() AS db");
    console.log(rows);
    connection.release();
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}

testConnection();

module.exports = pool;
