/**
 * =======================================================
 * 📄 File: js/main.js
 * 🎯 Purpose: Unified Event-Driven Application Controller
 * Author: Saleh Abedinezhad (ImSalione)
 * =======================================================
 * ✨ UPDATED: First visit setup integration
 * =======================================================
 */

(function initApp() {
  'use strict';

  /**
   * Application State
   */
  const state = {
    jsonDataReady: false,
    partialsReady: false,
    isRendering: false,
    cachedData: null,
  };

  /**
   * Initialize when DOM is ready
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /**
   * Main initialization function
   */
  async function init() {
    console.log(
      '%c🚀 [INIT] ImSalione Portfolio Starting...',
      'color:#00ffaa;font-weight:bold;font-size:14px;'
    );

    try {
      // ✨ NEW: Check if first visit and show setup
      if (CONFIG.isFirstVisit()) {
        console.log('🎬 [INIT] First visit detected, showing setup...');
        await showFirstVisitSetup();
      }

      // 1. Sync settings from localStorage
      const settings = syncAllSettings();
      console.log(
        `🌍 [SETTINGS] lang=${settings.lang} | theme=${settings.theme} | style=${settings.themeStyle} | bg=${settings.background}`
      );

      // 2. Load partials and content in parallel
      await Promise.all([loadAllPartials(), loadContent(settings.lang)]);

      // 3. Setup FAB listeners
      setupFabListeners();

      // 4. Emit appReady event
      emitEvent(CONFIG.events.appReady, { settings });

      console.log(
        '%c✅ [READY] App initialized successfully',
        'color:#00ff88;font-weight:bold;font-size:14px;'
      );
    } catch (err) {
      console.error('❌ [INIT ERROR]', err);
      showErrorNotification('Initialization failed. Please refresh the page.');
    }
  }

  /* =======================================================
     🎬 FIRST VISIT SETUP
  ======================================================= */

  /**
   * ✨ NEW: Show first visit setup modal
   */
  async function showFirstVisitSetup() {
    return new Promise((resolve) => {
      // Create modal HTML
      const modalHTML = `
        <!-- Background Preview Layer -->
        <div class="setup-bg-preview" id="setupBgPreview"></div>

        <!-- Setup Modal Overlay -->
        <div class="setup-overlay" id="setupOverlay">
          <div class="setup-modal">
            <!-- Header -->
            <div class="setup-header">
              <h1 class="setup-title">خوش آمدید! بیایید تنظیمات را انجام دهیم</h1>
              <p class="setup-subtitle">تجربه خود را در چند کلیک سفارشی کنید</p>
            </div>

            <!-- Content -->
            <div class="setup-content">
              <!-- Language Selection -->
              <div class="setup-section">
                <h3 class="setup-section-title"><span class="icon">🌍</span><span>زبان</span></h3>
                <div class="setup-options">
                  <div class="setup-option active" data-setting="lang" data-value="fa">
                    <span class="setup-option-icon">🇮🇷</span>
                    <span class="setup-option-label">فارسی</span>
                  </div>
                  <div class="setup-option" data-setting="lang" data-value="en">
                    <span class="setup-option-icon">🇬🇧</span>
                    <span class="setup-option-label">English</span>
                  </div>
                </div>
              </div>

              <!-- Theme Selection -->
              <div class="setup-section">
                <h3 class="setup-section-title"><span class="icon">🌓</span><span class="setup-text" data-en="Theme" data-fa="تم">تم</span></h3>
                <div class="setup-options">
                  <div class="setup-option active" data-setting="theme" data-value="dark">
                    <span class="setup-option-icon">🌙</span>
                    <span class="setup-option-label setup-text" data-en="Dark" data-fa="تیره">تیره</span>
                  </div>
                  <div class="setup-option" data-setting="theme" data-value="light">
                    <span class="setup-option-icon">☀️</span>
                    <span class="setup-option-label setup-text" data-en="Light" data-fa="روشن">روشن</span>
                  </div>
                </div>
              </div>

              <!-- Color Palette Selection -->
              <div class="setup-section">
                <h3 class="setup-section-title"><span class="icon">🎨</span><span class="setup-text" data-en="Color Palette" data-fa="پالت رنگی">پالت رنگی</span></h3>
                <div class="setup-options" id="paletteOptions">
                  <div class="setup-option active" data-setting="palette" data-value="default">
                    <div class="setup-palette-swatch" style="background: linear-gradient(135deg, #6366f1, #8b5cf6)"></div>
                    <span class="setup-option-label setup-text" data-en="Default" data-fa="پیش‌فرض">پیش‌فرض</span>
                  </div>
                  <div class="setup-option" data-setting="palette" data-value="ocean">
                    <div class="setup-palette-swatch" style="background: linear-gradient(135deg, #0ea5e9, #06b6d4)"></div>
                    <span class="setup-option-label setup-text" data-en="Ocean" data-fa="اقیانوس">اقیانوس</span>
                  </div>
                  <div class="setup-option" data-setting="palette" data-value="forest">
                    <div class="setup-palette-swatch" style="background: linear-gradient(135deg, #10b981, #14b8a6)"></div>
                    <span class="setup-option-label setup-text" data-en="Forest" data-fa="جنگل">جنگل</span>
                  </div>
                  <div class="setup-option" data-setting="palette" data-value="sunset">
                    <div class="setup-palette-swatch" style="background: linear-gradient(135deg, #f59e0b, #ef4444)"></div>
                    <span class="setup-option-label setup-text" data-en="Sunset" data-fa="غروب">غروب</span>
                  </div>
                </div>
              </div>

              <!-- Background Selection -->
              <div class="setup-section">
                <h3 class="setup-section-title"><span class="icon">🖼️</span><span class="setup-text" data-en="Background" data-fa="پس‌زمینه">پس‌زمینه</span></h3>
                <div class="setup-options" id="backgroundOptions"></div>
              </div>
            </div>

            <!-- Footer -->
            <div class="setup-footer">
              <button class="setup-btn setup-btn-skip" id="setupSkip">
                <span class="setup-text" data-en="Skip for now" data-fa="رد شدن">رد شدن</span>
              </button>
              <button class="setup-btn setup-btn-save" id="setupSave">
                <span class="setup-text" data-en="Save & Continue" data-fa="ذخیره و ادامه">ذخیره و ادامه</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      `;

      // Inject modal into body
      const modalContainer = document.createElement('div');
      modalContainer.id = 'firstVisitSetupContainer';
      modalContainer.innerHTML = modalHTML;
      document.body.appendChild(modalContainer);

      // Load setup CSS
      const setupCSS = document.createElement('link');
      setupCSS.rel = 'stylesheet';
      setupCSS.href = 'css/first-visit-setup.css';
      document.head.appendChild(setupCSS);

      // Initialize setup logic
      setTimeout(() => {
        initSetupLogic(resolve);
      }, 100);
    });
  }

  /**
   * ✨ NEW: Setup logic for first visit modal
   */
  function initSetupLogic(resolvePromise) {
    const settings = {
      lang: 'fa',
      theme: 'dark',
      palette: 'default',
      background: 'bg.jpg'
    };

    const overlay = document.getElementById('setupOverlay');
    const bgPreview = document.getElementById('setupBgPreview');
    const backgroundOptions = document.getElementById('backgroundOptions');
    const skipBtn = document.getElementById('setupSkip');
    const saveBtn = document.getElementById('setupSave');

    // Generate background options
    if (CONFIG.availableBackgrounds) {
      CONFIG.availableBackgrounds.forEach((bg, index) => {
        const option = document.createElement('div');
        option.className = 'setup-option' + (index === 0 ? ' active' : '');
        option.dataset.setting = 'background';
        option.dataset.value = bg;

        const bgName = bg.replace(/\.(jpg|png|svg|webp)$/i, '');
        const bgPath = CONFIG.backgroundPath + bg;
        
        option.innerHTML = `
          <div class="setup-bg-preview-small" style="background-image: url('${bgPath}')"></div>
          <span class="setup-option-label">${bgName}</span>
        `;

        backgroundOptions.appendChild(option);
      });
    }

    // Apply preview function
    function applyPreview() {
      const bgPath = CONFIG.backgroundPath + settings.background;
      bgPreview.style.backgroundImage = `url('${bgPath}')`;

      const lang = settings.lang;
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';

      // Update translatable elements
      document.querySelectorAll('.setup-text[data-en][data-fa]').forEach(el => {
        el.textContent = el.dataset[lang];
      });

      // Update header
      const title = document.querySelector('.setup-title');
      const subtitle = document.querySelector('.setup-subtitle');
      if (title) {
        title.textContent = lang === 'fa' 
          ? 'خوش آمدید! بیایید تنظیمات را انجام دهیم'
          : 'Welcome! Let\'s Set Up Your Experience';
      }
      if (subtitle) {
        subtitle.textContent = lang === 'fa'
          ? 'تجربه خود را در چند کلیک سفارشی کنید'
          : 'Customize your portfolio experience in just a few clicks';
      }
    }

    // Initial preview
    applyPreview();

    // Option selection
    document.querySelectorAll('.setup-option').forEach(option => {
      option.addEventListener('click', () => {
        const settingType = option.dataset.setting;
        const value = option.dataset.value;

        option.parentElement.querySelectorAll('.setup-option').forEach(opt => {
          opt.classList.remove('active');
        });

        option.classList.add('active');
        settings[settingType] = value;
        applyPreview();

        console.log(`🎨 [Setup] ${settingType} → ${value}`);
      });
    });

    // Skip button
    skipBtn.addEventListener('click', () => {
      closeSetup(false);
    });

    // Save button
    saveBtn.addEventListener('click', () => {
      saveSetupSettings();
      closeSetup(true);
    });

    function saveSetupSettings() {
      try {
        CONFIG.saveSetting(CONFIG.storage.lang, settings.lang);
        CONFIG.saveSetting(CONFIG.storage.theme, settings.theme);
        CONFIG.saveSetting(CONFIG.storage.themeStyle, settings.palette);
        CONFIG.saveSetting(CONFIG.storage.background, settings.background);
        CONFIG.markSetupComplete();
        console.log('✅ [Setup] Settings saved:', settings);
      } catch (err) {
        console.error('❌ [Setup] Save failed:', err);
      }
    }

    function closeSetup(saved) {
      overlay.classList.add('exiting');

      setTimeout(() => {
        const container = document.getElementById('firstVisitSetupContainer');
        if (container) {
          container.remove();
        }

        if (saved) {
          console.log('✅ [Setup] Setup completed, reloading...');
          window.location.reload();
        } else {
          console.log('⏭️ [Setup] Skipped');
          resolvePromise();
        }
      }, 400);
    }
  }

  /* =======================================================
     ⚙️ SETTINGS MANAGEMENT
  ======================================================= */

  /**
   * Get current language
   */
  function getCurrentLang() {
    return CONFIG.getCurrentLang();
  }

  /**
   * Apply language to DOM
   */
  function applyLanguage(lang) {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
  }

  /**
   * ✨ NEW: Apply background to DOM
   */
  function applyBackground(bgFile) {
    const bgPath = CONFIG.backgroundPath + bgFile;
    document.body.style.backgroundImage = `url('${bgPath}')`;
    document.documentElement.style.backgroundImage = `url('${bgPath}')`;
    console.log(`🖼️ [MAIN] Background applied: ${bgFile}`);
  }

  /**
   * Load theme CSS dynamically
   */
  function loadThemeCSS(theme) {
    const head = document.head;
    const oldLink = document.getElementById(CONFIG.themeLinkId);

    if (oldLink) {
      oldLink.remove();
      console.log(
        `🗑️ [THEME CSS] Removed: ${theme === 'dark' ? 'light' : 'dark'}`
      );
    }

    const newLink = document.createElement('link');
    newLink.id = CONFIG.themeLinkId;
    newLink.rel = 'stylesheet';
    newLink.type = 'text/css';
    newLink.href = `${CONFIG.themeCSSPath}${theme}.css?v=${Date.now()}`;

    head.appendChild(newLink);

    console.log(`🎨 [THEME CSS] Loaded: ${theme}.css`);
  }

  /**
   * Sync theme and palette from storage
   */
  function syncThemeAndPalette() {
    const theme = CONFIG.getCurrentTheme();
    const themeStyle = CONFIG.getCurrentThemeStyle();

    document.body.dataset.theme = theme;
    document.documentElement.dataset.themeStyle = themeStyle;

    loadThemeCSS(theme);

    console.log(`🎨 [SYNC] theme=${theme} | style=${themeStyle}`);
  }

  /**
   * Sync all settings from storage to DOM
   */
  function syncAllSettings() {
    const lang = getCurrentLang();
    const background = CONFIG.getCurrentBackground();
    
    applyLanguage(lang);
    applyBackground(background);
    syncThemeAndPalette();

    return {
      lang,
      theme: document.body.dataset.theme,
      themeStyle: document.documentElement.dataset.themeStyle,
      background,
    };
  }

  /* =======================================================
     📦 PARTIALS LOADING
  ======================================================= */

  /**
   * Load all HTML partials
   */
  async function loadAllPartials() {
    console.log('📦 [PARTIALS] Loading via Router...');

    if (window.Router && typeof window.Router.loadAll === 'function') {
      await window.Router.loadAll();
    } else {
      console.error('❌ [PARTIALS] Router not available');
      throw new Error('Router not found');
    }

    state.partialsReady = true;
    console.log('%c✅ [PARTIALS] All loaded', 'color:#0ff;font-weight:bold;');
    checkRenderReady();
  }

  /* =======================================================
     📥 CONTENT LOADING
  ======================================================= */

  /**
   * Load JSON content
   */
  async function loadContent(lang) {
    const path = CONFIG.contentPaths[lang] || CONFIG.contentPaths.fa;
    console.log(`📥 [FETCH] Loading JSON: ${path}`);

    try {
      const response = await fetch(`${path}?v=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data || typeof data !== 'object') {
        throw new Error('Invalid JSON structure');
      }

      window.timelineData = data.timeline || [];
      window.skillsData = data.skills || {};
      state.cachedData = data;
      window.currentContent = data;
      state.jsonDataReady = true;

      emitEvent(CONFIG.events.dataReady, { lang, data });

      console.log(
        '%c✅ [DATA] Content loaded',
        'color:#6f6;font-weight:bold;'
      );
      console.log(`📊 Timeline events: ${window.timelineData.length}`);
      console.log(
        `🎯 Skills available: ${Object.keys(window.skillsData).length}`
      );

      checkRenderReady();
    } catch (err) {
      console.error('❌ [JSON ERROR]', err);
      showErrorNotification(
        'Failed to load content. Please check your connection.'
      );
      throw err;
    }
  }

  /* =======================================================
     🎨 RENDERING PIPELINE
  ======================================================= */

  /**
   * Check if ready to render and trigger DomManager
   */
  function checkRenderReady() {
    if (!state.jsonDataReady || !state.partialsReady) {
      console.log(
        `⏳ [WAITING] JSON: ${state.jsonDataReady} | Partials: ${state.partialsReady}`
      );
      return;
    }

    if (state.isRendering) {
      console.warn('⚠️ [RENDER] Already rendering, skipping duplicate');
      return;
    }

    state.isRendering = true;

    console.log(
      '%c🧠 [RENDER] Starting DomManager.renderAll()...',
      'color:#0ff;font-weight:bold;font-size:13px;'
    );

    try {
      if (
        typeof DomManager === 'undefined' ||
        typeof DomManager.renderAll !== 'function'
      ) {
        throw new Error('DomManager not available');
      }

      if (!state.cachedData || typeof state.cachedData !== 'object') {
        throw new Error('Invalid cached data');
      }

      DomManager.renderAll(state.cachedData);

      emitEvent(CONFIG.events.renderReady);

      console.log(
        '%c✅ [RENDER] Complete',
        'color:#00ff88;font-weight:bold;font-size:13px;'
      );

      setTimeout(verifyRender, 500);
    } catch (err) {
      console.error('❌ [RENDER ERROR]', err);
      showErrorNotification('Rendering failed. Please refresh the page.');
    } finally {
      setTimeout(() => {
        state.isRendering = false;
      }, 1000);
    }
  }

  /**
   * Verify render completed successfully
   */
  function verifyRender() {
    const checks = {
      intro: !!document.querySelector('#section-intro .profile-name'),
      timeline: !!document.querySelector('.timeline-list'),
      skills: !!document.querySelector('.skills-grid'),
      projects: !!document.querySelector('.projects-grid'),
    };

    Object.entries(checks).forEach(([section, exists]) => {
      if (exists) {
        console.log(`✅ [VERIFY] ${section} rendered`);
      } else {
        console.warn(`⚠️ [VERIFY] ${section} not found`);
      }
    });
  }

  /* =======================================================
     🎛️ FAB LISTENERS
  ======================================================= */

  /**
   * Setup FAB event listeners
   */
  function setupFabListeners() {
    console.log('🎛️ [FAB] Setting up listeners...');

    document.addEventListener(CONFIG.events.fabLangToggle, handleLanguageToggle);
    document.addEventListener(CONFIG.events.fabThemeToggle, handleThemeToggle);
    document.addEventListener(CONFIG.events.fabPaletteSelect, handlePaletteChange);
    document.addEventListener(CONFIG.events.fabBackgroundSelect, handleBackgroundChange);

    console.log('✅ [FAB] Listeners ready');
  }

  /**
   * Handle language toggle
   */
  function handleLanguageToggle() {
    const currentLang = getCurrentLang();
    const newLang = currentLang === 'fa' ? 'en' : 'fa';

    console.log(`🌍 [FAB] Switching language → ${newLang}`);

    CONFIG.saveSetting(CONFIG.storage.lang, newLang);
    applyLanguage(newLang);

    state.jsonDataReady = false;
    state.cachedData = null;
    state.isRendering = false;

    loadContent(newLang);

    emitEvent(CONFIG.events.languageChanged, { lang: newLang });
  }

  /**
   * Handle theme toggle
   */
  function handleThemeToggle() {
    const currentTheme =
      document.body.dataset.theme === 'dark' ? 'light' : 'dark';

    console.log(`🎨 [FAB] Switching theme → ${currentTheme}`);

    document.body.dataset.theme = currentTheme;
    CONFIG.saveSetting(CONFIG.storage.theme, currentTheme);
    loadThemeCSS(currentTheme);

    emitEvent(CONFIG.events.themeChanged, { theme: currentTheme });
  }

  /**
   * Handle palette change
   */
  function handlePaletteChange(e) {
    const color = (e.detail && e.detail.color) || 'default';

    console.log(`🖌️ [FAB] Changing palette → ${color}`);

    document.documentElement.dataset.themeStyle = color;
    CONFIG.saveSetting(CONFIG.storage.themeStyle, color);

    emitEvent(CONFIG.events.paletteChanged, { color });
  }

  /**
   * ✨ NEW: Handle background change
   */
  function handleBackgroundChange(e) {
    const background = (e.detail && e.detail.background) || 'bg.jpg';

    console.log(`🖼️ [FAB] Changing background → ${background}`);

    applyBackground(background);
    CONFIG.saveSetting(CONFIG.storage.background, background);

    emitEvent(CONFIG.events.backgroundChanged, { background });
  }

  /* =======================================================
     🔧 UTILITY FUNCTIONS
  ======================================================= */

  /**
   * Emit event (EventHub-aware)
   */
  function emitEvent(name, detail = {}) {
    if (window.EventHub && typeof window.EventHub.emit === 'function') {
      window.EventHub.emit(name, detail);
    } else {
      document.dispatchEvent(new CustomEvent(name, { detail }));
    }
  }

  /**
   * Show error notification to user
   */
  function showErrorNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(239, 68, 68, 0.95);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      z-index: 9999;
      max-width: 300px;
      font-size: 0.9rem;
      animation: slideIn 0.3s ease;
    `;

    notification.innerHTML = `
      <div style="display: flex; align-items: start; gap: 0.75rem;">
        <span style="font-size: 1.5rem;">⚠️</span>
        <div>
          <strong style="display: block; margin-bottom: 0.25rem;">Error</strong>
          <p style="margin: 0; opacity: 0.9;">${message}</p>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  /* =======================================================
     🎨 POST-RENDER SYNC
  ======================================================= */

  /**
   * Re-apply theme after render
   */
  document.addEventListener(CONFIG.events.renderReady, () => {
    syncThemeAndPalette();
    console.log('🎨 [POST-RENDER] Theme/Palette re-applied');
  });

  console.log('%c✅ Main.js loaded', 'color:#00ddff;font-weight:bold;');
})();