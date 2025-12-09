/**
 * =======================================================
 * 📄 File: js/sections/section-projects.js
 * 🎯 Purpose: Projects Gallery Interactions
 * Author: Saleh Abedinezhad (ImSalione)
 * =======================================================
 * Features:
 * - Horizontal scroll management
 * - Scroll fade hints
 * - Keyboard navigation
 * - GitHub chart integration
 * =======================================================
 * ✅ OPTIMIZED: Proper observer cleanup and resource management
 * ✅ FIXED: CPU usage reduced by preventing memory leaks
 * =======================================================
 */

(function initProjectsSection() {
  'use strict';

  /**
   * State
   */
  let isInitialized = false;
  let elements = {};
  
  // ✅ Cleanup trackers - برای پاکسازی منابع
  let resizeObserver = null;
  let scrollHandler = null;
  let resizeHandler = null;
  let keyboardHandler = null;

  /**
   * ✅ Cleanup function - پاکسازی تمام منابع
   */
  function cleanup() {
    console.log('🧹 [Projects] Starting cleanup...');
    
    // Disconnect ResizeObserver
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
      console.log('✅ [Projects] ResizeObserver disconnected');
    }
    
    // Remove scroll listener
    if (scrollHandler && elements.grid) {
      elements.grid.removeEventListener('scroll', scrollHandler);
      scrollHandler = null;
      console.log('✅ [Projects] Scroll listener removed');
    }
    
    // Remove resize listener
    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler);
      resizeHandler = null;
      console.log('✅ [Projects] Resize listener removed');
    }
    
    // Remove keyboard listener
    if (keyboardHandler) {
      document.removeEventListener('keydown', keyboardHandler);
      keyboardHandler = null;
      console.log('✅ [Projects] Keyboard listener removed');
    }
    
    console.log('✅ [Projects] Cleanup complete');
  }

  /**
   * Handle scroll to update fade hints
   */
  function handleScroll() {
    if (!elements.grid) return;

    const maxScroll = elements.grid.scrollWidth - elements.grid.clientWidth;

    // Add/remove scroll state classes
    elements.grid.classList.toggle(
      'scrolled-left',
      elements.grid.scrollLeft > 10
    );

    elements.grid.classList.toggle(
      'scrolled-right',
      elements.grid.scrollLeft < maxScroll - 10
    );
  }

  /**
   * Setup scroll hints
   */
  function setupScrollHints() {
    if (!elements.grid) return;

    // ✅ Create and store throttled scroll handler
    scrollHandler = Utils.throttle(handleScroll, 100);

    elements.grid.addEventListener('scroll', scrollHandler, {
      passive: true,
    });

    // Initial check
    handleScroll();

    // ✅ Create and store debounced resize handler
    resizeHandler = Utils.debounce(handleScroll, 250);
    window.addEventListener('resize', resizeHandler);

    // ✅ Create and store ResizeObserver
    resizeObserver = new ResizeObserver(handleScroll);
    resizeObserver.observe(elements.grid);

    console.log('✅ [Projects] Scroll hints setup');
  }

  /**
   * Setup keyboard navigation
   */
  function setupKeyboardNav() {
    if (!elements.grid) return;

    // ✅ Store keyboard handler for cleanup
    keyboardHandler = (e) => {
      // Only navigate if grid is in viewport
      const rect = elements.grid.getBoundingClientRect();
      const isInViewport =
        rect.top >= 0 &&
        rect.bottom <=
          (window.innerHeight || document.documentElement.clientHeight);

      if (!isInViewport) return;

      // Arrow key navigation
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        elements.grid.scrollBy({ left: 300, behavior: 'smooth' });
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        elements.grid.scrollBy({ left: -300, behavior: 'smooth' });
      }
    };

    document.addEventListener('keydown', keyboardHandler);

    console.log('✅ [Projects] Keyboard navigation setup');
  }

  /**
   * Load GitHub chart
   */
  function loadGithubChart() {
    setTimeout(() => {
      if (window.injectGithubCard) {
        console.log('📊 [Projects] Loading GitHub chart...');
        window.injectGithubCard();
      } else {
        console.warn('⚠️ [Projects] GitHub chart loader not available');
      }
    }, 800);
  }

  /**
   * Initialize projects section
   */
  function initialize() {
    if (isInitialized) {
      console.log('ℹ️ [Projects] Already initialized');
      return;
    }

    console.log('🚀 [Projects] Initializing...');

    // Get elements
    elements = {
      grid: document.querySelector('.projects-grid'),
    };

    if (!elements.grid) {
      console.warn('⚠️ [Projects] Grid not found');
      return;
    }

    // Setup features
    setupScrollHints();
    setupKeyboardNav();
    loadGithubChart();

    isInitialized = true;
    console.log('✅ [Projects] Initialized');
  }

  /**
   * ✅ Reset projects section with proper cleanup
   */
  function reset() {
    console.log('🔄 [Projects] Resetting...');
    
    // ✅ CRITICAL: Cleanup all resources first
    cleanup();
    
    // Reset state
    isInitialized = false;
    elements = {};
    
    console.log('✅ [Projects] Reset complete');
  }

  /**
   * Event listeners
   */
  document.addEventListener(CONFIG.events.projectsRendered, initialize);

  document.addEventListener(CONFIG.events.renderReady, () => {
    if (!isInitialized) {
      setTimeout(initialize, 100);
    }
  });

  document.addEventListener(CONFIG.events.languageChanged, () => {
    console.log('🌐 [Projects] Language changed, resetting...');
    reset();
    setTimeout(initialize, 300);
  });

  console.log('✅ [Projects] Module loaded');
})();