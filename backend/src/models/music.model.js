const db = require("../db/db");

async function create({ uri, title, cover_url, artist_id, album_id = null }) {
  const [result] = await db.query(
    `INSERT INTO music
     (uri, title, cover_url, artist_id, album_id)
     VALUES (?, ?, ?, ?, ?)`,
    [uri, title, cover_url, artist_id, album_id],
  );

  return {
    music_id: result.insertId,
    uri,
    title,
    cover_url,
    artist_id,
    album_id,
  };
}

async function findAll(limit = 30) {
  const [rows] = await db.query(
    `
    SELECT music_id, uri, title, cover_url, artist_id, album_id, created_at
      FROM music
    ORDER BY RAND()
    LIMIT ?
    `,
    [limit],
  );

  return rows;
}
async function findById(id) {
  const [rows] = await db.query(
    "SELECT music_id, uri, title, cover_url, artist_id, album_id, created_at FROM music WHERE music_id = ? LIMIT 1",
    [id],
  );

  return rows[0] || null;
}

async function findByArtistId(artistId) {
  const [rows] = await db.query(
    "SELECT music_id, uri, title, cover_url, artist_id, album_id, created_at FROM music WHERE artist_id = ? ORDER BY created_at DESC",
    [artistId],
  );

  return rows;
}

async function update(
  id,
  { uri, title, cover_url, artist_id, album_id = null },
) {
  const [result] = await db.query(
    "UPDATE music SET uri = ?, title = ?, cover_url = ?, artist_id = ?, album_id = ? WHERE music_id = ?",
    [uri, title, cover_url, artist_id, album_id, id],
  );

  return result.affectedRows > 0;
}

async function remove(id) {
  const [result] = await db.query("DELETE FROM music WHERE music_id = ?", [id]);

  return result.affectedRows > 0;
}
async function assignToAlbum(albumId, musicIds) {
  const placeholders = musicIds.map(() => "?").join(",");

  const [result] = await db.query(
    `UPDATE music
     SET album_id = ?
     WHERE music_id IN (${placeholders})`,
    [albumId, ...musicIds],
  );

  return result;
}

async function findByIds(musicIds) {
  if (!musicIds.length) {
    return [];
  }

  const placeholders = musicIds.map(() => "?").join(",");

  const [rows] = await db.query(
    `SELECT music_id
     FROM music
     WHERE music_id IN (${placeholders})`,
    musicIds,
  );

  return rows;
}

async function findLatest(limit = 10) {
  const [rows] = await db.query(
    `
    SELECT
      music_id,
      uri,
      title,
      cover_url,
      artist_id,
      album_id,
      created_at
    FROM music
    ORDER BY created_at DESC
    LIMIT ?
    `,
    [limit],
  );

  return rows;
}

async function removeSongFromAlbum(music_id) {
  const [result] = await db.query(
    "UPDATE music SET album_id = NULL WHERE music_id = ?",
    [music_id],
  );

  return result.affectedRows > 0;
}

module.exports = {
  create,
  findAll,
  findById,
  findByArtistId,
  update,
  remove,
  assignToAlbum,
  findByIds,
  findLatest,
  removeSongFromAlbum,
};
