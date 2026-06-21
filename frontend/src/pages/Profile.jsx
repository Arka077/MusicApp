import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Alert } from "../components/Alert";
import "../styles/Auth.css";

export const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [username, setUsername] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Sync state with current user information
  useEffect(() => {
    if (user) {
      setUsername(user.username || user.name || "");
      setPreviewUrl(user.profile_photo || null);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-box" style={{ textAlign: "center" }}>
          <h2>Access Denied</h2>
          <p style={{ color: "#999", marginBottom: "20px" }}>
            Please log in to view your profile.
          </p>
          <button className="btn btn-primary" onClick={() => navigate("/login")}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }
      setProfilePhoto(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username.trim()) {
      setError("Username cannot be empty");
      return;
    }

    try {
      setUpdating(true);
      const formData = new FormData();
      formData.append("username", username.trim());
      if (profilePhoto) {
        formData.append("profile_photo", profilePhoto);
      }

      await updateProfile(formData);
      setSuccess("Profile updated successfully!");
      setProfilePhoto(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleLogoutClick = () => {
    logout();
    navigate("/login");
  };

  const displayName = user.username || user.name || user.user_id || "User";

  return (
    <div className="profile-container">
      <div className="profile-box">
        <h2>Your Profile</h2>

        {error && (
          <Alert type="error" message={error} onClose={() => setError("")} />
        )}
        {success && (
          <Alert type="success" message={success} onClose={() => setSuccess("")} />
        )}

        <div className="profile-avatar-container">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={displayName}
              className="profile-avatar-large"
              onClick={handleAvatarClick}
              style={{ cursor: "pointer" }}
            />
          ) : (
            <div
              className="profile-avatar-placeholder-large"
              onClick={handleAvatarClick}
              style={{ cursor: "pointer" }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <button type="button" className="avatar-upload-btn" onClick={handleAvatarClick}>
            Change Photo
          </button>
        </div>

        <form onSubmit={handleSave} encType="multipart/form-data">
          <div className="profile-info-row" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label htmlFor="username-input" style={{ color: "#86868b", fontSize: "13px", fontWeight: "500" }}>Username</label>
            <input
              id="username-input"
              type="text"
              className="dropdown-item"
              style={{
                border: "1px solid #3a3a3c",
                background: "#2c2c2e",
                color: "#fff",
                padding: "12px",
                borderRadius: "8px",
                fontSize: "16px",
                width: "100%",
                boxSizing: "border-box"
              }}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>

          <div className="profile-info-row" style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "20px" }}>
            <label style={{ color: "#86868b", fontSize: "13px", fontWeight: "500" }}>Email Address</label>
            <div className="profile-static-value" style={{
              color: "#f5f5f7",
              fontSize: "16px",
              background: "rgba(255, 255, 255, 0.03)",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #2c2c2e"
            }}>{user.email}</div>
          </div>

          <div className="profile-info-row" style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "20px" }}>
            <label style={{ color: "#86868b", fontSize: "13px", fontWeight: "500" }}>Account Type / Role</label>
            <div className="profile-static-value" style={{
              color: "#f5f5f7",
              fontSize: "16px",
              background: "rgba(255, 255, 255, 0.03)",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #2c2c2e",
              textTransform: "capitalize"
            }}>
              {user.role}
            </div>
          </div>

          <div className="btn-row" style={{ display: "flex", gap: "16px", marginTop: "32px" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleLogoutClick}
              style={{ flex: 1 }}
            >
              Log Out
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={updating}
              style={{ flex: 1 }}
            >
              {updating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
