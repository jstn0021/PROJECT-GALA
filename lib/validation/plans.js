
/**
 * Plans Validation
 * File: lib/validation/plans.js
 */

export const TEMPLATE_TYPES = [
    "Blank",
    "Weekend",
    "Solo",
    "Family",
    "Adventure",
];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Validate date format
function isValidDateString(v) {
    if (typeof v !== "string" || !DATE_RE.test(v)) {
        return false;
    }

    const d = new Date(`${v}T00:00:00Z`);

    return (
        !Number.isNaN(d.getTime()) &&
        d.toISOString().slice(0, 10) === v
    );
}

// Validate text
function checkString(v, label, max, { allowEmpty = false } = {}) {
    if (typeof v !== "string") {
        return { error: `${label} must be text.` };
    }

    const value = v.trim();

    if (!allowEmpty && value === "") {
        return { error: `${label} is required.` };
    }

    if (value.length > max) {
        return {
            error: `${label} must be ${max} characters or fewer.`,
        };
    }

    return { value };
}

// Validate money
function checkMoney(v, label) {
    const n =
        typeof v === "string" && v.trim() !== ""
            ? Number(v)
            : v;

    if (
        typeof n !== "number" ||
        !Number.isFinite(n) ||
        n < 0 ||
        n > 1e12
    ) {
        return {
            error: `${label} must be a number of 0 or more.`,
        };
    }

    return {
        value: Math.round(n * 100) / 100,
    };
}

// Validate lists
function checkStringList(v, label) {
    if (!Array.isArray(v) || v.length > 50) {
        return {
            error: `${label} must be a list of up to 50 items.`,
        };
    }

    const out = [];

    for (const item of v) {
        if (typeof item !== "string" || item.length > 200) {
            return {
                error: `${label} items must be text of 200 characters or fewer.`,
            };
        }

        if (item.trim() !== "") {
            out.push(item.trim());
        }
    }

    return { value: out };
}

// Main field validation
const FIELD_CHECKS = {
    title: (v) => checkString(v, "Title", 120),

    destination: (v) =>
        checkString(v, "Destination", 120),

    startDate: (v) =>
        isValidDateString(v)
            ? { value: v }
            : { error: "Start date must be YYYY-MM-DD." },

    endDate: (v) =>
        isValidDateString(v)
            ? { value: v }
            : { error: "End date must be YYYY-MM-DD." },

    notes: (v) =>
        checkString(v, "Notes", 5000, {
            allowEmpty: true,
        }),

    budget: (v) => checkMoney(v, "Budget"),

    spent: (v) => checkMoney(v, "Spent"),

    templateType: (v) =>
        TEMPLATE_TYPES.includes(v)
            ? { value: v }
            : {
                error: `Template must be one of: ${TEMPLATE_TYPES.join(", ")}.`,
            },
};

// Related fields
const RELATED_CHECKS = {
    activities: (v) =>
        checkStringList(v, "Activities"),

    budgetCategories: (v) =>
        checkStringList(v, "Budget categories"),
};

/**
 * CREATE PLAN VALIDATION
 */
export function validateCreate(body) {
    const errors = {};
    const value = {};

    const related = {
        activities: [],
        budgetCategories: [],
    };

    // Check required fields
    for (const key of [
        "destination",
        "startDate",
        "endDate",
    ]) {
        if (body[key] === undefined) {
            errors[key] = "This field is required.";
        }
    }

    // Validate main fields
    for (const [key, check] of Object.entries(FIELD_CHECKS)) {
        if (body[key] === undefined) {
            continue;
        }

        const result = check(body[key]);

        if (result.error) {
            errors[key] = result.error;
        } else {
            value[key] = result.value;
        }
    }

    // Validate related fields
    for (const [key, check] of Object.entries(RELATED_CHECKS)) {
        if (body[key] === undefined) {
            continue;
        }

        const result = check(body[key]);

        if (result.error) {
            errors[key] = result.error;
        } else {
            related[key] = result.value;
        }
    }

    // Validate date range
    if (
        value.startDate &&
        value.endDate &&
        !errors.startDate &&
        !errors.endDate &&
        value.endDate < value.startDate
    ) {
        errors.endDate =
            "End date can't be before the start date.";
    }

    // Apply default values
    if (!errors.destination) {
        value.title ??= value.destination;
    }

    value.notes ??= "";
    value.budget ??= 0;
    value.spent ??= 0;
    value.templateType ??= "Blank";

    return {
        value,
        related,
        errors,
    };
}

/**
 * UPDATE PLAN VALIDATION
 */
export function validateUpdate(body) {
    const errors = {};
    const value = {};

    // Validate provided fields
    for (const [key, check] of Object.entries(FIELD_CHECKS)) {
        if (body[key] === undefined) {
            continue;
        }

        const result = check(body[key]);

        if (result.error) {
            errors[key] = result.error;
        } else {
            value[key] = result.value;
        }
    }

    // Validate completion action
    if (body.markCompleted !== undefined) {
        if (body.markCompleted !== true) {
            errors.markCompleted =
                "markCompleted can only be true.";
        } else {
            value.markCompleted = true;
        }
    }

    return {
        value,
        errors,
    };
}
