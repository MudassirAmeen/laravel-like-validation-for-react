// src/rules.ts
var ruleNames = [
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
  "ends_with"
];
var predefinedRules = {
  required: () => (value) => value === void 0 || value === null || value === "" ? "This field is required." : null,
  nullable: () => () => null,
  // Server-side meaning: allow null; we handle logic in validate by skipping other rules if value is null/empty depending on 'nullable'
  email: () => (value) => {
    if (value === void 0 || value === null || value === "")
      return "Invalid email address.";
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value) ? null : "Invalid email address.";
  },
  string: () => (value) => value === void 0 || value === null || typeof value === "string" ? null : "The field must be a string.",
  numeric: () => (value) => value === void 0 || value === null || typeof value === "number" || !Number.isNaN(Number(value)) ? null : "The field must be numeric.",
  integer: () => (value) => Number.isInteger(Number(value)) ? null : "The field must be an integer.",
  boolean: () => (value) => value === void 0 || value === null || typeof value === "boolean" || value === 0 || value === 1 ? null : "The field must be boolean.",
  min: (minLen) => (value) => {
    if (value === void 0 || value === null)
      return `Must be at least ${minLen} characters.`;
    if (typeof value === "string" || Array.isArray(value)) {
      return value.length >= Number(minLen) ? null : `Must be at least ${minLen} characters.`;
    }
    if (!Number.isNaN(Number(value))) {
      return Number(value) >= Number(minLen) ? null : `Must be at least ${minLen}.`;
    }
    return `Must be at least ${minLen}.`;
  },
  max: (maxLen) => (value) => {
    if (value === void 0 || value === null)
      return null;
    if (typeof value === "string" || Array.isArray(value)) {
      return value.length <= Number(maxLen) ? null : `Must be no more than ${maxLen} characters.`;
    }
    if (!Number.isNaN(Number(value))) {
      return Number(value) <= Number(maxLen) ? null : `Must be no more than ${maxLen}.`;
    }
    return null;
  },
  between: (minVal, maxVal) => (value) => {
    if (value === void 0 || value === null)
      return null;
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
  confirmed: (field) => (value, data) => {
    const confirmedField = `${field}_confirmation`;
    if (!data)
      return `Fields do not match.`;
    return data[confirmedField] === value ? null : "Fields do not match.";
  },
  same: (otherField) => (value, data) => {
    if (!data)
      return "Fields do not match.";
    return data[otherField] === value ? null : "Fields do not match.";
  },
  regex: (pattern) => (value) => {
    if (value === void 0 || value === null)
      return null;
    const re = new RegExp(pattern);
    return re.test(String(value)) ? null : "Invalid format.";
  },
  url: () => (value) => {
    if (!value)
      return null;
    try {
      new URL(String(value));
      return null;
    } catch {
      return "Invalid URL.";
    }
  },
  date: () => (value) => {
    if (!value)
      return null;
    const d = Date.parse(String(value));
    return !Number.isNaN(d) ? null : "Invalid date.";
  },
  after: (dateOrField) => (value, data) => {
    if (!value)
      return null;
    const candidate = Date.parse(String(value));
    if (!Number.isNaN(candidate)) {
      const compare = Date.parse(String(dateOrField));
      if (!Number.isNaN(compare))
        return candidate > compare ? null : `Date must be after ${dateOrField}.`;
      return null;
    }
    if (data && data[dateOrField]) {
      const other = Date.parse(String(data[dateOrField]));
      return candidate > other ? null : `Date must be after ${dateOrField}.`;
    }
    return "Invalid date.";
  },
  before: (dateOrField) => (value, data) => {
    if (!value)
      return null;
    const candidate = Date.parse(String(value));
    if (!Number.isNaN(candidate)) {
      const compare = Date.parse(String(dateOrField));
      if (!Number.isNaN(compare))
        return candidate < compare ? null : `Date must be before ${dateOrField}.`;
      return null;
    }
    if (data && data[dateOrField]) {
      const other = Date.parse(String(data[dateOrField]));
      return candidate < other ? null : `Date must be before ${dateOrField}.`;
    }
    return "Invalid date.";
  },
  alpha: () => (value) => !value || /^[A-Za-z]+$/.test(String(value)) ? null : "Only alphabetic characters allowed.",
  alpha_num: () => (value) => !value || /^[A-Za-z0-9]+$/.test(String(value)) ? null : "Only alphanumeric characters allowed.",
  in: (...list) => (value) => list.includes(String(value)) ? null : `Value must be one of: ${list.join(", ")}.`,
  not_in: (...list) => (value) => !list.includes(String(value)) ? null : `Invalid value.`,
  size: (expected) => (value) => {
    if (typeof value === "string" || Array.isArray(value)) {
      return value.length === Number(expected) ? null : `Length must be ${expected}.`;
    }
    if (!Number.isNaN(Number(value))) {
      return Number(value) === Number(expected) ? null : `Value must be ${expected}.`;
    }
    return `Value must be ${expected}.`;
  },
  digits: (count) => (value) => /^\d+$/.test(String(value)) && String(value).length === Number(count) ? null : `Must be ${count} digits.`,
  digits_between: (minD, maxD) => (value) => {
    if (!/^\d+$/.test(String(value)))
      return "Must be digits.";
    const l = String(value).length;
    return l >= Number(minD) && l <= Number(maxD) ? null : `Digits length must be between ${minD} and ${maxD}.`;
  },
  starts_with: (...prefixes) => (value) => {
    if (!value)
      return null;
    return prefixes.some((p) => String(value).startsWith(p)) ? null : `Must start with one of: ${prefixes.join(", ")}`;
  },
  ends_with: (...suffixes) => (value) => {
    if (!value)
      return null;
    return suffixes.some((s) => String(value).endsWith(s)) ? null : `Must end with one of: ${suffixes.join(", ")}`;
  }
};
function parseRuleString(ruleStr) {
  if (!ruleStr)
    return [];
  const parts = ruleStr.split("|").map((p) => p.trim()).filter(Boolean);
  const out = [];
  for (const p of parts) {
    const [name, argString] = p.split(":");
    const key = name;
    if (!ruleNames.includes(key)) {
      out.push({ name: key, args: argString ? argString.split(",") : [] });
      continue;
    }
    const args = argString ? argString.split(",").map((a) => a.trim()) : [];
    out.push({ name: key, args });
  }
  return out;
}

