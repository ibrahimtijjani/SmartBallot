import { useState, useCallback } from 'react';
import { 
  validateElectionForm, 
  sanitizeInput 
} from '../utils/validation';
import type { 
  ElectionFormData, 
  FormErrors
} from '../utils/validation';

export interface UseFormValidationReturn {
  errors: FormErrors;
  isValid: boolean;
  validateField: (fieldName: keyof ElectionFormData, value: any) => boolean;
  validateForm: (formData: ElectionFormData) => boolean;
  clearErrors: () => void;
  sanitizeAndSet: (value: string) => string;
}

/**
 * Custom hook for form validation with real-time feedback
 */
export const useFormValidation = (): UseFormValidationReturn => {
  const [errors, setErrors] = useState<FormErrors>({});

  const validateField = useCallback((fieldName: keyof ElectionFormData, value: any): boolean => {
    const tempFormData: ElectionFormData = {
      question: '',
      options: [],
      startBlockOffset: 1,
      duration: 1,
      [fieldName]: value
    };

    const { errors: fieldErrors } = validateElectionForm(tempFormData);
      setErrors((prev: FormErrors) => ({
      ...prev,
      [fieldName]: fieldErrors[fieldName]
    }));

    return !fieldErrors[fieldName];
  }, []);

  const validateForm = useCallback((formData: ElectionFormData): boolean => {
    const { isValid, errors: formErrors } = validateElectionForm(formData);
    setErrors(formErrors);
    return isValid;
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const sanitizeAndSet = useCallback((value: string): string => {
    return sanitizeInput(value);
  }, []);

  const isValid = Object.keys(errors).length === 0;

  return {
    errors,
    isValid,
    validateField,
    validateForm,
    clearErrors,
    sanitizeAndSet
  };
};
