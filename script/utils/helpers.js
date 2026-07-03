/**
 * Helper Utilities
 * General utility functions used across the application
 */

/**
 * Count distinct elements in an array
 * @param {Array} arr - Array to count distinct elements from
 * @returns {number} - Number of distinct elements
 */
export function countDistinct(arr) {
  return new Set(arr).size;
}

/**
 * Parse reference string into array
 * @param {string} refString - Space-separated reference string
 * @returns {Array} - Array of page references
 */
export function parseReferenceString(refString) {
  return refString.trim().split(/\s+/g).filter(s => s.length > 0);
}

/**
 * Calculate performance metrics
 * @param {Array} pageFaults - Array of page fault indicators (1 or 0)
 * @param {number} totalReferences - Total number of references
 * @returns {Object} - Metrics object
 */
export function calculateMetrics(pageFaults, totalReferences) {
  const numberOfMisses = pageFaults.reduce((acc, curr) => acc + curr, 0);
  const numberOfHits = totalReferences - numberOfMisses;
  const hitRate = (numberOfHits / totalReferences).toFixed(3);
  const missRate = (numberOfMisses / totalReferences).toFixed(3);
  
  return {
    hits: numberOfHits,
    misses: numberOfMisses,
    hitRate: hitRate,
    missRate: missRate,
    hitPercentage: (parseFloat(hitRate) * 100).toFixed(1),
    missPercentage: (parseFloat(missRate) * 100).toFixed(1)
  };
}

/**
 * Debounce function to limit rate of function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Detect if device is mobile
 * @returns {boolean}
 */
export function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
    || window.innerWidth <= 768;
}

/**
 * Detect if device has low performance
 * @returns {boolean}
 */
export function isLowPerformanceDevice() {
  return navigator.hardwareConcurrency < 2;
}

/**
 * Format date for filenames
 * @returns {string} - Formatted timestamp
 */
export function getFormattedTimestamp() {
  return new Date().toISOString().slice(0, 19).replace(/:/g, '-');
}

/**
 * Smooth scroll to element
 * @param {HTMLElement} element - Element to scroll to
 * @param {string} block - Scroll position ('start', 'center', 'end')
 */
export function smoothScrollTo(element, block = 'start') {
  if (element) {
    element.scrollIntoView({ 
      behavior: 'smooth', 
      block: block 
    });
  }
}
