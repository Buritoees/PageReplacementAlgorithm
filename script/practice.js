/**
 * Practice Mode - Interactive Algorithm Learning
 * Allows users to test their understanding with randomly generated exercises
 */

import { pageReplacement } from './algorithms/pageReplacement.js';

// State
let currentExercise = null;
let correctAnswer = null;

// DOM Elements
const elements = {
  algorithmBtns: document.querySelectorAll('.algorithm-select-btn'),
  practicePages: document.getElementById('practice-pages'),
  practiceFrames: document.getElementById('practice-frames'),
  decreasePages: document.getElementById('decrease-pages'),
  increasePages: document.getElementById('increase-pages'),
  decreaseFrames: document.getElementById('decrease-frames'),
  increaseFrames: document.getElementById('increase-frames'),
  generateBtn: document.getElementById('generate-exercise-btn'),
  newExerciseBtn: document.getElementById('new-exercise-btn'),
  checkAnswerBtn: document.getElementById('check-answer-btn'),
  showSolutionBtn: document.getElementById('show-solution-btn'),
  clearAnswersBtn: document.getElementById('clear-answers-btn'),
  exerciseSection: document.getElementById('exercise-section'),
  resultsSection: document.getElementById('results-section'),
  exerciseInfo: document.getElementById('exercise-info'),
  practiceTableContainer: document.getElementById('practice-table-container'),
  scoreCard: document.getElementById('score-card'),
  explanationContent: document.getElementById('explanation-content'),
  themeToggle: document.getElementById('theme-toggle')
};

/**
 * Initialize practice mode
 */
function init() {
  setupEventListeners();
  initializeTheme();
  initializeParticles();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Algorithm selection
  elements.algorithmBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.algorithmBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Number controls
  elements.decreasePages.addEventListener('click', () => {
    const val = parseInt(elements.practicePages.value);
    if (val > 5) elements.practicePages.value = val - 1;
  });

  elements.increasePages.addEventListener('click', () => {
    const val = parseInt(elements.practicePages.value);
    if (val < 15) elements.practicePages.value = val + 1;
  });

  elements.decreaseFrames.addEventListener('click', () => {
    const val = parseInt(elements.practiceFrames.value);
    if (val > 2) elements.practiceFrames.value = val - 1;
  });

  elements.increaseFrames.addEventListener('click', () => {
    const val = parseInt(elements.practiceFrames.value);
    if (val < 5) elements.practiceFrames.value = val + 1;
  });

  // Main actions
  elements.generateBtn.addEventListener('click', generateExercise);
  elements.newExerciseBtn.addEventListener('click', generateExercise);
  elements.checkAnswerBtn.addEventListener('click', checkAnswer);
  elements.showSolutionBtn.addEventListener('click', showSolution);
  elements.clearAnswersBtn.addEventListener('click', clearAnswers);

  // Theme toggle
  elements.themeToggle.addEventListener('click', toggleTheme);
}

/**
 * Generate random exercise
 */
