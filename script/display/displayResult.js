/**
 * Results Display Controller
 * Handles visualization and presentation of simulation results
 */

/**
 * Generate snapshot table HTML
 * Shows frame contents at each reference step
 */
function generateSnapshotTable(reference, numFrames, timeSlice, pageFault) {
  let html = '<thead><tr>';
  
  // First column header
  html += `<th class="table-center" style="background: var(--gray-100);">Frame</th>`;
  
  // Header row with step numbers and references
  reference.forEach((ref, index) => {
    html += `<th class="table-center" style="min-width: 65px;">
      <div style="font-size: 10px; opacity: 0.5; font-weight: 500;">${index + 1}</div>
      <div style="font-size: 18px; font-weight: 700; margin-top: 2px;">${ref}</div>
    </th>`;
  });
  html += '</tr></thead><tbody>';
  
  // Frame rows
  for (let i = 0; i < numFrames; i++) {
    html += `<tr>`;
    html += `<td class="table-center" style="font-weight: 600; background: var(--gray-50);">${i + 1}</td>`;
    
    for (let t = 0; t < timeSlice.length; t++) {
      const value = timeSlice[t][i];
      let cellClass = '';
      let cellContent = '';
      
      if (value === null || value === undefined) {
        cellContent = '<span style="opacity: 0.2;">—</span>';
      } else {
        if (value === reference[t]) {
          // This is the referenced page in this frame
          if (pageFault[t]) {
            cellClass = 'cell-fault';
            cellContent = `<span style="font-size: 16px; font-weight: 700;">${value}</span>`;
          } else {
            cellClass = 'cell-hit';
            cellContent = `<span style="font-size: 16px; font-weight: 700;">${value}</span>`;
          }
        } else {
          // Different page in this frame
          cellContent = `<span style="opacity: 0.5;">${value}</span>`;
        }
      }
      
      html += `<td class="table-center ${cellClass}">${cellContent}</td>`;
    }
    html += '</tr>';
  }
  
  // Result row
  html += `<tr style="border-top: 2px solid var(--border);">`;
  html += `<td class="table-center" style="font-weight: 600; background: var(--gray-100);">Result</td>`;
  pageFault.forEach(fault => {
    if (fault) {
      html += `<td class="table-center cell-fault" style="font-size: 18px; font-weight: 800; letter-spacing: 1px;">F</td>`;
    } else {
      html += `<td class="table-center cell-hit" style="font-size: 18px; font-weight: 800; letter-spacing: 1px;">H</td>`;
    }
  });
  html += '</tr></tbody>';
  
  return html;
}

/**
 * Generate history table HTML
 * Shows chronological access order (LRU tracking) or insertion order (FIFO tracking)
 * Order 1 = Most recently used/inserted, Order N = Least recently used/oldest
 */
