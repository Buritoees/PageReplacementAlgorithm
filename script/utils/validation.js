/**
 * Validation Utilities
 * Handles all form validation logic
 */

/**
 * Validate reference string format
 * @param {string} value - The reference string to validate
 * @returns {Object} - { isValid: boolean, error: string }
 */
export function validateReferenceString(value) {
  const trimmedValue = value.trim();
  
  if (trimmedValue === '') {
    return {
      isValid: false,
      error: 'Reference string is required. Please enter page numbers or letters.'
    };
  }
  
  // Accept both numbers and letters, separated by spaces
  if (!/^[A-Za-z0-9\s]+$/.test(trimmedValue)) {
    return {
      isValid: false,
      error: 'Reference string must contain only letters (A-Z) or numbers (0-9), separated by spaces.'
    };
  }
  
  // Check if there are actual references
  const refs = trimmedValue.split(/\s+/g).filter(s => s.length > 0);
  if (refs.length === 0) {
    return {
      isValid: false,
      error: 'Reference string must contain at least one page reference.'
    };
  }
  
  return { isValid: true, error: '' };
}

/**
 * Validate frame number
 * @param {number} value - The number of frames
 * @returns {Object} - { isValid: boolean, value: number }
 */
export function validateFrameNumber(value) {
  const numValue = parseInt(value);
  
  if (isNaN(numValue) || numValue < 1) {
    return { isValid: false, value: 1 };
  }
  
  return { isValid: true, value: numValue };
}

/**
 * Validate algorithm selection
 * @param {string} algorithm - The selected algorithm
 * @returns {boolean}
 */
export function validateAlgorithm(algorithm) {
  return ['fifo', 'lru'].includes(algorithm.toLowerCase());
}

/**
 * Validate image file
 * @param {File} file - The uploaded file
 * @returns {Object} - { isValid: boolean, error: string }
 */
export function validateImageFile(file) {
  if (!file) {
    return { isValid: false, error: 'No file selected.' };
  }
  
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'Please upload a valid image file.' };
  }
  
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 10MB.' };
  }
  
  return { isValid: true, error: '' };
}
