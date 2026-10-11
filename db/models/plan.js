
const { DataTypes } = require("sequelize");
const sequelize = require("../connection");

const Plan = sequelize.define("Plan", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "user_id",
    },
    title: {
        type: DataTypes.STRING(120),
        allowNull: false,
    },
    destination: {
        type: DataTypes.STRING(120),
        allowNull: false,
    },
    image: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
    },
    startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: "start_date",
    },
    endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: "end_date",
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: "",
    },
    budget: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false,
        defaultValue: 0,
    },
    spent: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false,
        defaultValue: 0,
    },
    templateType: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: "Blank",
        field: "template_type",
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "completed_at",
    },
}, {
    tableName: "plans",
    underscored: true,
    timestamps: true,
},
);

module.exports = Plan;
