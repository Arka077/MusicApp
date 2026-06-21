const axios = require("axios");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

const mlService = {
  // Called after artist uploads — fire and forget
  indexSong: async (musicId, audioUrl) => {
    await axios.post(`${ML_SERVICE_URL}/index`, {
      music_id: musicId,
      audio_url: audioUrl,
    });
  },

  // Called when user searches
  search: async (query, topK = 10) => {
    const response = await axios.post(`${ML_SERVICE_URL}/search`, {
      query,
      top_k: topK,
    });
    return response.data.results; // [{music_id, score}, ...]
  },
};

module.exports = mlService;