// src/validator.ts
function buildValidators(ruleDef, fieldName) {
  const validators = [];
  if (Array.isArray(ruleDef)) {
    for (const r of ruleDef) {
      if (typeof r === "string") {
        validators.push(...buildValidatorsFromString(r, fieldName));
      } else if (typeof r === "function") {
        validators.push(r);
      }
    }
  } else if (typeof ruleDef === "string") {
    validators.push(...buildValidatorsFromString(ruleDef, fieldName));
  }
  return validators;
}
function buildValidatorsFromString(ruleStr, fieldName) {
  const parsed = parseRuleString(ruleStr);
  const validators = [];
  for (const p of parsed) {
    const name = p.name;
    const args = p.args || [];
    if (name in predefinedRules) {
      if (name === "confirmed") {
        validators.push(predefinedRules.confirmed(fieldName || ""));
      } else if (name === "same" && args[0]) {
        validators.push(predefinedRules.same(args[0]));
      } else {
        const maybeNums = args.map((a) => a !== void 0 && a !== null && !isNaN(Number(a)) ? Number(a) : a);
        validators.push(predefinedRules[name](...maybeNums));
      }
    } else {
      if (name === "in") {
        validators.push(predefinedRules.in(...args));
      } else if (name === "not_in") {
        validators.push(predefinedRules.not_in(...args));
      } else {
      }
    }
  }
  return validators;
}
function validateField(fieldName, value, allData, ruleDef) {
  if (!ruleDef)
    return null;
  const validators = buildValidators(ruleDef, String(fieldName));
  const hasNullable = Array.isArray(ruleDef) ? ruleDef.some((r) => typeof r === "string" ? r.split("|").includes("nullable") : false) : typeof ruleDef === "string" && ruleDef.split("|").includes("nullable");
  const empty = value === void 0 || value === null || typeof value === "string" && value.trim() === "" || Array.isArray(value) && value.length === 0;
  if (empty && hasNullable) {
    return null;
  }
  for (const validator of validators) {
    const err = validator(value, allData);
    if (err)
      return err;
  }
  return null;
}
function validateAll(data, rules) {
  const errors = {};
  let valid = true;
  for (const key in rules) {
    const ruleDef = rules[key];
    const err = validateField(key, data[key], data, ruleDef);
    if (err) {
      valid = false;
      errors[key] = err;
    } else {
      errors[key] = null;
    }
  }
  return { valid, errors };
}

export {
  ruleNames,
  predefinedRules,
  parseRuleString,
  validateField,
  validateAll
};
//# sourceMappingURL=chunk-HRE7OZBP.mjs.map