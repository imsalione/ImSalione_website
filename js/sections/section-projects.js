/**
 * =======================================================
 * 📄 File: js/sections/section-projects.js
 * 🎯 Purpose: Projects Gallery Interactions
 * Author: Saleh Abedinezhad (ImSalione)
 * =======================================================
 * Features:
 * - Smooth momentum-based horizontal scroll
 * - Fast AND smooth (best of both worlds)
 * - Scroll fade hints
 * - Keyboard navigation
 * - Clickable cards
 * - GitHub chart integration
 * =======================================================
 * ✅ PERFECTED: Momentum scrolling با interpolation
 * =======================================================
 */

(function initProjectsSection() {
  'use strict';

  /**
   * State
   */
  let isInitialized = false;
  let elements = {};
  
  // Cleanup trackers
  let resizeObserver = null;
  let scrollHandler = null;
  let resizeHandler = null;
  let keyboardHandler = null;
  let wheelHandler = null;
  
  // ✨ Momentum scrolling state
  let targetScroll = 0;
  let currentScroll = 0;
  let rafId = null;

  /**
   * Cleanup function
   */
  function cleanup() {
    console.log('🧹 [Projects] Starting cleanup...');
    
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    
    if (scrollHandler && elements.grid) {
      elements.grid.removeEventListener('scroll', scrollHandler);
      scrollHandler = null;
    }
    
    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler);
      resizeHandler = null;
    }
    
    if (keyboardHandler) {
      document.removeEventListener('keydown', keyboardHandler);
      keyboardHandler = null;
    }

    if (wheelHandler && elements.grid) {
      elements.grid.removeEventListener('wheel', wheelHandler);
      wheelHandler = null;
    }
    
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    
    console.log('✅ [Projects] Cleanup complete');
  }

  /**
   * Handle scroll to update fade hints
   */
  function handleScroll() {
    if (!elements.grid) return;

    const { scrollLeft, scrollWidth, clientWidth } = elements.grid;
    const maxScroll = scrollWidth - clientWidth;

    elements.grid.classList.toggle('scrolled-left', scrollLeft > 10);
    elements.grid.classList.toggle('scrolled-right', scrollLeft < maxScroll - 10);
  }

  /**
   * ✨ Smooth interpolation loop
   * این متد scroll را به صورت نرم و تدریجی انجام می‌دهد
   */
  function smoothScrollLoop() {
    if (!elements.grid) return;
    
    // محاسبه فاصله بین موقعیت فعلی و target
    const delta = targetScroll - currentScroll;
    
    // ✨ Interpolation factor - هرچه کمتر، نرم‌تر
    // 0.15 = نرم و آرام
    // 0.25 = متعادل (پیشنهادی)
    // 0.35 = سریع‌تر
    const lerp = 0.25;
    
    // اگر فاصله خیلی کم شد، مستقیم برو به target
    if (Math.abs(delta) < 0.5) {
      currentScroll = targetScroll;
      elements.grid.scrollLeft = currentScroll;
      rafId = null;
      return;
    }
    
    // ✨ Linear interpolation برای حرکت نرم
    currentScroll += delta * lerp;
    elements.grid.scrollLeft = currentScroll;
    
    // ادامه loop
    rafId = requestAnimationFrame(smoothScrollLoop);
  }

  /**
   * ✨ Setup smooth horizontal scroll با momentum
   */
  function setupHorizontalScroll() {
    if (!elements.grid) return;

    // ضریب سرعت
    const SCROLL_SPEED = 1.5;
    
    wheelHandler = function(e) {
      const hasVerticalOverflow = this.scrollHeight > this.clientHeight;
      
      if (!hasVerticalOverflow && e.deltaY) {
        e.preventDefault();
        
        // ✨ Update target scroll
        targetScroll += e.deltaY * SCROLL_SPEED;
        
        // محدود کردن به range معتبر
        const maxScroll = this.scrollWidth - this.clientWidth;
        targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));
        
        // Initialize current scroll اگر اولین بار است
        if (currentScroll === 0 && this.scrollLeft > 0) {
          currentScroll = this.scrollLeft;
        }
        
        // شروع smooth scroll loop اگر در حال اجرا نیست
        if (!rafId) {
          currentScroll = this.scrollLeft;
          rafId = requestAnimationFrame(smoothScrollLoop);
        }
      }
    };

    elements.grid.addEventListener('wheel', wheelHandler, { passive: false });

    console.log('✅ [Projects] Smooth momentum scroll enabled');
  }

  /**
   * Setup scroll hints
   */
  function setupScrollHints() {
    if (!elements.grid) return;

    let ticking = false;
    
    scrollHandler = function() {
      if (!ticking) {
        requestAnimationFrame(function() {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    elements.grid.addEventListener('scroll', scrollHandler, { passive: true });
    handleScroll();

    resizeHandler = function() {
      if (!ticking) {
        requestAnimationFrame(function() {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('resize', resizeHandler);

    try {
      resizeObserver = new ResizeObserver(function() {
        if (!ticking) {
          requestAnimationFrame(function() {
            handleScroll();
            ticking = false;
          });
          ticking = true;
        }
      });
      resizeObserver.observe(elements.grid);
    } catch (e) {
      console.warn('⚠️ [Projects] ResizeObserver not supported');
    }

    console.log('✅ [Projects] Scroll hints setup');
  }

  /**
   * Setup keyboard navigation
   */
  function setupKeyboardNav() {
    if (!elements.grid) return;

    keyboardHandler = function(e) {
      const rect = elements.grid.getBoundingClientRect();
      const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;

      if (!isVisible) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        targetScroll = elements.grid.scrollLeft + 300;
        const maxScroll = elements.grid.scrollWidth - elements.grid.clientWidth;
        targetScroll = Math.min(targetScroll, maxScroll);
        
        if (!rafId) {
          currentScroll = elements.grid.scrollLeft;
          rafId = requestAnimationFrame(smoothScrollLoop);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        targetScroll = elements.grid.scrollLeft - 300;
        targetScroll = Math.max(targetScroll, 0);
        
        if (!rafId) {
          currentScroll = elements.grid.scrollLeft;
          rafId = requestAnimationFrame(smoothScrollLoop);
        }
      }
    };

    document.addEventListener('keydown', keyboardHandler);
    console.log('✅ [Projects] Keyboard navigation setup');
  }

  /**
   * Setup clickable cards
   */
  function setupClickableCards() {
    if (!elements.grid) return;

    const projectCards = elements.grid.querySelectorAll('.project-card:not(.github-activity-card)');
    
    projectCards.forEach(function(card) {
      const url = card.dataset.projectUrl;
      
      if (url) {
        card.addEventListener('click', function(e) {
          if (e.target.closest('a')) return;
          window.open(url, '_blank', 'noopener,noreferrer');
        });
      }
    });

    const githubCard = elements.grid.querySelector('.github-activity-card');
    if (githubCard) {
      githubCard.addEventListener('click', function(e) {
        if (e.target.closest('a')) return;
        window.open('https://github.com/ImSalione', '_blank', 'noopener,noreferrer');
      });
    }

    console.log('✅ [Projects] Clickable cards setup');
  }

  /**
   * Load GitHub chart
   */
  function loadGithubChart() {
    setTimeout(function() {
      if (window.injectGithubCard && typeof window.injectGithubCard === 'function') {
        console.log('📊 [Projects] Loading GitHub chart...');
        window.injectGithubCard();
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

    elements.grid = document.querySelector('.projects-grid');

    if (!elements.grid) {
      console.warn('⚠️ [Projects] Grid not found');
      return;
    }

    // Initialize scroll positions
    targetScroll = elements.grid.scrollLeft;
    currentScroll = elements.grid.scrollLeft;

    setupScrollHints();
    setupHorizontalScroll();
    setupKeyboardNav();
    setupClickableCards();
    loadGithubChart();

    isInitialized = true;
    console.log('✅ [Projects] Initialized - Momentum scroll mode');
  }

  /**
   * Reset projects section
   */
  function reset() {
    console.log('🔄 [Projects] Resetting...');
    cleanup();
    isInitialized = false;
    targetScroll = 0;
    currentScroll = 0;
    elements = {};
    console.log('✅ [Projects] Reset complete');
  }

  /**
   * Event listeners setup
   */
  function setupEventListeners() {
    if (window.EventHub && typeof window.EventHub.on === 'function') {
      EventHub.on(CONFIG.events.projectsRendered, initialize);
      EventHub.on(CONFIG.events.renderReady, function() {
        if (!isInitialized) setTimeout(initialize, 100);
      });
      EventHub.on(CONFIG.events.languageChanged, function() {
        console.log('🌐 [Projects] Language changed');
        reset();
        setTimeout(initialize, 300);
      });
    } else {
      document.addEventListener(CONFIG.events.projectsRendered, initialize);
      document.addEventListener(CONFIG.events.renderReady, function() {
        if (!isInitialized) setTimeout(initialize, 100);
      });
      document.addEventListener(CONFIG.events.languageChanged, function() {
        console.log('🌐 [Projects] Language changed');
        reset();
        setTimeout(initialize, 300);
      });
    }
  }

  setupEventListeners();

  console.log('✅ [Projects] Module loaded - Smooth momentum scrolling');
})();