const db = require("../db/db");

/**
 * Creates a new album entry
 */
async function create({ title, cover_url, artist_id }) {
  const query =
    "INSERT INTO albums (title, cover_url, artist_id) VALUES (?, ?, ?)";
  const [result] = await db.execute(query, [
    title,
    cover_url || null,
    artist_id,
  ]);

  return {
    album_id: result.insertId,
    title,
    cover_url: cover_url || null,
    artist_id,
  };
}

/**
 * Fetches all albums, sorted chronologically
 */
async function findAll() {
  const query = "SELECT * FROM albums ORDER BY created_at DESC";
  const [rows] = await db.execute(query);
  return rows;
}

/**
 * Fetches an individual album by its primary ID key
 */
async function findById(id) {
  const query = "SELECT * FROM albums WHERE album_id = ? LIMIT 1";
  const [rows] = await db.execute(query, [id]);
  return rows[0] || null;
}

/**
 * Fetches all albums belonging to a specific artist
 */
async function findByArtistId(artistId) {
  const query =
    "SELECT * FROM albums WHERE artist_id = ? ORDER BY created_at DESC";
  const [rows] = await db.execute(query, [artistId]);
  return rows;
}

/**
 * Look up if an album title already exists for an artist (Prevents duplicates during auto-upload)
 */
async function findByTitleAndArtist(title, artist_id) {
  const query =
    "SELECT * FROM albums WHERE title = ? AND artist_id = ? LIMIT 1";
  const [rows] = await db.execute(query, [title, artist_id]);
  return rows[0] || null;
}

/**
 * Updates album text titles or image details
 */
async function update(id, { title, cover_url }) {
  const query = "UPDATE albums SET title = ?, cover_url = ? WHERE album_id = ?";
  const [result] = await db.execute(query, [title, cover_url || null, id]);
  return result.affectedRows > 0;
}

/**
 * Permanently removes an album container structure
 */
async function remove(id) {
  const query = "DELETE FROM albums WHERE album_id = ?";
  const [result] = await db.execute(query, [id]);
  return result.affectedRows > 0;
}

/**
 * Gathers all song rows tied to a single album id
 */
async function getAlbumSongs(albumId) {
  const query = `
    SELECT music_id, title, uri, cover_url, artist_id, album_id, created_at
    FROM music
    WHERE album_id = ?
    ORDER BY created_at ASC
  `;
  const [rows] = await db.execute(query, [albumId]);
  return rows;
}

module.exports = {
  create,
  findAll,
  findById,
  findByArtistId,
  findByTitleAndArtist,
  update,
  remove,
  getAlbumSongs,
};
