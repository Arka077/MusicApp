const express = require("express");
const router = express.Router();
const musicController = require("../controllers/music.controller");

// Import authenticate (generic token check) alongside authArtist
const { authenticate, authArtist } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/multer.middleware");

/**
 * Global Browsing Endpoints
 * Accessible by both regular users and artists since they use the generic 'authenticate' gate
 */
router.get("/", authenticate, musicController.getAllMusics);

router.get("/albums", authenticate, musicController.getAllAlbums);

/**
 * Artist Operational & Management Endpoints
 * Strictly locked down for accounts flagged with the 'artist' role
 */
router.post(
  "/upload",
  authArtist,
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  musicController.createMusic,
);

router.post(
  "/album/create",
  authArtist,
  upload.single("file"),
  musicController.createAlbum,
);

router.put(
  "/album/:id",
  authArtist,
  upload.single("file"),
  musicController.updateAlbum,
);

router.put(
  "/:id",
  authArtist,
  upload.single("cover"),
  musicController.updateMusic,
);

router.get("/my-songs", authArtist, musicController.getArtistSongs);
router.get("/unassigned-songs", authArtist, musicController.getUnassignedSongs);
router.get("/my-albums", authArtist, musicController.getArtistAlbums);
router.get("/album/:id", authenticate, musicController.getAlbumById);
router.get("/latest", authenticate, musicController.getLatestMusics);
router.delete("/:id", authArtist, musicController.deleteMusic);
router.put("/:id/remove-album", authArtist, musicController.removeSongFromAlbum);

module.exports = router;
