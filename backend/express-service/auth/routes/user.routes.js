const express = require("express");
const {
  getProfile,
  login,
  logout,
  registerUser,
  updateProfile,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  googleLogin,
  googleCallback
} = require("../controllers/user.controller");
const isLoggedIn = require("../middlewares/isLoggedIn.middleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", login);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", isLoggedIn, resendVerificationEmail);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);
router.get("/get-profile", isLoggedIn, getProfile);
router.put("/update-profile", isLoggedIn, updateProfile);
router.post("/logout", isLoggedIn, logout);

// Google OAuth
router.get("/google/login", googleLogin);
router.get("/google/callback", googleCallback);

module.exports = router;
