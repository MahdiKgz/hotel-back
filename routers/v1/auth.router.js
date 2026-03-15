const express = require("express");
const authRouter = express.Router();

const {
  register,
  login,
  sendOTP,
} = require("../../controllers/v1/auth.controller");

authRouter.route("/register").post(register);
authRouter.route("/login").post(login);
authRouter.route("/send-otp").post(sendOTP);

module.exports = authRouter;
