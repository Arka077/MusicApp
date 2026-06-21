const db = require("../db/db");

/**
 * Creates a new playlist row in the database
 */
async function create({ name, description, user_id }) {
  const query = `
    INSERT INTO playlists (name, description, user_id) 
    VALUES (?, ?, ?)
  `;
  const values = [name, description || null, user_id];

  const [result] = await db.execute(query, values);

  return {
    playlist_id: result.insertId,
    name,
    description: description || null,
    user_id,
  };
}

/**
 * Fetches a playlist details by its ID
 */
async function findById(playlist_id) {
  const query = "SELECT * FROM playlists WHERE playlist_id = ?";
  const [rows] = await db.execute(query, [playlist_id]);

  return rows[0] || null;
}

/**
 * Checks the playlist_music junction table to see if a song is already tied to a playlist
 */
async function hasSong(playlist_id, music_id) {
  const query = `
    SELECT 1 FROM playlist_music 
    WHERE playlist_id = ? AND music_id = ? 
    LIMIT 1
  `;
  const [rows] = await db.execute(query, [playlist_id, music_id]);

  return rows.length > 0;
}

/**
 * Inserts a new record into the many-to-many junction table playlist_music
 */
async function addSong(playlist_id, music_id) {
  const query = `
    INSERT INTO playlist_music (playlist_id, music_id) 
    VALUES (?, ?)
  `;
  const [result] = await db.execute(query, [playlist_id, music_id]);

  return result;
}

async function findByUserId(user_id) {
  const query = "SELECT * FROM playlists WHERE user_id = ?";
  const [rows] = await db.execute(query, [user_id]);
  return rows; // Returns an array of playlists
}

/**
 * Fetches playlist information and joins all tracked song objects mapped to it
 */
async function getDetailsWithTracks(playlist_id) {
  // 1. Fetch core playlist information
  const playlistQuery = "SELECT * FROM playlists WHERE playlist_id = ?";
  const [playlistRows] = await db.execute(playlistQuery, [playlist_id]);
  
  if (playlistRows.length === 0) return null;

  const tracksQuery = `
    SELECT m.*, a.title AS album_name FROM music m
    INNER JOIN playlist_music pm ON m.music_id = pm.music_id
    LEFT JOIN albums a ON m.album_id = a.album_id
    WHERE pm.playlist_id = ?
    ORDER BY pm.added_at ASC
  `;
  const [trackRows] = await db.execute(tracksQuery, [playlist_id]);

  return {
    ...playlistRows[0],
    tracks: trackRows, // Attaches songs array directly into object structure
  };
}

async function findLatest(limit = 10) {
  const [rows] = await db.query(
    `
    SELECT *
    FROM music
    ORDER BY created_at DESC
    LIMIT ?
    `,
    [limit],
  );

  return rows;
}

/**
 * Removes a song from the many-to-many junction table playlist_music
 */
async function removeSong(playlist_id, music_id) {
  const query = `
    DELETE FROM playlist_music 
    WHERE playlist_id = ? AND music_id = ?
  `;
  const [result] = await db.execute(query, [playlist_id, music_id]);
  return result;
}

/**
 * Updates a playlist's name and description
 */
async function update(playlist_id, { name, description }) {
  const query = `
    UPDATE playlists 
    SET name = ?, description = ?
    WHERE playlist_id = ?
  `;
  const values = [name, description || null, playlist_id];
  const [result] = await db.execute(query, values);
  return result;
}

module.exports = {
  create,
  findById,
  hasSong,
  addSong,
  removeSong,
  update,
  findByUserId,
  getDetailsWithTracks,
};
