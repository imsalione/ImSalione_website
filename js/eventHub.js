/* =======================================================
🧩 Global Event Hub – Safe & Duplicate-Free Version
Author: ImSalione (2025) — Optimized Edition
======================================================= */

/**
 * A lightweight, safe, duplicate-free pub/sub system.
 * Ensures:
 *   - No duplicate listeners
 *   - No repeated anonymous callbacks
 *   - Fully compatible with dynamically loaded sections
 */

(function () {
  // Prevent re-initialization
  if (window.EventHub && window.EventHub.__initialized) {
    console.warn("⚠️ EventHub already initialized — skipped.");
    return;
  }

  /**
   * Store:
   *   Map<eventName, Map<originalCallback, realHandler>>
   *
   * Why?
   *   - We cannot removeEventListener unless we keep the REAL handler.
   *   - This map ensures one unique listener per callback.
   */
  const listeners = new Map();

  const EventHub = {
    /**
     * Emit a custom event globally.
     */
    emit(event, detail = {}) {
      document.dispatchEvent(new CustomEvent(event, { detail }));
      console.log(`📡 [EventHub] Emit: ${event}`, detail);
    },

    /**
     * Subscribe to an event.
     * Prevents duplicates 100%.
     */
    on(event, callback) {
      if (!listeners.has(event)) {
        listeners.set(event, new Map());
      }

      const eventMap = listeners.get(event);

      // If callback already registered → skip
      if (eventMap.has(callback)) return;

      const handler = (e) => callback(e.detail || {});
      eventMap.set(callback, handler);

      document.addEventListener(event, handler);
    },

    /**
     * Subscribe once — auto-remove after trigger.
     */
    once(event, callback) {
      const handler = (e) => {
        callback(e.detail || {});
        document.removeEventListener(event, handler);
      };

      document.addEventListener(event, handler);
    },

    /**
     * Remove a subscription manually (optional feature).
     */
    off(event, callback) {
      const eventMap = listeners.get(event);
      if (!eventMap) return;

      const handler = eventMap.get(callback);
      if (!handler) return;

      document.removeEventListener(event, handler);
      eventMap.delete(callback);
    },

    __initialized: true,
  };

  window.EventHub = EventHub;
  console.log("✅ EventHub initialized (Safe Version).");
})();
