
const sequelize = require("../connection");

const User = require("./user.js");
const Plan = require("./plan.js");
const PlanActivity = require("./planActivity.js");
const PlanBudgetAllocation = require("./planBudgetAllocation.js");

User.hasMany(Plan, { foreignKey: "userId" });
Plan.belongsTo(User, { foreignKey: "userId" });

Plan.hasMany(PlanActivity, {
    foreignKey: "planId",
    as: "activities",
    onDelete: "CASCADE",
});
PlanActivity.belongsTo(Plan, { foreignKey: "planId" });

Plan.hasMany(PlanBudgetAllocation, {
    foreignKey: "planId",
    as: "budgetAllocations",
    onDelete: "CASCADE",
});
PlanBudgetAllocation.belongsTo(Plan, { foreignKey: "planId" });

module.exports = {
    sequelize,
    User,
    Plan,
    PlanActivity,
    PlanBudgetAllocation,
};
