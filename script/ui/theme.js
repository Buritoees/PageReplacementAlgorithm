/**
 * Theme Management
 * Handles theme switching between dark, light, and glass modes
 */

/**
 * Initialize theme toggle functionality
 */
export function initThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;
  
  // Force dark mode as default - don't trust localStorage on first load
  let currentMode = localStorage.getItem('themeMode');
  
  // If no theme saved or invalid theme, set to dark
  if (!currentMode || !['dark', 'light', 'glass'].includes(currentMode)) {
    currentMode = 'dark';
    localStorage.setItem('themeMode', 'dark');
  }
  
  // Apply saved or default theme
  applyTheme(currentMode);
  
  // Click to cycle through themes
  themeToggle?.addEventListener('click', () => {
    // Cycle: dark → light → glass → dark
    let newMode;
    if (currentMode === 'dark') {
      newMode = 'light';
    } else if (currentMode === 'light') {
      newMode = 'glass';
    } else {
      newMode = 'dark';
    }
    
    currentMode = newMode;
    applyTheme(currentMode);
    localStorage.setItem('themeMode', currentMode);
  });
}

/**
 * Apply theme to the page
 * @param {string} mode - Theme mode ('dark', 'light', 'glass')
 */
function applyTheme(mode) {
  const body = document.body;
  const themeToggle = document.getElementById('theme-toggle');
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
 * @returns {string} - Current theme mode
 */
export function getCurrentTheme() {
  if (document.body.classList.contains('glass-mode')) {
    return 'glass';
  } else if (document.body.classList.contains('light-mode')) {
    return 'light';
  }
  return 'dark';
}
