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
} = require("../../controllers/v1/auth.controller");
const auth = require("../../middlewares/auth");

const { multerStorage } = require("../../utils/multer-uploader");

const upload = multerStorage("uploads/avatars/");

authRouter.route("/register").post(register);
authRouter.route("/login").post(login);
authRouter.route("/send-otp").post(sendOTP);
authRouter.route("/verify").post(verifyOTP);
authRouter.route("/reset-password").post(auth, resetPassword);
authRouter.route("/me").get(auth, getMe);

authRouter.route("/avatar").post(auth, upload.single("avatar"), setAvatar);

module.exports = authRouter;
