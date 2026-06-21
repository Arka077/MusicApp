import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/api";
import "../styles/Playlists.css";

export const ArtistCreateAlbum = () => {
  const [title, setTitle] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [unassignedSongs, setUnassignedSongs] = useState([]);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    apiClient
      .get("/music/unassigned-songs")
      .then((res) => setUnassignedSongs(res.data.songs || []))
      .catch((err) => console.error(err));
  }, []);

  const handleToggleSong = (musicId) => {
    setSelectedSongs((prev) =>
      prev.includes(musicId)
        ? prev.filter((id) => id !== musicId)
        : [...prev, musicId],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title)
      return alert("Album title is required.");

    const formData = new FormData();
    formData.append("title", title);
    if (coverFile) {
      formData.append("file", coverFile);
    }
    formData.append("music_ids", JSON.stringify(selectedSongs));

    try {
      setLoading(true);
      await apiClient.post("/music/album/create", formData);

      alert(`Album "${title}" built successfully!`);

      navigate("/artist/albums");
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to package album structure.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="playlist-container">
      <h2>Compile Custom Album</h2>
      <p style={{ color: "#999", marginBottom: "20px" }}>
        Group your unassigned standalone singles into a unified album catalog
        entry.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          maxWidth: "500px",
        }}
      >
        <input
          type="text"
          placeholder="Album Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="dropdown-item"
          style={{ border: "1px solid #444", background: "#1e1e2e" }}
        />

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontSize: "13px",
              color: "#bbb",
            }}
          >
            Album Art Cover Image (Optional):
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files[0])}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "10px",
              fontWeight: "600",
            }}
          >
            Select Available Tracks (Songs can belong to only one album):
          </label>
          {unassignedSongs.length === 0 ? (
            <p style={{ color: "#666", fontStyle: "italic", fontSize: "14px" }}>
              No single tracks currently available to assign.
            </p>
          ) : (
            <div
              style={{
                background: "#1e1e2e",
                borderRadius: "6px",
                padding: "10px",
                maxHeight: "200px",
                overflowY: "auto",
                border: "1px solid #333",
              }}
            >
              {unassignedSongs.map((song) => (
                <label
                  key={song.music_id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedSongs.includes(song.music_id)}
                    onChange={() => handleToggleSong(song.music_id)}
                  />
                  <span>{song.title}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading
            ? "Compiling..."
            : `Assemble Album (${selectedSongs.length} Songs)`}
        </button>
      </form>
    </div>
  );
};
