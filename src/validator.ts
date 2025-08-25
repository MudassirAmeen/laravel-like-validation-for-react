import { ValidationRule, parseRuleString, predefinedRules, RuleParsed, RuleName } from "./rules";

/**
 * Types
 */
export type RulesDefinition<T extends Record<string, any>> = Partial<Record<keyof T, string | string[] | ((value: any, data?: Record<string, any>) => string | null)[]>>;

export type Errors<T> = Partial<Record<keyof T, string | null>>;

/**
 * buildValidatorsFromString - given a field rule string or array, return array of ValidationRule
 */
function buildValidators(ruleDef: string | string[] | ((v:any,d?:any)=>string|null)[], fieldName?: string) {
  const validators: ValidationRule[] = [];
  if (Array.isArray(ruleDef)) {
    // array could be strings or functions
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

function buildValidatorsFromString(ruleStr: string, fieldName?: string) {
  const parsed = parseRuleString(ruleStr);
  const validators: ValidationRule[] = [];
  for (const p of parsed) {
    const name = p.name as RuleName;
    const args = p.args || [];
    if (name in predefinedRules) {
      // special-case 'confirmed' uses fieldName
      if (name === "confirmed") {
        // Laravel: 'confirmed' means field_confirmation must match
        validators.push(predefinedRules.confirmed(fieldName || ""));
      } else if (name === "same" && args[0]) {
        validators.push(predefinedRules.same(args[0]));
      } else {
        // convert numeric args where appropriate
        const maybeNums = args.map((a) => (a !== undefined && a !== null && !isNaN(Number(a)) ? Number(a) : a));
        // @ts-ignore
        validators.push(predefinedRules[name](...maybeNums));
      }
    } else {
      // unknown rule name: we can support `in:` via fallback or regex rule if provided as regex
      if (name === "in") {
        validators.push(predefinedRules.in(...(args as string[])));
      } else if (name === "not_in") {
        validators.push(predefinedRules.not_in(...(args as string[])));
      } else {
        // ignore unknown rule to avoid crash
        // optionally we could warn in dev mode
      }
    }
  }
  return validators;
}

/**
 * validateField - validate a single field value against ruleDef
 * Handles 'nullable' - if a value is empty and nullable present, skip other checks.
 */
export function validateField<T extends Record<string, any>>(
  fieldName: keyof T,
  value: any,
  allData: T,
  ruleDef?: string | string[] | ((value: any, data?: Record<string, any>) => string | null)[]
): string | null {
  if (!ruleDef) return null;
  // If ruleDef is a function array or string, build validators
  const validators = buildValidators(ruleDef as any, String(fieldName));

  // check for 'nullable' present
  const hasNullable = Array.isArray(ruleDef)
    ? (ruleDef as any[]).some((r) => (typeof r === "string" ? r.split("|").includes("nullable") : false))
    : typeof ruleDef === "string" && ruleDef.split("|").includes("nullable");

  // treat empty-ish values
  const empty =
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "") ||
    (Array.isArray(value) && value.length === 0);

  if (empty && hasNullable) {
    return null;
  }

  for (const validator of validators) {
    const err = validator(value, allData);
    if (err) return err;
  }

  return null;
}

/**
 * validateAll - validate entire data object against rules map.
 * returns { valid, errors }
 */
export function validateAll<T extends Record<string, any>>(data: T, rules: RulesDefinition<T>): { valid: boolean; errors: Errors<T> } {
  const errors: Errors<T> = {};
  let valid = true;

  for (const key in rules) {
    const ruleDef = rules[key as keyof T];
    const err = validateField(key as keyof T, (data as any)[key], data, ruleDef as any);
    if (err) {
      valid = false;
      (errors as any)[key] = err;
    } else {
      (errors as any)[key] = null;
    }
  }

  return { valid, errors };
}
