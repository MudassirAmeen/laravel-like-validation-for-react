# @ameen-nexus/validator

A Laravel-inspired validation library for React with TypeScript support, providing both core validation utilities and React hooks for form management.

---

## Installation

```bash
npm install @ameen-nexus/validator
```

---

## Features

- 🚀 **Laravel-style validation rules**
- 📝 **TypeScript support**
- ⚛️ **React hooks integration**
- 🔄 **Automatic dependency tracking between fields**
- 🌐 **Axios integration for form submissions**
- 🎯 **Built-in validation rules + custom rule support**

---

## Quick Start

### Core Validation

```typescript
import { validateAll } from '@ameen-nexus/validator';

const data = { email: 'test@example.com', password: 'secret' };
const rules = {
  email: 'required|email',
  password: 'required|min:8'
};

const { valid, errors } = validateAll(data, rules);
```

### React Hook Usage

```tsx
import { useForm } from '@ameen-nexus/validator/react';

const MyForm = () => {
  const { data, setField, errors, post } = useForm(
    { email: '', password: '' },
    {
      email: 'required|email',
      password: 'required|min:8|confirmed'
    }
  );

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      post('/api/register');
    }}>
      <input
        value={data.email}
        onChange={(e) => setField('email', e.target.value)}
      />
      {errors.email && <span>{errors.email}</span>}

      <input
        type="password"
        value={data.password}
        onChange={(e) => setField('password', e.target.value)}
      />

      <input
        type="password"
        placeholder="Confirm Password"
        onChange={(e) => setField('password_confirmation', e.target.value)}
      />
      {errors.password && <span>{errors.password}</span>}

      <button type="submit">Register</button>
    </form>
  );
};
```

---

## Available Rules

- `required` - Field must be present
- `email` - Valid email format
- `min:X` - Minimum length/value
- `max:X` - Maximum length/value
- `confirmed` - Field must have matching confirmation field
- `same:field` - Match another field's value
- `numeric` - Must be numeric
- `boolean` - Must be boolean
- `in:a,b,c` - Must be in given list
- `regex:pattern` - Match regex pattern

> And many more...

---

## API Reference

### `useForm` Hook

```typescript
const {
  data,           // Form data object
  setField,       // Update single field
  setData,        // Update multiple fields
  errors,         // Validation errors
  validateField,  // Validate single field
  validate,       // Validate all fields
  post,           // Submit via POST
  get,            // Submit via GET
  put,            // Submit via PUT
  patch,          // Submit via PATCH
  delete: del,    // Submit via DELETE
  reset,          // Reset form values
  processing      // Submission state
} = useForm(initialValues, validationRules);
```

### Core Validation

```typescript
import { validateAll, validateField } from '@ameen-nexus/validator';

// Validate entire object
validateAll(data, rules);

// Validate single field
validateField('email', 'test@example.com', data, 'required|email');
```

---

## Validation Rules Syntax

Rules can be specified as:

- **String** with pipe-separated rules: `'required|email|min:8'`
- **Array** of rule strings: `['required', 'email', 'min:8']`
- **Array** of custom validation functions

---

## Examples

### Custom Validation

```typescript
const rules = {
  username: [
    'required',
    'min:3',
    (value) => value.includes('admin') ? 'Cannot contain admin' : null
  ]
};
```

### Form Submission

```typescript
const { post } = useForm(/* ... */);

const handleSubmit = async () => {
  try {
    await post('/api/submit', {
      onSuccess: (response) => console.log('Success!'),
      onError: (error) => console.error('Error!')
    });
  } catch (error) {
    if (error.validation) {
      console.log('Validation errors:', error.errors);
    }
  }
};
```

---

## License


MIT License

Copyright (c) 2025 AmeenNexus

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
