const express = require("express");
const hotelRouter = express.Router();

const { create } = require("../../controllers/v1/hotel.controller");

const auth = require("../../middlewares/auth");
const { roleGuard } = require("../../middlewares/roleGuard");

hotelRouter.route("/").post(auth, roleGuard("ADMIN,MANAGER"), create);

module.exports = hotelRouter;
