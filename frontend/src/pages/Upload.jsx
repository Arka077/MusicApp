import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { musicService } from "../services/musicService";
import { Alert } from "../components/Alert";
import { LoadingSpinner } from "../components/LoadingSpinner";
import "../styles/Upload.css";

export const Upload = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    albumName: "",
  });
  const [file, setFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Enforce Artist Role Validation Access Limits
  if (!user || user.role !== "artist") {
    return (
      <div className="upload-container">
        <div className="upload-box" style={{ textAlign: "center" }}>
          <h2>❌ Access Denied</h2>
          <p>
            Only artists can upload music. Please register as an artist to
            upload.
          </p>
          <p style={{ marginTop: "20px", color: "#999", fontSize: "14px" }}>
            Want to become an artist? Register a new account and select "Artist"
            as your account type.
          </p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith("audio/")) {
      setFile(selectedFile);
      setError("");
    } else {
      setError("Please select a valid audio file");
      setFile(null);
    }
  };

  const handleCoverChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setCoverFile(selectedFile);
      setError("");
    } else {
      setError("Please select a valid cover image");
      setCoverFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    if (!file) {
      setError("Please select an audio file");
      return;
    }

    try {
      setLoading(true);
      const uploadFormData = new FormData();
      uploadFormData.append("title", formData.title.trim());

      if (formData.albumName.trim()) {
        uploadFormData.append("album_name", formData.albumName.trim());
      }

      uploadFormData.append("file", file);
      if (coverFile) {
        uploadFormData.append("cover", coverFile);
      }

      await musicService.uploadMusic(uploadFormData);
      setMessage("Music uploaded successfully!");

      // Redirects to your new Artist Dashboard
      setTimeout(() => navigate("/artist/songs"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="upload-container">
      <div className="upload-box">
        <h2>Upload Music</h2>

        {error && (
          <Alert type="error" message={error} onClose={() => setError("")} />
        )}
        {message && (
          <Alert
            type="success"
            message={message}
            onClose={() => setMessage("")}
          />
        )}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="form-group">
            <label htmlFor="title">Music Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter music title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="albumName">Album Name (Optional)</label>
            <input
              type="text"
              id="albumName"
              name="albumName"
              value={formData.albumName}
              onChange={handleInputChange}
              placeholder="e.g., Midnights (Creates or groups automatically)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="file">Music File *</label>
            <input
              type="file"
              id="file"
              accept="audio/*"
              onChange={handleFileChange}
              required
            />
            {file && <p className="file-info">✓ {file.name}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="cover">Cover Image (Optional)</label>
            <input
              type="file"
              id="cover"
              accept="image/*"
              onChange={handleCoverChange}
            />
            {coverFile && <p className="file-info">✓ {coverFile.name}</p>}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Uploading..." : "Upload Music"}
          </button>
        </form>

        <p style={{ fontSize: "12px", color: "#999", marginTop: "15px" }}>
          Note: If you provide an album name, we will automatically bundle this
          track into that album. If the album doesn't exist yet, it will be
          generated automatically!
        </p>
      </div>
    </div>
  );
};
