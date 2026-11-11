const express = require("express");
const authRouter = express.Router();

const {
  register,
  login,
  sendOTP,
  verifyOTP,
  resetPassword,
  getMe,
  setAvatar,
  updateProfile,
} = require("../../controllers/v1/auth.controller");
const recovery = require("../../controllers/v1/account-recovery.controller");
const auth = require("../../middlewares/auth");

const { multerStorage } = require("../../utils/multer-uploader");

const upload = multerStorage("uploads/avatars/");

authRouter.route("/register").post(register);
authRouter.route("/login").post(login);
authRouter.route("/send-otp").post(sendOTP);
authRouter.route("/verify").post(verifyOTP);
authRouter.route("/reset-password").post(auth, resetPassword);
authRouter.post("/request-email-verification", auth, recovery.requestVerification);
authRouter.post("/verify-email", recovery.verifyEmail);
authRouter.post("/forgot-password", recovery.forgotPassword);
authRouter.post("/recover-password", recovery.recoverPassword);
authRouter.route("/me").get(auth, getMe);

authRouter.route("/avatar").post(auth, upload.single("avatar"), setAvatar);
authRouter.route("/update-profile").put(auth, updateProfile);

module.exports = authRouter;
