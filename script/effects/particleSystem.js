/**
 * Background Effects - Dynamic Cobweb Network
 * Creates an interactive cobweb of particles with click interactions
 * MOBILE OPTIMIZED: Disabled on mobile/low-performance devices
 */

class ParticleSystem {
  constructor() {
    this.canvas = document.getElementById('particle-canvas');
    if (!this.canvas) return;
    
    // Detect mobile devices - disable particles on mobile
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    this.isLowPerformance = navigator.hardwareConcurrency < 2;
    
    // Disable particles on mobile or low-end devices
    if (this.isMobile || this.isLowPerformance) {
      this.canvas.style.display = 'none';
      console.log('✅ Particles disabled for mobile/low-end devices');
      return;
    }
    
    console.log('✅ Particles enabled for desktop');
    
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: null, y: null, radius: 250, isPressed: false }; // Larger radius
    this.explodeTime = 0;
    
    this.init();
  }
  
  init() {
    this.resize();
    this.createParticles();
    this.addEventListeners();
    this.animate();
  }
  
  resize() {
    // Get the actual visible viewport dimensions accounting for zoom
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    const isMobile = viewportWidth <= 768;
    
    // Mobile: Expand canvas beyond viewport to allow particles to flow naturally
    // Desktop: Match viewport exactly
    const expansionFactor = isMobile ? 1.3 : 1.0; // 30% larger on mobile
    const newWidth = viewportWidth * expansionFactor;
    const newHeight = viewportHeight * expansionFactor;
    
    // Update canvas size
    this.canvas.width = newWidth;
    this.canvas.height = newHeight;
    
    // Center the expanded canvas on mobile
    if (isMobile) {
      const offset = ((expansionFactor - 1) / 2) * 100; // Calculate percentage offset
      this.canvas.style.left = `-${offset}%`;
      this.canvas.style.top = `-${offset}%`;
      this.canvas.style.width = `${expansionFactor * 100}%`;
      this.canvas.style.height = `${expansionFactor * 100}%`;
    } else {
      // Desktop: exact match
      this.canvas.style.left = '0';
      this.canvas.style.top = '0';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
    }
    
    // Mobile optimization: disable smoothing for better performance
    if (isMobile) {
      this.ctx.imageSmoothingEnabled = false;
    }
  }
  
  createParticles() {
    // Calculate optimal particle count based on screen resolution and pixel density
    const screenWidth = this.canvas.width;
    const screenHeight = this.canvas.height;
    const totalPixels = screenWidth * screenHeight;
    const pixelDensity = window.devicePixelRatio || 1;
    
    // Check if glass mode is active for additional reduction
    const isGlassMode = document.body.classList.contains('glass-mode');
    const isMobile = screenWidth < 768;
    
    // Base calculation: 1 particle per X pixels (adjusted for device pixel ratio)
    const pixelsPerParticle = 15000 * pixelDensity;
    let baseCount = Math.floor(totalPixels / pixelsPerParticle);
    
    // Apply resolution-based multipliers - Mobile optimized for zoom
    if (screenWidth < 768) {
      // Mobile: Optimized count scales with viewport size
      const zoomFactor = Math.min(screenWidth / 375, 1.5); // Normalize to iPhone viewport
      baseCount = Math.floor(baseCount * 0.5 * zoomFactor);
      
      // Further reduce in glass mode on mobile
      if (isGlassMode) {
        baseCount = Math.floor(baseCount * 0.7);
      }
    } else if (screenWidth < 1024) {
      // Tablet: Moderate reduction
      baseCount = Math.floor(baseCount * 0.6);
    } else if (screenWidth < 1440) {
      // Small desktop: Slight reduction
      baseCount = Math.floor(baseCount * 0.8);
    } else if (screenWidth >= 2560) {
      // 4K/Large screens: Cap to prevent too many particles
      baseCount = Math.floor(baseCount * 0.7);
    }
    
    // Set reasonable min/max bounds - Mobile optimized
    const minParticles = (isMobile && isGlassMode) ? 20 : (screenWidth < 768 ? 30 : 60);
    const maxParticles = (isMobile && isGlassMode) ? 50 : (screenWidth < 768 ? 70 : 350);
    
    const numberOfParticles = Math.max(minParticles, Math.min(maxParticles, baseCount));
    
    console.log(`Screen: ${screenWidth}x${screenHeight}, DPR: ${pixelDensity.toFixed(2)}, Glass: ${isGlassMode}, Particles: ${numberOfParticles}`);
    
    for (let i = 0; i < numberOfParticles; i++) {
      this.particles.push(new Particle(this.canvas.width, this.canvas.height));
    }
  }
  
  addEventListeners() {
    let resizeTimeout;
    const isMobile = window.innerWidth <= 768;
    
    // Handle resize and zoom changes
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      // Use longer debounce on mobile to prevent too many recreations during pinch zoom
      const debounceTime = isMobile ? 300 : 150;
      
      resizeTimeout = setTimeout(() => {
        this.resize();
        // Recreate particles for new canvas size
        this.particles = [];
        this.createParticles();
      }, debounceTime);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Listen for visual viewport changes (handles pinch zoom on mobile)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      // No need for scroll listener since canvas is now expanded
    }
    
    // Handle orientation change on mobile devices
    if (isMobile) {
      window.addEventListener('orientationchange', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          this.resize();
          this.particles = [];
          this.createParticles();
        }, 400); // Longer delay for orientation change
      });
    }
    
    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isGlassMode = document.body.classList.contains('glass-mode');
          const isMobile = window.innerWidth < 768;
          
          // Adjust particle count when switching to/from glass mode on mobile
          if (isMobile && isGlassMode !== this.wasGlassMode) {
            this.wasGlassMode = isGlassMode;
            
            // Debounce particle recreation
            clearTimeout(this.themeChangeTimeout);
            this.themeChangeTimeout = setTimeout(() => {
              const targetCount = isGlassMode ? 
                Math.floor(this.particles.length * 0.7) : // Reduce by 30% in glass mode
                Math.ceil(this.particles.length / 0.7);   // Restore when leaving glass mode
              
              const currentCount = this.particles.length;
              
              // Add or remove particles smoothly
              if (targetCount < currentCount) {
                // Remove excess particles
                this.particles.splice(targetCount, currentCount - targetCount);
              } else if (targetCount > currentCount) {
                // Add more particles
                const toAdd = Math.min(targetCount - currentCount, 30); // Max 30 at once
                for (let i = 0; i < toAdd; i++) {
                  this.particles.push(new Particle(this.canvas.width, this.canvas.height));
                }
              }
              
              console.log(`Theme changed - Particles adjusted: ${currentCount} → ${this.particles.length}`);
            }, 300);
          }
        }
      });
    });
    
    this.wasGlassMode = document.body.classList.contains('glass-mode');
    
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    // Mouse events - adjust for canvas offset on mobile
    window.addEventListener('mousemove', (e) => {
      const canvasRect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - canvasRect.left;
      this.mouse.y = e.clientY - canvasRect.top;
    });
    
    window.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
    
    // Mouse click interactions
    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // Left click
        this.mouse.isPressed = true;
        this.explodeTime = 0;
      }
    });
    
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) { // Left click
        this.mouse.isPressed = false;
        this.explodeTime = performance.now();
      }
    });
    
    // Touch events for mobile - adjust for canvas offset, handle multi-touch
    let lastTouchDistance = 0;
    
    window.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        // Single touch - normal interaction, adjust for canvas offset
        const canvasRect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.touches[0].clientX - canvasRect.left;
        this.mouse.y = e.touches[0].clientY - canvasRect.top;
        this.mouse.isPressed = true;
        this.explodeTime = 0;
      } else if (e.touches.length === 2) {
        // Two touches - might be pinch zoom, disable interaction
        this.mouse.isPressed = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastTouchDistance = Math.sqrt(dx * dx + dy * dy);
      }
    }, { passive: true });
    
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        // Single touch - update mouse position, adjust for canvas offset
        const canvasRect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.touches[0].clientX - canvasRect.left;
        this.mouse.y = e.touches[0].clientY - canvasRect.top;
      } else if (e.touches.length === 2) {
        // Two touches - detect pinch zoom
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDistance = Math.sqrt(dx * dx + dy * dy);
        
        // If distance changed significantly, it's a zoom
        if (Math.abs(currentDistance - lastTouchDistance) > 10) {
          this.mouse.isPressed = false;
          this.mouse.x = null;
          this.mouse.y = null;
        }
        lastTouchDistance = currentDistance;
      }
    }, { passive: true });
    
    window.addEventListener('touchend', () => {
      this.mouse.isPressed = false;
      this.explodeTime = performance.now();
      // Keep position for explosion effect, then clear
      setTimeout(() => {
        this.mouse.x = null;
        this.mouse.y = null;
      }, 500);
    }, { passive: true });
  }
  
  connectAllParticles() {
    // Check if light mode - match connection color to node color
    const isLightMode = document.body.classList.contains('light-mode');
    const baseColor = isLightMode ? '0, 0, 0' : '10, 132, 255'; // Black in light mode, blue in dark mode
    
    // Connect particles based on each node's individual connection distance
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Use the average of both particles' connection distances
        const avgConnectionDistance = (this.particles[i].connectionDistance + this.particles[j].connectionDistance) / 2;
        
        // Connect if within average connection distance
        if (distance < avgConnectionDistance) {
          const opacity = 1 - (distance / avgConnectionDistance);
          this.ctx.strokeStyle = `rgba(${baseColor}, ${opacity * 0.3})`;
          this.ctx.lineWidth = 0.8;
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    }
  }
  
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Check if recently exploded (within 300ms) - gentler timing
    const isExploding = this.explodeTime > 0 && (performance.now() - this.explodeTime < 300);
    
    // Update and draw particles
    this.particles.forEach(particle => {
      particle.update(this.mouse, this.canvas.width, this.canvas.height, isExploding);
    });
    
    // Draw density-based glows BEFORE particles
    this.drawDensityGlows();
    
    // Draw particles
    this.particles.forEach(particle => {
      particle.draw(this.ctx);
    });
    
    // Draw cobweb connections
    this.connectAllParticles();
    
    requestAnimationFrame(() => this.animate());
  }
  
  drawDensityGlows() {
    const isLightMode = document.body.classList.contains('light-mode');
    const densityRadius = 80; // Check within 80px radius
    
    // For each particle, check density around it
    this.particles.forEach(particle => {
      let nearbyCount = 0;
      
      // Count nearby particles
      this.particles.forEach(other => {
        if (particle === other) return;
        
        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < densityRadius) {
          nearbyCount++;
        }
      });
      
      // Draw glow based on density (more nodes = brighter glow)
      if (nearbyCount > 0) {
        const glowIntensity = Math.min(nearbyCount / 8, 1); // Cap at 8 nodes for full intensity
        const glowSize = densityRadius * (0.5 + glowIntensity * 0.5);
        
        const gradient = this.ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, glowSize
        );
        
        if (isLightMode) {
          gradient.addColorStop(0, `rgba(0, 122, 255, ${0.08 * glowIntensity})`);
          gradient.addColorStop(1, 'transparent');
        } else {
          gradient.addColorStop(0, `rgba(10, 132, 255, ${0.12 * glowIntensity})`);
          gradient.addColorStop(1, 'transparent');
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, glowSize, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });
  }
}

