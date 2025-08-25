/**
 * This is custom validation library that provides flexibility just like laravel validations.
 * @author Mudassir Ameen
 */
type ValidationRule = (value: any, data?: Record<string, any>) => string | null;
type RuleParsed = {
    name: RuleName;
    args?: any[];
};
declare const ruleNames: readonly ["required", "nullable", "email", "string", "numeric", "integer", "boolean", "min", "max", "between", "confirmed", "same", "regex", "url", "date", "after", "before", "alpha", "alpha_num", "in", "not_in", "size", "digits", "digits_between", "starts_with", "ends_with"];
type RuleName = typeof ruleNames[number];
/**
 * predefinedRules: map of ruleName => factory that returns ValidationRule.
 * Har function k return value aik function hai jo value or data pass kar kay error ya null return karti hai.
 */
declare const predefinedRules: Record<RuleName, (...args: any[]) => ValidationRule>;
/**
 * parseRuleString - parse laravel style rule string into RuleParsed array.
 * Example: "required|min:8|email|in:admin,user,guest"
 */
declare function parseRuleString(ruleStr: string): RuleParsed[];

/**
 * Types
 */
type RulesDefinition<T extends Record<string, any>> = Partial<Record<keyof T, string | string[] | ((value: any, data?: Record<string, any>) => string | null)[]>>;
type Errors<T> = Partial<Record<keyof T, string | null>>;
/**
 * validateField - validate a single field value against ruleDef
 * Handles 'nullable' - if a value is empty and nullable present, skip other checks.
 */
declare function validateField<T extends Record<string, any>>(fieldName: keyof T, value: any, allData: T, ruleDef?: string | string[] | ((value: any, data?: Record<string, any>) => string | null)[]): string | null;
/**
 * validateAll - validate entire data object against rules map.
 * returns { valid, errors }
 */
declare function validateAll<T extends Record<string, any>>(data: T, rules: RulesDefinition<T>): {
    valid: boolean;
    errors: Errors<T>;
};

export { Errors, RuleName, RuleParsed, RulesDefinition, ValidationRule, parseRuleString, predefinedRules, ruleNames, validateAll, validateField };
