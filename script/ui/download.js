/**
 * Download Functionality - Professional Print-Ready Export
 * Enhanced color grading, typography, and complete content visibility
 */

import { getFormattedTimestamp } from '../utils/helpers.js';

/**
 * Enable download button
 * @param {HTMLElement} downloadBtn - Download button element
 */
export function enableDownloadButton(downloadBtn) {
  if (downloadBtn) {
    downloadBtn.classList.remove('disabled');
    downloadBtn.disabled = false;
    
    // Update status badge
    const statusBadge = downloadBtn.querySelector('.status-badge i');
    if (statusBadge) {
      statusBadge.classList.remove('bi-x');
      statusBadge.classList.add('bi-check');
    }
    
    // Update tooltip
    const tooltipText = downloadBtn.querySelector('.download-tooltip-content span');
    const tooltipIcon = downloadBtn.querySelector('.download-tooltip-content i');
    if (tooltipText) {
      tooltipText.textContent = 'Ready to Download!';
    }
    if (tooltipIcon) {
      tooltipIcon.classList.remove('bi-exclamation-triangle-fill');
      tooltipIcon.classList.add('bi-check-circle-fill');
    }
  }
}

/**
 * Disable download button
 * @param {HTMLElement} downloadBtn - Download button element
 */
export function disableDownloadButton(downloadBtn) {
  if (downloadBtn) {
    downloadBtn.classList.add('disabled');
    downloadBtn.disabled = true;
    
    // Update status badge
    const statusBadge = downloadBtn.querySelector('.status-badge i');
    if (statusBadge) {
      statusBadge.classList.remove('bi-check');
      statusBadge.classList.add('bi-x');
    }
    
    // Update tooltip
    const tooltipText = downloadBtn.querySelector('.download-tooltip-content span');
    const tooltipIcon = downloadBtn.querySelector('.download-tooltip-content i');
    if (tooltipText) {
      tooltipText.textContent = 'Simulate First to Download!';
    }
    if (tooltipIcon) {
      tooltipIcon.classList.remove('bi-check-circle-fill');
      tooltipIcon.classList.add('bi-exclamation-triangle-fill');
    }
  }
}

/**
 * Handle download of simulation results
 * @param {Object} state - Application state
 * @param {Object} elements - DOM elements
 */
