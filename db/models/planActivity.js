
const { DataTypes } = require("sequelize");
const sequelize = require("../connection");

const PlanActivity = sequelize.define("PlanActivity", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    planId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "plan_id",
    },
    position: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    text: {
        type: DataTypes.STRING(200),
        allowNull: false,
    },
}, {
    tableName: "plan_activities",
    timestamps: false,
});

module.exports = PlanActivity;
