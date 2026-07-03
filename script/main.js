/**
 * Main Application Entry Point
 * Coordinates all modules and initializes the application
 */

// Core functionality
import { runSimulation } from './core/simulationController.js';

// UI modules
import { initThemeToggle } from './ui/theme.js';
import { 
  setupAlgorithmSelection,
  setupFrameCounter,
  setupReferenceStringValidation,
  setupSampleButtons,
  handleReset,
  setupKeyboardShortcuts
} from './ui/formHandlers.js';
import {
  enableDownloadButton,
  disableDownloadButton,
  handleDownload
} from './ui/download.js';
import {
  initScrollAnimations,
  initNavbarScrollEffects
} from './ui/scrollEffects.js';

// OCR module
import { handleImageUpload } from './ocr/imageProcessor.js';

/**
 * Application State
 */
const state = {
  selectedAlgorithm: 'fifo',
  isSimulating: false
};

/**
 * DOM Elements Cache
 */
const elements = {
  form: document.getElementById('simulation-form'),
  runBtn: document.getElementById('run-btn'),
  resetBtn: document.getElementById('reset-btn'),
  uploadBtn: document.getElementById('upload-btn'),
  imageUpload: document.getElementById('image-upload'),
  refString: document.getElementById('ref-string'),
  refError: document.getElementById('ref-error'),
  numFrames: document.getElementById('num-frames'),
  algorithmInput: document.getElementById('algorithm'),
  resultsSection: document.getElementById('results-section'),
  increaseFrames: document.getElementById('increase-frames'),
  decreaseFrames: document.getElementById('decrease-frames'),
  sampleBtns: document.querySelectorAll('.sample-card'),
  algorithmCards: document.querySelectorAll('.algorithm-card'),
  downloadBtn: document.getElementById('download-btn')
};

/**
 * Initialize all event listeners
 */
function initEventListeners() {
  // Form submission
  elements.form?.addEventListener('submit', (e) => {
    runSimulation(
      e, 
      elements, 
      state, 
      () => enableDownloadButton(elements.downloadBtn)
    );
  });
  
  // Reset button
  elements.resetBtn?.addEventListener('click', () => {
    handleReset(elements, () => disableDownloadButton(elements.downloadBtn));
  });
  
  // Download button
  elements.downloadBtn?.addEventListener('click', () => {
    handleDownload(state, elements);
  });
  
  // Upload button - trigger file input
  elements.uploadBtn?.addEventListener('click', () => {
    elements.imageUpload?.click();
  });
  
  // Image upload - process with OCR
  elements.imageUpload?.addEventListener('change', (e) => {
    handleImageUpload(e, elements);
  });
  
  // Algorithm selection
  setupAlgorithmSelection(elements, state);
  
  // Frame counter
  setupFrameCounter(elements);
  
  // Reference string validation
  setupReferenceStringValidation(elements);
  
  // Sample buttons
  setupSampleButtons(elements);
  
  // Keyboard shortcuts
  setupKeyboardShortcuts(elements);
  
  // Navbar scroll effects
  initNavbarScrollEffects();
}

/**
 * Initialize the application
 */
function initApplication() {
  // Initialize event listeners
  initEventListeners();
  
  // Initialize algorithm selection (default to FIFO)
  const fifoCard = document.querySelector('[data-algorithm="fifo"]');
  if (fifoCard) {
    fifoCard.click();
  }
  
  // Initialize theme toggle
  initThemeToggle();
  
  // Disable download button initially
  disableDownloadButton(elements.downloadBtn);
  
  // Initialize scroll animations
  initScrollAnimations();
  
  console.log('✅ Page Replacement Visualizer initialized');
  console.log('📁 Modular structure loaded successfully');
}

/**
 * Start the application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', initApplication);
