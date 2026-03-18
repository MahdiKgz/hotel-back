const { DataTypes } = require("sequelize");
const db = require("../../configs/db");

const { STRING, BOOLEAN } = DataTypes;

const Amenity = db.define(
  "Amenity",
  {
    title: {
      type: STRING(40),
      allowNull: false,
      unique: true,
      trim: true,
    },
    description: {
      type: STRING,
      allowNull: true,
      defaultValue: null,
    },
    isActive: {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  { paranoid: true, deletedAt: "deleted_at" },
);

module.exports = Amenity;