class Particle {
  constructor(canvasWidth, canvasHeight) {
    // Current position
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    
    // Home position (where particle returns to)
    this.homeX = this.x;
    this.homeY = this.y;
    
    this.size = Math.random() * 2 + 1.5;
    
    // Random connection distance (how far this node connects to others)
    this.connectionDistance = Math.random() * 150 + 100; // 100-250px range
    
    // Random movement velocity for fluid motion
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    
    // For smooth repulsion/attraction
    this.ax = 0;
    this.ay = 0;
    this.friction = 0.92; // Lower friction for more control
    
    // Random phase for sine wave movement (fluid effect)
    this.phaseX = Math.random() * Math.PI * 2;
    this.phaseY = Math.random() * Math.PI * 2;
    this.phaseSpeedX = (Math.random() - 0.5) * 0.01;
    this.phaseSpeedY = (Math.random() - 0.5) * 0.01;
    
    this.color = `rgba(10, 132, 255, 0.7)`; // iOS blue for dark mode
  }
  
  draw(ctx) {
    // Check if light mode
    const isLightMode = document.body.classList.contains('light-mode');
    const color = isLightMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(10, 132, 255, 0.7)'; // Black in light mode
    
    // Draw particle node
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    
    // Add subtle glow (smaller and subtler)
    const glowColor = isLightMode ? 'rgba(0, 0, 0' : 'rgba(10, 132, 255';
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 1.5);
    gradient.addColorStop(0, `${glowColor}, 0.2)`);
    gradient.addColorStop(1, `${glowColor}, 0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }
  
  update(mouse, canvasWidth, canvasHeight, isExploding) {
    let isNearMouse = false;
    
    // Mouse interaction
    if (mouse.x !== null && mouse.y !== null) {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < mouse.radius) {
        isNearMouse = true;
        
        if (isExploding) {
          // EXPLODE - Scatter in random directions with gentler force
          const randomAngle = Math.random() * Math.PI * 2;
          const explosionForce = (mouse.radius - distance) / mouse.radius;
          
          this.vx += Math.cos(randomAngle) * explosionForce * 4; // Reduced from 15 to 4
          this.vy += Math.sin(randomAngle) * explosionForce * 4;
          
        } else if (mouse.isPressed) {
          // ATTRACT - Strong pull toward cursor center
          const force = (mouse.radius - distance) / mouse.radius;
          const forceDirectionX = -dx / distance; // Negative = attract
          const forceDirectionY = -dy / distance;
          
          this.vx += forceDirectionX * force * 2.5; // Stronger attraction
          this.vy += forceDirectionY * force * 2.5;
          
        } else {
          // REPEL - Strong push away from cursor
          const force = (mouse.radius - distance) / mouse.radius;
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          
          this.vx += forceDirectionX * force * 2.0; // Stronger repulsion
          this.vy += forceDirectionY * force * 2.0;
        }
      }
    }
    
    // Smooth fluid-like sine wave movement (very subtle)
    this.phaseX += this.phaseSpeedX;
    this.phaseY += this.phaseSpeedY;
    
    const sineForceX = Math.sin(this.phaseX) * 0.05;
    const sineForceY = Math.sin(this.phaseY) * 0.05;
    
    // Add very subtle random drift
    const randomForceX = (Math.random() - 0.5) * 0.02;
    const randomForceY = (Math.random() - 0.5) * 0.02;
    
    this.vx += sineForceX + randomForceX;
    this.vy += sineForceY + randomForceY;
    
    // Strong return to home position with distance-based force
    const dxHome = this.homeX - this.x;
    const dyHome = this.homeY - this.y;
    const distanceFromHome = Math.sqrt(dxHome * dxHome + dyHome * dyHome);
    
    // Progressively stronger pull the farther from home
    let returnForce = 0.02; // Base return force
    
    if (distanceFromHome > 200) {
      // Very strong pull if too far from home
      returnForce = 0.18;
    } else if (distanceFromHome > 150) {
      // Very strong pull if too far from home
      returnForce = 0.12;
    } else if (distanceFromHome > 100) {
      // Strong pull if far from home
      returnForce = 0.06;
    } else if (distanceFromHome > 50) {
      // Medium pull
      returnForce = 0.03;
    }
    
    if (distanceFromHome > 1) {
      this.vx += dxHome * returnForce;
      this.vy += dyHome * returnForce;
    }
    
    // Apply friction for smooth movement
    this.vx *= this.friction;
    this.vy *= this.friction;
    
    // Apply movement
    this.x += this.vx;
    this.y += this.vy;
    
    // Velocity limits
    const maxSpeed = 8; // Increased for more dynamic movement
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > maxSpeed) {
      this.vx = (this.vx / speed) * maxSpeed;
      this.vy = (this.vy / speed) * maxSpeed;
    }
    
    // Update home position with very gentle drift
    this.homeX += Math.sin(this.phaseX * 0.5) * 0.15;
    this.homeY += Math.sin(this.phaseY * 0.5) * 0.15;
    
    // Allow particles to flow naturally beyond edges, especially on mobile
    const isMobile = canvasWidth < 768;
    const buffer = isMobile ? 150 : 50; // Larger buffer on mobile for natural flow
    
    // Wraparound logic - if particle goes too far off one side, bring it back from the other
    if (this.x < -buffer) {
      this.x = canvasWidth + buffer;
      this.homeX = canvasWidth - 100;
    }
    if (this.x > canvasWidth + buffer) {
      this.x = -buffer;
      this.homeX = 100;
    }
    if (this.y < -buffer) {
      this.y = canvasHeight + buffer;
      this.homeY = canvasHeight - 100;
    }
    if (this.y > canvasHeight + buffer) {
      this.y = -buffer;
      this.homeY = 100;
    }
    
    // Keep home position within canvas bounds but allow particles to wander
    const homePadding = isMobile ? 80 : 50;
    if (this.homeX < homePadding) this.homeX = homePadding + Math.random() * 50;
    if (this.homeX > canvasWidth - homePadding) this.homeX = canvasWidth - homePadding - Math.random() * 50;
    if (this.homeY < homePadding) this.homeY = homePadding + Math.random() * 50;
    if (this.homeY > canvasHeight - homePadding) this.homeY = canvasHeight - homePadding - Math.random() * 50;
  }
}

// Initialize particle system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ParticleSystem();
});
