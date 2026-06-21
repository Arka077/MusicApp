const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: {
    rejectUnauthorized: false,
  },

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function testConnection() {
  try {
    console.log("Testing database connection...");
    console.log("DB_HOST:", process.env.DB_HOST);
    console.log("DB_PORT:", process.env.DB_PORT);
    console.log("DB_NAME:", process.env.DB_NAME);
    console.log("DB_USER:", process.env.DB_USER);

    const connection = await pool.getConnection();

    console.log("Database connection established successfully.");

    const [rows] = await connection.query(
      "SELECT DATABASE() AS db, VERSION() AS version"
    );

    console.log("Connected to:", rows[0]);

    connection.release();
  } catch (error) {
    console.error("Error connecting to the database:");
    console.error(error);
  }
}

testConnection();

module.exports = pool;
