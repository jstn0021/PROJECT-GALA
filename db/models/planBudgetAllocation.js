
const { DataTypes } = require("sequelize");
const sequelize = require("../connection");

const PlanBudgetAllocation = sequelize.define(
    "PlanBudgetAllocation",
    {
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
        category: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        amount: {
            type: DataTypes.DECIMAL(14, 2),
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        tableName: "plan_budget_allocations",
        timestamps: false,
    }
);

module.exports = PlanBudgetAllocation;
