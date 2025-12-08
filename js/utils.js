/**
 * =======================================================
 * 🧰 Utility Functions — Helper Methods
 * File: js/utils.js
 * Author: Saleh Abedinezhad (ImSalione)
 * =======================================================
 * Purpose: Reusable helper functions for animations,
 * DOM manipulation, and common tasks
 * =======================================================
 */

(function initUtils() {
  'use strict';

  // Prevent re-initialization
  if (window.Utils) {
    console.warn('⚠️ Utils already initialized, skipping');
    return;
  }

  window.Utils = {
    /**
     * Smooth fade-in animation
     * @param {HTMLElement} el - Target element
     * @param {number} duration - Animation duration in ms
     */
    fadeIn(el, duration = 400) {
      if (!el) return;

      el.style.opacity = 0;
      el.style.display = 'block';

      let last = Date.now();

      const tick = () => {
        const now = Date.now();
        const progress = (now - last) / duration;

        el.style.opacity = Math.min(
          parseFloat(el.style.opacity) + progress,
          1
        );

        last = now;

        if (parseFloat(el.style.opacity) < 1) {
          requestAnimationFrame(tick);
        }
      };

      requestAnimationFrame(tick);
    },

    /**
     * Smooth fade-out animation
     * @param {HTMLElement} el - Target element
     * @param {number} duration - Animation duration in ms
     */
    fadeOut(el, duration = 400) {
      if (!el) return;

      el.style.opacity = 1;

      let last = Date.now();

      const tick = () => {
        const now = Date.now();
        const progress = (now - last) / duration;

        el.style.opacity = Math.max(
          parseFloat(el.style.opacity) - progress,
          0
        );

        last = now;

        if (parseFloat(el.style.opacity) > 0) {
          requestAnimationFrame(tick);
        } else {
          el.style.display = 'none';
        }
      };

      requestAnimationFrame(tick);
    },

    /**
     * Debounce function calls
     * @param {function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {function} Debounced function
     */
    debounce(func, wait = 250) {
      let timeout;

      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    /**
     * Throttle function calls
     * @param {function} func - Function to throttle
     * @param {number} limit - Time limit in ms
     * @returns {function} Throttled function
     */
    throttle(func, limit = 250) {
      let inThrottle;

      return function executedFunction(...args) {
        if (!inThrottle) {
          func(...args);
          inThrottle = true;
          setTimeout(() => (inThrottle = false), limit);
        }
      };
    },

    /**
     * Wait for element to appear in DOM
     * @param {string} selector - CSS selector
     * @param {number} timeout - Max wait time in ms
     * @returns {Promise<HTMLElement>}
     */
    waitForElement(selector, timeout = 5000) {
      return new Promise((resolve, reject) => {
        const startTime = Date.now();

        const check = () => {
          const element = document.querySelector(selector);

          if (element) {
            resolve(element);
          } else if (Date.now() - startTime > timeout) {
            reject(
              new Error(`Element ${selector} not found within ${timeout}ms`)
            );
          } else {
            setTimeout(check, 100);
          }
        };

        check();
      });
    },

    /**
     * Load external script dynamically
     * @param {string} src - Script URL
     * @param {object} options - Script attributes
     * @returns {Promise<void>}
     */
    loadScript(src, options = {}) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;

        // Apply options
        Object.entries(options).forEach(([key, value]) => {
          script.setAttribute(key, value);
        });

        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load: ${src}`));

        document.head.appendChild(script);
      });
    },

    /**
     * Safely parse JSON with fallback
     * @param {string} jsonString - JSON string to parse
     * @param {*} fallback - Fallback value on error
     * @returns {*} Parsed object or fallback
     */
    safeJSONParse(jsonString, fallback = null) {
      try {
        return JSON.parse(jsonString);
      } catch (err) {
        console.warn('⚠️ JSON parse error:', err);
        return fallback;
      }
    },

    /**
     * Deep clone an object
     * @param {object} obj - Object to clone
     * @returns {object} Cloned object
     */
    deepClone(obj) {
      if (obj === null || typeof obj !== 'object') return obj;

      try {
        return JSON.parse(JSON.stringify(obj));
      } catch (err) {
        console.warn('⚠️ Deep clone failed:', err);
        return obj;
      }
    },

    /**
     * Check if element is in viewport
     * @param {HTMLElement} el - Element to check
     * @returns {boolean}
     */
    isInViewport(el) {
      if (!el) return false;

      const rect = el.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <=
          (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <=
          (window.innerWidth || document.documentElement.clientWidth)
      );
    },

    /**
     * Smooth scroll to element
     * @param {HTMLElement|string} target - Element or selector
     * @param {number} offset - Offset from top in px
     */
    scrollTo(target, offset = 0) {
      const element =
        typeof target === 'string'
          ? document.querySelector(target)
          : target;

      if (!element) return;

      const top =
        element.getBoundingClientRect().top + window.pageYOffset - offset;

      window.scrollTo({
        top,
        behavior: 'smooth',
      });
    },

    /**
     * Get CSS variable value
     * @param {string} varName - CSS variable name (without --)
     * @returns {string} Variable value
     */
    getCSSVar(varName) {
      return getComputedStyle(document.documentElement)
        .getPropertyValue(`--${varName}`)
        .trim();
    },

    /**
     * Set CSS variable value
     * @param {string} varName - CSS variable name (without --)
     * @param {string} value - New value
     */
    setCSSVar(varName, value) {
      document.documentElement.style.setProperty(`--${varName}`, value);
    },

    /**
     * Format date to locale string
     * @param {string|Date} date - Date to format
     * @param {string} locale - Locale code
     * @returns {string} Formatted date
     */
    formatDate(date, locale = 'fa-IR') {
      try {
        const dateObj = date instanceof Date ? date : new Date(date);
        return dateObj.toLocaleDateString(locale);
      } catch (err) {
        console.warn('⚠️ Date format error:', err);
        return String(date);
      }
    },

    /**
     * Generate unique ID
     * @param {string} prefix - Optional prefix
     * @returns {string} Unique ID
     */
    generateId(prefix = 'id') {
      return `${prefix}-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
    },

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>}
     */
    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn('⚠️ Clipboard write failed:', err);

        // Fallback method
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();

        try {
          document.execCommand('copy');
          document.body.removeChild(textarea);
          return true;
        } catch (fallbackErr) {
          document.body.removeChild(textarea);
          return false;
        }
      }
    },

    /**
     * Check if mobile device
     * @returns {boolean}
     */
    isMobile() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    },

    /**
     * Check if touch device
     * @returns {boolean}
     */
    isTouchDevice() {
      return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0
      );
    },

    /**
     * Get browser info
     * @returns {object} Browser information
     */
    getBrowserInfo() {
      const ua = navigator.userAgent;
      const browsers = {
        Chrome: /Chrome\/(\S+)/,
        Firefox: /Firefox\/(\S+)/,
        Safari: /Safari\/(\S+)/,
        Edge: /Edg\/(\S+)/,
        Opera: /OPR\/(\S+)/,
      };

      for (const [name, regex] of Object.entries(browsers)) {
        const match = ua.match(regex);
        if (match) {
          return {
            name,
            version: match[1],
          };
        }
      }

      return {
        name: 'Unknown',
        version: 'Unknown',
      };
    },
  };

  console.log(
    '%c✅ Utils initialized',
    'color:#00ddff;font-weight:bold;'
  );
})();