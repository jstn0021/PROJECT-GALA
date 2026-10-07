const { DataTypes } = require("sequelize");
const sequelize = require("../connection");

const Credit = sequelize.define(
  "Credit",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(120), allowNull: false },
    role: { type: DataTypes.STRING(120), allowNull: false },
    description: { type: DataTypes.STRING(300), allowNull: true },
    photoUrl: { type: DataTypes.TEXT, allowNull: true },
    photoPath: { type: DataTypes.TEXT, allowNull: true },
    sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  { tableName: "credits", timestamps: false },
);

module.exports = Credit;
