const { DataTypes } = require("sequelize");
const db = require("../../configs/db");
const Hotel = require("./Hotel.model");

const { STRING, ENUM, INTEGER, TEXT } = DataTypes;

const Room = db.define(
  "Room",
  {
    name: {
      type: STRING(40),
      allowNull: false,
      unique: true,
    },
    slug: {
      type: STRING(30),
      allowNull: false,
      unique: true,
    },
    capacity: {
      type: INTEGER,
      allowNull: false,
    },
    status: {
      type: ENUM("RESERVED", "MAINTAIN", "EMPTY"),
      allowNull: false,
    },
    price: {
      type: INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    bookType: {
      type: ENUM("DAILY", "WEEKLY", "MONTHLY"),
      allowNull: false,
      defaultValue: "DAILY",
    },
    bathService: {
      type: INTEGER,
      allowNull: false,
      field: "bath_service",
    },
    balcony: {
      type: INTEGER,
      allowNull: false,
    },
    geoDirection: {
      field: "geo_direction",
      type: ENUM("NORTH", "SOUTH", "EAST", "WEST"),
      allowNull: false,
    },
    kitchen: {
      type: ENUM("YES", "NO"),
      allowNull: false,
      defaultValue: "YES",
    },
    description: {
      type: TEXT,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    paranoid: true,
    deletedAt: "deleted_at",
  },
);

Room.belongsTo(Hotel, { foreignKey: "hotel_id", as: "hotel" });
Hotel.hasMany(Room, { foreignKey: "hotel_id" });

module.exports = Room;
