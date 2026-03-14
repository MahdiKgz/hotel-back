const express = require("express");
const authRouter = express.Router();

const { register } = require("../../controllers/v1/auth.controller");

authRouter.route("/register").post(register);

module.exports = authRouter;
