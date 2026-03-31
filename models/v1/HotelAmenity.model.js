// models/HotelAmenity.model.js
const { DataTypes } = require("sequelize");
const db = require("../../configs/db");
const Hotel = require("./Hotel.model");
const Amenity = require("./Amenity.model");

const { BOOLEAN, INTEGER } = DataTypes;

const HotelAmenity = db.define(
  "HotelAmenity",
  {
    hotelId: {
      type: INTEGER,
      allowNull: false,
      references: {
        model: "Hotels",
        key: "id",
      },
      onDelete: "CASCADE",
      field: "hotel_id",
    },
    amenityId: {
      type: INTEGER,
      allowNull: false,
      references: {
        model: "Amenities",
        key: "id",
      },
      onDelete: "CASCADE",
      field: "amenity_id",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = HotelAmenity;

Hotel.belongsToMany(Amenity, {
  through: HotelAmenity,
  as: "amenities",
  foreignKey: "hotel_id",
  otherKey: "amenity_id",
});

Amenity.belongsToMany(Hotel, {
  through: HotelAmenity,
  as: "hotels",
  foreignKey: "amenity_id",
  otherKey: "hotel_id",
});
