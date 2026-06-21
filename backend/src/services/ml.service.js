const axios = require("axios");


const rawUrl = process.env.ML_SERVICE_URL;

const ML_SERVICE_URL = rawUrl.replace(/\/$/, "");

const mlService = {

  indexSong: async (musicId, audioUrl) => {
    await axios.post(`${ML_SERVICE_URL}/api/index`, {
      music_id: musicId,
      audio_url: audioUrl,
    });
  },


  search: async (query, topK = 10) => {
    const response = await axios.post(`${ML_SERVICE_URL}/api/search`, {
      query,
      top_k: topK,
    });
    return response.data.results; 
  },
};

module.exports = mlService;
