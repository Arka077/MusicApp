const express = require("express");
const router = express.Router();

// Import your controller functions
const playlistController = require("../controllers/music.controller");

// Import your authentication middleware layer
const { authUser } = require("../middlewares/auth.middleware");

// Import the model directly for the query list endpoint
const playlistModel = require("../models/playlist.model");

/**
 * @route   POST /api/playlists/create
 * @desc    Create a brand new playlist row
 * @access  Private (Users only)
 */
router.post("/create", authUser, playlistController.createPlaylist);

/**
 * @route   GET /api/playlists/my-playlists
 * @desc    Fetch all custom playlists owned by the authenticated user
 * @access  Private (Users only)
 */
router.get("/my-playlists", authUser, async (req, res) => {
  try {
    const user = req.user;
    const loggedInUserId = user.id || user.user_id;

    const playlists = await playlistModel.findByUserId(loggedInUserId);

    return res.status(200).json({
      message: "Playlists retrieved successfully",
      playlists,
    });
  } catch (error) {
    console.error("Get user playlists route error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/playlists/add
 * @desc    Append a track profile into a user's playlist (playlist_music junction)
 * @access  Private (Users only)
 */
router.post("/add", authUser, playlistController.addToPlaylist);

router.post("/remove-track", authUser, playlistController.removeFromPlaylist);

router.put("/:id", authUser, playlistController.updatePlaylist);

router.get("/:id", authUser, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const playlist = await playlistModel.getDetailsWithTracks(id);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    return res.status(200).json({ playlist });
  } catch (error) {
    console.error("Get playlist details route error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

module.exports = router;
