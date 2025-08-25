import * as axios from 'axios';
import { AxiosRequestConfig } from 'axios';
import * as react from 'react';

type SubmitOptions = AxiosRequestConfig & {
    validateBeforeSubmit?: boolean;
    onSuccess?: (resp: any) => void;
    onError?: (err: any) => void;
};
declare function useForm<T extends Record<string, any>>(initialValues: T, rules?: Partial<Record<keyof T, string | string[] | ((v: any, d?: any) => string | null)[]>>): {
    data: T;
    setData: (obj: Partial<T>) => void;
    setField: (key: keyof T, value: any) => void;
    errors: Partial<Record<keyof T, string | null>>;
    setErrors: react.Dispatch<react.SetStateAction<Partial<Record<keyof T, string | null>>>>;
    processing: boolean;
    validateField: (field: keyof T, valueOverride?: any) => string | null;
    validate: () => {
        valid: boolean;
        errors: any;
    };
    get: (url: string, config?: SubmitOptions) => Promise<axios.AxiosResponse<any, any>>;
    post: (url: string, config?: SubmitOptions) => Promise<axios.AxiosResponse<any, any>>;
    put: (url: string, config?: SubmitOptions) => Promise<axios.AxiosResponse<any, any>>;
    patch: (url: string, config?: SubmitOptions) => Promise<axios.AxiosResponse<any, any>>;
    delete: (url: string, config?: SubmitOptions) => Promise<axios.AxiosResponse<any, any>>;
    reset: (keys?: (keyof T)[]) => void;
};

export { SubmitOptions, useForm };
