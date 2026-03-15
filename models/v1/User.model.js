const { DataTypes, STRING } = require("sequelize");
const db = require("../../configs/db");

const User = db.define(
  "User",
  {
    fullName: {
      type: DataTypes.STRING(70),
      allowNull: false,
      field: "full_name",
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: true,
      validate: {
        is: {
          args: /^(0?[2-9][0-9]{9}|[2-9][0-9]{9})$/,
          msg: "شماره تلفن نامعتبر است (مثال: ۰۹۱۲۳۴۵۶۷۸۹ یا ۹۱۲۳۴۵۶۷۸۹)",
        },

        len: {
          args: [10, 15],
          msg: "شماره تلفن باید بین ۱۰ تا ۱۵ رقم باشد",
        },
      }, // regex or somethinng else
    },
    email: {
      type: DataTypes.STRING(100),
      defaultValue: null,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    role: {
      type: DataTypes.ENUM("ADMIN", "MANAGER", "OPERATOR", "GUEST"),
      allowNull: false,
    },
  },
  { paranoid: true, deletedAt: "deleted_at" },
);

module.exports = User;
