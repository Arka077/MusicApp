const express = require("express");
const router = express.Router();

const { searchMusic } = require("../controllers/search.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.post("/", authenticate, searchMusic);

module.exports = router;
