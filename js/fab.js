/**
 * =======================================================
 * ⚙️ FAB Menu - Enhanced with Background Selector
 * File: js/fab.js
 * Author: Saleh Abedinezhad (ImSalione)
 * =======================================================
 * ✨ NEW: Background selector functionality
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
  let isBackgroundOpen = false; // ✨ NEW
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
          backgroundBtn: document.getElementById('backgroundToggle'), // ✨ NEW
          backgroundMenu: document.getElementById('fabBackground'), // ✨ NEW
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
   * ✨ NEW: Generate background thumbnails
   */
  function generateBackgroundThumbnails() {
    if (!elements.backgroundMenu || !CONFIG.availableBackgrounds) return;

    console.log('🎨 [FAB] Generating background thumbnails...');

    elements.backgroundMenu.innerHTML = '';

    CONFIG.availableBackgrounds.forEach((bgFile) => {
      const bgPath = CONFIG.backgroundPath + bgFile;
      const bgName = bgFile.replace(/\.(jpg|png|svg|webp)$/i, '');
      
      const preview = document.createElement('button');
      preview.className = 'background-preview';
      preview.dataset.background = bgFile;
      preview.style.backgroundImage = `url('${bgPath}')`;
      preview.setAttribute('aria-label', `Background: ${bgName}`);
      preview.setAttribute('title', bgName);
      preview.setAttribute('role', 'menuitemradio');
      preview.setAttribute('aria-checked', 'false');
      preview.setAttribute('tabindex', '0');

      preview.addEventListener('click', (e) => {
        e.stopPropagation();
        applyBackground(bgFile, true);
        
        // Close background menu after selection
        setTimeout(() => {
          elements.backgroundMenu?.classList.remove('open');
          isBackgroundOpen = false;
          elements.backgroundBtn?.classList.remove('fab-option-active');
        }, 150);
      });

      elements.backgroundMenu.appendChild(preview);
    });

    console.log(`✅ [FAB] Generated ${CONFIG.availableBackgrounds.length} background previews`);
  }

  /**
   * ✨ NEW: Apply background
   */
  function applyBackground(bgFile, persist = true) {
    if (!bgFile) return;

    console.log(`🎨 [FAB] Applying background: ${bgFile}`);

    const bgPath = CONFIG.backgroundPath + bgFile;

    // Apply to body
    document.body.style.backgroundImage = `url('${bgPath}')`;
    document.documentElement.style.backgroundImage = `url('${bgPath}')`;

    // Persist to storage
    if (persist) {
      CONFIG.saveSetting(CONFIG.storage.background, bgFile);
    }

    // Highlight active preview
    highlightActiveBackground(bgFile);

    // Emit event
    const event = new CustomEvent(CONFIG.events.backgroundChanged, {
      detail: { background: bgFile },
      bubbles: true,
      cancelable: false
    });
    document.dispatchEvent(event);

    // Show notification
    const bgName = bgFile.replace(/\.(jpg|png|svg|webp)$/i, '');
    showNotification(`Background: ${bgName}`, '🖼️');
    
    console.log(`✅ [FAB] Background applied: ${bgFile}`);
  }

  /**
   * ✨ NEW: Highlight active background
   */
  function highlightActiveBackground(bgFile) {
    if (!elements.backgroundMenu) return;

    const previews = elements.backgroundMenu.querySelectorAll('.background-preview');

    previews.forEach((preview) => {
      const previewBg = preview.getAttribute('data-background');

      if (previewBg === bgFile) {
        preview.classList.add('fab-bg-active');
        preview.setAttribute('aria-checked', 'true');
      } else {
        preview.classList.remove('fab-bg-active');
        preview.setAttribute('aria-checked', 'false');
      }
    });
  }

  /**
   * Apply theme style (palette) with smooth transition
   */
  function applyThemeStyle(styleName, persist = true) {
    if (!styleName) return;

    console.log(`🎨 [FAB] Applying palette: ${styleName}`);

    requestAnimationFrame(() => {
      document.documentElement.classList.add('theme-transitioning');
      document.body.classList.add('theme-transitioning');

      document.documentElement.setAttribute('data-theme-style', styleName);
      document.body.setAttribute('data-theme-style', styleName);
      document.documentElement.dataset.themeStyle = styleName;
      document.body.dataset.themeStyle = styleName;

      void document.documentElement.offsetHeight;

      if (persist) {
        CONFIG.saveSetting(CONFIG.storage.themeStyle, styleName);
      }

      highlightActiveSwatch(styleName);

      setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning');
        document.body.classList.remove('theme-transitioning');
      }, 350);

      const event = new CustomEvent(CONFIG.events.fabPaletteSelect, {
        detail: { color: styleName },
        bubbles: true,
        cancelable: false
      });
      document.dispatchEvent(event);

      if (window.EventHub && typeof window.EventHub.emit === 'function') {
        window.EventHub.emit(CONFIG.events.paletteChanged, { color: styleName });
      }

      showNotification(`Palette: ${styleName}`, '🎨');
      
      console.log(`✅ [FAB] Palette applied: ${styleName}`);
    });
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
      elements.menu.classList.add('open');
      elements.main.classList.add('fab-intro-active');
      isOpen = true;

      let index = 0;

      const interval = setInterval(() => {
        options.forEach((btn) => btn.classList.remove('fab-intro-pulse'));

        if (index >= options.length) {
          clearInterval(interval);

          setTimeout(() => {
            elements.menu.classList.remove('open');
            elements.paletteMenu?.classList.remove('open');
            elements.backgroundMenu?.classList.remove('open');
            elements.main.classList.remove('fab-intro-active');
            isOpen = false;
            isPaletteOpen = false;
            isBackgroundOpen = false;

            options.forEach((btn) => btn.classList.remove('fab-intro-pulse'));

            try {
              localStorage.setItem(CONFIG.storage.fabIntroShown, '1');
            } catch (err) {
              console.warn('⚠️ Cannot save intro status:', err);
            }

            console.log('✅ [FAB] Intro animation complete');
          }, timings.closeDelay);

          return;
        }

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
        elements.backgroundMenu?.classList.remove('open');
        isPaletteOpen = false;
        isBackgroundOpen = false;
      }

      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(10);
      }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!elements.menu.contains(e.target) && isOpen) {
        elements.menu.classList.remove('open');
        elements.paletteMenu?.classList.remove('open');
        elements.backgroundMenu?.classList.remove('open');
        elements.main.classList.remove('fab-active');
        isOpen = false;
        isPaletteOpen = false;
        isBackgroundOpen = false;
        console.log('🎨 [FAB] Closed (outside click)');
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) {
        elements.menu.classList.remove('open');
        elements.paletteMenu?.classList.remove('open');
        elements.backgroundMenu?.classList.remove('open');
        elements.main.classList.remove('fab-active');
        isOpen = false;
        isPaletteOpen = false;
        isBackgroundOpen = false;
        console.log('🎨 [FAB] Closed (ESC key)');
      }
    });

    // ✨ NEW: Toggle background submenu
    if (elements.backgroundBtn) {
      elements.backgroundBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Close palette if open
        if (isPaletteOpen) {
          elements.paletteMenu?.classList.remove('open');
          elements.paletteBtn?.classList.remove('fab-option-active');
          isPaletteOpen = false;
        }
        
        isBackgroundOpen = !isBackgroundOpen;
        elements.backgroundMenu?.classList.toggle('open', isBackgroundOpen);
        elements.backgroundBtn.classList.toggle('fab-option-active', isBackgroundOpen);
        console.log(`🎨 [FAB] Background menu ${isBackgroundOpen ? 'opened' : 'closed'}`);
      });
    }

    // Toggle palette submenu
    if (elements.paletteBtn) {
      elements.paletteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Close background if open
        if (isBackgroundOpen) {
          elements.backgroundMenu?.classList.remove('open');
          elements.backgroundBtn?.classList.remove('fab-option-active');
          isBackgroundOpen = false;
        }
        
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
            
            setTimeout(() => {
              elements.paletteMenu?.classList.remove('open');
              isPaletteOpen = false;
              elements.paletteBtn?.classList.remove('fab-option-active');
            }, 150);
          });

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

    if (elements.menu) {
      elements.menu.appendChild(notification);
    } else {
      document.body.appendChild(notification);
    }

    requestAnimationFrame(() => {
      notification.classList.add('fab-notification-show');
    });

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

    if (elements.themeBtn) {
      const themeIcon = elements.themeBtn.querySelector('i');
      if (themeIcon) {
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
      }
    }

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
    document.addEventListener(CONFIG.events.themeChanged, () => {
      updateFabIcons();
      showNotification(
        `Theme: ${document.body.dataset.theme}`,
        document.body.dataset.theme === 'dark' ? '🌙' : '☀️'
      );
    });

    document.addEventListener(CONFIG.events.languageChanged, (e) => {
      updateFabIcons();
      const lang = e.detail?.lang || 'en';
      showNotification(`Language: ${lang.toUpperCase()}`, '🌍');
    });

    // ✨ NEW: Background changed listener
    document.addEventListener(CONFIG.events.backgroundChanged, (e) => {
      const bg = e.detail?.background || '';
      console.log('🎨 [FAB] Background changed event:', bg);
    });
  }

  /**
   * Initialize FAB
   */
  async function initialize() {
    console.log('🎨 [FAB] Initializing...');

    const found = await waitForElements();
    if (!found) {
      console.error('❌ [FAB] Failed to find elements');
      return;
    }

    if (typeof CONFIG === 'undefined') {
      console.warn('⚠️ [FAB] CONFIG not ready, retrying...');
      setTimeout(initialize, 200);
      return;
    }

    // ✨ NEW: Generate background thumbnails
    generateBackgroundThumbnails();

    // Load initial palette
    const initialStyle = 
      document.body.getAttribute('data-theme-style') ||
      document.documentElement.getAttribute('data-theme-style') ||
      CONFIG.getCurrentThemeStyle() ||
      'default';

    console.log(`🎨 [FAB] Applying initial palette: ${initialStyle}`);
    
    document.documentElement.setAttribute('data-theme-style', initialStyle);
    document.body.setAttribute('data-theme-style', initialStyle);
    document.documentElement.dataset.themeStyle = initialStyle;
    document.body.dataset.themeStyle = initialStyle;
    
    highlightActiveSwatch(initialStyle);

    // ✨ NEW: Load initial background
    const initialBg = CONFIG.getCurrentBackground();
    console.log(`🖼️ [FAB] Applying initial background: ${initialBg}`);
    applyBackground(initialBg, false);

    updateFabIcons();
    setupEventListeners();
    setupStateListeners();

    setTimeout(() => {
      runIntroAnimation();
    }, 500);

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