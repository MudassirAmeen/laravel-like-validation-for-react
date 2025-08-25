import { validateField, validateAll } from "../src/validator";
import { expect, test } from "vitest";

test("required rule fails on empty", () => {
  const rules = { name: "required" } as any;
  const { valid, errors } = validateAll({ name: "" }, rules);
  expect(valid).toBe(false);
  expect(errors.name).toBeTruthy();
});
