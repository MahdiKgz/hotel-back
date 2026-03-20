const { DataTypes } = require("sequelize");
const db = require("../../configs/db");

const Ban = db.define(
  "Ban",
  {
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { paranoid: true, deletedAt: "deleted_at" },
);

module.exports = Ban;
