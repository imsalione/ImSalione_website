/**
 * =======================================================
 * 📄 File: js/sections/section-intro.js
 * 🎯 Purpose: Intro Section Animations & Modal
 * Author: Saleh Abedinezhad (ImSalione)
 * =======================================================
 * Responsibilities:
 * - Fix contact icons
 * - Play entrance animations
 * - Handle about modal
 * =======================================================
 */

(function initIntroSection() {
  'use strict';

  /**
   * Get contact icon type and path
   */
  function getContactIcon(href) {
    const type = CONFIG.getContactIconType(href);
    return CONFIG.contactIcons[type] || CONFIG.contactIcons.website;
  }

  /**
   * Fix contact icons
   */
  function fixContactIcons(section) {
    if (!section) return;

    const links = section.querySelectorAll('.contact-links a');

    links.forEach((link) => {
      const href = link.getAttribute('href');
      const iconPath = getContactIcon(href);
      const type = CONFIG.getContactIconType(href);

      link.innerHTML = `
        <img 
          src="${iconPath}" 
          alt="${type}" 
          style="width: 20px; height: 20px; pointer-events: none;"
        />
      `;
    });

    console.log(`✅ [Intro] Fixed ${links.length} contact icons`);
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

  console.log('✅ [Intro] Module loaded');
})();