function generateExercise() {
  const algorithm = document.querySelector('.algorithm-select-btn.active').dataset.algo;
  const numPages = parseInt(elements.practicePages.value);
  const numFrames = parseInt(elements.practiceFrames.value);

  // Generate random reference string (numbers 0-9)
  const referenceString = [];
  for (let i = 0; i < numPages; i++) {
    referenceString.push(Math.floor(Math.random() * 10));
  }

  // Run algorithm to get correct answer
  const { time_slice, page_fault } = pageReplacement(algorithm, referenceString, numFrames);

  currentExercise = {
    algorithm,
    referenceString,
    numFrames,
    numPages
  };

  correctAnswer = {
    timeSlice: time_slice,
    pageFault: page_fault
  };

  // Display exercise
  displayExercise();
  
  // Hide results, show exercise
  elements.resultsSection.classList.add('hidden');
  elements.exerciseSection.classList.remove('hidden');
  
  // Scroll to exercise
  setTimeout(() => {
    elements.exerciseSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

/**
 * Display exercise information and table
 */
function displayExercise() {
  const { algorithm, referenceString, numFrames } = currentExercise;

  // Display exercise info
  elements.exerciseInfo.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
      <div>
        <div style="font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.5rem;">Algorithm</div>
        <div style="font-size: 20px; font-weight: 700; color: var(--ios-blue);">${algorithm.toUpperCase()}</div>
      </div>
      <div>
        <div style="font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.5rem;">Number of Frames</div>
        <div style="font-size: 20px; font-weight: 700; color: var(--text-primary);">${numFrames}</div>
      </div>
      <div>
        <div style="font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.5rem;">Reference String</div>
        <div style="font-size: 18px; font-weight: 600; font-family: monospace; color: var(--text-primary);">${referenceString.join(' ')}</div>
      </div>
    </div>
  `;

  // Generate practice table
  elements.practiceTableContainer.innerHTML = generatePracticeTable(referenceString, numFrames);
  
  // Setup horizontal scrolling after table is created
  setupPracticeTableScroll();
}

/**
 * Generate interactive practice table
 */
function generatePracticeTable(reference, numFrames) {
  let html = '<div class="table-container" style="overflow-x: auto;"><table class="table table-monospace practice-table">';
  
  // Header
  html += '<thead><tr>';
  html += '<th class="table-center" style="background: var(--gray-100);">Frame</th>';
  reference.forEach((ref, index) => {
    html += `<th class="table-center" style="min-width: 80px;">
      <div style="font-size: 10px; opacity: 0.5; font-weight: 500;">Step ${index + 1}</div>
      <div style="font-size: 18px; font-weight: 700; margin-top: 2px;">${ref}</div>
    </th>`;
  });
  html += '</tr></thead><tbody>';

  // Frame rows
  for (let i = 0; i < numFrames; i++) {
    html += '<tr>';
    html += `<td class="table-center" style="font-weight: 600; background: var(--gray-50);">Frame ${i + 1}</td>`;
    
    for (let t = 0; t < reference.length; t++) {
      html += `<td class="table-center">
        <input 
          type="text" 
          class="practice-input" 
          data-frame="${i}" 
          data-step="${t}" 
          maxlength="2"
          placeholder="?"
          style="width: 60px; text-align: center; padding: 8px; border: 2px solid var(--border); border-radius: 6px; background: var(--bg-primary); color: var(--text-primary); font-weight: 600;"
        >
      </td>`;
    }
    html += '</tr>';
  }

  // Result row
  html += '<tr style="border-top: 2px solid var(--border);">';
  html += '<td class="table-center" style="font-weight: 600; background: var(--gray-100);">Result</td>';
  reference.forEach((ref, index) => {
    html += `<td class="table-center">
      <select 
        class="practice-select" 
        data-step="${index}"
        style="width: 80px; padding: 8px; border: 2px solid var(--border); border-radius: 6px; background: var(--bg-primary); color: var(--text-primary); font-weight: 700; cursor: pointer;"
      >
        <option value="">?</option>
        <option value="F">F</option>
        <option value="H">H</option>
      </select>
    </td>`;
  });
  html += '</tr>';

  html += '</tbody></table></div>';
  return html;
}

/**
 * Check user's answer
 */
function checkAnswer() {
  const { referenceString, numFrames } = currentExercise;
  const { timeSlice, pageFault } = correctAnswer;

  let totalCells = 0;
  let correctCells = 0;
  let mistakes = [];

  // Check frame inputs
  for (let t = 0; t < referenceString.length; t++) {
    for (let f = 0; f < numFrames; f++) {
      const input = document.querySelector(`input[data-frame="${f}"][data-step="${t}"]`);
      const userValue = input.value.trim();
      const correctValue = timeSlice[t][f];

      totalCells++;

      if (correctValue === null || correctValue === undefined) {
        // Empty cell
        if (userValue === '' || userValue === '-') {
          correctCells++;
          input.style.borderColor = 'var(--ios-green)';
          input.style.background = 'rgba(48, 209, 88, 0.1)';
        } else {
          input.style.borderColor = 'var(--ios-red)';
          input.style.background = 'rgba(255, 69, 58, 0.1)';
          mistakes.push({
            type: 'frame',
            frame: f + 1,
            step: t + 1,
            userValue,
            correctValue: 'Empty',
            reason: `Frame ${f + 1} should be empty at step ${t + 1} because only ${timeSlice[t].filter(v => v !== null).length} frame(s) are filled.`
          });
        }
      } else {
        // Has value
        if (userValue == correctValue) {
          correctCells++;
          input.style.borderColor = 'var(--ios-green)';
          input.style.background = 'rgba(48, 209, 88, 0.1)';
        } else {
          input.style.borderColor = 'var(--ios-red)';
          input.style.background = 'rgba(255, 69, 58, 0.1)';
          mistakes.push({
            type: 'frame',
            frame: f + 1,
            step: t + 1,
            userValue: userValue || 'Empty',
            correctValue,
            reason: generateFrameExplanation(t, f, correctValue, referenceString[t], pageFault[t])
          });
        }
      }
    }
  }

  // Check result row
  for (let t = 0; t < referenceString.length; t++) {
    const select = document.querySelector(`select[data-step="${t}"]`);
    const userValue = select.value;
    const correctValue = pageFault[t] ? 'F' : 'H';

    totalCells++;

    if (userValue === correctValue) {
      correctCells++;
      select.style.borderColor = 'var(--ios-green)';
      select.style.background = 'rgba(48, 209, 88, 0.1)';
    } else {
      select.style.borderColor = 'var(--ios-red)';
      select.style.background = 'rgba(255, 69, 58, 0.1)';
      mistakes.push({
        type: 'result',
        step: t + 1,
        userValue: userValue || 'Not selected',
        correctValue,
        reason: generateResultExplanation(t, referenceString[t], pageFault[t], timeSlice, currentExercise.algorithm)
      });
    }
  }

  // Display results
  displayResults(correctCells, totalCells, mistakes);
}

/**
 * Generate explanation for frame value
 */
function generateFrameExplanation(step, frame, correctValue, refPage, isFault) {
  if (isFault) {
    if (step === 0) {
      return `At step 1, this is the first reference (${refPage}), so it's loaded into Frame ${frame + 1} as a page fault.`;
    } else {
      return `At step ${step + 1}, page ${refPage} was not in memory, causing a page fault. It was loaded into Frame ${frame + 1}.`;
    }
  } else {
    return `At step ${step + 1}, page ${refPage} was already in Frame ${frame + 1}, resulting in a page hit. The frame contents don't change.`;
  }
}

/**
 * Generate explanation for result (F/H)
 */
function generateResultExplanation(step, refPage, isFault, timeSlice, algorithm) {
  const prevFrames = step > 0 ? timeSlice[step - 1].filter(v => v !== null) : [];
  const wasInMemory = prevFrames.includes(refPage);

  if (isFault) {
    if (step === 0) {
      return `Step 1: Page ${refPage} is the first reference. Memory is empty, so this is a Page Fault (F). The page is loaded into memory.`;
    } else if (!wasInMemory) {
      return `Step ${step + 1}: Page ${refPage} is not in memory (current frames: ${prevFrames.join(', ')}). This is a Page Fault (F). ${algorithm === 'fifo' ? 'Using FIFO, the oldest page is replaced.' : 'Using LRU, the least recently used page is replaced.'}`;
    } else {
      return `Step ${step + 1}: Page ${refPage} was in memory, but this still shows as a fault in the solution. Please check the frame states.`;
    }
  } else {
    return `Step ${step + 1}: Page ${refPage} is already in memory (frames: ${prevFrames.join(', ')}). This is a Page Hit (H). No replacement needed${algorithm === 'lru' ? ', but the access order is updated for LRU' : ''}.`;
  }
}

/**
 * Display results and explanations
 */
function displayResults(correct, total, mistakes) {
  const percentage = Math.round((correct / total) * 100);
  const isPerfect = correct === total;

  // Score card
  let scoreHTML = `
    <div style="text-align: center; padding: 2rem;">
      <div style="font-size: 72px; margin-bottom: 1rem;">
        ${isPerfect ? '🎉' : percentage >= 80 ? '👍' : percentage >= 60 ? '📚' : '💪'}
      </div>
      <h2 style="margin-bottom: 1rem; font-size: 32px;">
        ${isPerfect ? 'Perfect Score!' : percentage >= 80 ? 'Great Job!' : percentage >= 60 ? 'Good Effort!' : 'Keep Practicing!'}
      </h2>
      <div style="font-size: 48px; font-weight: 800; color: ${isPerfect ? 'var(--ios-green)' : percentage >= 60 ? 'var(--ios-blue)' : 'var(--ios-orange)'}; margin-bottom: 0.5rem;">
        ${percentage}%
      </div>
      <div style="font-size: 18px; color: var(--text-secondary); margin-bottom: 2rem;">
        ${correct} out of ${total} cells correct
      </div>
  `;

  if (isPerfect) {
    scoreHTML += `
      <div class="alert alert-success" style="max-width: 500px; margin: 0 auto;">
        <i class="bi bi-trophy-fill" style="font-size: 1.5rem;"></i>
        <div>
          <strong>Excellent work!</strong><br>
          You have a perfect understanding of the ${currentExercise.algorithm.toUpperCase()} algorithm!
        </div>
      </div>
    `;
  } else if (mistakes.length > 0) {
    scoreHTML += `
      <div class="alert alert-warning" style="max-width: 500px; margin: 0 auto;">
        <i class="bi bi-exclamation-triangle-fill" style="font-size: 1.5rem;"></i>
        <div>
          <strong>Review the explanations below</strong><br>
          ${mistakes.length} mistake${mistakes.length > 1 ? 's' : ''} found. Check the detailed feedback!
        </div>
      </div>
    `;
  }

  scoreHTML += '</div>';
  elements.scoreCard.innerHTML = scoreHTML;

  // Explanations
  if (mistakes.length > 0) {
    let explanationHTML = '<div style="display: flex; flex-direction: column; gap: 1rem;">';
    
    mistakes.forEach((mistake, index) => {
      explanationHTML += `
        <div class="mistake-card" style="padding: 1.5rem; background: var(--bg-secondary); border-left: 4px solid var(--ios-red); border-radius: 8px;">
          <div style="display: flex; align-items: start; gap: 1rem; margin-bottom: 1rem;">
            <div style="flex-shrink: 0; width: 32px; height: 32px; background: var(--ios-red); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">
              ${index + 1}
            </div>
            <div style="flex: 1;">
              <div style="font-size: 16px; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-primary);">
                ${mistake.type === 'frame' ? `Frame ${mistake.frame}, Step ${mistake.step}` : `Result - Step ${mistake.step}`}
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 1rem;">
                <div>
                  <span style="font-size: 12px; color: var(--text-secondary);">Your Answer:</span>
                  <div style="font-weight: 700; color: var(--ios-red);">${mistake.userValue}</div>
                </div>
                <div>
                  <span style="font-size: 12px; color: var(--text-secondary);">Correct Answer:</span>
                  <div style="font-weight: 700; color: var(--ios-green);">${mistake.correctValue}</div>
                </div>
              </div>
              <div style="padding: 1rem; background: var(--bg-primary); border-radius: 6px; font-size: 14px; line-height: 1.6; color: var(--text-primary);">
                <strong style="color: var(--ios-blue);">Explanation:</strong><br>
                ${mistake.reason}
              </div>
            </div>
          </div>
        </div>
      `;
    });

    explanationHTML += '</div>';
    elements.explanationContent.innerHTML = explanationHTML;
  } else {
    elements.explanationContent.innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <i class="bi bi-check-circle-fill" style="font-size: 64px; color: var(--ios-green);"></i>
        <p style="font-size: 18px; margin-top: 1rem;">No mistakes! You got everything correct!</p>
      </div>
    `;
  }

  // Show results section
  elements.resultsSection.classList.remove('hidden');
  setTimeout(() => {
    elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

/**
 * Show solution
 */
function showSolution() {
  const { timeSlice, pageFault } = correctAnswer;
  const { referenceString, numFrames } = currentExercise;

  // Fill in all correct answers
  for (let t = 0; t < referenceString.length; t++) {
    for (let f = 0; f < numFrames; f++) {
      const input = document.querySelector(`input[data-frame="${f}"][data-step="${t}"]`);
      const correctValue = timeSlice[t][f];
      
      if (correctValue === null || correctValue === undefined) {
        input.value = '';
      } else {
        input.value = correctValue;
      }
      
      input.style.borderColor = 'var(--ios-blue)';
      input.style.background = 'rgba(10, 132, 255, 0.1)';
    }

    // Result
    const select = document.querySelector(`select[data-step="${t}"]`);
    select.value = pageFault[t] ? 'F' : 'H';
    select.style.borderColor = 'var(--ios-blue)';
    select.style.background = 'rgba(10, 132, 255, 0.1)';
  }

  // Show explanation without checking
  elements.resultsSection.classList.add('hidden');
}

/**
 * Clear all user answers
 */
function clearAnswers() {
  const inputs = document.querySelectorAll('.practice-input');
  const selects = document.querySelectorAll('.practice-select');

  inputs.forEach(input => {
    input.value = '';
    input.style.borderColor = '';
    input.style.background = '';
  });

  selects.forEach(select => {
    select.value = '';
    select.style.borderColor = '';
    select.style.background = '';
  });

  elements.resultsSection.classList.add('hidden');
}

/**
 * Initialize theme
 */
function initializeTheme() {
  // Force dark mode as default - don't trust localStorage on first load
  let currentMode = localStorage.getItem('themeMode');
  
  // If no theme saved or invalid theme, set to dark
  if (!currentMode || !['dark', 'light', 'glass'].includes(currentMode)) {
    currentMode = 'dark';
    localStorage.setItem('themeMode', 'dark');
  }
  
  // Apply saved or default theme
  applyTheme(currentMode);
}

/**
 * Toggle theme - Cycle through dark → light → glass → dark
 */
function toggleTheme() {
  const body = document.body;
  let currentMode = getCurrentTheme();
  
  // Cycle: dark → light → glass → dark
  let newMode;
  if (currentMode === 'dark') {
    newMode = 'light';
  } else if (currentMode === 'light') {
    newMode = 'glass';
  } else {
    newMode = 'dark';
  }
  
  applyTheme(newMode);
  localStorage.setItem('themeMode', newMode);
}

/**
 * Apply theme to the page
 */
function applyTheme(mode) {
  const body = document.body;
  const themeToggle = elements.themeToggle;
  const icon = themeToggle?.querySelector('i');
  const text = themeToggle?.querySelector('span');
  
  // Remove all theme classes
  body.classList.remove('light-mode', 'glass-mode');
  
  // Apply theme and update button
  if (mode === 'glass') {
    body.classList.add('glass-mode');
    icon?.classList.remove('bi-sun-fill', 'bi-moon-fill');
    icon?.classList.add('bi-stars');
    if (text) text.textContent = 'Glass';
  } else if (mode === 'dark') {
    // Dark mode (no classes needed)
    icon?.classList.remove('bi-sun-fill', 'bi-stars');
    icon?.classList.add('bi-moon-fill');
    if (text) text.textContent = 'Dark';
  } else if (mode === 'light') {
    body.classList.add('light-mode');
    icon?.classList.remove('bi-moon-fill', 'bi-stars');
    icon?.classList.add('bi-sun-fill');
    if (text) text.textContent = 'Light';
  }
}

/**
 * Get current theme mode
 */
function getCurrentTheme() {
  if (document.body.classList.contains('glass-mode')) {
    return 'glass';
  } else if (document.body.classList.contains('light-mode')) {
    return 'light';
  }
  return 'dark';
}

/**
 * Initialize particle system
 */
function initializeParticles() {
  if (typeof initParticles === 'function') {
    initParticles();
  }
}

/**
 * Setup horizontal scrolling for practice table
 * Desktop: Drag-to-scroll with momentum
 * Mobile: Native touch scrolling
 */
function setupPracticeTableScroll() {
  const container = document.querySelector('#practice-table-container .table-container');
  
  if (!container) return;
  
  // Detect if device is mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   window.innerWidth <= 768;
  
  // Skip custom handlers on mobile - use native scrolling only
  if (isMobile) {
    container.style.cursor = 'auto';
    return;
  }
  
  // Drag-to-scroll state
  const state = {
    isDragging: false,
    startX: 0,
    scrollLeft: 0,
    velocityX: 0,
    lastX: 0,
    lastTime: 0,
    hasMoved: false
  };
  
  // Touch events for desktop tablets
  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    state.isDragging = true;
    state.hasMoved = false;
    state.startX = touch.clientX;
    state.scrollLeft = container.scrollLeft;
    state.velocityX = 0;
    state.lastX = touch.clientX;
    state.lastTime = Date.now();
  };
  
  const handleTouchMove = (e) => {
    if (!state.isDragging || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const deltaX = state.lastX - touch.clientX;
    
    // Mark that user has moved (for click detection)
    if (Math.abs(deltaX) > 5) {
      state.hasMoved = true;
    }
    
    // Calculate velocity for momentum
    const now = Date.now();
    const dt = now - state.lastTime;
    if (dt > 0) {
      state.velocityX = -deltaX / dt;
    }
    state.lastX = touch.clientX;
    state.lastTime = now;
    
    // Apply scroll IMMEDIATELY
    const newScrollLeft = state.scrollLeft + deltaX;
    container.scrollLeft = newScrollLeft;
    state.scrollLeft = container.scrollLeft;
  };
  
  const handleTouchEnd = () => {
    if (!state.isDragging) return;
    state.isDragging = false;
    
    // Apply momentum if user swiped
    if (state.hasMoved && Math.abs(state.velocityX) > 0.5) {
      applyMomentum();
    }
  };
  
  // Touch events
  container.addEventListener('touchstart', handleTouchStart, { passive: true });
  container.addEventListener('touchmove', handleTouchMove, { passive: true });
  container.addEventListener('touchend', handleTouchEnd, { passive: true });
  container.addEventListener('touchcancel', handleTouchEnd, { passive: true });
  
  // Mouse events for desktop
  container.addEventListener('mousedown', (e) => {
    // Don't interfere with input/select elements
    if (e.button !== 0 || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    
    state.isDragging = true;
    state.hasMoved = false;
    state.startX = e.pageX;
    state.scrollLeft = container.scrollLeft;
    state.velocityX = 0;
    state.lastX = e.pageX;
    state.lastTime = Date.now();
    
    container.style.cursor = 'grabbing';
    container.style.userSelect = 'none';
    
    e.preventDefault();
  });
  
  container.addEventListener('mousemove', (e) => {
    if (!state.isDragging) return;
    
    e.preventDefault();
    
    const deltaX = state.lastX - e.pageX;
    
    if (Math.abs(deltaX) > 5) {
      state.hasMoved = true;
    }
    
    // Calculate velocity
    const now = Date.now();
    const dt = now - state.lastTime;
    if (dt > 0) {
      state.velocityX = -deltaX / dt;
    }
    state.lastX = e.pageX;
    state.lastTime = now;
    
    // Apply scroll
    const newScrollLeft = state.scrollLeft + deltaX;
    container.scrollLeft = newScrollLeft;
    state.scrollLeft = container.scrollLeft;
  });
  
  const stopDragging = () => {
    if (!state.isDragging) return;
    
    state.isDragging = false;
    container.style.cursor = 'grab';
    container.style.userSelect = '';
    
    // Apply momentum if swiped
    if (state.hasMoved && Math.abs(state.velocityX) > 0.5) {
      applyMomentum();
    }
  };
  
  container.addEventListener('mouseup', stopDragging);
  container.addEventListener('mouseleave', stopDragging);
  
  // Set cursor for desktop
  container.style.cursor = 'grab';
  
  // Smooth mouse wheel horizontal scrolling with momentum
  let wheelVelocity = 0;
  let isWheelScrolling = false;
  
  const smoothWheelScroll = (delta) => {
    wheelVelocity += delta * 0.4;
    
    if (!isWheelScrolling) {
      isWheelScrolling = true;
      
      const animate = () => {
        if (Math.abs(wheelVelocity) < 0.05) {
          isWheelScrolling = false;
          wheelVelocity = 0;
          return;
        }
        
        wheelVelocity *= 0.88; // Smooth deceleration
        const newScrollLeft = container.scrollLeft + wheelVelocity;
        container.scrollLeft = newScrollLeft;
        
        requestAnimationFrame(animate);
      };
      
      requestAnimationFrame(animate);
    }
  };
  
  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    const scrollAmount = e.deltaY !== 0 ? e.deltaY : e.deltaX;
    smoothWheelScroll(scrollAmount);
  }, { passive: false });
  
  // Apply momentum scrolling
  function applyMomentum() {
    let velocity = state.velocityX * -20;
    const deceleration = 0.94;
    const minVelocity = 0.3;
    
    const animate = () => {
      if (Math.abs(velocity) < minVelocity) return;
      
      velocity *= deceleration;
      const newScrollLeft = container.scrollLeft + velocity;
      container.scrollLeft = newScrollLeft;
      
      requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
