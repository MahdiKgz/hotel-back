// models/v1/HotelImage.model.js
const { DataTypes } = require("sequelize");
const db = require("../../configs/db");
const Hotel = require("./Hotel.model");

const HotelImage = db.define(
  "HotelImage",
  {
    url: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    isCover: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    paranoid: true,
    deletedAt: "deleted_at",
  },
);

Hotel.hasMany(HotelImage, {
  foreignKey: "hotel_id",
  as: "images",
  onDelete: "CASCADE",
  hooks: true,
});

HotelImage.belongsTo(Hotel, {
  foreignKey: "hotel_id",
  as: "hotel",
});

module.exports = HotelImage;
