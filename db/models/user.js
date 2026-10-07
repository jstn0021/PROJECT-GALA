const { DataTypes } = require("sequelize");
const sequelize = require("../connection");

const User = sequelize.define(
  "User",
  {
    fullName: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    resetToken: { type: DataTypes.STRING, allowNull: true },
    resetTokenExpires: { type: DataTypes.DATE, allowNull: true },
    // "user" (regular) o "superadmin". Hindi puwedeng itakda sa signup.
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "user",
      validate: { isIn: [["user", "superadmin"]] },
    },
    // true = hindi na makakapag-login / makakagamit ng app
    disabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  { tableName: "users" },
);

module.exports = User;
