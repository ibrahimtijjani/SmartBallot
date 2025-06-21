/**
 * Validation utilities for form inputs
 */

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export interface ElectionFormData {
  question: string;
  options: string[];
  startBlockOffset: number;
  duration: number;
}

export interface FormErrors {
  question?: string;
  options?: string[];
  startBlockOffset?: string;
  duration?: string;
}

/**
 * Validates election question
 */
export const validateQuestion = (question: string): ValidationResult => {
  const trimmed = question.trim();
  
  if (!trimmed) {
    return { isValid: false, message: 'Election question is required' };
  }
  
  if (trimmed.length < 10) {
    return { isValid: false, message: 'Question must be at least 10 characters long' };
  }
  
  if (trimmed.length > 256) {
    return { isValid: false, message: 'Question must not exceed 256 characters' };
  }
  
  return { isValid: true };
};

/**
 * Validates voting options
 */
export const validateOptions = (options: string[]): ValidationResult => {
  const validOptions = options.filter(opt => opt.trim() !== '');
  
  if (validOptions.length < 2) {
    return { isValid: false, message: 'At least 2 voting options are required' };
  }
  
  if (validOptions.length > 10) {
    return { isValid: false, message: 'Maximum 10 voting options allowed' };
  }
  
  // Check for duplicate options
  const uniqueOptions = new Set(validOptions.map(opt => opt.trim().toLowerCase()));
  if (uniqueOptions.size !== validOptions.length) {
    return { isValid: false, message: 'Voting options must be unique' };
  }
  
  // Check individual option length
  for (const option of validOptions) {
    if (option.trim().length > 64) {
      return { isValid: false, message: 'Each option must not exceed 64 characters' };
    }
    if (option.trim().length < 1) {
      return { isValid: false, message: 'Options cannot be empty' };
    }
  }
  
  return { isValid: true };
};

/**
 * Validates start block offset
 */
export const validateStartBlockOffset = (offset: number): ValidationResult => {
  if (!Number.isInteger(offset) || offset < 1) {
    return { isValid: false, message: 'Start delay must be at least 1 block' };
  }
  
  if (offset > 10000) {
    return { isValid: false, message: 'Start delay cannot exceed 10,000 blocks' };
  }
  
  return { isValid: true };
};

/**
 * Validates duration
 */
export const validateDuration = (duration: number): ValidationResult => {
  if (!Number.isInteger(duration) || duration < 1) {
    return { isValid: false, message: 'Duration must be at least 1 block' };
  }
  
  if (duration > 100000) {
    return { isValid: false, message: 'Duration cannot exceed 100,000 blocks' };
  }
  
  return { isValid: true };
};

/**
 * Validates entire election form
 */
export const validateElectionForm = (formData: ElectionFormData): { 
  isValid: boolean; 
  errors: FormErrors;
} => {
  const errors: FormErrors = {};
  let isValid = true;
  
  // Validate question
  const questionResult = validateQuestion(formData.question);
  if (!questionResult.isValid) {
    errors.question = questionResult.message;
    isValid = false;
  }
  
  // Validate options
  const optionsResult = validateOptions(formData.options);
  if (!optionsResult.isValid) {
    errors.options = [optionsResult.message || 'Invalid options'];
    isValid = false;
  }
  
  // Validate start block offset
  const startBlockResult = validateStartBlockOffset(formData.startBlockOffset);
  if (!startBlockResult.isValid) {
    errors.startBlockOffset = startBlockResult.message;
    isValid = false;
  }
  
  // Validate duration
  const durationResult = validateDuration(formData.duration);
  if (!durationResult.isValid) {
    errors.duration = durationResult.message;
    isValid = false;
  }
  
  return { isValid, errors };
};

/**
 * Sanitizes input to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove basic HTML tags
    .trim()
    .substring(0, 1000); // Limit length
};
