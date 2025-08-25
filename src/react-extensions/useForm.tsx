import { useState, useCallback, useMemo } from "react";
import axios, { AxiosRequestConfig } from "axios";
import { validateAll, validateField as coreValidateField } from "../validator";
import { parseRuleString } from "../rules";

export type SubmitOptions = AxiosRequestConfig & {
  validateBeforeSubmit?: boolean;
  onSuccess?: (resp: any) => void;
  onError?: (err: any) => void;
};

export function useForm<T extends Record<string, any>>(
  initialValues: T,
  rules?: Partial<Record<keyof T, string | string[] | ((v:any,d?:any)=>string|null)[]>>
) {
  const [data, setData] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string | null>>>({});
  const [processing, setProcessing] = useState(false);

  // --- Build reverse dependency map: if fieldB has "same:fieldA" etc.,
  // then fieldA change -> revalidate fieldB automatically.
  const dependentsMap = useMemo(() => {
    const map = new Map<keyof T, Set<keyof T>>();
    if (!rules) return map;

    const add = (base: keyof T, dep: keyof T) => {
      if (!map.has(base)) map.set(base, new Set());
      map.get(base)!.add(dep);
    };

    for (const key in rules) {
      const field = key as keyof T;
      const def = rules[field];
      const list = Array.isArray(def) ? def : [def];

      for (const item of list) {
        if (typeof item === "string") {
          const tokens = parseRuleString(item);
          for (const t of tokens) {
            // Roman Urdu: "same:password" ka matlab yeh field (confirmation) depends on password.
            if (t.name === "same" && t.args?.[0]) {
              add(t.args[0] as keyof T, field);
            }
            // Optional: date dependencies
            if ((t.name === "after" || t.name === "before") && t.args?.[0]) {
              add(t.args[0] as keyof T, field);
            }
            // Note: Laravel "confirmed" UI-wise hum error confirmation field par dikhana chahtay hain,
            // isliye recommend "same:password" ko confirmation field par lagana (neeche usage).
          }
        }
      }
    }
    return map;
  }, [rules]);

  const setField = useCallback((key: keyof T, value: any) => {
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setMultiple = useCallback((obj: Partial<T>) => {
    setData((prev) => ({ ...prev, ...obj }));
  }, []);

  // ✅ New: validateField that accepts an optional value override to avoid stale state.
  const validateField = useCallback(
    (field: keyof T, valueOverride?: any) => {
      if (!rules) return null;
      const ruleDef = rules[field];

      // nextData banayein taa ke latest ke sath validate ho
      const nextData = (valueOverride !== undefined)
        ? ({ ...data, [field]: valueOverride } as T)
        : data;

      const valueToUse = (valueOverride !== undefined) ? valueOverride : (data as any)[field];

      const err = coreValidateField(field, valueToUse, nextData, ruleDef as any);

      setErrors((prev) => ({ ...(prev as any), [field]: err }));

      // 🔄 Auto-revalidate dependents (e.g., password change -> recheck password_confirmation)
      const deps = dependentsMap.get(field);
      if (deps && deps.size > 0) {
        const updated: Partial<Record<keyof T, string | null>> = {};
        deps.forEach((depField) => {
          const depDef = rules[depField];
          const depErr = coreValidateField(depField, (nextData as any)[depField], nextData, depDef as any);
          updated[depField] = depErr;
        });
        setErrors((prev) => ({ ...(prev as any), ...updated }));
      }

      return err;
    },
    [data, rules, dependentsMap]
  );

  const validate = useCallback(() => {
    if (!rules) return { valid: true, errors: {} as any };
    const { valid, errors: v } = validateAll(data, rules as any);
    setErrors(v as any);
    return { valid, errors: v };
  }, [data, rules]);

  async function submit(method: AxiosRequestConfig["method"], url: string, config?: SubmitOptions) {
    if (processing) return Promise.reject(new Error("Already processing"));

    const validateBefore = config?.validateBeforeSubmit ?? true;
    if (validateBefore && rules) {
      const { valid, errors: validationErrors } = validate();
      if (!valid) {
        setErrors(validationErrors as any);
        return Promise.reject({ validation: true, errors: validationErrors });
      }
    }

    setProcessing(true);
    try {
      const axiosConfig: AxiosRequestConfig = { method, url, ...config };
      if (method && ["get", "delete"].includes((method as string).toLowerCase())) {
        axiosConfig.params = data;
      } else {
        axiosConfig.data = data;
      }
      const response = await axios(axiosConfig);
      setProcessing(false);
      setErrors({} as any);
      if (config?.onSuccess) config.onSuccess(response);
      return response;
    } catch (err: any) {
      setProcessing(false);
      if (err?.response?.data?.errors) {
        const serverErrors = err.response.data.errors;
        const normalized: Partial<Record<keyof T, string | null>> = {};
        for (const k in serverErrors) {
          normalized[k as keyof T] = Array.isArray(serverErrors[k]) ? serverErrors[k][0] : serverErrors[k];
        }
        setErrors(normalized as any);
      }
      if (config?.onError) config.onError(err);
      throw err;
    }
  }

  const get = (url: string, config?: SubmitOptions) => submit("get", url, config);
  const post = (url: string, config?: SubmitOptions) => submit("post", url, config);
  const put = (url: string, config?: SubmitOptions) => submit("put", url, config);
  const patch = (url: string, config?: SubmitOptions) => submit("patch", url, config);
  const del = (url: string, config?: SubmitOptions) => submit("delete", url, config);

  const reset = (keys?: (keyof T)[]) => {
    if (!keys) {
      setData(initialValues);
      setErrors({} as any);
      return;
    }
    setData((prev) => {
      const copy = { ...prev };
      for (const k of keys) copy[k as keyof T] = (initialValues as any)[k];
      return copy;
    });
    setErrors((prev) => {
      const copy = { ...(prev as any) };
      for (const k of keys) (copy as any)[k] = null;
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
    validateField,     // <-- updated signature (valueOverride?)
    validate,
    get,
    post,
    put,
    patch,
    delete: del,
    reset,
  };
}
