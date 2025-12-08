/**
 * =======================================================
 * 📄 File: js/core/router.js
 * 🎯 Purpose: Dynamic Partial Loader & DOM Injector
 * Author: Saleh Abedinezhad (ImSalione)
 * =======================================================
 * Responsibilities:
 * - Load HTML partials from CONFIG.partials
 * - Inject into mount points (CONFIG.mountPoints)
 * - Emit events for each partial load
 * - Prevent redundant reloading
 * - Handle loading errors gracefully
 * =======================================================
 */

(function initRouter() {
  'use strict';

  // Prevent re-initialization
  if (window.Router) {
    console.warn('⚠️ Router already initialized, skipping');
    return;
  }

  /**
   * Track loaded partials to prevent duplicates
   */
  const loadedPartials = new Set();

  /**
   * Loading state
   */
  let isLoading = false;

  const Router = {
    /**
     * Load all HTML partials defined in CONFIG.partials
     * @returns {Promise<void>}
     */
    async loadAll() {
      if (isLoading) {
        console.warn('⚠️ [ROUTER] Already loading partials');
        return;
      }

      console.log('📦 [ROUTER] Loading all partials...');
      isLoading = true;

      if (!window.CONFIG || !window.CONFIG.partials) {
        console.error('❌ [ROUTER] CONFIG.partials not found!');
        isLoading = false;
        return;
      }

      try {
        const entries = Object.entries(CONFIG.partials);
        const promises = entries.map(([key, path]) =>
          this.loadPartial(key, path)
        );

        await Promise.all(promises);

        // Emit partialsReady event
        this.emitEvent(CONFIG.events.partialsReady);
        console.log('✅ [ROUTER] All partials loaded successfully');
      } catch (err) {
        console.error('❌ [ROUTER] Error loading partials:', err);
      } finally {
        isLoading = false;
      }
    },

    /**
     * Load a single partial
     * @param {string} key - Partial identifier (e.g., "intro", "timeline")
     * @param {string} path - Path to HTML file
     * @param {boolean} forceReload - Force reload even if already loaded
     * @returns {Promise<boolean>} Success status
     */
    async loadPartial(key, path, forceReload = false) {
      // Check if already loaded
      if (loadedPartials.has(key) && !forceReload) {
        console.log(`ℹ️ [ROUTER] Already loaded: ${key}`);
        return true;
      }

      const mountSelector = CONFIG.mountPoints[key];
      const mount = document.querySelector(mountSelector);

      if (!mount) {
        console.warn(
          `⚠️ [ROUTER] Mount point not found for: ${key} (${mountSelector})`
        );
        return false;
      }

      try {
        console.log(`📥 [ROUTER] Loading: ${key} from ${path}`);

        const response = await fetch(`${path}?v=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Content-Type': 'text/html',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} for ${path}`);
        }

        const html = await response.text();

        // Validate HTML content
        if (!html || html.trim().length === 0) {
          throw new Error(`Empty content received for ${key}`);
        }

        // Inject HTML
        mount.innerHTML = html;

        // Mark as loaded
        loadedPartials.add(key);

        // Emit individual partial loaded event
        this.emitEvent(CONFIG.events.partialLoaded, { section: key });
        console.log(`✅ [ROUTER] Loaded: ${key}`);

        return true;
      } catch (err) {
        console.error(`❌ [ROUTER] Failed to load ${key}:`, err);

        // Show error in mount point
        if (mount) {
          mount.innerHTML = `
            <div style="
              padding: 2rem;
              text-align: center;
              color: var(--text-secondary);
              opacity: 0.7;
            ">
              <p>⚠️ Failed to load ${key}</p>
              <small style="font-size: 0.8rem;">${err.message}</small>
            </div>
          `;
        }

        return false;
      }
    },

    /**
     * Reload a specific partial
     * @param {string} key - Partial identifier
     * @returns {Promise<boolean>} Success status
     */
    async reload(key) {
      console.log(`🔄 [ROUTER] Reloading: ${key}`);

      const path = CONFIG.partials[key];
      if (!path) {
        console.warn(`⚠️ [ROUTER] Unknown partial: ${key}`);
        return false;
      }

      // Remove from loaded set
      loadedPartials.delete(key);

      // Reload
      return await this.loadPartial(key, path, true);
    },

    /**
     * Reload all partials
     * @returns {Promise<void>}
     */
    async reloadAll() {
      console.log('🔄 [ROUTER] Reloading all partials...');

      // Clear loaded set
      loadedPartials.clear();

      // Reload all
      await this.loadAll();
    },

    /**
     * Check if a partial is loaded
     * @param {string} key - Partial identifier
     * @returns {boolean}
     */
    isLoaded(key) {
      return loadedPartials.has(key);
    },

    /**
     * Get list of loaded partials
     * @returns {string[]}
     */
    getLoadedPartials() {
      return Array.from(loadedPartials);
    },

    /**
     * Emit event (supports EventHub or native CustomEvent)
     * @param {string} eventName - Event name
     * @param {object} detail - Event payload
     */
    emitEvent(eventName, detail = {}) {
      if (window.EventHub && typeof window.EventHub.emit === 'function') {
        window.EventHub.emit(eventName, detail);
      } else {
        document.dispatchEvent(new CustomEvent(eventName, { detail }));
      }
    },

    /**
     * Reset router state
     */
    reset() {
      loadedPartials.clear();
      isLoading = false;
      console.log('🔄 [ROUTER] Reset complete');
    },
  };

  // Expose to window
  window.Router = Router;

  console.log(
    '%c✅ Router initialized',
    'color:#00ddff;font-weight:bold;'
  );
})();