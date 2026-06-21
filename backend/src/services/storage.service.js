require("dotenv").config();
const ImageKit = require("@imagekit/nodejs");

const ImageKitClient = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

async function uploadFile(file) {
  try {
    const response = await ImageKitClient.files.upload({
      file: file.buffer.toString("base64"),
      fileName: "music-file-" + Date.now(),
      folder: "music_app/music_files",
    });
    return response;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

module.exports = {
  uploadFile,
};
