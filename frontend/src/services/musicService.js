import apiClient from "./api";

export const musicService = {
  getAllMusic: async (search) => {
    const url = search ? `/music?search=${encodeURIComponent(search)}` : "/music";
    const response = await apiClient.get(url);
    return response.data.musics || response.data || [];
  },

  getMusicById: async (id) => {
    const allMusic = await musicService.getAllMusic();
    return allMusic.find((m) => m.music_id === id);
  },

  searchMusic: async (query) => {
    const allMusic = await musicService.getAllMusic();
    return allMusic.filter(
      (m) =>
        m.title?.toLowerCase().includes(query.toLowerCase()) ||
        m.artist_id?.toLowerCase().includes(query.toLowerCase()),
    );
  },

  getAlbums: async () => {
    const response = await apiClient.get("/music/albums");
    return response.data.albums || response.data || [];
  },

  getAlbumById: async (id) => {
    const response = await apiClient.get(`/music/album/${id}`);
    return response.data.album || response.data;
  },

  uploadMusic: async (formData) => {
    const response = await apiClient.post("/music/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  getLatestMusic: async () => {
    const response = await apiClient.get("/music/latest");
    return response.data.musics;
  },
  deleteMusic: async (id) => {
    const response = await apiClient.delete(`/music/${id}`);
    return response.data;
  },
  removeSongFromAlbum: async (id) => {
    const response = await apiClient.put(`/music/${id}/remove-album`);
    return response.data;
  },
  updateAlbum: async (albumId, albumData) => {
    const isFormData = albumData instanceof FormData;
    const response = await apiClient.put(`/music/album/${albumId}`, albumData, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
    });
    return response.data.album;
  },
  updateMusic: async (musicId, musicData) => {
    const isFormData = musicData instanceof FormData;
    const response = await apiClient.put(`/music/${musicId}`, musicData, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
    });
    return response.data.music;
  },
};
