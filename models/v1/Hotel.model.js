const { DataTypes } = require("sequelize");
const db = require("../../configs/db");

const { STRING, ENUM, INTEGER, TEXT, JSONB } = DataTypes;

const Hotel = db.define(
  "Hotel",
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
    country: {
      type: INTEGER,
      allowNull: false,
    },
    city: {
      type: INTEGER,
      allowNull: false,
    },
    address: {
      type: TEXT,
      allowNull: false,
    },
    postalCode: {
      type: STRING,
      allowNull: false,
      field: "postal_code",
    },
    stars: {
      type: ENUM("1", "2", "3", "4", "5"),
      allowNull: false,
    },
    coordinates: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isJson(value) {
          try {
            JSON.parse(value);
          } catch (e) {
            throw new Error("فرمت مختصات باید JSON باشد");
          }
        },
      },
    },
    metroAccess: {
      type: ENUM("YES", "NO"),
      allowNull: true,
      defaultValue: "NO",
      field: "metro_access",
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

module.exports = Hotel;
