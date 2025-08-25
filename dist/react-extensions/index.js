"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/react-extensions/index.ts
var react_extensions_exports = {};
__export(react_extensions_exports, {
  useForm: () => useForm
});
module.exports = __toCommonJS(react_extensions_exports);

// src/react-extensions/useForm.tsx
var import_react = require("react");
var import_axios = __toESM(require("axios"));

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

// src/react-extensions/useForm.tsx
function useForm(initialValues, rules) {
  const [data, setData] = (0, import_react.useState)(initialValues);
  const [errors, setErrors] = (0, import_react.useState)({});
  const [processing, setProcessing] = (0, import_react.useState)(false);
  const dependentsMap = (0, import_react.useMemo)(() => {
    const map = /* @__PURE__ */ new Map();
    if (!rules)
      return map;
    const add = (base, dep) => {
      if (!map.has(base))
        map.set(base, /* @__PURE__ */ new Set());
      map.get(base).add(dep);
    };
    for (const key in rules) {
      const field = key;
      const def = rules[field];
      const list = Array.isArray(def) ? def : [def];
      for (const item of list) {
        if (typeof item === "string") {
          const tokens = parseRuleString(item);
          for (const t of tokens) {
            if (t.name === "same" && t.args?.[0]) {
              add(t.args[0], field);
            }
            if ((t.name === "after" || t.name === "before") && t.args?.[0]) {
              add(t.args[0], field);
            }
          }
        }
      }
    }
    return map;
  }, [rules]);
  const setField = (0, import_react.useCallback)((key, value) => {
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);
  const setMultiple = (0, import_react.useCallback)((obj) => {
    setData((prev) => ({ ...prev, ...obj }));
  }, []);
  const validateField2 = (0, import_react.useCallback)(
    (field, valueOverride) => {
      if (!rules)
        return null;
      const ruleDef = rules[field];
      const nextData = valueOverride !== void 0 ? { ...data, [field]: valueOverride } : data;
      const valueToUse = valueOverride !== void 0 ? valueOverride : data[field];
      const err = validateField(field, valueToUse, nextData, ruleDef);
      setErrors((prev) => ({ ...prev, [field]: err }));
      const deps = dependentsMap.get(field);
      if (deps && deps.size > 0) {
        const updated = {};
        deps.forEach((depField) => {
          const depDef = rules[depField];
          const depErr = validateField(depField, nextData[depField], nextData, depDef);
          updated[depField] = depErr;
        });
        setErrors((prev) => ({ ...prev, ...updated }));
      }
      return err;
    },
    [data, rules, dependentsMap]
  );
  const validate = (0, import_react.useCallback)(() => {
    if (!rules)
      return { valid: true, errors: {} };
    const { valid, errors: v } = validateAll(data, rules);
    setErrors(v);
    return { valid, errors: v };
  }, [data, rules]);
  async function submit(method, url, config) {
    if (processing)
      return Promise.reject(new Error("Already processing"));
    const validateBefore = config?.validateBeforeSubmit ?? true;
    if (validateBefore && rules) {
      const { valid, errors: validationErrors } = validate();
      if (!valid) {
        setErrors(validationErrors);
        return Promise.reject({ validation: true, errors: validationErrors });
      }
    }
    setProcessing(true);
    try {
      const axiosConfig = { method, url, ...config };
      if (method && ["get", "delete"].includes(method.toLowerCase())) {
        axiosConfig.params = data;
      } else {
        axiosConfig.data = data;
      }
      const response = await (0, import_axios.default)(axiosConfig);
      setProcessing(false);
      setErrors({});
      if (config?.onSuccess)
        config.onSuccess(response);
      return response;
    } catch (err) {
      setProcessing(false);
      if (err?.response?.data?.errors) {
        const serverErrors = err.response.data.errors;
        const normalized = {};
        for (const k in serverErrors) {
          normalized[k] = Array.isArray(serverErrors[k]) ? serverErrors[k][0] : serverErrors[k];
        }
        setErrors(normalized);
      }
      if (config?.onError)
        config.onError(err);
      throw err;
    }
  }
  const get = (url, config) => submit("get", url, config);
  const post = (url, config) => submit("post", url, config);
  const put = (url, config) => submit("put", url, config);
  const patch = (url, config) => submit("patch", url, config);
  const del = (url, config) => submit("delete", url, config);
  const reset = (keys) => {
    if (!keys) {
      setData(initialValues);
      setErrors({});
      return;
    }
    setData((prev) => {
      const copy = { ...prev };
      for (const k of keys)
        copy[k] = initialValues[k];
      return copy;
    });
    setErrors((prev) => {
      const copy = { ...prev };
      for (const k of keys)
        copy[k] = null;
      return copy;
    });
  };
  return {
    data,
    setData: setMultiple,
    setField,
    errors,
    setErrors,
    processing,
    validateField: validateField2,
    // <-- updated signature (valueOverride?)
    validate,
    get,
    post,
    put,
    patch,
    delete: del,
    reset
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  useForm
});
//# sourceMappingURL=index.js.map