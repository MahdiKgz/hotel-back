const db = require("../configs/db");
const User = require("./v1/User.model");
const Province = require("./v1/Province.model");
const Amenity = require("./v1/Amenity.model");
const Hotel = require("./v1/Hotel.model");
const Room = require("./v1/Room.model");
const HotelImage = require("./v1/HotelImages.model");
const HotelAmenity = require("./v1/HotelAmenity.model");
const Reserve = require("./v1/Reserve.model");
const Ban = require("./v1/Ban.model");

module.exports = {
  db,
  User,
  Province,
  Amenity,
  Hotel,
  Room,
  HotelImage,
  HotelAmenity,
  Reserve,
  Ban,
};
