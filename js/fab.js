/**
 * =======================================================
 * ⚙️ FAB Menu - Unified Palette & Settings System
 * File: js/fab.js
 * Author: Saleh Abedinezhad (ImSalione)
 * =======================================================
 * Responsibilities:
 * - Control color palette via data-theme-style
 * - Handle theme and language toggles
 * - Play one-time intro animation
 * - Persist settings to localStorage
 * - Enhanced glassmorphism integration
 * =======================================================
 */

(function initFAB() {
  'use strict';

  // Prevent double initialization
  if (window.fabInitialized) {
    console.warn('⚠️ FAB already initialized, skipping');
    return;
  }

  console.log('🎨 [FAB] Module loading...');

  /**
   * State
   */
  let isOpen = false;
  let isPaletteOpen = false;
  let elements = {};

  /**
   * Wait for FAB elements to be available in DOM
   */
  async function waitForElements() {
    return new Promise((resolve) => {
      const maxAttempts = 50;
      let attempts = 0;

      const check = () => {
        attempts++;

        elements = {
          menu: document.getElementById('fabMenu'),
          main: document.getElementById('fabMain'),
          submenu: document.getElementById('fabSubmenu'),
          paletteBtn: document.getElementById('paletteToggle'),
          paletteMenu: document.getElementById('fabPalette'),
          themeBtn: document.getElementById('themeToggle'),
          langBtn: document.getElementById('langToggle'),
        };

        const allFound = elements.menu && elements.main && elements.submenu;

        if (allFound) {
          console.log('✅ [FAB] Elements found');
          resolve(true);
        } else if (attempts >= maxAttempts) {
          console.error('❌ [FAB] Elements not found after max attempts');
          resolve(false);
        } else {
          setTimeout(check, 100);
        }
      };

      check();
    });
  }

  /**
   * Apply theme style (palette) with smooth transition
   */
  function applyThemeStyle(styleName, persist = true) {
    if (!styleName) return;

    console.log(`🎨 [FAB] Applying palette: ${styleName}`);

    // Add transition class for smooth color change
    document.documentElement.classList.add('theme-transitioning');
    document.body.classList.add('theme-transitioning');

    // Apply to DOM - CRITICAL: Set on both html and body
    document.documentElement.setAttribute('data-theme-style', styleName);
    document.body.setAttribute('data-theme-style', styleName);
    
    // Also apply as dataset for easier access
    document.documentElement.dataset.themeStyle = styleName;
    document.body.dataset.themeStyle = styleName;

    // Persist to storage
    if (persist) {
      CONFIG.saveSetting(CONFIG.storage.themeStyle, styleName);
    }

    // Highlight active swatch
    highlightActiveSwatch(styleName);

    // Remove transition class after animation
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
      document.body.classList.remove('theme-transitioning');
    }, 350);

    // Emit event
    const event = new CustomEvent(CONFIG.events.fabPaletteSelect, {
      detail: { color: styleName },
    });
    document.dispatchEvent(event);

    // Emit legacy event for backward compatibility
    if (window.EventHub && typeof window.EventHub.emit === 'function') {
      window.EventHub.emit(CONFIG.events.paletteChanged, { color: styleName });
    }

    // Show notification
    showNotification(`Palette: ${styleName}`, '🎨');
    
    console.log(`✅ [FAB] Palette applied: ${styleName}`);
  }

  /**
   * Highlight active color swatch
   */
  function highlightActiveSwatch(styleName) {
    if (!elements.paletteMenu) return;

    const swatches = elements.paletteMenu.querySelectorAll('.color-swatch');

    swatches.forEach((swatch) => {
      const swatchName = swatch.getAttribute('data-color');

      if (swatchName === styleName) {
        swatch.classList.add('fab-swatch-active');
        swatch.setAttribute('aria-selected', 'true');
      } else {
        swatch.classList.remove('fab-swatch-active');
        swatch.setAttribute('aria-selected', 'false');
      }
    });
  }

  /**
   * One-time intro animation
   */
  function runIntroAnimation() {
    // Check if already shown
    try {
      if (localStorage.getItem(CONFIG.storage.fabIntroShown) === '1') {
        console.log('⭐ [FAB] Intro already shown, skipping');
        return;
      }
    } catch (err) {
      console.warn('⚠️ Cannot check intro status:', err);
      return;
    }

    const options = elements.submenu?.querySelectorAll('.fab-option');
    if (!options || options.length === 0) return;

    console.log('🎬 [FAB] Running intro animation');

    const timings = {
      startDelay: 600,
      stepDelay: 260,
      closeDelay: 350,
    };

    setTimeout(() => {
      // Open menu with smooth animation
      elements.menu.classList.add('open');
      elements.main.classList.add('fab-intro-active');
      isOpen = true;

      let index = 0;

      const interval = setInterval(() => {
        // Clear previous pulses
        options.forEach((btn) => btn.classList.remove('fab-intro-pulse'));

        if (index >= options.length) {
          clearInterval(interval);

          // Close menu
          setTimeout(() => {
            elements.menu.classList.remove('open');
            elements.paletteMenu?.classList.remove('open');
            elements.main.classList.remove('fab-intro-active');
            isOpen = false;
            isPaletteOpen = false;

            options.forEach((btn) => btn.classList.remove('fab-intro-pulse'));

            // Mark as shown
            try {
              localStorage.setItem(CONFIG.storage.fabIntroShown, '1');
            } catch (err) {
              console.warn('⚠️ Cannot save intro status:', err);
            }

            console.log('✅ [FAB] Intro animation complete');
          }, timings.closeDelay);

          return;
        }

        // Pulse current option (bottom to top)
        const current = options[options.length - 1 - index];
        current.classList.add('fab-intro-pulse');

        index++;
      }, timings.stepDelay);
    }, timings.startDelay);
  }

  /**
   * Setup event listeners
   */
  function setupEventListeners() {
    console.log('🔗 [FAB] Setting up event listeners...');

    // Toggle main FAB
    elements.main.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      isOpen = !isOpen;
      elements.menu.classList.toggle('open', isOpen);
      elements.main.classList.toggle('fab-active', isOpen);

      console.log(`🎨 [FAB] ${isOpen ? 'Opened' : 'Closed'}`);

      if (!isOpen) {
        elements.paletteMenu?.classList.remove('open');
        isPaletteOpen = false;
      }

      // Add haptic feedback on mobile
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(10);
      }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!elements.menu.contains(e.target) && isOpen) {
        elements.menu.classList.remove('open');
        elements.paletteMenu?.classList.remove('open');
        elements.main.classList.remove('fab-active');
        isOpen = false;
        isPaletteOpen = false;
        console.log('🎨 [FAB] Closed (outside click)');
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) {
        elements.menu.classList.remove('open');
        elements.paletteMenu?.classList.remove('open');
        elements.main.classList.remove('fab-active');
        isOpen = false;
        isPaletteOpen = false;
        console.log('🎨 [FAB] Closed (ESC key)');
      }
    });

    // Toggle palette submenu
    if (elements.paletteBtn) {
      elements.paletteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isPaletteOpen = !isPaletteOpen;
        elements.paletteMenu?.classList.toggle('open', isPaletteOpen);
        elements.paletteBtn.classList.toggle('fab-option-active', isPaletteOpen);
        console.log(`🎨 [FAB] Palette menu ${isPaletteOpen ? 'opened' : 'closed'}`);
      });
    }

    // Palette selection
    if (elements.paletteMenu) {
      elements.paletteMenu
        .querySelectorAll('.color-swatch')
        .forEach((swatch) => {
          swatch.addEventListener('click', (e) => {
            e.stopPropagation();
            
            const styleName = swatch
              .getAttribute('data-color')
              ?.trim()
              .toLowerCase();

            if (!styleName) return;

            console.log(`🎨 [FAB] Palette selected: ${styleName}`);
            applyThemeStyle(styleName, true);
            
            // Close palette menu after selection
            setTimeout(() => {
              elements.paletteMenu?.classList.remove('open');
              isPaletteOpen = false;
            }, 150);
          });

          // Keyboard support
          swatch.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              swatch.click();
            }
          });
        });
    }

    // Theme toggle
    if (elements.themeBtn) {
      elements.themeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('🌓 [FAB] Theme toggle clicked');
        
        // Add active state
        elements.themeBtn.classList.add('fab-option-active');
        setTimeout(() => {
          elements.themeBtn.classList.remove('fab-option-active');
        }, 300);
        
        document.dispatchEvent(
          new CustomEvent(CONFIG.events.fabThemeToggle)
        );
      });
    }

    // Language toggle
    if (elements.langBtn) {
      elements.langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('🌍 [FAB] Language toggle clicked');
        
        // Add active state
        elements.langBtn.classList.add('fab-option-active');
        setTimeout(() => {
          elements.langBtn.classList.remove('fab-option-active');
        }, 300);
        
        document.dispatchEvent(new CustomEvent(CONFIG.events.fabLangToggle));
      });
    }

    console.log('✅ [FAB] Event listeners ready');
  }

  /**
   * Show notification (subtle toast)
   */
  function showNotification(message, icon = '✨') {
    // Remove existing notification
    const existing = document.querySelector('.fab-notification');
    if (existing) {
      existing.remove();
    }

    const notification = document.createElement('div');
    notification.className = 'fab-notification';
    notification.innerHTML = `
      <span class="fab-notification-icon">${icon}</span>
      <span class="fab-notification-text">${message}</span>
    `;

    // Append to FAB menu container for correct positioning
    if (elements.menu) {
      elements.menu.appendChild(notification);
    } else {
      document.body.appendChild(notification);
    }

    // Trigger animation
    requestAnimationFrame(() => {
      notification.classList.add('fab-notification-show');
    });

    // Auto remove
    setTimeout(() => {
      notification.classList.remove('fab-notification-show');
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  /**
   * Update FAB icons based on current state
   */
  function updateFabIcons() {
    const theme = document.body.dataset.theme || 'dark';
    const lang = document.documentElement.lang || 'fa';

    // Update theme icon
    if (elements.themeBtn) {
      const themeIcon = elements.themeBtn.querySelector('i');
      if (themeIcon) {
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
      }
    }

    // Update language text
    if (elements.langBtn) {
      const langText = elements.langBtn.querySelector('.fab-option-text');
      if (langText) {
        langText.textContent = lang === 'fa' ? 'EN' : 'FA';
      }
    }
  }

  /**
   * Listen to theme/language changes
   */
  function setupStateListeners() {
    // Theme changed
    document.addEventListener(CONFIG.events.themeChanged, () => {
      updateFabIcons();
      showNotification(
        `Theme: ${document.body.dataset.theme}`,
        document.body.dataset.theme === 'dark' ? '🌙' : '☀️'
      );
    });

    // Language changed
    document.addEventListener(CONFIG.events.languageChanged, (e) => {
      updateFabIcons();
      const lang = e.detail?.lang || 'en';
      showNotification(`Language: ${lang.toUpperCase()}`, '🌍');
    });
  }

  /**
   * Initialize FAB
   */
  async function initialize() {
    console.log('🎨 [FAB] Initializing...');

    // Wait for elements
    const found = await waitForElements();
    if (!found) {
      console.error('❌ [FAB] Failed to find elements');
      return;
    }

    // Load initial palette
    const initialStyle =
      CONFIG.getCurrentThemeStyle() ||
      document.documentElement.getAttribute('data-theme-style') ||
      'default';

    console.log(`🎨 [FAB] Applying initial palette: ${initialStyle}`);
    applyThemeStyle(initialStyle, false);

    // Update icons
    updateFabIcons();

    // Setup listeners
    setupEventListeners();
    setupStateListeners();

    // Run intro animation
    runIntroAnimation();

    // Mark as initialized
    window.fabInitialized = true;
    console.log('✅ [FAB] Initialized successfully');
  }

  /**
   * Auto-initialize
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initialize, 100);
    });
  } else {
    setTimeout(initialize, 100);
  }

  console.log('✅ [FAB] Module loaded');
})();