export async function handleDownload(state, elements) {
  // Check if results exist
  if (elements.resultsSection.classList.contains('hidden')) {
    const configSection = document.getElementById('simulation-form');
    if (configSection) {
      configSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }
  
  // Show loading state
  const originalContent = elements.downloadBtn.innerHTML;
  elements.downloadBtn.innerHTML = '<i class="bi bi-hourglass-split"></i><span>Generating...</span>';
  elements.downloadBtn.disabled = true;
  
  try {
    const downloadContainer = createDownloadContainer(state, elements);
    const canvas = await generateImageFromContainer(downloadContainer);
    await downloadImage(canvas, state.selectedAlgorithm);
    
    // Show success feedback
    elements.downloadBtn.innerHTML = '<i class="bi bi-check-circle-fill"></i><span>Downloaded!</span>';
    setTimeout(() => {
      elements.downloadBtn.innerHTML = originalContent;
      elements.downloadBtn.disabled = false;
    }, 2000);
    
  } catch (error) {
    console.error('Download error:', error);
    
    elements.downloadBtn.innerHTML = '<i class="bi bi-x-circle-fill"></i><span>Error</span>';
    setTimeout(() => {
      elements.downloadBtn.innerHTML = originalContent;
      elements.downloadBtn.disabled = false;
    }, 2000);
  }
}

/**
 * Create download container with professional print-ready styling
 * @param {Object} state - Application state
 * @param {Object} elements - DOM elements
 * @returns {HTMLElement} - Download container
 */
function createDownloadContainer(state, elements) {
  // Calculate actual content width from tables including ALL columns
  const snapshotTable = document.getElementById('snapshot-table');
  const historyTable = document.getElementById('history-table');
  
  // Get true scrollWidth to ensure all columns are captured
  const snapshotWidth = snapshotTable ? snapshotTable.scrollWidth : 0;
  const historyWidth = historyTable ? historyTable.scrollWidth : 0;
  const maxTableWidth = Math.max(snapshotWidth, historyWidth);
  
  // Generous padding to prevent any clipping
  const contentWidth = Math.max(maxTableWidth + 120, 1400);
  
  const downloadContainer = document.createElement('div');
  downloadContainer.style.cssText = `
    position: fixed;
    left: -99999px;
    top: -99999px;
    background: #FFFFFF;
    padding: 60px;
    width: ${contentWidth}px;
    max-width: none;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', 'Helvetica Neue', Arial, sans-serif;
    pointer-events: none;
    z-index: -9999;
    visibility: hidden;
    opacity: 0;
    overflow: visible;
    box-sizing: border-box;
  `;
  
  const algorithmName = state.selectedAlgorithm.toUpperCase();
  const refString = elements.refString.value.trim();
  const numFrames = elements.numFrames.value;
  
  // Add header
  downloadContainer.appendChild(createHeader(algorithmName, refString, numFrames));
  
  // Add stats
  const statsContainer = document.getElementById('stats-container');
  if (statsContainer) {
    downloadContainer.appendChild(createStatsSection(statsContainer));
  }
  
  // Add tables with full width
  if (snapshotTable) {
    downloadContainer.appendChild(createTableSection(snapshotTable, 'Snapshot View'));
  }
  
  if (historyTable) {
    downloadContainer.appendChild(createTableSection(historyTable, 'History View'));
  }
  
  // Add legend
  downloadContainer.appendChild(createLegend());
  
  // Append to body
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    position: fixed;
    left: -99999px;
    top: -99999px;
    width: auto;
    height: auto;
    overflow: visible;
    pointer-events: none;
    z-index: -9999;
    visibility: hidden;
    opacity: 0;
  `;
  wrapper.appendChild(downloadContainer);
  document.body.appendChild(wrapper);
  
  downloadContainer.style.visibility = 'visible';
  downloadContainer.style.opacity = '1';
  
  // Force layout calculation
  downloadContainer.offsetHeight;
  
  // Final width calculation to ensure everything fits
  const finalWidth = Math.max(
    downloadContainer.scrollWidth + 120,
    contentWidth,
    maxTableWidth + 120
  );
  downloadContainer.style.width = finalWidth + 'px';
  
  return wrapper;
}

/**
 * Create professional header section
 */
function createHeader(algorithmName, refString, numFrames) {
  const header = document.createElement('div');
  header.style.cssText = `
    margin-bottom: 35px;
    padding-bottom: 25px;
    border-bottom: 3px solid #2563EB;
  `;
  
  header.innerHTML = `
    <h1 style="color: #1E293B; font-size: 32px; font-weight: 700; margin: 0 0 20px 0; letter-spacing: -0.5px;">
      Page Replacement Algorithm Results
    </h1>
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; color: #1E293B; font-size: 14px;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-weight: 600; color: #64748B; min-width: 150px;">Algorithm:</span>
        <span style="font-weight: 700; color: #2563EB; font-size: 17px; background: #EFF6FF; padding: 6px 14px; border-radius: 6px;">${algorithmName}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-weight: 600; color: #64748B; min-width: 150px;">Number of Frames:</span>
        <span style="font-weight: 700; color: #1E293B;">${numFrames}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-weight: 600; color: #64748B; min-width: 150px;">Reference String:</span>
        <span style="font-weight: 600; font-family: 'Courier New', 'SF Mono', monospace; background: #F1F5F9; padding: 6px 12px; border-radius: 4px; color: #1E293B;">${refString}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-weight: 600; color: #64748B; min-width: 150px;">Generated:</span>
        <span style="font-weight: 600; color: #1E293B;">${new Date().toLocaleString()}</span>
      </div>
    </div>
  `;
  
  return header;
}

/**
 * Create professional stats section
 */
function createStatsSection(statsContainer) {
  const statsDiv = document.createElement('div');
  statsDiv.style.cssText = `
    margin-bottom: 35px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
  `;
  
  const stats = statsContainer.querySelectorAll('.stat-card');
  stats.forEach(stat => {
    const label = stat.querySelector('.stat-label')?.textContent || '';
    const value = stat.querySelector('.stat-value')?.textContent || '';
    
    const statCard = document.createElement('div');
    statCard.style.cssText = `
      background: #F8FAFC;
      padding: 18px;
      border-radius: 10px;
      border: 2px solid #E2E8F0;
      text-align: center;
    `;
    
    statCard.innerHTML = `
      <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 10px;">
        ${label}
      </div>
      <div style="font-size: 28px; font-weight: 800; color: #1E293B; letter-spacing: -0.5px;">
        ${value}
      </div>
    `;
    
    statsDiv.appendChild(statCard);
  });
  
  return statsDiv;
}

/**
 * Create professional table section with enhanced visibility
 */
function createTableSection(originalTable, title) {
  const section = document.createElement('div');
  section.style.cssText = 'margin-bottom: 35px;';
  
  const titleElement = document.createElement('h2');
  titleElement.style.cssText = `
    color: #1E293B;
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 18px;
    display: flex;
    align-items: center;
    gap: 10px;
  `;
  titleElement.innerHTML = `
    <span style="
      background: #2563EB;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    ">📊</span>
    ${title}
  `;
  section.appendChild(titleElement);
  
  // Calculate actual table width
  const actualWidth = originalTable.scrollWidth;
  
  const table = document.createElement('table');
  table.style.cssText = `
    border-collapse: separate;
    border-spacing: 0;
    width: 100%;
    min-width: ${actualWidth}px;
    background: #FFFFFF;
    border: 2px solid #CBD5E1;
    border-radius: 12px;
    overflow: visible;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    table-layout: auto;
  `;
  
  // Clone and style thead
  const thead = originalTable.querySelector('thead');
  if (thead) {
    const theadClone = thead.cloneNode(true);
    const thCells = theadClone.querySelectorAll('th');
    thCells.forEach((th, index) => {
      th.style.cssText = `
        border: none;
        border-right: 1px solid #E2E8F0;
        border-bottom: 2px solid #CBD5E1;
        padding: 14px 18px;
        background: linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%);
        color: #1E293B;
        font-weight: 700;
        text-align: center;
        white-space: nowrap;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        min-width: 70px;
      `;
      
      if (index === thCells.length - 1) {
        th.style.borderRight = 'none';
      }
    });
    table.appendChild(theadClone);
  }
  
  // Clone and style tbody
  const tbody = originalTable.querySelector('tbody');
  if (tbody) {
    const tbodyClone = tbody.cloneNode(true);
    const rows = tbodyClone.querySelectorAll('tr');
    rows.forEach((row, rowIndex) => {
      const cells = row.querySelectorAll('td');
      cells.forEach((td, cellIndex) => {
        const text = td.textContent.trim();
        const isFault = td.classList.contains('cell-fault');
        const isHit = td.classList.contains('cell-hit');
        
        let bgColor = rowIndex % 2 === 0 ? '#FFFFFF' : '#FAFAFA';
        let borderBottom = rowIndex === rows.length - 1 ? 'none' : '1px solid #E2E8F0';
        let textColor = '#1E293B';
        
        if (cellIndex === 0) {
          bgColor = '#F8FAFC';
          textColor = '#1E293B';
        }
        
        td.style.cssText = `
          border: none;
          border-right: 1px solid #E2E8F0;
          border-bottom: ${borderBottom};
          padding: 12px 16px;
          background: ${bgColor};
          text-align: center;
          white-space: nowrap;
          font-weight: 600;
          font-size: 14px;
          color: ${textColor};
          min-width: 70px;
        `;
        
        if (cellIndex === cells.length - 1) {
          td.style.borderRight = 'none';
        }
        
        if (isFault) {
          // Full red background for FAULT cells
          td.style.background = '#DC2626';
          td.style.color = '#FFFFFF';
          td.style.fontWeight = '800';
          td.style.fontSize = '15px';
          td.textContent = text;
        } else if (isHit) {
          // Full green background for HIT cells
          td.style.background = '#16A34A';
          td.style.color = '#FFFFFF';
          td.style.fontWeight = '800';
          td.style.fontSize = '15px';
          td.textContent = text;
        } else if (text === '✓' || text === '✗' || text === '') {
          td.textContent = '';
          td.style.color = '#94A3B8';
        } else {
          td.textContent = text;
          td.style.color = '#1E293B';
        }
      });
    });
    table.appendChild(tbodyClone);
  }
  
  section.appendChild(table);
  return section;
}

/**
 * Create professional legend
 */
function createLegend() {
  const legend = document.createElement('div');
  legend.style.cssText = `
    margin-top: 25px;
    padding: 16px 22px;
    background: #F8FAFC;
    border-radius: 10px;
    border: 2px solid #E2E8F0;
    display: flex;
    align-items: center;
    gap: 30px;
    font-size: 14px;
    color: #1E293B;
  `;
  legend.innerHTML = `
    <span style="font-weight: 700; color: #64748B;">Legend:</span>
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="
        display: inline-block;
        width: 24px;
        height: 24px;
        background: #DC2626;
        border-radius: 4px;
      "></span>
      <span style="font-weight: 700; color: #1E293B;">Page Fault</span>
    </div>
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="
        display: inline-block;
        width: 24px;
        height: 24px;
        background: #16A34A;
        border-radius: 4px;
      "></span>
      <span style="font-weight: 700; color: #1E293B;">Page Hit</span>
    </div>
  `;
  
  return legend;
}

/**
 * Generate image from container using html2canvas
 */
async function generateImageFromContainer(wrapper) {
  const downloadContainer = wrapper.querySelector('div');
  const contentWidth = parseInt(downloadContainer.style.width);
  
  const canvas = await html2canvas(downloadContainer, {
    backgroundColor: '#FFFFFF',
    scale: 2,
    logging: false,
    useCORS: true,
    allowTaint: true,
    width: contentWidth,
    windowWidth: contentWidth,
    scrollX: 0,
    scrollY: 0,
    imageTimeout: 0
  });
  
  document.body.removeChild(wrapper);
  
  return canvas;
}

/**
 * Download canvas as image
 */
async function downloadImage(canvas, algorithm) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to create image blob'));
        return;
      }
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = getFormattedTimestamp();
      link.download = `page-replacement-${algorithm.toUpperCase()}-${timestamp}.png`;
      link.href = url;
      link.click();
      
      URL.revokeObjectURL(url);
      resolve();
    });
  });
}
