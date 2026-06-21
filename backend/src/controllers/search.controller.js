const mlService = require("../services/ml.service");
const db = require("../db/db");

async function searchMusic(req, res) {
  try {
    const { query, top_k = 10 } = req.body;

    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Query is required" });
    }

    // 1. Get ranked music_ids from ml_service
    const mlResults = await mlService.search(query.trim(), top_k);

    if (!mlResults || mlResults.length === 0) {
      return res.status(200).json({ results: [] });
    }

    // 2. Fetch metadata from MySQL
    const musicIds = mlResults.map((r) => r.music_id);
    const placeholders = musicIds.map(() => "?").join(",");

    const [songs] = await db.execute(
      `SELECT 
                m.music_id,
                m.title,
                m.uri,
                m.cover_url,
                m.album_id,
                u.username AS artist_name
             FROM music m
             JOIN users u ON m.artist_id = u.user_id
             WHERE m.music_id IN (${placeholders})`,
      musicIds,
    );

    // 3. Merge scores and preserve Qdrant ranking order
    const scoreMap = new Map(mlResults.map((r) => [r.music_id, r.score]));
    const songMap = new Map(songs.map((s) => [s.music_id, s]));

    const ordered = musicIds
      .map((id) => {
        const song = songMap.get(id);
        if (!song) return null;
        return {
          ...song,
          similarity_score: scoreMap.get(id),
        };
      })
      .filter(Boolean);

    return res.status(200).json({ results: ordered });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({
      message: "Search failed",
      error: error.message,
    });
  }
}

module.exports = { searchMusic };
