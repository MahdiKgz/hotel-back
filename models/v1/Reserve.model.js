const { DataTypes } = require("sequelize");
const db = require("../../configs/db");
const Hotel = require("./Hotel.model");
const Room = require("./Room.model");
const User = require("./User.model");

const { DATEONLY, INTEGER, TEXT } = DataTypes;

const Reserve = db.define("Reserve", {
  hotelId: {
    type: INTEGER,
    allowNull: false,
    references: {
      model: Hotel,
      key: "id",
    },
    onDelete: "CASCADE",
    field: "hotel_id",
  },
  userId: {
    type: INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
    onDelete: "CASCADE",
    field: "user_id",
  },
  roomId: {
    type: INTEGER,
    allowNull: false,
    references: {
      model: Room,
      key: "id",
    },
    onDelete: "CASCADE",
    field: "room_id",
  },
  startDate: {
    type: DATEONLY,
    allowNull: false,
  },
  endDate: {
    type: DATEONLY,
    allowNull: false,
  },
  note: {
    type: TEXT,
    allowNull: true,
    defaultValue: "",
  },
});

Reserve.belongsTo(Hotel, {
  foreignKey: "hotelId",
  as: "hotel",
  onDelete: "CASCADE",
});
Reserve.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
  onDelete: "CASCADE",
});
Reserve.belongsTo(Room, {
  foreignKey: "roomId",
  as: "room",
  onDelete: "CASCADE",
});

User.belongsToMany(Room, {
  through: Reserve,
  as: "reservedRooms",
  foreignKey: "userId",
  otherKey: "roomId",
});

Room.belongsToMany(User, {
  through: Reserve,
  as: "reservingUsers",
  foreignKey: "roomId",
  otherKey: "userId",
});

module.exports = Reserve;
