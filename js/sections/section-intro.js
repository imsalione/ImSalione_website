/**
 * =======================================================
 * 📄 File: js/sections/section-intro.js
 * 🎯 Purpose: Intro Section Animations & Modal
 * Author: Saleh Abedinezhad (ImSalione)
 * =======================================================
 * Responsibilities:
 * - Fix contact icons with Font Awesome support
 * - Play entrance animations
 * - Handle about modal
 * - Theme-aware icon colors
 * =======================================================
 */

(function initIntroSection() {
  'use strict';

  /**
   * Get Font Awesome icon class based on URL
   */
  function getIconClass(href) {
    const url = href.toLowerCase();
    
    // Social Media Icons
    if (url.includes('github.com')) return 'fab fa-github';
    if (url.includes('linkedin.com')) return 'fab fa-linkedin';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'fab fa-twitter';
    if (url.includes('instagram.com')) return 'fab fa-instagram';
    if (url.includes('facebook.com')) return 'fab fa-facebook';
    if (url.includes('youtube.com')) return 'fab fa-youtube';
    if (url.includes('telegram.org') || url.includes('t.me')) return 'fab fa-telegram';
    if (url.includes('whatsapp.com')) return 'fab fa-whatsapp';
    if (url.includes('discord.com') || url.includes('discord.gg')) return 'fab fa-discord';
    if (url.includes('reddit.com')) return 'fab fa-reddit';
    if (url.includes('medium.com')) return 'fab fa-medium';
    if (url.includes('dev.to')) return 'fab fa-dev';
    if (url.includes('stackoverflow.com')) return 'fab fa-stack-overflow';
    if (url.includes('codepen.io')) return 'fab fa-codepen';
    if (url.includes('dribbble.com')) return 'fab fa-dribbble';
    if (url.includes('behance.net')) return 'fab fa-behance';
    if (url.includes('pinterest.com')) return 'fab fa-pinterest';
    if (url.includes('twitch.tv')) return 'fab fa-twitch';
    if (url.includes('tiktok.com')) return 'fab fa-tiktok';
    if (url.includes('spotify.com')) return 'fab fa-spotify';
    if (url.includes('soundcloud.com')) return 'fab fa-soundcloud';
    
    // Email
    if (url.startsWith('mailto:')) return 'fas fa-envelope';
    
    // Phone
    if (url.startsWith('tel:')) return 'fas fa-phone';
    
    // Default website icon
    return 'fas fa-globe';
  }

  /**
   * Get icon label for accessibility
   */
  function getIconLabel(href) {
    const url = href.toLowerCase();
    
    if (url.includes('github.com')) return 'GitHub';
    if (url.includes('linkedin.com')) return 'LinkedIn';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'Twitter/X';
    if (url.includes('instagram.com')) return 'Instagram';
    if (url.includes('facebook.com')) return 'Facebook';
    if (url.includes('youtube.com')) return 'YouTube';
    if (url.includes('telegram.org') || url.includes('t.me')) return 'Telegram';
    if (url.includes('whatsapp.com')) return 'WhatsApp';
    if (url.includes('discord.com') || url.includes('discord.gg')) return 'Discord';
    if (url.includes('reddit.com')) return 'Reddit';
    if (url.includes('medium.com')) return 'Medium';
    if (url.includes('dev.to')) return 'Dev.to';
    if (url.includes('stackoverflow.com')) return 'Stack Overflow';
    if (url.includes('codepen.io')) return 'CodePen';
    if (url.includes('dribbble.com')) return 'Dribbble';
    if (url.includes('behance.net')) return 'Behance';
    if (url.includes('pinterest.com')) return 'Pinterest';
    if (url.includes('twitch.tv')) return 'Twitch';
    if (url.includes('tiktok.com')) return 'TikTok';
    if (url.includes('spotify.com')) return 'Spotify';
    if (url.includes('soundcloud.com')) return 'SoundCloud';
    if (url.startsWith('mailto:')) return 'Email';
    if (url.startsWith('tel:')) return 'Phone';
    
    return 'Website';
  }

  /**
   * Fix contact icons with Font Awesome
   */
  function fixContactIcons(section) {
    if (!section) return;

    const links = section.querySelectorAll('.contact-links a');

    links.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;

      const iconClass = getIconClass(href);
      const iconLabel = getIconLabel(href);

      // Replace content with Font Awesome icon
      link.innerHTML = `<i class="${iconClass}" aria-label="${iconLabel}"></i>`;
      
      // Add accessibility attributes
      link.setAttribute('aria-label', iconLabel);
      link.setAttribute('title', iconLabel);
      
      // Add target blank for external links
      if (!href.startsWith('mailto:') && !href.startsWith('tel:')) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });

    console.log(`✅ [Intro] Fixed ${links.length} contact icons with Font Awesome`);
  }

  /**
   * Play intro animation
   */
  function playIntroAnimation(section) {
    if (!section) return;

    const container = section.querySelector('.intro-section');
    if (container) {
      container.classList.add('active');
    }

    // Sequential fade-in for elements
    const elements = [
      '.intro-img-wrapper',
      '.profile-name',
      '.profile-title',
      '.contact-links',
      '.about-box',
    ];

    elements.forEach((selector, index) => {
      const element = section.querySelector(selector);
      if (!element) return;

      // Remove any existing animation
      element.classList.remove('fade-in');

      // Add animation with delay
      requestAnimationFrame(() => {
        setTimeout(() => {
          element.classList.add('fade-in');
        }, index * 150 + 100);
      });
    });

    console.log('✅ [Intro] Animation started');
  }

  /**
   * Setup about modal
   */
  function setupAboutModal(section) {
    const aboutBox = section?.querySelector('.about-box');
    const modal = document.getElementById('about-modal');

    if (!aboutBox || !modal) {
      console.warn('⚠️ [Intro] Modal elements not found');
      return;
    }

    // Prevent duplicate binding
    if (modal.dataset.bound === 'true') {
      console.log('ℹ️ [Intro] Modal already bound');
      return;
    }

    modal.dataset.bound = 'true';

    // Get modal elements
    const modalElements = {
      title: modal.querySelector('.about-modal-title'),
      body: modal.querySelector('.about-modal-body'),
      close: modal.querySelector('.about-close-btn'),
    };

    // Open modal
    aboutBox.addEventListener('click', () => {
      const sectionTitle =
        section.querySelector('.about-title')?.textContent || '';
      const sectionContent =
        section.querySelector('.about-content')?.innerHTML || '';

      if (modalElements.title) modalElements.title.textContent = sectionTitle;
      if (modalElements.body) modalElements.body.innerHTML = sectionContent;

      modal.classList.add('active');
      document.body.style.overflow = 'hidden';

      console.log('📖 [Intro] Modal opened');
    });

    // Close modal function
    const closeModal = () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      console.log('📖 [Intro] Modal closed');
    };

    // Close button
    if (modalElements.close) {
      modalElements.close.addEventListener('click', closeModal);
    }

    // Backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    // ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });

    console.log('✅ [Intro] Modal setup complete');
  }

  /**
   * Initialize intro section
   */
  function initialize() {
    const section = document.querySelector('#section-intro');

    if (!section) {
      console.warn('⚠️ [Intro] Section not found');
      return;
    }

    console.log('🎨 [Intro] Initializing...');

    // Fix contact icons
    fixContactIcons(section);

    // Play animation
    playIntroAnimation(section);

    // Setup modal
    setupAboutModal(section);

    console.log('✅ [Intro] Initialized');
  }

  /**
   * Event listeners
   */
  document.addEventListener(CONFIG.events.renderReady, initialize);
  document.addEventListener(CONFIG.events.introRendered, initialize);

  // Re-initialize on language change
  document.addEventListener(CONFIG.events.languageChanged, () => {
    setTimeout(initialize, 300);
  });

  // Re-initialize on theme/palette change for icon color update
  document.addEventListener(CONFIG.events.themeChanged, () => {
    console.log('🎨 [Intro] Theme changed, icons will auto-update via CSS');
  });

  document.addEventListener(CONFIG.events.fabPaletteSelect, () => {
    console.log('🎨 [Intro] Palette changed, icons will auto-update via CSS');
  });

  console.log('✅ [Intro] Module loaded');
})();