/**
 * =======================================================
 * 📄 File: js/sections/section-projects.js
 * 🎯 Purpose: Projects Gallery Interactions
 * Author: Saleh Abedinezhad (ImSalione)
 * =======================================================
 * Features:
 * - Horizontal scroll management with mouse wheel
 * - Scroll fade hints
 * - Keyboard navigation
 * - Clickable cards (no separate buttons)
 * - GitHub chart integration
 * =======================================================
 * ✅ OPTIMIZED: Proper observer cleanup and resource management
 * ✅ NEW: Mouse wheel horizontal scroll
 * =======================================================
 */

(function initProjectsSection() {
  'use strict';

  /**
   * State
   */
  let isInitialized = false;
  let elements = {};
  
  // ✅ Cleanup trackers
  let resizeObserver = null;
  let scrollHandler = null;
  let resizeHandler = null;
  let keyboardHandler = null;
  let wheelHandler = null;
  let mouseEnterHandler = null;
  let mouseLeaveHandler = null;

  /**
   * ✅ Cleanup function
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

    // Remove wheel listener
    if (wheelHandler && elements.grid) {
      elements.grid.removeEventListener('wheel', wheelHandler);
      wheelHandler = null;
      console.log('✅ [Projects] Wheel listener removed');
    }

    // Remove mouse enter/leave listeners
    if (mouseEnterHandler && elements.grid) {
      elements.grid.removeEventListener('mouseenter', mouseEnterHandler);
      mouseEnterHandler = null;
    }
    if (mouseLeaveHandler && elements.grid) {
      elements.grid.removeEventListener('mouseleave', mouseLeaveHandler);
      mouseLeaveHandler = null;
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
   * ✨ Setup horizontal scroll with mouse wheel
   */
  function setupHorizontalScroll() {
    if (!elements.grid) return;

    // ✨ تبدیل اسکرول عمودی به افقی
    wheelHandler = (e) => {
      // فقط زمانی که اسکرول عمودی وجود ندارد
      if (e.deltaY !== 0) {
        e.preventDefault();
        elements.grid.scrollLeft += e.deltaY;
      }
    };

    // ✨ فعال‌سازی اسکرول افقی با ورود ماوس
    mouseEnterHandler = () => {
      elements.grid.classList.add('horizontal-scroll-active');
      elements.grid.addEventListener('wheel', wheelHandler, { passive: false });
    };

    // ✨ غیرفعال‌سازی با خروج ماوس
    mouseLeaveHandler = () => {
      elements.grid.classList.remove('horizontal-scroll-active');
      elements.grid.removeEventListener('wheel', wheelHandler);
    };

    elements.grid.addEventListener('mouseenter', mouseEnterHandler);
    elements.grid.addEventListener('mouseleave', mouseLeaveHandler);

    console.log('✅ [Projects] Horizontal scroll setup');
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
   * ✨ Setup clickable cards
   */
  function setupClickableCards() {
    if (!elements.grid) return;

    const cards = elements.grid.querySelectorAll('.project-card:not(.github-activity-card)');
    
    cards.forEach(card => {
      // بدست آوردن لینک از data attribute یا از دکمه قبلی
      const link = card.dataset.projectUrl || 
                   card.querySelector('a')?.href || 
                   card.querySelector('[href]')?.href;
      
      if (link) {
        card.style.cursor = 'pointer';
        
        card.addEventListener('click', (e) => {
          // جلوگیری از باز شدن لینک اگر روی عناصر داخلی کلیک شد
          if (e.target.tagName === 'A' || e.target.closest('a')) {
            return;
          }
          
          window.open(link, '_blank', 'noopener,noreferrer');
        });
      }
    });

    // Setup GitHub card click
    const githubCard = elements.grid.querySelector('.github-activity-card');
    if (githubCard) {
      githubCard.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' || e.target.closest('a')) {
          return;
        }
        window.open('https://github.com/ImSalione', '_blank', 'noopener,noreferrer');
      });
    }

    console.log('✅ [Projects] Clickable cards setup');
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
    setupHorizontalScroll();
    setupKeyboardNav();
    setupClickableCards();
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