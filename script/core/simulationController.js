/**
 * Simulation Controller
 * Orchestrates the simulation process and coordinates between modules
 */

import { pageReplacement } from '../algorithms/pageReplacement.js';
import { displayTable, displaySummary } from '../display/displayResult.js';
import { validateReferenceString } from '../utils/validation.js';
import { parseReferenceString, calculateMetrics, countDistinct, smoothScrollTo } from '../utils/helpers.js';

/**
 * Run page replacement simulation
 * @param {Event} e - Form submit event
 * @param {Object} elements - DOM elements
 * @param {Object} state - Application state
 * @param {Function} enableDownload - Callback to enable download
 */
export async function runSimulation(e, elements, state, enableDownload) {
  e.preventDefault();
  
  // Get form values
  const algorithm = elements.algorithmInput.value;
  const refString = elements.refString.value.trim();
  const numFrames = parseInt(elements.numFrames.value);
  
  // Validate reference string
  const validation = validateReferenceString(refString);
  if (!validation.isValid) {
    elements.refError.textContent = validation.error;
    elements.refError.classList.remove('hidden');
    return;
  }
  
  elements.refError.classList.add('hidden');
  
  // Parse reference string
  const refStringArray = parseReferenceString(refString);
  
  if (refStringArray.length === 0) {
    elements.refError.textContent = 'Invalid reference string';
    elements.refError.classList.remove('hidden');
    return;
  }
  
  // Update UI to loading state
  state.isSimulating = true;
  const originalText = elements.runBtn.innerHTML;
  elements.runBtn.innerHTML = '<div class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></div> Running...';
  elements.runBtn.disabled = true;
  
  try {
    // Run algorithm
    const { time_slice, page_fault } = pageReplacement(
      algorithm, 
      refStringArray, 
      numFrames
    );
    
    // Display results
    displayTable(refStringArray, numFrames, time_slice, page_fault, algorithm.toUpperCase());
    
    // Calculate and display metrics
    const totalReferences = refStringArray.length;
    const metrics = calculateMetrics(page_fault, totalReferences);
    
    const summary = {
      algorithm: algorithm.toUpperCase(),
      totalReferences: totalReferences,
      distinctPages: countDistinct(refStringArray),
      frames: numFrames,
      ...metrics
    };
    
    displaySummary(summary);
    
    // Show results with fade-in animation
    elements.resultsSection.classList.remove('hidden');
    elements.resultsSection.classList.add('fade-in');
    
    // Enable download button
    enableDownload();
    
    // Smooth scroll to results
    setTimeout(() => {
      smoothScrollTo(elements.resultsSection, 'start');
    }, 100);
    
  } catch (error) {
    console.error('Simulation error:', error);
    elements.refError.textContent = 'An error occurred during simulation: ' + error.message;
    elements.refError.classList.remove('hidden');
  } finally {
    // Restore button state
    state.isSimulating = false;
    elements.runBtn.innerHTML = originalText;
    elements.runBtn.disabled = false;
  }
}
