/**
 * =======================================================
 * 📄 File: js/config.js
 * 🎯 Global Configuration – ImSalione Portfolio
 * =======================================================
 * ✅ CONFIGURED: PHP API endpoint
 * =======================================================
 */

(function initConfig() {
  'use strict';

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
      appReady: 'appReady',
      partialLoaded: 'partialLoaded',
      partialsReady: 'partialsReady',
      dataReady: 'dataReady',
      renderReady: 'renderReady',
      languageChanged: 'languageChanged',
      themeChanged: 'themeChanged',
      paletteChanged: 'paletteChanged',
      introRendered: 'introRendered',
      timelineRendered: 'timelineRendered',
      skillsRendered: 'skillsRendered',
      projectsRendered: 'projectsRendered',
      timelineIndexChanged: 'timelineIndexChanged',
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
      /**
       * ✅ OPTION 1: PHP API (Recommended - uses your token)
       * Make sure api/github_contrib.php exists
       */
      githubContributions: (username) => {
        return `api/github_contrib.php?username=${username}&t=${Date.now()}`;
      },
      
      /**
       * ✅ OPTION 2: Static JSON (for testing without server)
       * Uncomment this to use static file instead:
       */
      // githubContributions: (username) => 'api/github.json',
      
      /**
       * ✅ OPTION 3: Public API (no token needed, but has rate limits)
       * Uncomment this to use public API:
       */
      // githubContributions: (username) => 
      //   `https://github-contributions-api.jogruber.de/v4/${username}?y=last`,
    },

    // ========== Utility Functions ==========
    getCurrentLang() {
      try {
        return localStorage.getItem(this.storage.lang) || this.defaultLang;
      } catch (err) {
        console.warn('⚠️ Cannot access localStorage:', err);
        return this.defaultLang;
      }
    },

    getCurrentTheme() {
      try {
        return localStorage.getItem(this.storage.theme) || this.defaultTheme;
      } catch (err) {
        console.warn('⚠️ Cannot access localStorage:', err);
        return this.defaultTheme;
      }
    },

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

    saveSetting(key, value) {
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (err) {
        console.warn(`⚠️ Cannot save ${key} to localStorage:`, err);
        return false;
      }
    },

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
  console.log('📡 GitHub API:', window.CONFIG.api.githubContributions('test'));
})();