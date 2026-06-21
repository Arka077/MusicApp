import React, { useState, useEffect } from "react";
import apiClient from "../services/api";
import { useMusic } from "../hooks/useMusic";
import { musicService } from "../services/musicService";
import "../styles/Playlists.css";

export const YourSongs = () => {
  const [songs, setSongs] = useState([]);
  const { play } = useMusic();
  const [searchQuery, setSearchQuery] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCoverFile, setEditCoverFile] = useState(null);
  const [editError, setEditError] = useState("");
  const [updating, setUpdating] = useState(false);

  const openEditModal = (song) => {
    setEditingSong(song);
    setEditTitle(song.title);
    setEditCoverFile(null);
    setEditError("");
    setIsEditModalOpen(true);
  };

  const handleSaveSongDetails = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      setEditError("Title is required");
      return;
    }
    try {
      setUpdating(true);
      setEditError("");

      const formData = new FormData();
      formData.append("title", editTitle.trim());
      if (editCoverFile) {
        formData.append("cover", editCoverFile);
      }

      const updatedSong = await musicService.updateMusic(editingSong.music_id, formData);
      setSongs(
        songs.map((s) =>
          s.music_id === editingSong.music_id
            ? { ...s, title: updatedSong.title, cover_url: updatedSong.cover_url }
            : s
        )
      );
      setIsEditModalOpen(false);
      setEditingSong(null);
      setEditCoverFile(null);
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update song details");
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    apiClient
      .get("/music/my-songs")
      .then((res) => setSongs(res.data.songs || []))
      .catch((err) => console.error(err));
  }, []);

  const handleRemoveFromAlbum = async (musicId) => {
    if (
      !window.confirm(
        "Are you sure you want to remove this song from its album? It will become a standalone single."
      )
    ) {
      return;
    }
    try {
      await musicService.removeSongFromAlbum(musicId);
      setSongs(
        songs.map((s) =>
          s.music_id === musicId
            ? { ...s, album_id: null, album_name: null }
            : s
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove song from album");
      console.error(err);
    }
  };

  const handleDeleteSong = async (musicId) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this song from the platform? This cannot be undone."
      )
    ) {
      return;
    }
    try {
      await musicService.deleteMusic(musicId);
      setSongs(songs.filter((s) => s.music_id !== musicId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete song");
      console.error(err);
    }
  };

  const filteredSongs = songs.filter(
    (song) =>
      song.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.album_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="playlist-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2>Your Uploaded Songs</h2>
          <p style={{ color: "#b3b3b3", marginTop: "4px" }}>
            A complete history of your published audio profiles across the platform.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search your songs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: "1px solid #333",
              background: "#1e1e2e",
              color: "#fff",
              fontSize: "14px",
              width: "240px"
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="btn btn-secondary"
              style={{ borderRadius: "20px", padding: "8px 16px" }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="track-list-table">
        <div className="table-header-row">
          <span>#</span>
          <span>Title</span>
          <span>Album Status</span>
          <span>Actions</span>
        </div>
        {filteredSongs.map((song, i) => (
          <div key={song.music_id} className="track-row">
            <span className="track-index">{i + 1}</span>
            <div>
              <span className="track-title-text">{song.title}</span>
            </div>
            <span
              style={{
                color: song.album_name ? "#667eea" : "#aaa",
                fontSize: "13px",
                fontWeight: song.album_name ? "500" : "normal",
              }}
            >
              {song.album_name
                ? `In Album: ${song.album_name}`
                : "Standalone Single"}
            </span>
            <div className="track-actions">
              <button
                className="control-btn play-btn-inline"
                onClick={() =>
                  play(
                    { ...song, url: song.uri, artist: "You" },
                    songs.map((s) => ({ ...s, url: s.uri, artist: "You" })),
                    i
                  )
                }
                title="Play Song"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>

              <button
                className="delete-btn-inline"
                onClick={() => openEditModal(song)}
                title="Edit Song Details"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#a78bfa",
                  cursor: "pointer",
                  padding: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "4px",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(167, 139, 250, 0.1)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </button>

              {song.album_id && (
                <button
                  className="delete-btn-inline"
                  onClick={() => handleRemoveFromAlbum(song.music_id)}
                  title="Remove from Album"
                  style={{ padding: "6px" }}
                >
                  {/* Unlink icon */}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17 7h-4v2h4c1.65 0 3 1.35 3 3s-1.35 3-3 3h-4v2h4c2.76 0 5-2.24 5-5s-2.24-5-5-5zm-6 8H7c-1.65 0-3-1.35-3-3s1.35-3 3-3h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-2zm-3-4h8v2H8z" />
                  </svg>
                </button>
              )}

              <button
                className="delete-btn-inline"
                onClick={() => handleDeleteSong(song.music_id)}
                title="Delete Permanently"
                style={{ padding: "6px" }}
              >
                {/* Trash icon */}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Song Details</h3>
            {editError && (
              <div style={{ color: "#ff453a", marginBottom: "15px", fontSize: "14px" }}>
                {editError}
              </div>
            )}
            <form onSubmit={handleSaveSongDetails} encType="multipart/form-data">
              <div className="modal-form-group">
                <label htmlFor="edit-song-title">Song Title</label>
                <input
                  id="edit-song-title"
                  type="text"
                  className="modal-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Enter song title"
                  required
                />
              </div>
              <div className="modal-form-group" style={{ marginTop: "15px" }}>
                <label htmlFor="edit-song-cover">Song Cover Image (Optional)</label>
                <input
                  id="edit-song-cover"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditCoverFile(e.target.files[0])}
                  style={{ marginTop: "5px" }}
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={updating}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save" disabled={updating}>
                  {updating ? "Saving..." : "Save Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
