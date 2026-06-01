export type ValidationResult = {
    isValid: boolean;
    errors: string[];
  };
  
  export function createValidationResult(errors: string[]): ValidationResult {
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  
  export function isRequired(value: unknown): boolean {
    if (typeof value === "string") {
      return value.trim().length > 0;
    }
  
    return value !== null && value !== undefined;
  }