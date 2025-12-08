/**
 * =======================================================
 * 📄 File: js/sections/section-skills.js
 * 🎯 Purpose: Progressive Skill Tree (Glass UI Optimized)
 * Author: Saleh Abedinezhad (ImSalione)
 * =======================================================
 * FIXED: Proper handling of timeline index
 * Smooth animations and empty state management
 * =======================================================
 */

(function initSkillsSection() {
  'use strict';

  /**
   * State
   */
  let timelineData = [];
  let skillsData = {};
  let currentSkills = [];
  let allSkillsCount = 0;
  let isInitialized = false;
  let elements = {};
  let animationTimeout = null;

  /**
   * Get category color CSS variable
   */
  function getCategoryColor(category) {
    const categoryKey = (category || 'other')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .split('-')[0];
    return `var(--category-${categoryKey}, var(--category-other))`;
  }

  /**
   * Calculate total unique skills from timeline
   */
  function calculateTotalSkills() {
    const uniqueSkills = new Set();
    
    timelineData.forEach((event) => {
      const skills = event.skills_cumulative || [];
      skills.forEach((skill) => uniqueSkills.add(skill));
    });
    
    return uniqueSkills.size;
  }

  /**
   * Initialize skills section
   */
  async function initialize() {
    if (isInitialized) {
      console.log('ℹ️ [Skills] Already initialized');
      return;
    }

    console.log('🎯 [Skills] Initializing...');

    // Get elements
    elements = {
      grid: document.getElementById('skills-grid'),
      bar: document.querySelector('.progress-fill'),
      count: document.querySelector('.current-skills'),
      total: document.querySelector('.total-skills'),
      event: document.querySelector('.context-event'),
      ctxBox: document.querySelector('.timeline-context'),
      modal: document.getElementById('skill-detail-modal'),
      emptyState: document.querySelector('.empty-state'),
    };

    if (!elements.grid) {
      console.warn('⚠️ [Skills] Grid not found, retrying...');
      setTimeout(initialize, 200);
      return;
    }

    // Load data
    const content = window.currentContent || {};
    timelineData = window.timelineData || content.timeline || [];
    skillsData = window.skillsData || content.skills || {};

    // Filter out past/future events
    timelineData = timelineData.filter(
      (item) => item.type !== 'past' && item.type !== 'future'
    );

    console.log(`📊 [Skills] Loaded ${timelineData.length} timeline events`);
    console.log(`📊 [Skills] Loaded ${Object.keys(skillsData).length} skill definitions`);

    // Calculate total skills
    allSkillsCount = calculateTotalSkills();

    if (elements.total) {
      elements.total.textContent = allSkillsCount;
    }

    console.log(`📊 [Skills] Total unique skills: ${allSkillsCount}`);

    // Setup listeners
    document.addEventListener(
      CONFIG.events.timelineIndexChanged,
      handleTimelineChange
    );

    setupModal();

    isInitialized = true;
    console.log('✅ [Skills] Initialized and waiting for timeline events');
  }

  /**
   * Handle timeline change event
   */
  function handleTimelineChange(e) {
    const { index, eventData, displayIndex } = e.detail;
    
    console.log(`🔔 [Skills] Timeline changed: display=${displayIndex}, data=${index}`);

    // Handle special cases
    if (index === -1) {
      // Past card - clear all skills
      console.log('📊 [Skills] Past card - clearing skills');
      updateSkills(-1);
      return;
    }

    // Regular event
    updateSkills(index);
  }

  /**
   * Update skills based on timeline index
   */
  function updateSkills(index) {
    // Handle past card (clear all)
    if (index === -1) {
      const newSkills = [];
      
      if (elements.event) {
        elements.event.textContent = '—';
      }
      
      animateSkillsChange(newSkills, 'آغاز مسیر');
      return;
    }

    // Get event data
    const event = timelineData[index];
    
    if (!event) {
      console.warn(`⚠️ [Skills] No event at index ${index}`);
      return;
    }

    const newSkills = event.skills_cumulative || [];

    console.log(`📊 [Skills] Event: "${event.title}"`);
    console.log(`📊 [Skills] Skills count: ${newSkills.length}`);

    animateSkillsChange(newSkills, event.title);
  }

  /**
   * Animate skills change with smooth transitions
   */
  function animateSkillsChange(newSkills, eventTitle) {
    // Update context UI
    if (elements.event) {
      elements.event.textContent = eventTitle || '—';
    }

    if (elements.ctxBox) {
      elements.ctxBox.classList.add('active');
      setTimeout(() => elements.ctxBox.classList.remove('active'), 500);
    }

    // Calculate diff
    const toAdd = newSkills.filter((s) => !currentSkills.includes(s));
    const toRemove = currentSkills.filter((s) => !newSkills.includes(s));

    console.log(`➕ [Skills] Adding: ${toAdd.length}`, toAdd);
    console.log(`➖ [Skills] Removing: ${toRemove.length}`, toRemove);

    // Update current skills
    currentSkills = [...newSkills];

    // Clear any pending animations
    if (animationTimeout) {
      clearTimeout(animationTimeout);
    }

    // Remove skills with fade-out animation
    toRemove.forEach((skillName, idx) => {
      const card = elements.grid.querySelector(`[data-skill="${skillName}"]`);
      if (card) {
        setTimeout(() => {
          card.classList.add('removing');
          setTimeout(() => card.remove(), 400);
        }, idx * 30);
      }
    });

    // Add skills with fade-in animation
    animationTimeout = setTimeout(() => {
      toAdd.forEach((skillName, idx) => {
        // Check if already exists
        if (elements.grid.querySelector(`[data-skill="${skillName}"]`)) {
          return;
        }

        const skillInfo = skillsData[skillName];
        if (!skillInfo) {
          console.warn(`⚠️ [Skills] Skill info not found: "${skillName}"`);
          return;
        }

        setTimeout(() => {
          addSkillCard(skillName, skillInfo);
        }, idx * 50);
      });

      // Update empty state
      updateEmptyState();
    }, toRemove.length * 30 + 100);

    // Update progress bar
    updateProgressBar();

    console.log(
      `📊 [Skills] Updated: ${currentSkills.length}/${allSkillsCount}`
    );
  }

  /**
   * Add skill card to grid with animation
   */
  function addSkillCard(skillName, skillInfo) {
    const card = document.createElement('div');
    card.className = 'skill-card';
    card.dataset.skill = skillName;
    card.dataset.category = skillInfo.category || 'Other';

    card.innerHTML = `
      <div class="skill-icon">${skillInfo.icon || '💡'}</div>
      <div class="skill-name">${skillInfo.name}</div>
      <div class="skill-level">${skillInfo.level || ''}</div>
    `;

    card.addEventListener('click', () => showModal(skillInfo));

    elements.grid.appendChild(card);

    // Trigger fade-in animation
    requestAnimationFrame(() => {
      void card.offsetWidth; // Force reflow
      card.classList.add('entering');
    });
  }

  /**
   * Update empty state visibility
   */
  function updateEmptyState() {
    if (!elements.emptyState) return;

    if (currentSkills.length > 0) {
      elements.emptyState.style.display = 'none';
    } else {
      elements.emptyState.style.display = 'flex';
    }
  }

  /**
   * Update progress bar
   */
  function updateProgressBar() {
    if (elements.bar && allSkillsCount > 0) {
      const percentage = (currentSkills.length / allSkillsCount) * 100;
      elements.bar.style.width = `${percentage}%`;
    }

    if (elements.count) {
      elements.count.textContent = currentSkills.length;
      elements.count.classList.add('updating');
      setTimeout(() => elements.count.classList.remove('updating'), 500);
    }
  }

  /**
   * Setup skill detail modal
   */
  function setupModal() {
    if (!elements.modal) {
      console.warn('⚠️ [Skills] Modal not found');
      return;
    }

    const closeBtn = elements.modal.querySelector('.modal-close');
    const backdrop = elements.modal.querySelector('.modal-backdrop');

    const closeModal = () => {
      elements.modal.classList.add('hidden');
      document.body.style.overflow = '';
    };

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    if (backdrop) {
      backdrop.addEventListener('click', closeModal);
    }

    // ESC key
    document.addEventListener('keydown', (e) => {
      if (
        e.key === 'Escape' &&
        !elements.modal.classList.contains('hidden')
      ) {
        closeModal();
      }
    });

    console.log('✅ [Skills] Modal setup complete');
  }

  /**
   * Show skill detail modal
   */
  function showModal(skillInfo) {
    if (!elements.modal) return;

    const modalElements = {
      icon: elements.modal.querySelector('.modal-icon'),
      title: elements.modal.querySelector('.modal-title'),
      category: elements.modal.querySelector('.category-badge'),
      level: elements.modal.querySelector('.level-value'),
      description: elements.modal.querySelector('.modal-description'),
    };

    if (modalElements.icon) {
      modalElements.icon.textContent = skillInfo.icon || '';
    }

    if (modalElements.title) {
      modalElements.title.textContent = skillInfo.name || '';
    }

    if (modalElements.category) {
      const category = skillInfo.category || 'Other';
      modalElements.category.textContent = category;
      modalElements.category.style.background = getCategoryColor(category);
    }

    if (modalElements.level) {
      modalElements.level.textContent = skillInfo.level || '';
    }

    if (modalElements.description) {
      modalElements.description.textContent = skillInfo.desc || '';
    }

    elements.modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    console.log(`💡 [Skills] Modal opened: ${skillInfo.name}`);
  }

  /**
   * Expose showModal globally
   */
  window.showModal = showModal;

  /**
   * Reset skills section
   */
  function reset() {
    isInitialized = false;
    currentSkills = [];
    allSkillsCount = 0;
    elements = {};
    if (animationTimeout) {
      clearTimeout(animationTimeout);
      animationTimeout = null;
    }
    console.log('🔄 [Skills] Reset');
  }

  /**
   * Event listeners
   */
  document.addEventListener(CONFIG.events.skillsRendered, () => {
    console.log('📣 [Skills] Received skillsRendered event');
    setTimeout(initialize, 100);
  });

  document.addEventListener(CONFIG.events.languageChanged, () => {
    reset();
    setTimeout(initialize, 300);
  });

  console.log('✅ [Skills] Module loaded');
})();