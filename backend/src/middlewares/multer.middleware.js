const multer = require("multer");

// Use memory storage so files are kept in memory as a Buffer
// before being passed straight to your storage.service (ImageKit)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // Sets a 20MB file cap limit
  },
});

module.exports = upload;
