const express= require('express');
const router=express.Router();
const authController=require('../controllers/auth.controller');
const { authenticate } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/multer.middleware");

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/logout', authController.logoutUser);
router.put('/profile', authenticate, upload.single('profile_photo'), authController.updateProfile);

module.exports=router;