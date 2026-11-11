const { DataTypes } = require("sequelize");
const db = require("../../configs/db");
const User = require("./User.model");

module.exports = db.define("AccountRecovery", {
  userId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: { model: User, key: "id" },
    onDelete: "CASCADE",
  },
  verifiedEmail: { type: DataTypes.STRING(100), allowNull: true, unique: true },
  recoveredAt: { type: DataTypes.DATE, allowNull: true },
});
