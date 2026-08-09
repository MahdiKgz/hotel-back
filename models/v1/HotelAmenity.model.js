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
    indexes: [
      {
        unique: true,
        fields: ["hotel_id", "amenity_id"],
      },
    ],
  },
);

module.exports = HotelAmenity;

Hotel.belongsToMany(Amenity, {
  through: HotelAmenity,
  as: "amenities",
  foreignKey: { name: "hotelId", field: "hotel_id" },
  otherKey: { name: "amenityId", field: "amenity_id" },
});

Amenity.belongsToMany(Hotel, {
  through: HotelAmenity,
  as: "hotels",
  foreignKey: { name: "amenityId", field: "amenity_id" },
  otherKey: { name: "hotelId", field: "hotel_id" },
});

HotelAmenity.belongsTo(Amenity, {
  foreignKey: { name: "amenityId", field: "amenity_id" },
  as: "amenity",
});

HotelAmenity.belongsTo(Hotel, {
  foreignKey: { name: "hotelId", field: "hotel_id" },
  as: "hotel",
});
