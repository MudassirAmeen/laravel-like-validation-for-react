import {
  parseRuleString,
  validateAll,
  validateField
} from "../chunk-HRE7OZBP.mjs";

// src/react-extensions/useForm.tsx
import { useState, useCallback, useMemo } from "react";
import axios from "axios";
function useForm(initialValues, rules) {
  const [data, setData] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const dependentsMap = useMemo(() => {
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
  const setField = useCallback((key, value) => {
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);
  const setMultiple = useCallback((obj) => {
    setData((prev) => ({ ...prev, ...obj }));
  }, []);
  const validateField2 = useCallback(
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
  const validate = useCallback(() => {
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
      const response = await axios(axiosConfig);
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
export {
  useForm
};
//# sourceMappingURL=index.mjs.map