/**
 * =======================================================
 * 📄 File: js/core/dom-manager.js
 * 🎯 Purpose: JSON-Driven DOM Renderer
 * Author: Saleh Abedinezhad (ImSalione)
 * =======================================================
 * FIXED: Timeline renders with proper data structure
 * Skills section properly initialized
 * =======================================================
 */

(function initDomManager() {
  'use strict';

  // Prevent re-initialization
  if (window.DomManager) {
    console.warn('⚠️ DomManager already initialized, skipping');
    return;
  }

  /**
   * Track rendered sections
   */
  const renderStatus = {
    intro: false,
    timeline: false,
    skills: false,
    projects: false,
  };

  /**
   * Get UI labels based on current language
   */
  function getLabels() {
    const lang = document.documentElement.lang || 'fa';

    const labels = {
      fa: {
        introTitle: 'درباره من',
        timelineTitle: 'سوابق کاری و تحصیلی',
        skillsTitle: 'مهارت‌ها',
        projectsTitle: 'پروژه‌ها',
        projectView: 'مشاهده پروژه',
        skillsLabel: 'مهارت',
        currentEvent: 'رویداد فعال:',
        navigateTimeline: 'برای مشاهده مهارت‌ها، تایم‌لاین را حرکت دهید...',
      },
      en: {
        introTitle: 'About Me',
        timelineTitle: 'Work & Education',
        skillsTitle: 'Skills',
        projectsTitle: 'Projects',
        projectView: 'View Project',
        skillsLabel: 'Skills',
        currentEvent: 'Current Event:',
        navigateTimeline: 'Navigate timeline to see skills...',
      },
    };

    return labels[lang] || labels.en;
  }

  const DomManager = {
    /**
     * Render all sections from JSON data
     * @param {object} data - JSON content (fa.json or en.json)
     */
    renderAll(data) {
      if (!data) {
        console.error('❌ [DomManager] No JSON data provided');
        return;
      }

      console.log('🎨 [DomManager] Starting render...');

      const labels = getLabels();

      try {
        this.renderIntro(data.intro, labels);
        this.renderTimeline(data.timeline, labels);
        this.renderSkills(data.skills, labels);
        this.renderProjects(data.projects, labels);

        console.log('✅ [DomManager] All sections rendered');
      } catch (err) {
        console.error('❌ [DomManager] Render error:', err);
      }
    },

    /**
     * Render Intro Section
     */
    renderIntro(intro, labels) {
      const root = document.querySelector('#section-intro');
      if (!root || !intro) {
        console.warn('⚠️ [DomManager] Intro section or data not found');
        return;
      }

      try {
        // Profile Image
        const img = root.querySelector('.profile-image');
        if (img) {
          img.src = intro.profile_image || 'assets/profile.jpg';
          img.alt = intro.full_name || 'Profile';
        }

        // Profile Name & Title
        const name = root.querySelector('.profile-name');
        const title = root.querySelector('.profile-title');
        if (name) name.textContent = intro.full_name || '';
        if (title) title.textContent = intro.title || '';

        // Contact Links
        const contact = root.querySelector('.contact-links');
        if (contact && intro.contacts) {
          contact.innerHTML = '';

          Object.entries(intro.contacts).forEach(([key, value]) => {
            if (!value) return;

            const link = document.createElement('a');
            link.href =
              key === 'email'
                ? `mailto:${value}`
                : key === 'phone'
                ? `tel:${value}`
                : value;
            link.target = '_blank';
            link.setAttribute('data-type', key);

            contact.appendChild(link);
          });
        }

        // About Me Content
        const aboutTitle = root.querySelector('.about-title');
        const aboutContent = root.querySelector('.about-content');

        if (aboutTitle) aboutTitle.textContent = labels.introTitle;

        if (aboutContent && Array.isArray(intro.about)) {
          aboutContent.innerHTML = '';

          intro.about.forEach((text) => {
            const p = document.createElement('p');
            p.textContent = text;
            aboutContent.appendChild(p);
          });
        }

        renderStatus.intro = true;
        this.emitEvent(CONFIG.events.introRendered);
        console.log('✅ [DomManager] Intro rendered');
      } catch (err) {
        console.error('❌ [DomManager] Intro render error:', err);
      }
    },

    /**
     * Render Timeline Section
     * FIXED: Only render real timeline items, let section-timeline.js add special cards
     */
    renderTimeline(timeline, labels) {
      const container = document.querySelector(
        '#section-timeline-skills .timeline-container'
      );

      if (!container || !timeline) {
        console.warn('⚠️ [DomManager] Timeline container or data not found');
        return;
      }

      try {
        // Create structure
        container.innerHTML = `
          <div class="timeline-wrapper">
            <h2 class="section-title">${labels.timelineTitle}</h2>
            <div class="timeline-indicator"></div>
            <div class="timeline-list"></div>
            <div class="timeline-nav">
              <button class="timeline-prev" aria-label="Previous"><span>‹</span></button>
              <button class="timeline-next" aria-label="Next"><span>›</span></button>
            </div>
          </div>
        `;

        const list = container.querySelector('.timeline-list');

        // Filter out past and future cards - they will be added by section-timeline.js
        const realEvents = timeline.filter(
          (item) => item.type !== 'past' && item.type !== 'future'
        );

        // Render ONLY real timeline items
        realEvents.forEach((item, index) => {
          const itemDiv = document.createElement('div');
          itemDiv.classList.add('timeline-item');
          itemDiv.dataset.eventId = item.id || '';
          itemDiv.dataset.index = String(index); // Real index (0-based)

          itemDiv.innerHTML = `
            <div>
              <h3>${item.title || ''}</h3>
              <small>${item.date || ''}</small>
              <p>${item.subtitle || item.description || ''}</p>
            </div>
          `;

          list.appendChild(itemDiv);
        });

        renderStatus.timeline = true;
        
        console.log(`✅ [DomManager] Timeline rendered with ${realEvents.length} real events`);
        
        // Emit event AFTER list is ready
        this.emitEvent(CONFIG.events.timelineRendered);
      } catch (err) {
        console.error('❌ [DomManager] Timeline render error:', err);
      }
    },

    /**
     * Render Skills Section
     */
    renderSkills(skills, labels) {
      const container = document.querySelector(
        '#section-timeline-skills .skills-container'
      );

      if (!container) {
        console.warn('⚠️ [DomManager] Skills container not found');
        return;
      }

      try {
        // Create structure
        container.innerHTML = `
          <div class="skills-wrapper">
            <h2 class="section-title">${labels.skillsTitle}</h2>
            
            <div class="skills-progress-bar">
              <div class="progress-fill"></div>
              <div class="progress-text">
                <span class="current-skills">0</span>
                <span class="separator">/</span>
                <span class="total-skills">0</span>
                <span class="label">${labels.skillsLabel}</span>
              </div>
            </div>

            <div class="timeline-context">
              <div class="context-icon">🎯</div>
              <div class="context-text">
                <span class="context-label">${labels.currentEvent}</span>
                <span class="context-event">—</span>
              </div>
            </div>

            <div class="skills-grid" id="skills-grid">
              <div class="empty-state">
                <div class="empty-icon">🌱</div>
                <p class="empty-text">${labels.navigateTimeline}</p>
              </div>
            </div>
            
            <!-- Skill Detail Modal -->
            <div class="skill-detail-modal hidden" id="skill-detail-modal">
              <div class="modal-backdrop"></div>
              <div class="modal-content">
                <button class="modal-close" aria-label="Close">×</button>
                <div class="modal-header">
                  <span class="modal-icon"></span>
                  <h3 class="modal-title"></h3>
                </div>
                <div class="modal-body">
                  <div class="modal-category"><span class="category-badge"></span></div>
                  <div class="modal-level">
                    <span class="level-label">Level:</span>
                    <span class="level-value"></span>
                  </div>
                  <p class="modal-description"></p>
                </div>
              </div>
            </div>
          </div>
        `;

        renderStatus.skills = true;
        
        console.log('✅ [DomManager] Skills structure rendered');
        
        // Emit event
        this.emitEvent(CONFIG.events.skillsRendered);
      } catch (err) {
        console.error('❌ [DomManager] Skills render error:', err);
      }
    },

    /**
     * Render Projects Section
     */
    renderProjects(projects, labels) {
      const wrapper = document.querySelector(
        '#section-projects .projects-wrapper'
      );

      if (!wrapper) {
        console.warn('⚠️ [DomManager] Projects wrapper not found');
        return;
      }

      try {
        // Update title
        const titleEl = wrapper.querySelector('.section-title');
        if (titleEl) titleEl.textContent = labels.projectsTitle;

        // Get or create grid
        let grid = wrapper.querySelector('.projects-grid');
        if (!grid) {
          grid = document.createElement('div');
          grid.className = 'projects-grid';
          wrapper.appendChild(grid);
        }

        grid.innerHTML = '';

        // GitHub Card (static)
        grid.insertAdjacentHTML(
          'beforeend',
          `
          <div class="project-card github-activity-card no-flip">
            <div class="card-inner">
              <div class="card-front">
                <div class="gh-header">
                  <div class="gh-header-left">
                    <span class="live-label">GITHUB LIVE 🔥</span>
                  </div>
                  <i class="fab fa-github github-icon"></i>
                </div>
                <div class="gh-chart-wrap">
                  <canvas id="ghContribChart"></canvas>
                  <div class="chart-loader">
                    <div class="spinner"></div>
                    <span class="loading-text">Loading...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `
        );

        // Project Cards from JSON
        if (Array.isArray(projects)) {
          projects.forEach((project) => {
            const card = document.createElement('div');
            card.className = 'project-card';

            card.innerHTML = `
              <div class="project-content">
                <h3 class="project-title">${project.title || ''}</h3>
                <p class="project-desc">${project.desc || ''}</p>
                ${
                  project.link
                    ? `<a href="${project.link}" target="_blank" class="project-link">${labels.projectView}</a>`
                    : ''
                }
              </div>
            `;

            grid.appendChild(card);
          });
        }

        renderStatus.projects = true;
        this.emitEvent(CONFIG.events.projectsRendered);
        console.log('✅ [DomManager] Projects rendered');
      } catch (err) {
        console.error('❌ [DomManager] Projects render error:', err);
      }
    },

    /**
     * Get render status
     */
    getRenderStatus() {
      return { ...renderStatus };
    },

    /**
     * Reset render status
     */
    resetRenderStatus() {
      Object.keys(renderStatus).forEach((key) => {
        renderStatus[key] = false;
      });
      console.log('🔄 [DomManager] Render status reset');
    },

    /**
     * Emit event helper
     */
    emitEvent(eventName, detail = {}) {
      if (window.EventHub && typeof window.EventHub.emit === 'function') {
        window.EventHub.emit(eventName, detail);
      } else {
        document.dispatchEvent(new CustomEvent(eventName, { detail }));
      }
    },
  };

  // Expose to window
  window.DomManager = DomManager;

  console.log(
    '%c✅ DomManager initialized',
    'color:#00ff88;font-weight:bold;'
  );
})();