import { useState, useCallback } from 'react';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
}

interface ValidationRules {
  [fieldName: string]: ValidationRule;
}

interface ValidationErrors {
  [fieldName: string]: string;
}

interface ValidationState {
  [fieldName: string]: boolean;
}

export const useFormValidation = (rules: ValidationRules) => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<ValidationState>({});
  const [submitted, setSubmitted] = useState(false);

  const validateField = useCallback((fieldName: string, value: any): boolean => {
    const rule = rules[fieldName];
    if (!rule) return true;

    // Required validation
    if (rule.required) {
      if (value === undefined || value === null || value === '' || 
          (typeof value === 'number' && fieldName !== 'requestType' && value === 0) ||
          (Array.isArray(value) && value.length === 0)) {
        setErrors(prev => ({ ...prev, [fieldName]: 'این فیلد الزامی است' }));
        return false;
      }
    }

    // String validations
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        setErrors(prev => ({ ...prev, [fieldName]: `حداقل ${rule.minLength} کاراکتر وارد کنید` }));
        return false;
      }
      
      if (rule.maxLength && value.length > rule.maxLength) {
        setErrors(prev => ({ ...prev, [fieldName]: `حداکثر ${rule.maxLength} کاراکتر مجاز است` }));
        return false;
      }
      
      if (rule.pattern && !rule.pattern.test(value)) {
        setErrors(prev => ({ ...prev, [fieldName]: 'فرمت وارد شده صحیح نیست' }));
        return false;
      }
    }

    // Custom validation
    if (rule.custom && !rule.custom(value)) {
      setErrors(prev => ({ ...prev, [fieldName]: 'مقدار وارد شده معتبر نیست' }));
      return false;
    }

    // Clear error if validation passes
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
    
    return true;
  }, [rules]);

  const validateForm = useCallback((formData: any): boolean => {
    setSubmitted(true);
    let isValid = true;

    Object.keys(rules).forEach(fieldName => {
      const fieldValue = formData[fieldName];
      if (!validateField(fieldName, fieldValue)) {
        isValid = false;
      }
    });

    return isValid;
  }, [rules, validateField]);

  const markFieldTouched = useCallback((fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched({});
    setSubmitted(false);
  }, []);

  const getFieldError = useCallback((fieldName: string): string | undefined => {
    return errors[fieldName];
  }, [errors]);

  const hasFieldError = useCallback((fieldName: string): boolean => {
    return !!(errors[fieldName] && (touched[fieldName] || submitted));
  }, [errors, touched, submitted]);

  const getFieldStyle = useCallback((baseStyle: any, fieldName: string) => {
    const hasError = hasFieldError(fieldName);
    return {
      ...baseStyle,
      border: hasError ? '1px solid #ff4757' : baseStyle.border,
      boxShadow: hasError ? '0 0 0 1px #ff4757' : 'none'
    };
  }, [hasFieldError]);

  return {
    errors,
    touched,
    submitted,
    validateField,
    validateForm,
    markFieldTouched,
    clearErrors,
    getFieldError,
    hasFieldError,
    getFieldStyle
  };
};

export default useFormValidation;