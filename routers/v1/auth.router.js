const express = require("express");
const authRouter = express.Router();

const {
  register,
  login,
  sendOTP,
  verifyOTP,
  resetPassword,
} = require("../../controllers/v1/auth.controller");
const auth = require("../../middlewares/auth");

authRouter.route("/register").post(register);
authRouter.route("/login").post(login);
authRouter.route("/send-otp").post(sendOTP);
authRouter.route("/verify").post(verifyOTP);
authRouter.route("/reset-password").post(auth, resetPassword);

module.exports = authRouter;
