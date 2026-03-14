const { DataTypes } = require("sequelize");
const db = require("../../configs/db");

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
      allowNull : false,
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

module.exports = Room;