function generateHistoryTable(reference, numFrames, timeSlice, pageFault, algorithm) {
  let html = '<thead><tr>';
  
  // First column header
  html += `<th class="table-center" style="background: var(--gray-100);">Frame</th>`;
  
  // Header row
  reference.forEach((ref, index) => {
    html += `<th class="table-center" style="min-width: 65px;">
      <div style="font-size: 10px; opacity: 0.5; font-weight: 500;">${index + 1}</div>
      <div style="font-size: 18px; font-weight: 700; margin-top: 2px;">${ref}</div>
    </th>`;
  });
  html += '</tr></thead><tbody>';
  
  // Reconstruct the order at each time step
  // For LRU: track access recency (most recent access = highest priority)
  // For FIFO: track insertion order (most recent insertion = highest priority)
  const historyOrder = [];
  let orderTracking = [];  // Tracks order list at each step
  
  for (let t = 0; t < timeSlice.length; t++) {
    const currentFrames = timeSlice[t];
    const currentPage = reference[t];
    const isFault = pageFault[t];
    
    if (isFault) {
      // Page fault: page was added or replaced
      // Remove the page if it exists in tracking (shouldn't exist, but safety check)
      orderTracking = orderTracking.filter(p => p !== currentPage);
      // Add current page to end (most recent)
      orderTracking.push(currentPage);
      
      // If orderTracking has more pages than frames, remove oldest
      if (orderTracking.length > numFrames) {
        orderTracking.shift();
      }
    } else {
      // Page hit: update order (LRU only, FIFO stays same)
      if (algorithm && algorithm.toLowerCase() === 'lru') {
        // Move accessed page to end (most recent)
        orderTracking = orderTracking.filter(p => p !== currentPage);
        orderTracking.push(currentPage);
      }
      // For FIFO, order doesn't change on hit
    }
    
    // Create ordered list for display (most recent first for display)
    // Reverse so most recent is at top (Priority 1)
    const displayOrder = [...orderTracking].reverse();
    historyOrder.push(displayOrder);
  }
  
  // Priority rows (Priority 1 = Most recent, Priority N = Least recent/oldest)
  for (let i = 0; i < numFrames; i++) {
    html += `<tr>`;
    html += `<td class="table-center" style="font-weight: 600; background: var(--gray-50);">${i + 1}</td>`;
    
    for (let t = 0; t < timeSlice.length; t++) {
      const value = historyOrder[t][i];
      let cellClass = '';
      let cellContent = '';
      
      if (value === null || value === undefined) {
        cellContent = '<span style="opacity: 0.2;">—</span>';
      } else {
        if (value === reference[t]) {
          // This is the referenced page
          if (pageFault[t]) {
            cellClass = 'cell-fault';
            cellContent = `<span style="font-size: 16px; font-weight: 700;">${value}</span>`;
          } else {
            cellClass = 'cell-hit';
            cellContent = `<span style="font-size: 16px; font-weight: 700;">${value}</span>`;
          }
        } else {
          // Different page
          cellContent = `<span style="opacity: 0.5;">${value}</span>`;
        }
      }
      
      html += `<td class="table-center ${cellClass}">${cellContent}</td>`;
    }
    html += '</tr>';
  }
  
  // Result row
  html += `<tr style="border-top: 2px solid var(--border);">`;
  html += `<td class="table-center" style="font-weight: 600; background: var(--gray-100);">Result</td>`;
  pageFault.forEach(fault => {
    if (fault) {
      html += `<td class="table-center cell-fault" style="font-size: 18px; font-weight: 800; letter-spacing: 1px;">F</td>`;
    } else {
      html += `<td class="table-center cell-hit" style="font-size: 18px; font-weight: 800; letter-spacing: 1px;">H</td>`;
    }
  });
  html += '</tr></tbody>';
  
  return html;
}

/**
 * Synchronized scroll between tables - Toggleable & Smart Alignment
 * OPTIMIZED: Native scrolling on mobile, custom drag on desktop
 */
