const { DataTypes } = require("sequelize");
const sequelize = require("../connection");

const SiteImage = sequelize.define(
  "SiteImage",
  {
    slot: { type: DataTypes.STRING(50), primaryKey: true },
    url: { type: DataTypes.TEXT, allowNull: false },
    path: { type: DataTypes.TEXT, allowNull: false },
  },
  { tableName: "site_images", timestamps: false },
);

module.exports = SiteImage;
