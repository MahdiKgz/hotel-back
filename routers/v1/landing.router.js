const express = require("express");
const {
  getFilters,
  getHotelDetails,
  getOverview,
  searchHotels,
} = require("../../controllers/v1/landing.controller");

const landingRouter = express.Router();

landingRouter.get("/", getOverview);
landingRouter.get("/filters", getFilters);
landingRouter.get("/hotels", searchHotels);
landingRouter.get("/hotels/:slug", getHotelDetails);
landingRouter.get("/search", searchHotels);

module.exports = landingRouter;