function setupSynchronizedScroll() {
  const snapshotContainer = document.querySelector('#snapshot-table')?.closest('.table-container');
  const historyContainer = document.querySelector('#history-table')?.closest('.table-container');
  const snapshotSyncBtn = document.querySelector('#snapshot-sync-btn');
  const historySyncBtn = document.querySelector('#history-sync-btn');
  
  if (!snapshotContainer || !historyContainer || !snapshotSyncBtn || !historySyncBtn) return;
  
  // Detect if device is mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   window.innerWidth <= 768;
  
  // State management
  let isSyncEnabled = true;
  let isSyncing = false;
  let isAnimating = false;
  
  // Drag-to-scroll state for both containers
  const dragState = {
    snapshot: { isDragging: false, startX: 0, scrollLeft: 0, velocityX: 0, lastX: 0, lastTime: 0, hasMoved: false },
    history: { isDragging: false, startX: 0, scrollLeft: 0, velocityX: 0, lastX: 0, lastTime: 0, hasMoved: false }
  };
  
  const setupDragScroll = (container, stateKey) => {
    const state = dragState[stateKey];
    
    // Skip custom handlers on mobile - use native scrolling only
    if (isMobile) {
      container.style.cursor = 'auto';
      return;
    }
    
    // Touch events for tablets/desktop (including mobile)
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
      
      // Sync other table
      if (isSyncEnabled && !isSyncing) {
        isSyncing = true;
        const otherContainer = stateKey === 'snapshot' ? historyContainer : snapshotContainer;
        otherContainer.scrollLeft = newScrollLeft;
        setTimeout(() => { isSyncing = false; }, 0);
      }
    };
    
    const handleTouchEnd = () => {
      if (!state.isDragging) return;
      state.isDragging = false;
      
      // Apply momentum if user swiped
      if (state.hasMoved && Math.abs(state.velocityX) > 0.5) {
        applyMomentum(container, state, stateKey);
      }
    };
    
    // Touch events for desktop tablets
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    
    // Mouse events for desktop
    container.addEventListener('mousedown', (e) => {
      if (e.button !== 0 || e.target.tagName === 'BUTTON') return;
      
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
      
      // Sync
      if (isSyncEnabled && !isSyncing) {
        isSyncing = true;
        const otherContainer = stateKey === 'snapshot' ? historyContainer : snapshotContainer;
        otherContainer.scrollLeft = newScrollLeft;
        setTimeout(() => { isSyncing = false; }, 0);
      }
    });
    
    const stopDragging = () => {
      if (!state.isDragging) return;
      
      state.isDragging = false;
      container.style.cursor = 'grab';
      container.style.userSelect = '';
      
      // Apply momentum if swiped
      if (state.hasMoved && Math.abs(state.velocityX) > 0.5) {
        applyMomentum(container, state, stateKey);
      }
    };
    
    container.addEventListener('mouseup', stopDragging);
    container.addEventListener('mouseleave', stopDragging);
    
    // Set cursor for desktop
    if (!isMobile) {
      container.style.cursor = 'grab';
    }
  };
  
  // OPTIMIZED: Apply momentum scrolling with RAF batching
  const applyMomentum = (container, state, stateKey) => {
    let velocity = state.velocityX * -20;
    const deceleration = 0.94;
    const minVelocity = 0.3;
    
    const animate = () => {
      if (Math.abs(velocity) < minVelocity) return;
      
      velocity *= deceleration;
      const newScrollLeft = container.scrollLeft + velocity;
      
      // Batch updates in single RAF
      if (isSyncEnabled && !isSyncing) {
        isSyncing = true;
        const otherContainer = stateKey === 'snapshot' ? historyContainer : snapshotContainer;
        
        // Update both containers in same frame
        container.scrollLeft = newScrollLeft;
        otherContainer.scrollLeft = newScrollLeft;
        
        isSyncing = false;
      } else {
        container.scrollLeft = newScrollLeft;
      }
      
      requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  };
  
  // Setup drag-to-scroll for both containers
  setupDragScroll(snapshotContainer, 'snapshot');
  setupDragScroll(historyContainer, 'history');
  
  // Update button states
  const updateButtonStates = (enabled) => {
    isSyncEnabled = enabled;
    
    if (enabled) {
      snapshotSyncBtn.classList.add('sync-active');
      historySyncBtn.classList.add('sync-active');
      snapshotSyncBtn.innerHTML = '<i class="bi bi-arrow-left-right"></i> Synced';
      historySyncBtn.innerHTML = '<i class="bi bi-arrow-left-right"></i> Synced';
    } else {
      snapshotSyncBtn.classList.remove('sync-active');
      historySyncBtn.classList.remove('sync-active');
      snapshotSyncBtn.innerHTML = '<i class="bi bi-arrow-left-right"></i> Sync Off';
      historySyncBtn.innerHTML = '<i class="bi bi-arrow-left-right"></i> Sync Off';
    }
  };
  
  // Initialize button states
  updateButtonStates(true);
  
  // Align scroll positions (animate to target)
  const alignScrollPositions = (sourceContainer, targetContainer) => {
    if (isAnimating) return;
    
    isAnimating = true;
    isSyncing = true;
    
    const targetScroll = sourceContainer.scrollLeft;
    const startScroll = targetContainer.scrollLeft;
    const distance = targetScroll - startScroll;
    const duration = 300;
    const startTime = performance.now();
    
    const easeOutQuad = (t) => t * (2 - t);
    
    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuad(progress);
      
      const currentScroll = startScroll + (distance * easedProgress);
      targetContainer.scrollLeft = currentScroll;
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        isAnimating = false;
        isSyncing = false;
      }
    };
    
    requestAnimationFrame(animateScroll);
  };
  
  // Snapshot sync button click
  snapshotSyncBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isSyncEnabled) {
      // Enable sync and align history to snapshot
      updateButtonStates(true);
      alignScrollPositions(snapshotContainer, historyContainer);
    } else {
      // Disable sync
      updateButtonStates(false);
    }
  });
  
  // History sync button click
  historySyncBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isSyncEnabled) {
      // Enable sync and align snapshot to history
      updateButtonStates(true);
      alignScrollPositions(historyContainer, snapshotContainer);
    } else {
      // Disable sync
      updateButtonStates(false);
    }
  });
  
  // Setup drag-to-scroll for both containers
  setupDragScroll(snapshotContainer, 'snapshot');
  setupDragScroll(historyContainer, 'history');
  
  // OPTIMIZED: RAF-based scroll sync for 60 FPS performance
  let syncRAF = null;
  
  const syncScroll = (source, target) => {
      if (!isSyncEnabled || isSyncing || isAnimating) return;
      
      // Cancel previous RAF to prevent queueing
      if (syncRAF) {
        cancelAnimationFrame(syncRAF);
      }
      
      // Use RAF instead of setTimeout for instant sync
      syncRAF = requestAnimationFrame(() => {
        isSyncing = true;
        const scrollValue = source.scrollLeft;  // Single DOM read
        target.scrollLeft = scrollValue;        // Single DOM write
        isSyncing = false;
        syncRAF = null;
      });
  };
  
  snapshotContainer.addEventListener('scroll', () => {
      if (!dragState.snapshot.isDragging) {
        syncScroll(snapshotContainer, historyContainer);
      }
  }, { passive: true });
  
  historyContainer.addEventListener('scroll', () => {
      if (!dragState.history.isDragging) {
        syncScroll(historyContainer, snapshotContainer);
      }
  }, { passive: true });
  
  // OPTIMIZED: Smooth wheel scroll with batched RAF updates
  let wheelVelocity = 0;
  let isWheelScrolling = false;
  
  const smoothWheelScroll = (container, delta) => {
      wheelVelocity += delta * 0.4;
      
      if (!isWheelScrolling) {
        isWheelScrolling = true;
        
        const animate = () => {
          if (Math.abs(wheelVelocity) < 0.05) {
            isWheelScrolling = false;
            wheelVelocity = 0;
            return;
          }
          
          wheelVelocity *= 0.88;
          const newScrollLeft = container.scrollLeft + wheelVelocity;
          
          // Batch both container updates in single RAF
          if (isSyncEnabled && !isSyncing) {
            isSyncing = true;
            const otherContainer = container === snapshotContainer ? historyContainer : snapshotContainer;
            
            container.scrollLeft = newScrollLeft;
            otherContainer.scrollLeft = newScrollLeft;
            
            isSyncing = false;
          } else {
            container.scrollLeft = newScrollLeft;
          }
          
          requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
      }
  };
  
  const handleWheelScroll = (container) => (e) => {
      if (Math.abs(e.deltaY) > 0 && Math.abs(e.deltaX) === 0) {
        e.preventDefault();
        smoothWheelScroll(container, e.deltaY);
      }
  };
  
  snapshotContainer.addEventListener('wheel', handleWheelScroll(snapshotContainer), { passive: false });
  historyContainer.addEventListener('wheel', handleWheelScroll(historyContainer), { passive: false });
}

