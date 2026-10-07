// Template names come from the TEMPLATES object in NewPlan.jsx.
// Keep in sync, or move TEMPLATES to a shared module later.
export const TEMPLATE_TYPES = ["Blank", "Weekend", "Solo", "Family", "Adventure"];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isValidDateString(v) {
    if (typeof v !== "string" || !DATE_RE.test(v)) return false;
    const d = new Date(`${v}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

function checkString(v, label, max, { allowEmpty = false } = {}) {
    if (typeof v !== "string") return { error: `${label} must be text.` };
    const value = v.trim();
    if (!allowEmpty && value === "") return { error: `${label} is required.` };
    if (value.length > max) return { error: `${label} must be ${max} characters or fewer.` };
    return { value };
}

function checkMoney(v, label) {
    const n = typeof v === "string" && v.trim() !== "" ? Number(v) : v;
    if (typeof n !== "number" || !Number.isFinite(n) || n < 0 || n > 1e12) {
        return { error: `${label} must be a number of 0 or more.` };
    }
    return { value: Math.round(n * 100) / 100 };
}

function checkStringList(v, label) {
    if (!Array.isArray(v) || v.length > 50) {
        return { error: `${label} must be a list of up to 50 items.` };
    }
    const out = [];
    for (const item of v) {
        if (typeof item !== "string" || item.length > 200) {
            return { error: `${label} items must be text of 200 characters or fewer.` };
        }
        if (item.trim() !== "") out.push(item.trim());
    }
    return { value: out };
}

const FIELD_CHECKS = {
    title: (v) => checkString(v, "Title", 120),
    destination: (v) => checkString(v, "Destination", 120),
    start_date: (v) =>
        isValidDateString(v) ? { value: v } : { error: "Start date must be YYYY-MM-DD." },
    end_date: (v) =>
        isValidDateString(v) ? { value: v } : { error: "End date must be YYYY-MM-DD." },
    notes: (v) => checkString(v, "Notes", 5000, { allowEmpty: true }),
    budget: (v) => checkMoney(v, "Budget"),
    spent: (v) => checkMoney(v, "Spent"),
    template_type: (v) =>
        TEMPLATE_TYPES.includes(v)
            ? { value: v }
            : { error: `Template must be one of: ${TEMPLATE_TYPES.join(", ")}.` },
};

const RELATED_CHECKS = {
    activities: (v) => checkStringList(v, "Activities"),
    budget_categories: (v) => checkStringList(v, "Budget categories"),
};

export function validateCreate(body) {
    const errors = {};
    const value = {};
    const related = { activities: [], budget_categories: [] };

    for (const key of ["destination", "start_date", "end_date"]) {
        if (body[key] === undefined) errors[key] = "This field is required.";
    }

    for (const [key, check] of Object.entries(FIELD_CHECKS)) {
        if (body[key] === undefined) continue;
        const r = check(body[key]);
        if (r.error) errors[key] = r.error;
        else value[key] = r.value;
    }

    for (const [key, check] of Object.entries(RELATED_CHECKS)) {
        if (body[key] === undefined) continue;
        const r = check(body[key]);
        if (r.error) errors[key] = r.error;
        else related[key] = r.value;
    }

    if (!errors.start_date && !errors.end_date && value.end_date < value.start_date) {
        errors.end_date = "End date can't be before the start date.";
    }

    // Defaults (title falls back to destination, as the current frontend does)
    if (!errors.destination) value.title ??= value.destination;
    value.notes ??= "";
    value.budget ??= 0;
    value.spent ??= 0;
    value.template_type ??= "Blank";

    return { value, related, errors };
}

export function validateUpdate(body) {
    const errors = {};
    const value = {};

    for (const [key, check] of Object.entries(FIELD_CHECKS)) {
        if (body[key] === undefined) continue;
        const r = check(body[key]);
        if (r.error) errors[key] = r.error;
        else value[key] = r.value;
    }

    if (body.mark_completed !== undefined) {
        if (body.mark_completed !== true) {
            errors.mark_completed = "mark_completed can only be true.";
        } else {
            value.mark_completed = true;
        }
    }

    return { value, errors };
}