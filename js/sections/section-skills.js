/**
 * =======================================================
 * 📄 File: js/sections/section-skills.js
 * 🎯 Purpose: Progressive Skill Bar Chart (Glass UI)
 * Author: Saleh Abedinezhad (ImSalione)
 * =======================================================
 * ✅ OPTIMIZED: Bar chart with smooth growth animations
 * ✅ FEATURE: Skills grow progressively with timeline
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
  let skillLevels = {}; // Track progress level for each skill
  let allSkillsCount = 0;
  let isInitialized = false;
  let elements = {};
  
  // Animation queue management
  let animationQueue = [];
  let isAnimating = false;

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
   * Calculate skill progress level based on timeline position
   */
  function calculateSkillLevel(skillName, currentIndex) {
    let firstAppearance = -1;
    let level = 0;
    
    // Find when skill first appeared
    for (let i = 0; i < timelineData.length; i++) {
      const skills = timelineData[i].skills_cumulative || [];
      if (skills.includes(skillName)) {
        if (firstAppearance === -1) {
          firstAppearance = i;
        }
        if (i <= currentIndex) {
          level = i - firstAppearance + 1;
        }
      }
    }
    
    // Calculate percentage (20% base + random growth up to 100%)
    const baseLevel = 20;
    const maxGrowth = 80;
    const growthPerStep = maxGrowth / Math.max(timelineData.length - firstAppearance, 1);
    
    let percentage = baseLevel + (level * growthPerStep);
    
    // Add some randomness for natural feel
    const randomVariation = (Math.random() - 0.5) * 10;
    percentage = Math.max(20, Math.min(100, percentage + randomVariation));
    
    return Math.round(percentage);
  }

  /**
   * Clear animation queue
   */
  function clearAnimationQueue() {
    animationQueue.forEach(timeoutId => clearTimeout(timeoutId));
    animationQueue = [];
    isAnimating = false;
    console.log('🧹 [Skills] Animation queue cleared');
  }

  /**
   * Add timeout to queue
   */
  function queueTimeout(callback, delay) {
    const timeoutId = setTimeout(() => {
      callback();
      const index = animationQueue.indexOf(timeoutId);
      if (index > -1) {
        animationQueue.splice(index, 1);
      }
      
      if (animationQueue.length === 0) {
        isAnimating = false;
      }
    }, delay);
    
    animationQueue.push(timeoutId);
    return timeoutId;
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
    // Cancel any ongoing animations
    if (isAnimating) {
      console.log('⏳ [Skills] Cancelling ongoing animations...');
      clearAnimationQueue();
    }

    // Handle past card (clear all)
    if (index === -1) {
      const newSkills = [];
      
      if (elements.event) {
        elements.event.textContent = '—';
      }
      
      animateSkillsChange(newSkills, 'آغاز مسیر', -1);
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

    animateSkillsChange(newSkills, event.title, index);
  }

  /**
   * Animate skills change with smooth bar chart transitions
   */
  function animateSkillsChange(newSkills, eventTitle, timelineIndex) {
    isAnimating = true;

    // Update context UI
    if (elements.event) {
      elements.event.textContent = eventTitle || '—';
    }

    if (elements.ctxBox) {
      elements.ctxBox.classList.add('active');
      queueTimeout(() => {
        if (elements.ctxBox) {
          elements.ctxBox.classList.remove('active');
        }
      }, 500);
    }

    // Calculate diff
    const toAdd = newSkills.filter((s) => !currentSkills.includes(s));
    const toRemove = currentSkills.filter((s) => !newSkills.includes(s));
    const toUpdate = currentSkills.filter((s) => newSkills.includes(s));

    console.log(`➕ [Skills] Adding: ${toAdd.length}`, toAdd);
    console.log(`➖ [Skills] Removing: ${toRemove.length}`, toRemove);
    console.log(`🔄 [Skills] Updating: ${toUpdate.length}`, toUpdate);

    // Update current skills
    currentSkills = [...newSkills];

    // Remove skills
    if (toRemove.length > 0) {
      toRemove.forEach((skillName, idx) => {
        const card = elements.grid.querySelector(`[data-skill="${skillName}"]`);
        if (card) {
          queueTimeout(() => {
            card.classList.add('removing');
            queueTimeout(() => {
              if (card.parentNode) {
                card.remove();
                delete skillLevels[skillName];
              }
            }, 400);
          }, idx * 30);
        }
      });
    }

    // Update existing skills with new progress
    if (toUpdate.length > 0 && timelineIndex >= 0) {
      toUpdate.forEach((skillName) => {
        const card = elements.grid.querySelector(`[data-skill="${skillName}"]`);
        if (card) {
          const newLevel = calculateSkillLevel(skillName, timelineIndex);
          skillLevels[skillName] = newLevel;
          
          const progressFill = card.querySelector('.skill-progress-fill');
          if (progressFill) {
            queueTimeout(() => {
              progressFill.style.width = `${newLevel}%`;
            }, 100);
          }
        }
      });
    }

    // Add new skills
    const removeDelay = toRemove.length * 30 + 100;
    
    queueTimeout(() => {
      if (!isAnimating) {
        console.log('ℹ️ [Skills] Animation cancelled, skipping additions');
        return;
      }

      toAdd.forEach((skillName, idx) => {
        if (elements.grid && elements.grid.querySelector(`[data-skill="${skillName}"]`)) {
          return;
        }

        const skillInfo = skillsData[skillName];
        if (!skillInfo) {
          console.warn(`⚠️ [Skills] Skill info not found: "${skillName}"`);
          return;
        }

        // Calculate initial level for new skill
        const initialLevel = timelineIndex >= 0 
          ? calculateSkillLevel(skillName, timelineIndex)
          : 20;
        skillLevels[skillName] = initialLevel;

        queueTimeout(() => {
          if (elements.grid) {
            addSkillBar(skillName, skillInfo, initialLevel);
          }
        }, idx * 50);
      });

      // Update empty state after all operations
      const finalDelay = toAdd.length * 50 + 100;
      queueTimeout(() => {
        updateEmptyState();
        if (animationQueue.length === 1) {
          isAnimating = false;
        }
        console.log('✅ [Skills] Animation sequence complete');
      }, finalDelay);
      
    }, removeDelay);

    // Update progress bar
    updateProgressBar();

    console.log(`📊 [Skills] Updated: ${currentSkills.length}/${allSkillsCount}`);
  }

  /**
   * Add skill bar to chart with animation
   */
  function addSkillBar(skillName, skillInfo, progressLevel) {
    if (!elements.grid) {
      console.warn('⚠️ [Skills] Grid not available for adding bar');
      return;
    }

    const card = document.createElement('div');
    card.className = 'skill-card';
    card.dataset.skill = skillName;
    card.dataset.category = skillInfo.category || 'Other';

    card.innerHTML = `
      <div class="skill-info">
        <div class="skill-icon">${skillInfo.icon || '💡'}</div>
        <div class="skill-name">${skillInfo.name}</div>
      </div>
      <div class="skill-progress">
        <div class="skill-progress-fill" style="width: 0%"></div>
      </div>
      <div class="skill-level">${skillInfo.level || ''}</div>
    `;

    card.addEventListener('click', () => showModal(skillInfo));

    elements.grid.appendChild(card);

    // Trigger entry animation
    requestAnimationFrame(() => {
      void card.offsetWidth;
      card.classList.add('entering');
      
      // Animate progress bar after card enters
      queueTimeout(() => {
        const progressFill = card.querySelector('.skill-progress-fill');
        if (progressFill) {
          progressFill.style.width = `${progressLevel}%`;
        }
      }, 300);
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
      queueTimeout(() => {
        if (elements.count) {
          elements.count.classList.remove('updating');
        }
      }, 500);
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

    document.addEventListener('keydown', (e) => {
      if (
        e.key === 'Escape' &&
        elements.modal &&
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
    console.log('🔄 [Skills] Resetting...');
    
    clearAnimationQueue();
    
    isInitialized = false;
    currentSkills = [];
    skillLevels = {};
    allSkillsCount = 0;
    elements = {};
    timelineData = [];
    skillsData = {};
    
    console.log('✅ [Skills] Reset complete');
  }

  /**
   * Event listeners
   */
  document.addEventListener(CONFIG.events.skillsRendered, () => {
    console.log('📣 [Skills] Received skillsRendered event');
    setTimeout(initialize, 100);
  });

  document.addEventListener(CONFIG.events.languageChanged, () => {
    console.log('🌍 [Skills] Language changed, resetting...');
    reset();
    setTimeout(initialize, 300);
  });

  console.log('✅ [Skills] Module loaded');
})();