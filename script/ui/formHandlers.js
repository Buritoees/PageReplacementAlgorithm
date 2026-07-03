/**
 * Form Handlers
 * Handles all form interactions and UI controls
 */

import { validateReferenceString, validateFrameNumber } from '../utils/validation.js';

/**
 * Setup algorithm selection handlers
 * @param {Object} elements - DOM elements
 * @param {Object} state - Application state
 */
export function setupAlgorithmSelection(elements, state) {
  elements.algorithmCards.forEach(card => {
    card.addEventListener('click', () => selectAlgorithm(card.dataset.algorithm, elements, state));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectAlgorithm(card.dataset.algorithm, elements, state);
      }
    });
  });
}

/**
 * Select an algorithm
 * @param {string} algorithm - Algorithm to select
 * @param {Object} elements - DOM elements
 * @param {Object} state - Application state
 */
function selectAlgorithm(algorithm, elements, state) {
  state.selectedAlgorithm = algorithm;
  elements.algorithmInput.value = algorithm;
  
  // Update UI
  elements.algorithmCards.forEach(card => {
    const isSelected = card.dataset.algorithm === algorithm;
    card.classList.toggle('active', isSelected);
    card.setAttribute('aria-pressed', isSelected);
    
    // Update badge
    const existingBadge = card.querySelector('.algorithm-badge');
    if (existingBadge) existingBadge.remove();
    
    if (isSelected) {
      const badge = document.createElement('span');
      badge.className = 'algorithm-badge';
      badge.textContent = 'Selected';
      card.appendChild(badge);
    }
  });
}

/**
 * Setup frame counter handlers
 * @param {Object} elements - DOM elements
 */
export function setupFrameCounter(elements) {
  elements.increaseFrames?.addEventListener('click', () => updateFrameCount(1, elements));
  elements.decreaseFrames?.addEventListener('click', () => updateFrameCount(-1, elements));
  elements.numFrames?.addEventListener('change', () => validateAndUpdateFrameNumber(elements));
  elements.numFrames?.addEventListener('blur', () => validateAndUpdateFrameNumber(elements));
}

/**
 * Update frame count
 * @param {number} delta - Amount to change frame count
 * @param {Object} elements - DOM elements
 */
function updateFrameCount(delta, elements) {
  const current = parseInt(elements.numFrames.value) || 3;
  const newValue = Math.max(1, current + delta);
  elements.numFrames.value = newValue;
}

/**
 * Validate and update frame number
 * @param {Object} elements - DOM elements
 */
function validateAndUpdateFrameNumber(elements) {
  const result = validateFrameNumber(elements.numFrames.value);
  if (!result.isValid) {
    elements.numFrames.value = result.value;
  }
}

/**
 * Setup reference string validation
 * @param {Object} elements - DOM elements
 */
export function setupReferenceStringValidation(elements) {
  elements.refString?.addEventListener('input', () => {
    if (elements.refString.value.trim()) {
      const result = validateReferenceString(elements.refString.value);
      if (!result.isValid) {
        elements.refError.textContent = result.error;
        elements.refError.classList.remove('hidden');
      } else {
        elements.refError.classList.add('hidden');
      }
    }
  });
}

/**
 * Setup sample buttons
 * @param {Object} elements - DOM elements
 */
export function setupSampleButtons(elements) {
  elements.sampleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.refString.value = btn.dataset.sample;
      elements.refString.focus();
      elements.refError.classList.add('hidden');
    });
  });
}

/**
 * Reset form to default state
 * @param {Object} elements - DOM elements
 * @param {Function} disableDownload - Callback to disable download button
 */
export function handleReset(elements, disableDownload) {
  elements.refString.value = '';
  elements.numFrames.value = 3;
  elements.refError.classList.add('hidden');
  elements.resultsSection.classList.add('hidden');
  disableDownload();
}

/**
 * Setup keyboard shortcuts
 * @param {Object} elements - DOM elements
 */
export function setupKeyboardShortcuts(elements) {
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      elements.form?.requestSubmit();
    }
  });
}
