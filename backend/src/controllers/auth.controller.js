const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { uploadFile } = require("../services/storage.service");

async function registerUser(req, res) {
  try {
    const { username, email, password, role = "user" } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Username, email, and password are required",
      });
    }

    const existingUser = await userModel.findOne({ username, email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      username,
      email,
      password: hashedPassword,
      role,
    });

    const token = jwt.sign(
      {
        id: user.user_id,
        role: user.role,
      },
      process.env.JWT_SECRET,
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile_photo: null,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

async function loginUser(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username && !email) {
      return res.status(400).json({
        message: "Username or email is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        message: "Password is required",
      });
    }

    const user = await userModel.findOne({ username, email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user.user_id,
        role: user.role,
      },
      process.env.JWT_SECRET,
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "User logged in successfully",
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile_photo: user.profile_photo,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { username } = req.body;
    const file = req.file;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let profilePhotoUrl = user.profile_photo;
    if (file) {
      const uploadResult = await uploadFile(file);
      profilePhotoUrl = uploadResult.url;
    }

    await userModel.update(userId, { username, profile_photo: profilePhotoUrl });

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user.user_id,
        username,
        email: user.email,
        role: user.role,
        profile_photo: profilePhotoUrl,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

async function logoutUser(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  return res.json({
    message: "User logged out successfully",
  });
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  updateProfile,
};
