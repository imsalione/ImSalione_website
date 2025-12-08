/**
 * =======================================================
 * 📄 File: js/config.js
 * 🎯 Global Configuration — ImSalione Portfolio
 * Author: Saleh Abedinezhad (ImSalione)
 * =======================================================
 * Purpose:
 *   🌐 Language & Theme Defaults
 *   📁 Content JSON Paths
 *   🧩 Partial HTML Paths & Mount Points
 *   ⚙️ Standardized Global Events (Pub/Sub)
 * =======================================================
 */

(function initConfig() {
  'use strict';

  // Prevent re-initialization
  if (window.CONFIG) {
    console.warn('⚠️ CONFIG already initialized, skipping');
    return;
  }

  window.CONFIG = {
    // ========== Default Settings ==========
    defaultLang: 'fa',
    defaultTheme: 'dark',
    defaultThemeStyle: 'default',

    // ========== HTML Partials Paths ==========
    partials: {
      intro: 'partials/section-intro.html',
      timeline: 'partials/section-timeline.html',
      skills: 'partials/section-skills.html',
      projects: 'partials/section-projects.html',
      fab: 'partials/fab.html',
    },

    // ========== Mount Points (CSS Selectors) ==========
    mountPoints: {
      intro: '#section-intro',
      timeline: '#section-timeline-skills .timeline-container',
      skills: '#section-timeline-skills .skills-container',
      projects: '#section-projects',
      fab: '#fab-placeholder',
    },

    // ========== JSON Content Paths ==========
    contentPaths: {
      fa: 'content/fa.json',
      en: 'content/en.json',
    },

    // ========== Theme CSS Paths ==========
    themeCSSPath: 'css/themes/',
    themeLinkId: 'theme-css-link',

    // ========== Application Events ==========
    events: {
      // Core lifecycle events
      appReady: 'appReady',
      partialLoaded: 'partialLoaded',
      partialsReady: 'partialsReady',
      dataReady: 'dataReady',
      renderReady: 'renderReady',

      // Settings change events
      languageChanged: 'languageChanged',
      themeChanged: 'themeChanged',
      paletteChanged: 'paletteChanged',

      // Section render events
      introRendered: 'introRendered',
      timelineRendered: 'timelineRendered',
      skillsRendered: 'skillsRendered',
      projectsRendered: 'projectsRendered',

      // Timeline-Skills synchronization
      timelineIndexChanged: 'timelineIndexChanged',

      // FAB events
      fabThemeToggle: 'fabThemeToggle',
      fabLangToggle: 'fabLangToggle',
      fabPaletteSelect: 'fabPaletteSelect',
    },

    // ========== Contact Icons Mapping ==========
    contactIcons: {
      email: '/assets/icons/email.svg',
      phone: '/assets/icons/phone.svg',
      github: '/assets/icons/github.svg',
      linkedin: '/assets/icons/linkedin.svg',
      instagram: '/assets/icons/instagram.svg',
      website: '/assets/icons/link.svg',
    },

    // ========== Storage Keys ==========
    storage: {
      lang: 'lang',
      theme: 'theme',
      themeStyle: 'themeStyle',
      fabIntroShown: 'fabIntroShown',
    },

    // ========== API Endpoints ==========
    api: {
      githubContributions: (username) =>
        `https://github-contributions-api.deno.dev/${username}.json`,
    },

    // ========== Utility Functions ==========
    /**
     * Get current language from localStorage
     */
    getCurrentLang() {
      try {
        return localStorage.getItem(this.storage.lang) || this.defaultLang;
      } catch (err) {
        console.warn('⚠️ Cannot access localStorage:', err);
        return this.defaultLang;
      }
    },

    /**
     * Get current theme from localStorage
     */
    getCurrentTheme() {
      try {
        return localStorage.getItem(this.storage.theme) || this.defaultTheme;
      } catch (err) {
        console.warn('⚠️ Cannot access localStorage:', err);
        return this.defaultTheme;
      }
    },

    /**
     * Get current theme style (palette) from localStorage
     */
    getCurrentThemeStyle() {
      try {
        return (
          localStorage.getItem(this.storage.themeStyle) ||
          this.defaultThemeStyle
        );
      } catch (err) {
        console.warn('⚠️ Cannot access localStorage:', err);
        return this.defaultThemeStyle;
      }
    },

    /**
     * Save setting to localStorage safely
     */
    saveSetting(key, value) {
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (err) {
        console.warn(`⚠️ Cannot save ${key} to localStorage:`, err);
        return false;
      }
    },

    /**
     * Get contact icon type from URL
     */
    getContactIconType(url) {
      if (!url) return 'website';
      const lowerUrl = url.toLowerCase();

      if (lowerUrl.startsWith('mailto:')) return 'email';
      if (lowerUrl.startsWith('tel:')) return 'phone';
      if (lowerUrl.includes('github.com')) return 'github';
      if (lowerUrl.includes('linkedin.com')) return 'linkedin';
      if (lowerUrl.includes('instagram.com')) return 'instagram';

      return 'website';
    },
  };

  console.log(
    '%c✅ CONFIG loaded successfully',
    'color:#ffaa00;font-weight:bold;'
  );
})();