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
 */

(function initProjectsSection() {
  'use strict';

  /**
   * State
   */
  let isInitialized = false;
  let elements = {};

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

    // Throttle scroll handler for performance
    const throttledScroll = Utils.throttle(handleScroll, 100);

    elements.grid.addEventListener('scroll', throttledScroll, {
      passive: true,
    });

    // Initial check
    handleScroll();

    // Re-check on window resize
    window.addEventListener('resize', Utils.debounce(handleScroll, 250));

    // Re-check when grid size changes
    const resizeObserver = new ResizeObserver(handleScroll);
    resizeObserver.observe(elements.grid);

    console.log('✅ [Projects] Scroll hints setup');
  }

  /**
   * Setup keyboard navigation
   */
  function setupKeyboardNav() {
    if (!elements.grid) return;

    document.addEventListener('keydown', (e) => {
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
    });

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
   * Reset projects section
   */
  function reset() {
    isInitialized = false;
    elements = {};
    console.log('🔄 [Projects] Reset');
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
    reset();
    setTimeout(initialize, 300);
  });

  console.log('✅ [Projects] Module loaded');
})();