const express = require("express");
const hotelRouter = express.Router();

const {
  create,
  getOneHotel,
} = require("../../controllers/v1/hotel.controller");

const auth = require("../../middlewares/auth");
const { roleGuard } = require("../../middlewares/roleGuard");

hotelRouter.route("/").post(auth, roleGuard("ADMIN,MANAGER"), create);
hotelRouter.route("/:slug").get(getOneHotel);

module.exports = hotelRouter;