/**
 * Display simulation results in tables
 */
export function displayTable(reference, numFrames, timeSlice, pageFault, algorithm) {
  const snapshotTable = document.getElementById('snapshot-table');
  const historyTable = document.getElementById('history-table');
  
  if (snapshotTable) {
    snapshotTable.innerHTML = generateSnapshotTable(
      reference, 
      numFrames, 
      timeSlice, 
      pageFault
    );
  }
  
  if (historyTable) {
    historyTable.innerHTML = generateHistoryTable(
      reference, 
      numFrames, 
      timeSlice, 
      pageFault,
      algorithm
    );
  }
  
  // Setup synchronized scrolling after tables render
  setTimeout(() => {
    setupSynchronizedScroll();
  }, 50);
  
  // Generate step-by-step solution
  generateSolution(reference, numFrames, timeSlice, pageFault, algorithm);
}

/**
 * Display performance summary statistics
 */
export function displaySummary(summary) {
  const statsContainer = document.getElementById('stats-container');
  
  if (!statsContainer) return;
  
  // Determine performance level
  const hitPercentage = parseFloat(summary.hitPercentage);
  let performanceLevel = 'Poor';
  let performanceClass = 'error';
  
  if (hitPercentage >= 70) {
    performanceLevel = 'Excellent';
    performanceClass = 'success';
  } else if (hitPercentage >= 50) {
    performanceLevel = 'Good';
    performanceClass = 'warning';
  } else if (hitPercentage >= 30) {
    performanceLevel = 'Fair';
    performanceClass = 'warning';
  }
  
  // Build stats HTML
  statsContainer.innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Algorithm</div>
      <div class="stat-value">${summary.algorithm}</div>
      <div class="stat-description">Page replacement method</div>
    </div>
    
    <div class="stat-card">
      <div class="stat-label">Total References</div>
      <div class="stat-value">${summary.totalReferences}</div>
      <div class="stat-description">${summary.distinctPages} distinct pages</div>
    </div>
    
    <div class="stat-card">
      <div class="stat-label">Memory Frames</div>
      <div class="stat-value">${summary.frames}</div>
      <div class="stat-description">Available cache frames</div>
    </div>
    
    <div class="stat-card">
      <div class="stat-label">Page Hits</div>
      <div class="stat-value" style="color: var(--ios-green);">${summary.hits}</div>
      <div class="stat-description">${summary.hitPercentage}% hit rate</div>
    </div>
    
    <div class="stat-card">
      <div class="stat-label">Page Faults</div>
      <div class="stat-value" style="color: var(--ios-red);">${summary.misses}</div>
      <div class="stat-description">${summary.missPercentage}% fault rate</div>
    </div>
    
    <div class="stat-card">
      <div class="stat-label">Performance</div>
      <div class="stat-value">
        <span class="badge badge-${performanceClass}" style="font-size: var(--text-base); padding: var(--space-2) var(--space-4);">
          ${performanceLevel}
        </span>
      </div>
      <div class="stat-description">Overall efficiency rating</div>
    </div>
  `;
  
  // Animate stats appearance
  const cards = statsContainer.querySelectorAll('.stat-card');
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    setTimeout(() => {
      card.style.transition = 'all 0.3s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 50);
  });
}


/**
 * Generate step-by-step solution explanation
 */
function generateSolution(reference, numFrames, timeSlice, pageFault, algorithm) {
  const solutionContainer = document.getElementById('solution-steps');
  
  if (!solutionContainer) return;
  
  let solutionHTML = '';
  
  for (let i = 0; i < reference.length; i++) {
    const currentRef = reference[i];
    const isFault = pageFault[i];
    const frames = timeSlice[i];
    const prevFrames = i > 0 ? timeSlice[i - 1] : [];
    
    const stepClass = isFault ? 'fault' : 'hit';
    const statusIcon = isFault ? 'bi-x-circle-fill' : 'bi-check-circle-fill';
    const statusText = isFault ? 'Page Fault' : 'Page Hit';
    const statusColor = isFault ? 'var(--ios-red)' : 'var(--ios-green)';
    
    // Build explanation
    let explanation = '';
    
    if (i === 0) {
      // First reference
      explanation = `First reference to page <strong>${currentRef}</strong>. Memory is empty, so this is a <strong>page fault</strong>. Page <strong>${currentRef}</strong> is loaded into Frame 1.`;
    } else if (isFault) {
      // Page fault occurred
      explanation = `Reference to page <strong>${currentRef}</strong>. `;
      
      // Check if frames are full
      if (prevFrames.length < numFrames) {
        explanation += `Page <strong>${currentRef}</strong> is not in memory. Empty frame available, so page <strong>${currentRef}</strong> is loaded into Frame ${prevFrames.length + 1}.`;
      } else {
        // Find victim page
        let victim = '';
        for (let j = 0; j < prevFrames.length; j++) {
          if (!frames.includes(prevFrames[j])) {
            victim = prevFrames[j];
            break;
          }
        }
        
        if (victim) {
          if (algorithm === 'FIFO') {
            explanation += `Page <strong>${currentRef}</strong> is not in memory. All frames are full. Using <strong>FIFO</strong>, the oldest page <strong>${victim}</strong> is replaced with page <strong>${currentRef}</strong>.`;
          } else if (algorithm === 'LRU') {
            explanation += `Page <strong>${currentRef}</strong> is not in memory. All frames are full. Using <strong>LRU</strong>, the least recently used page <strong>${victim}</strong> is replaced with page <strong>${currentRef}</strong>.`;
          }
        } else {
          explanation += `Page <strong>${currentRef}</strong> is loaded into memory.`;
        }
      }
    } else {
      // Page hit
      explanation = `Reference to page <strong>${currentRef}</strong>. Page <strong>${currentRef}</strong> is already in memory - <strong>Page Hit!</strong> No replacement needed.`;
      
      if (algorithm === 'LRU') {
        explanation += ` The access order is updated for LRU tracking.`;
      }
    }
    
    // Frame state
    const frameState = frames.map((f, idx) => `F${idx + 1}: ${f}`).join(', ');
    
    solutionHTML += `
      <div class="solution-step ${stepClass}">
        <div class="solution-step-header">
          <div class="solution-step-number">${i + 1}</div>
          <div class="solution-step-title">
            <i class="${statusIcon}" style="color: ${statusColor}; margin-right: 0.5rem;"></i>
            ${statusText} - Reference: ${currentRef}
          </div>
        </div>
        <div class="solution-step-content">
          <p>${explanation}</p>
          <div class="solution-step-detail">
            <strong>Memory State:</strong> ${frameState}
          </div>
        </div>
      </div>
    `;
  }
  
  solutionContainer.innerHTML = solutionHTML;
  
  // Animate solution steps
  const steps = solutionContainer.querySelectorAll('.solution-step');
  steps.forEach((step, index) => {
    step.style.opacity = '0';
    step.style.transform = 'translateY(20px)';
    setTimeout(() => {
      step.style.transition = 'all 0.3s ease';
      step.style.opacity = '1';
      step.style.transform = 'translateY(0)';
    }, index * 30);
  });
  
  // Setup drag-to-scroll for solution steps
  setupSolutionDragScroll();
}

/**
 * Setup drag-to-scroll for solution steps container
 */
function setupSolutionDragScroll() {
  const container = document.getElementById('solution-steps');
  if (!container) return;
  
  const dragState = {
    isDragging: false,
    startY: 0,
    scrollTop: 0,
    velocityY: 0,
    lastY: 0,
    lastTime: 0
  };
  
  // Mouse down - Start dragging
  container.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    
    dragState.isDragging = true;
    dragState.startY = e.pageY - container.offsetTop;
    dragState.scrollTop = container.scrollTop;
    dragState.velocityY = 0;
    dragState.lastY = e.pageY;
    dragState.lastTime = Date.now();
    
    container.style.cursor = 'grabbing';
    container.style.userSelect = 'none';
    
    e.preventDefault();
  });
  
  // Mouse move - Dragging
  container.addEventListener('mousemove', (e) => {
    if (!dragState.isDragging) return;
    
    e.preventDefault();
    
    const y = e.pageY - container.offsetTop;
    const walk = (y - dragState.startY) * 2;
    
    // Calculate velocity for momentum
    const now = Date.now();
    const dt = now - dragState.lastTime;
    if (dt > 0) {
      dragState.velocityY = (e.pageY - dragState.lastY) / dt;
    }
    dragState.lastY = e.pageY;
    dragState.lastTime = now;
    
    // Apply scroll
    container.scrollTop = dragState.scrollTop - walk;
  });
  
  // Mouse up - Stop dragging with momentum
  const stopDragging = () => {
    if (!dragState.isDragging) return;
    
    dragState.isDragging = false;
    container.style.cursor = 'grab';
    container.style.userSelect = '';
    
    // Apply momentum/inertia effect
    if (Math.abs(dragState.velocityY) > 0.5) {
      applyMomentum(container, dragState);
    }
  };
  
  container.addEventListener('mouseup', stopDragging);
  container.addEventListener('mouseleave', stopDragging);
  
  // Apply momentum scrolling
  const applyMomentum = (container, state) => {
    let velocity = state.velocityY * -20;
    const deceleration = 0.94;
    const minVelocity = 0.3;
    
    const animate = () => {
      if (Math.abs(velocity) < minVelocity) return;
      
      velocity *= deceleration;
      container.scrollTop += velocity;
      
      requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  };
  
  // Set initial cursor
  container.style.cursor = 'grab';
}
