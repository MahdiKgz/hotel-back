const express = require("express");
const auth = require("../../middlewares/auth");
const {
  createReserve,
  getMyReserves,
  cancelMyReserve,
  getOneHotelReserves,
  cancelReserve,
} = require("../../controllers/v1/reserve.controller");
const { roleGuard } = require("../../middlewares/roleGuard");
const reserveRouter = express.Router();

reserveRouter.route("/").post(auth, createReserve);
reserveRouter.route("/me").get(auth, getMyReserves);
reserveRouter.route("/me/:reservationId").delete(auth, cancelMyReserve);

reserveRouter
  .route("/:hotelId")
  .get(auth, roleGuard("ADMIN"), getOneHotelReserves);

reserveRouter.route('/:roomId').delete(auth , cancelReserve)
module.exports = reserveRouter;
