import apiClient from "./api";

const API_URL = "/playlists";

export const playlistService = {
  getUserPlaylists: async () => {
    const response = await apiClient.get(`${API_URL}/my-playlists`);
    return response.data.playlists;
  },

  createPlaylist: async (playlistData) => {
    const response = await apiClient.post(`${API_URL}/create`, playlistData);
    return response.data.playlist;
  },

  getPlaylistById: async (id) => {
    const response = await apiClient.get(`${API_URL}/${id}`);
    return response.data.playlist;
  },

  addToPlaylist: async (playlistId, musicId) => {
    const response = await apiClient.post(`${API_URL}/add`, {
      playlist_id: playlistId,
      music_id: musicId,
    });
    return response.data;
  },

  removeFromPlaylist: async (playlistId, musicId) => {
    const response = await apiClient.post(`${API_URL}/remove-track`, {
      playlist_id: playlistId,
      music_id: musicId,
    });
    return response.data;
  },

  updatePlaylist: async (playlistId, playlistData) => {
    const response = await apiClient.put(
      `${API_URL}/${playlistId}`,
      playlistData,
    );
    return response.data.playlist;
  },
};
