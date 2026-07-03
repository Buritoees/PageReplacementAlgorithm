/**
 * Scroll Effects
 * Handles scroll-based animations and effects
 */

import { debounce } from '../utils/helpers.js';

/**
 * Initialize scroll animations
 */
export function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);
  
  // Observe all scroll animation elements
  document.querySelectorAll('.scroll-fade-in, .scroll-slide-left, .scroll-slide-right, .scroll-scale-in')
    .forEach(el => observer.observe(el));
}

/**
 * Initialize navbar scroll effects
 */
export function initNavbarScrollEffects() {
  let lastScroll = 0;
  let ticking = false;
  
  const handleScroll = () => {
    const navbar = document.querySelector('.navbar');
    const currentScroll = window.pageYOffset;
    const isMobile = window.innerWidth <= 768;
    
    if (!isMobile) {
      // Desktop - shadow effects only
      if (currentScroll > 50) {
        navbar.style.boxShadow = currentScroll > lastScroll 
          ? '0 4px 24px rgba(0, 0, 0, 0.2)' 
          : '0 2px 16px rgba(0, 0, 0, 0.3)';
      } else {
        navbar.style.boxShadow = '0 2px 16px rgba(0, 0, 0, 0.3)';
      }
    }
    
    lastScroll = currentScroll;
    ticking = false;
  };
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(handleScroll);
      ticking = true;
    }
  }, { passive: true });
}

/**
 * Setup drag-to-scroll for a container
 * @param {HTMLElement} container - Container element
 * @param {string} orientation - 'horizontal' or 'vertical'
 */
export function setupDragScroll(container, orientation = 'horizontal') {
  if (!container) return;
  
  const dragState = {
    isDragging: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
    velocityX: 0,
    velocityY: 0,
    lastX: 0,
    lastY: 0,
    lastTime: 0
  };
  
  // Mouse down - Start dragging
  container.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    
    dragState.isDragging = true;
    dragState.startX = e.pageX - container.offsetLeft;
    dragState.startY = e.pageY - container.offsetTop;
    dragState.scrollLeft = container.scrollLeft;
    dragState.scrollTop = container.scrollTop;
    dragState.velocityX = 0;
    dragState.velocityY = 0;
    dragState.lastX = e.pageX;
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
    
    if (orientation === 'horizontal' || orientation === 'both') {
      const x = e.pageX - container.offsetLeft;
      const walkX = (x - dragState.startX) * 2;
      container.scrollLeft = dragState.scrollLeft - walkX;
      
      // Calculate velocity for momentum
      const now = Date.now();
      const dt = now - dragState.lastTime;
      if (dt > 0) {
        dragState.velocityX = (e.pageX - dragState.lastX) / dt;
      }
      dragState.lastX = e.pageX;
    }
    
    if (orientation === 'vertical' || orientation === 'both') {
      const y = e.pageY - container.offsetTop;
      const walkY = (y - dragState.startY) * 2;
      container.scrollTop = dragState.scrollTop - walkY;
      
      // Calculate velocity for momentum
      const now = Date.now();
      const dt = now - dragState.lastTime;
      if (dt > 0) {
        dragState.velocityY = (e.pageY - dragState.lastY) / dt;
      }
      dragState.lastY = e.pageY;
    }
    
    dragState.lastTime = Date.now();
  });
  
  // Mouse up - Stop dragging with momentum
  const stopDragging = () => {
    if (!dragState.isDragging) return;
    
    dragState.isDragging = false;
    container.style.cursor = 'grab';
    container.style.userSelect = '';
    
    // Apply momentum/inertia effect
    if (orientation === 'horizontal' && Math.abs(dragState.velocityX) > 0.5) {
      applyMomentum(container, dragState, 'horizontal');
    }
    if (orientation === 'vertical' && Math.abs(dragState.velocityY) > 0.5) {
      applyMomentum(container, dragState, 'vertical');
    }
  };
  
  container.addEventListener('mouseup', stopDragging);
  container.addEventListener('mouseleave', stopDragging);
  
  // Set initial cursor
  container.style.cursor = 'grab';
}

/**
 * Apply momentum scrolling
 */
function applyMomentum(container, state, orientation) {
  let velocityX = orientation === 'horizontal' ? state.velocityX * -20 : 0;
  let velocityY = orientation === 'vertical' ? state.velocityY * -20 : 0;
  const deceleration = 0.94;
  const minVelocity = 0.3;
  
  const animate = () => {
    if (Math.abs(velocityX) < minVelocity && Math.abs(velocityY) < minVelocity) return;
    
    velocityX *= deceleration;
    velocityY *= deceleration;
    
    if (orientation === 'horizontal') {
      container.scrollLeft += velocityX;
    }
    if (orientation === 'vertical') {
      container.scrollTop += velocityY;
    }
    
    requestAnimationFrame(animate);
  };
  
  requestAnimationFrame(animate);
}

/**
 * Setup smooth wheel scroll for horizontal scrolling
 * @param {HTMLElement} container - Container element
 */
export function setupSmoothWheelScroll(container) {
  if (!container) return;
  
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
        
        wheelVelocity *= 0.88;
        container.scrollLeft += wheelVelocity;
        
        requestAnimationFrame(animate);
      };
      
      requestAnimationFrame(animate);
    }
  };
  
  container.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) > 0 && Math.abs(e.deltaX) === 0) {
      e.preventDefault();
      smoothWheelScroll(e.deltaY);
    }
  }, { passive: false });
}
