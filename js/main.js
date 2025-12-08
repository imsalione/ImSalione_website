/**
 * =======================================================
 * 📄 File: js/main.js
 * 🎯 Purpose: Unified Event-Driven Application Controller
 * Author: Saleh Abedinezhad (ImSalione)
 * =======================================================
 * Responsibilities:
 * - Initialize application
 * - Load partials and content
 * - Manage settings (language, theme, palette)
 * - Coordinate rendering pipeline
 * - Handle FAB interactions
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
      // 1. Sync settings from localStorage
      const settings = syncAllSettings();
      console.log(
        `🌍 [SETTINGS] lang=${settings.lang} | theme=${settings.theme} | style=${settings.themeStyle}`
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
   * Load theme CSS dynamically
   */
  function loadThemeCSS(theme) {
    const head = document.head;
    const oldLink = document.getElementById(CONFIG.themeLinkId);

    // Remove old theme CSS
    if (oldLink) {
      oldLink.remove();
      console.log(
        `🗑️ [THEME CSS] Removed: ${theme === 'dark' ? 'light' : 'dark'}`
      );
    }

    // Create new link element
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

    // Apply to DOM
    document.body.dataset.theme = theme;
    document.documentElement.dataset.themeStyle = themeStyle;

    // Load CSS
    loadThemeCSS(theme);

    console.log(`🎨 [SYNC] theme=${theme} | style=${themeStyle}`);
  }

  /**
   * Sync all settings from storage to DOM
   */
  function syncAllSettings() {
    const lang = getCurrentLang();
    applyLanguage(lang);
    syncThemeAndPalette();

    return {
      lang,
      theme: document.body.dataset.theme,
      themeStyle: document.documentElement.dataset.themeStyle,
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

      // Validate data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid JSON structure');
      }

      // Store globally
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

    // Prevent duplicate renders
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
      // Verify DomManager
      if (
        typeof DomManager === 'undefined' ||
        typeof DomManager.renderAll !== 'function'
      ) {
        throw new Error('DomManager not available');
      }

      // Verify data
      if (!state.cachedData || typeof state.cachedData !== 'object') {
        throw new Error('Invalid cached data');
      }

      // Render all sections
      DomManager.renderAll(state.cachedData);

      // Emit renderReady event
      emitEvent(CONFIG.events.renderReady);

      console.log(
        '%c✅ [RENDER] Complete',
        'color:#00ff88;font-weight:bold;font-size:13px;'
      );

      // Verify critical sections
      setTimeout(verifyRender, 500);
    } catch (err) {
      console.error('❌ [RENDER ERROR]', err);
      showErrorNotification('Rendering failed. Please refresh the page.');
    } finally {
      // Reset flag after delay
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

    // Language Toggle
    document.addEventListener(CONFIG.events.fabLangToggle, handleLanguageToggle);

    // Theme Toggle
    document.addEventListener(CONFIG.events.fabThemeToggle, handleThemeToggle);

    // Palette Change
    document.addEventListener(CONFIG.events.fabPaletteSelect, handlePaletteChange);

    console.log('✅ [FAB] Listeners ready');
  }

  /**
   * Handle language toggle
   */
  function handleLanguageToggle() {
    const currentLang = getCurrentLang();
    const newLang = currentLang === 'fa' ? 'en' : 'fa';

    console.log(`🌍 [FAB] Switching language → ${newLang}`);

    // Save to storage
    CONFIG.saveSetting(CONFIG.storage.lang, newLang);

    // Apply to DOM
    applyLanguage(newLang);

    // Reset state
    state.jsonDataReady = false;
    state.cachedData = null;
    state.isRendering = false;

    // Reload content
    loadContent(newLang);

    // Emit event
    emitEvent(CONFIG.events.languageChanged, { lang: newLang });
  }

  /**
   * Handle theme toggle
   */
  function handleThemeToggle() {
    const currentTheme =
      document.body.dataset.theme === 'dark' ? 'light' : 'dark';

    console.log(`🎨 [FAB] Switching theme → ${currentTheme}`);

    // Apply to DOM
    document.body.dataset.theme = currentTheme;

    // Save to storage
    CONFIG.saveSetting(CONFIG.storage.theme, currentTheme);

    // Load CSS
    loadThemeCSS(currentTheme);

    // Emit event
    emitEvent(CONFIG.events.themeChanged, { theme: currentTheme });
  }

  /**
   * Handle palette change
   */
  function handlePaletteChange(e) {
    const color = (e.detail && e.detail.color) || 'default';

    console.log(`🖌️ [FAB] Changing palette → ${color}`);

    // Apply to DOM
    document.documentElement.dataset.themeStyle = color;

    // Save to storage
    CONFIG.saveSetting(CONFIG.storage.themeStyle, color);

    // Emit event
    emitEvent(CONFIG.events.paletteChanged, { color });
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

    // Auto-remove after 5 seconds
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