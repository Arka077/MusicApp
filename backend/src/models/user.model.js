const db = require("../db/db");

async function findOne({ username, email }) {
  const [rows] = await db.query(
    "SELECT user_id, username, email, password, role, profile_photo, created_at FROM users WHERE username = ? OR email = ? LIMIT 1",
    [username, email],
  );

  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await db.query(
    "SELECT user_id, username, email, role, profile_photo, created_at FROM users WHERE user_id = ? LIMIT 1",
    [id],
  );

  return rows[0] || null;
}

async function create({ username, email, password, role = "user" }) {
  const [result] = await db.query(
    "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
    [username, email, password, role],
  );

  return {
    user_id: result.insertId,
    username,
    email,
    password,
    role,
    profile_photo: null,
  };
}

async function update(id, { username, profile_photo }) {
  const [result] = await db.query(
    "UPDATE users SET username = ?, profile_photo = ? WHERE user_id = ?",
    [username, profile_photo, id],
  );

  return result.affectedRows > 0;
}

module.exports = { findOne, findById, create, update };
