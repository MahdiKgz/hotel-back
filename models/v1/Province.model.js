const { DataTypes } = require("sequelize");
const db = require("../../configs/db");

const Province = db.define(
  "Province",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    paranoid: true,
    timestamps: false,
    tableName: "Provinces",
  },
);

module.exports = Province;
