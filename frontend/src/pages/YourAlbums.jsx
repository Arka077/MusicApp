import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/api";
import "../styles/Playlists.css";

export const YourAlbums = () => {
  const [albums, setAlbums] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    apiClient
      .get("/music/my-albums")
      .then((res) => setAlbums(res.data.albums || []))
      .catch((err) => console.error("Failed to fetch artist albums", err));
  }, []);

  return (
    <div className="playlists-page">
      <div className="playlists-header">
        <div>
          <h2>Your Albums</h2>
          <p style={{ color: "#b3b3b3", marginTop: "4px" }}>
            Manage your catalog collections and musical frameworks.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/artist/albums/new")}
        >
          + Create Album
        </button>
      </div>

      {albums.length === 0 ? (
        <div
          className="playlists-empty"
          style={{ textAlign: "center", width: "100%", padding: "40px 0" }}
        >
          <p style={{ color: "#666", fontStyle: "italic" }}>
            You haven't compiled any albums yet.
          </p>
        </div>
      ) : (
        <div className="playlists-grid">
          {albums.map((album) => (
            <div
              key={album.album_id}
              className="playlist-item-card"
              onClick={() => navigate(`/artist/albums/${album.album_id}`, { state: { fromAlbumsPage: true } })}
              style={{
                background: "#1e1e2e",
                padding: "16px",
                borderRadius: "8px",
                border: "1px solid #333",
                cursor: "pointer",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.02)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              {album.cover_url ? (
                <img
                  src={album.cover_url}
                  alt={album.title}
                  className="playlist-item-card-image"
                  style={{
                    width: "100%",
                    aspectRatio: "1/1",
                    objectFit: "cover",
                    borderRadius: "6px",
                  }}
                />
              ) : (
                <div
                  className="card-image-fallback"
                  style={{
                    width: "100%",
                    aspectRatio: "1/1",
                    background:
                      "linear-gradient(135deg, #3a1c5c 0%, #1a102f 100%)",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#a78bfa",
                  }}
                >
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5z" />
                  </svg>
                </div>
              )}
              <h4
                style={{
                  marginTop: "12px",
                  marginBottom: "4px",
                  color: "#fff",
                }}
              >
                {album.title}
              </h4>
              <span style={{ fontSize: "12px", color: "#777" }}>
                Album Collection
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
