/**
 * This is custom validation library that provides flexibility just like laravel validations.
 * @author Mudassir Ameen
 */

export type ValidationRule = (value: any, data?: Record<string, any>) => string | null;
export type RuleParsed = { name: RuleName; args?: any[] };

export const ruleNames = [
    "required",
    "nullable",
    "email",
    "string",
    "numeric",
    "integer",
    "boolean",
    "min",
    "max",
    "between",
    "confirmed",
    "same",
    "regex",
    "url",
    "date",
    "after",
    "before",
    "alpha",
    "alpha_num",
    "in",
    "not_in",
    "size",
    "digits",
    "digits_between",
    "starts_with",
    "ends_with",
] as const;

export type RuleName = typeof ruleNames[number];

/**
 * predefinedRules: map of ruleName => factory that returns ValidationRule.
 * Har function k return value aik function hai jo value or data pass kar kay error ya null return karti hai.
 */
export const predefinedRules: Record<RuleName, (...args: any[]) => ValidationRule> = {
    required: () => (value) =>
        value === undefined || value === null || value === "" ? "This field is required." : null,

    nullable: () => () => null, // Server-side meaning: allow null; we handle logic in validate by skipping other rules if value is null/empty depending on 'nullable'

    email: () => (value) => {
        if (value === undefined || value === null || value === "") return "Invalid email address.";
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(value) ? null : "Invalid email address.";
    },

    string: () => (value) =>
        value === undefined || value === null || typeof value === "string" ? null : "The field must be a string.",

    numeric: () => (value) =>
        value === undefined || value === null || typeof value === "number" || !Number.isNaN(Number(value))
            ? null
            : "The field must be numeric.",

    integer: () => (value) => (Number.isInteger(Number(value)) ? null : "The field must be an integer."),

    boolean: () => (value) =>
        value === undefined || value === null || typeof value === "boolean" || value === 0 || value === 1
            ? null
            : "The field must be boolean.",

    min: (minLen: number) => (value) => {
        if (value === undefined || value === null) return `Must be at least ${minLen} characters.`;
        if (typeof value === "string" || Array.isArray(value)) {
            return value.length >= Number(minLen) ? null : `Must be at least ${minLen} characters.`;
        }
        if (!Number.isNaN(Number(value))) {
            return Number(value) >= Number(minLen) ? null : `Must be at least ${minLen}.`;
        }
        return `Must be at least ${minLen}.`;
    },

    max: (maxLen: number) => (value) => {
        if (value === undefined || value === null) return null;
        if (typeof value === "string" || Array.isArray(value)) {
            return value.length <= Number(maxLen) ? null : `Must be no more than ${maxLen} characters.`;
        }
        if (!Number.isNaN(Number(value))) {
            return Number(value) <= Number(maxLen) ? null : `Must be no more than ${maxLen}.`;
        }
        return null;
    },

    between: (minVal: number, maxVal: number) => (value) => {
        if (value === undefined || value === null) return null;
        if (!Number.isNaN(Number(value))) {
            const n = Number(value);
            return n >= Number(minVal) && n <= Number(maxVal) ? null : `Must be between ${minVal} and ${maxVal}.`;
        }
        if (typeof value === "string" || Array.isArray(value)) {
            const l = value.length;
            return l >= Number(minVal) && l <= Number(maxVal) ? null : `Length must be between ${minVal} and ${maxVal}.`;
        }
        return null;
    },

    confirmed: (field: string) => (value, data) => {
        // Laravel: password_confirm field convention password_confirmation
        const confirmedField = `${field}_confirmation`;
        if (!data) return `Fields do not match.`;
        return data[confirmedField] === value ? null : "Fields do not match.";
    },

    same: (otherField: string) => (value, data) => {
        if (!data) return "Fields do not match.";
        return data[otherField] === value ? null : "Fields do not match.";
    },

    regex: (pattern: string) => (value) => {
        if (value === undefined || value === null) return null;
        const re = new RegExp(pattern);
        return re.test(String(value)) ? null : "Invalid format.";
    },

    url: () => (value) => {
        if (!value) return null;
        try {
            // eslint-disable-next-line no-new
            new URL(String(value));
            return null;
        } catch {
            return "Invalid URL.";
        }
    },

    date: () => (value) => {
        if (!value) return null;
        const d = Date.parse(String(value));
        return !Number.isNaN(d) ? null : "Invalid date.";
    },

    after: (dateOrField: string) => (value, data) => {
        if (!value) return null;
        const candidate = Date.parse(String(value));
        if (!Number.isNaN(candidate)) {
            const compare = Date.parse(String(dateOrField));
            if (!Number.isNaN(compare)) return candidate > compare ? null : `Date must be after ${dateOrField}.`;
            return null;
        }
        // if dateOrField is another field name
        if (data && data[dateOrField]) {
            const other = Date.parse(String(data[dateOrField]));
            return candidate > other ? null : `Date must be after ${dateOrField}.`;
        }
        return "Invalid date.";
    },

    before: (dateOrField: string) => (value, data) => {
        if (!value) return null;
        const candidate = Date.parse(String(value));
        if (!Number.isNaN(candidate)) {
            const compare = Date.parse(String(dateOrField));
            if (!Number.isNaN(compare)) return candidate < compare ? null : `Date must be before ${dateOrField}.`;
            return null;
        }
        if (data && data[dateOrField]) {
            const other = Date.parse(String(data[dateOrField]));
            return candidate < other ? null : `Date must be before ${dateOrField}.`;
        }
        return "Invalid date.";
    },

    alpha: () => (value) => (!value || /^[A-Za-z]+$/.test(String(value)) ? null : "Only alphabetic characters allowed."),

    alpha_num: () => (value) => (!value || /^[A-Za-z0-9]+$/.test(String(value)) ? null : "Only alphanumeric characters allowed."),

    in: (...list: string[]) => (value) => (list.includes(String(value)) ? null : `Value must be one of: ${list.join(", ")}.`),

    not_in: (...list: string[]) => (value) => (!list.includes(String(value)) ? null : `Invalid value.`),

    size: (expected: number) => (value) => {
        if (typeof value === "string" || Array.isArray(value)) {
            return value.length === Number(expected) ? null : `Length must be ${expected}.`;
        }
        if (!Number.isNaN(Number(value))) {
            return Number(value) === Number(expected) ? null : `Value must be ${expected}.`;
        }
        return `Value must be ${expected}.`;
    },

    digits: (count: number) => (value) => (/^\d+$/.test(String(value)) && String(value).length === Number(count) ? null : `Must be ${count} digits.`),

    digits_between: (minD: number, maxD: number) => (value) => {
        if (!/^\d+$/.test(String(value))) return "Must be digits.";
        const l = String(value).length;
        return l >= Number(minD) && l <= Number(maxD) ? null : `Digits length must be between ${minD} and ${maxD}.`;
    },

    starts_with: (...prefixes: string[]) => (value) => {
        if (!value) return null;
        return prefixes.some((p) => String(value).startsWith(p)) ? null : `Must start with one of: ${prefixes.join(", ")}`;
    },

    ends_with: (...suffixes: string[]) => (value) => {
        if (!value) return null;
        return suffixes.some((s) => String(value).endsWith(s)) ? null : `Must end with one of: ${suffixes.join(", ")}`;
    },
};

/**
 * parseRuleString - parse laravel style rule string into RuleParsed array.
 * Example: "required|min:8|email|in:admin,user,guest"
 */
export function parseRuleString(ruleStr: string): RuleParsed[] {
    if (!ruleStr) return [];
    const parts = ruleStr.split("|").map((p) => p.trim()).filter(Boolean);
    const out: RuleParsed[] = [];
    for (const p of parts) {
        const [name, argString] = p.split(":");
        const key = name as RuleName;
        if (!ruleNames.includes(key)) {
            // Unknown rule - include as regex (if pattern) or ignore
            // We push it as name so later validator can decide.
            out.push({ name: key, args: argString ? argString.split(",") : [] });
            continue;
        }
        const args = argString ? argString.split(",").map((a) => a.trim()) : [];
        out.push({ name: key, args });
    }
    return out;
}
