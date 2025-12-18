/**
 * =======================================================
 * 📄 File: js/sections/section-skills.js
 * 🎯 Purpose: Progressive Skill Bar Chart (Glass UI)
 * Author: Saleh Abedinezhad (ImSalione)
 * =======================================================
 * ✅ FIXED: Accurate skill level calculation with 4-tier system
 * ✅ FIXED: Proper progress bar synchronization
 * ✅ FIXED: Smart level badge upgrades (Beginner → Expert)
 * ✅ FIXED: Smooth animations and state management
 * =======================================================
 */

(function initSkillsSection() {
  'use strict';

  /**
   * State management
   */
  let timelineData = [];
  let skillsData = {};
  let currentSkills = [];
  let skillMetadata = {}; // Tracks: { skillName: { level: number, firstIndex: number, badge: string } }
  let allSkillsCount = 0;
  let isInitialized = false;
  let elements = {};
  
  // Animation queue management
  let animationQueue = [];
  let isAnimating = false;

  /**
   * Skill level tiers
   * Maps progression percentage to skill level badge
   */
  const LEVEL_TIERS = [
    { min: 0, max: 25, badge: 'Beginner', label: { fa: 'مبتدی', en: 'Beginner' } },
    { min: 25, max: 50, badge: 'Intermediate', label: { fa: 'متوسط', en: 'Intermediate' } },
    { min: 50, max: 75, badge: 'Advanced', label: { fa: 'پیشرفته', en: 'Advanced' } },
    { min: 75, max: 100, badge: 'Expert', label: { fa: 'حرفه‌ای', en: 'Expert' } }
  ];

  /**
   * Get category color CSS variable
   * @param {string} category - Skill category name
   * @returns {string} CSS variable reference
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
   * @returns {number} Total number of unique skills across all events
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
   * Calculate skill progression level with smart growth algorithm
   * @param {string} skillName - Name of the skill
   * @param {number} currentIndex - Current timeline index
   * @returns {number} Progress percentage (20-100%)
   */
  function calculateSkillLevel(skillName, currentIndex) {
    let firstAppearance = -1;
    let lastAppearance = -1;
    let appearanceCount = 0;
    
    // Scan timeline to find skill's journey
    for (let i = 0; i < timelineData.length; i++) {
      const skills = timelineData[i].skills_cumulative || [];
      if (skills.includes(skillName)) {
        if (firstAppearance === -1) {
          firstAppearance = i;
        }
        lastAppearance = i;
        if (i <= currentIndex) {
          appearanceCount++;
        }
      }
    }
    
    if (firstAppearance === -1 || appearanceCount === 0) {
      return 20; // Minimum level for new skills
    }

    /**
     * Smart Growth Algorithm:
     * - Base level: 20% (everyone starts somewhere)
     * - Growth rate: Based on how long skill has been active
     * - Natural variation: ±8% for realistic feel
     * - Cap: 100% maximum
     */
    const timelineSpan = lastAppearance - firstAppearance + 1;
    const progressRatio = appearanceCount / timelineSpan;
    
    // Calculate growth (60% available for growth from base 20%)
    const availableGrowth = 80;
    const earnedGrowth = availableGrowth * progressRatio;
    
    // Base level + earned growth
    let percentage = 20 + earnedGrowth;
    
    // Add natural variation for realism
    const variation = (Math.random() - 0.5) * 16; // ±8%
    percentage = percentage + variation;
    
    // Ensure bounds
    percentage = Math.max(20, Math.min(100, percentage));
    
    return Math.round(percentage);
  }

  /**
   * Get skill level badge based on percentage
   * @param {number} percentage - Skill progress percentage
   * @returns {Object} Badge info { badge, label }
   */
  function getSkillBadge(percentage) {
    const lang = document.documentElement.lang || 'fa';
    
    for (const tier of LEVEL_TIERS) {
      if (percentage >= tier.min && percentage < tier.max) {
        return {
          badge: tier.badge,
          label: tier.label[lang] || tier.label.en
        };
      }
    }
    
    // Default to Expert for 100%
    const expertTier = LEVEL_TIERS[LEVEL_TIERS.length - 1];
    return {
      badge: expertTier.badge,
      label: expertTier.label[lang] || expertTier.label.en
    };
  }

  /**
   * Clear animation queue
   * Prevents animation conflicts when rapidly changing timeline
   */
  function clearAnimationQueue() {
    animationQueue.forEach(timeoutId => clearTimeout(timeoutId));
    animationQueue = [];
    isAnimating = false;
    console.log('🧹 [Skills] Animation queue cleared');
  }

  /**
   * Add timeout to animation queue
   * Allows proper cleanup if animations are interrupted
   * @param {Function} callback - Function to execute
   * @param {number} delay - Delay in milliseconds
   * @returns {number} Timeout ID
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
   * Sets up DOM references and event listeners
   */
  async function initialize() {
    if (isInitialized) {
      console.log('ℹ️ [Skills] Already initialized');
      return;
    }

    console.log('🎯 [Skills] Initializing...');

    // Get DOM elements
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

    // Load data from global scope
    const content = window.currentContent || {};
    timelineData = window.timelineData || content.timeline || [];
    skillsData = window.skillsData || content.skills || {};

    // Filter out special cards
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
    console.log('✅ [Skills] Initialized and listening for timeline events');
    
    // Load initial skills from first timeline event after a short delay
    // This ensures we display skills even if timeline event hasn't fired yet
    setTimeout(() => {
      if (timelineData.length > 0 && currentSkills.length === 0) {
        const firstEvent = timelineData[0];
        console.log('🔄 [Skills] Loading initial skills from first event');
        updateSkills(0, firstEvent);
      }
    }, 200);
  }

  /**
   * Handle timeline change event
   * Main synchronization point with timeline section
   * @param {CustomEvent} e - Timeline change event
   */
  function handleTimelineChange(e) {
    const { index, eventData, displayIndex, total } = e.detail;
    
    console.log(`🔔 [Skills] Timeline changed: display=${displayIndex}, data=${index}, total=${total}`);

    // Handle past card (clear all skills)
    if (index === -1) {
      console.log('📊 [Skills] Past card - clearing all skills');
      updateSkills(-1, null);
      return;
    }

    // Handle real events
    if (index >= 0 && eventData) {
      console.log(`📊 [Skills] Event "${eventData.title}" at index ${index}`);
      updateSkills(index, eventData);
    }
  }

  /**
   * Update skills display based on timeline position
   * @param {number} index - Timeline data index (-1 for past)
   * @param {Object} eventData - Current event data
   */
  function updateSkills(index, eventData) {
    // Cancel ongoing animations
    if (isAnimating) {
      console.log('⏳ [Skills] Cancelling ongoing animations...');
      clearAnimationQueue();
    }

    // Handle past card (clear everything)
    if (index === -1) {
      const newSkills = [];
      
      if (elements.event) {
        const lang = document.documentElement.lang || 'fa';
        elements.event.textContent = lang === 'fa' ? 'آغاز مسیر' : 'The Beginning';
      }
      
      animateSkillsChange(newSkills, null, -1);
      return;
    }

    // Get skills for current event
    const newSkills = eventData?.skills_cumulative || [];

    console.log(`📊 [Skills] Event: "${eventData?.title}"`);
    console.log(`📊 [Skills] Cumulative skills: ${newSkills.length}`);

    animateSkillsChange(newSkills, eventData?.title, index);
  }

  /**
   * Animate skills change with smooth transitions
   * @param {Array} newSkills - Array of skill names to display
   * @param {string} eventTitle - Current event title
   * @param {number} timelineIndex - Current timeline index
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

    // Calculate what changed
    const toAdd = newSkills.filter((s) => !currentSkills.includes(s));
    const toRemove = currentSkills.filter((s) => !newSkills.includes(s));
    const toUpdate = currentSkills.filter((s) => newSkills.includes(s));

    console.log(`➕ [Skills] Adding: ${toAdd.length}`, toAdd);
    console.log(`➖ [Skills] Removing: ${toRemove.length}`, toRemove);
    console.log(`🔄 [Skills] Updating: ${toUpdate.length}`, toUpdate);

    // Update current skills list
    currentSkills = [...newSkills];

    // Phase 1: Remove skills
    if (toRemove.length > 0) {
      toRemove.forEach((skillName, idx) => {
        const card = elements.grid.querySelector(`[data-skill="${skillName}"]`);
        if (card) {
          queueTimeout(() => {
            card.classList.add('removing');
            queueTimeout(() => {
              if (card.parentNode) {
                card.remove();
                delete skillMetadata[skillName];
              }
            }, 400);
          }, idx * 30);
        }
      });
    }

    // Phase 2: Update existing skills with new progress
    if (toUpdate.length > 0 && timelineIndex >= 0) {
      toUpdate.forEach((skillName) => {
        const card = elements.grid.querySelector(`[data-skill="${skillName}"]`);
        if (card) {
          const newLevel = calculateSkillLevel(skillName, timelineIndex);
          const badgeInfo = getSkillBadge(newLevel);
          
          // Update metadata
          skillMetadata[skillName] = {
            level: newLevel,
            badge: badgeInfo.badge,
            badgeLabel: badgeInfo.label
          };
          
          // Update progress bar
          const progressFill = card.querySelector('.skill-progress-fill');
          if (progressFill) {
            queueTimeout(() => {
              progressFill.style.width = `${newLevel}%`;
            }, 100);
          }
          
          // Update badge
          const badgeElement = card.querySelector('.skill-level');
          if (badgeElement && badgeElement.textContent !== badgeInfo.label) {
            queueTimeout(() => {
              badgeElement.textContent = badgeInfo.label;
              badgeElement.classList.add('level-upgraded');
              queueTimeout(() => {
                badgeElement.classList.remove('level-upgraded');
              }, 500);
            }, 150);
          }
        }
      });
    }

    // Phase 3: Add new skills
    const removeDelay = toRemove.length * 30 + 100;
    
    queueTimeout(() => {
      if (!isAnimating) {
        console.log('ℹ️ [Skills] Animation cancelled, skipping additions');
        return;
      }

      toAdd.forEach((skillName, idx) => {
        // Check if already exists
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
        
        const badgeInfo = getSkillBadge(initialLevel);
        
        // Store metadata
        skillMetadata[skillName] = {
          level: initialLevel,
          badge: badgeInfo.badge,
          badgeLabel: badgeInfo.label
        };

        queueTimeout(() => {
          if (elements.grid) {
            addSkillBar(skillName, skillInfo, initialLevel, badgeInfo.label);
          }
        }, idx * 50);
      });

      // Phase 4: Update empty state and finalize
      const finalDelay = toAdd.length * 50 + 100;
      queueTimeout(() => {
        updateEmptyState();
        updateProgressBar();
        if (animationQueue.length === 1) {
          isAnimating = false;
        }
        console.log('✅ [Skills] Animation sequence complete');
      }, finalDelay);
      
    }, removeDelay);

    console.log(`📊 [Skills] Current: ${currentSkills.length}/${allSkillsCount}`);
  }

  /**
   * Add skill bar card to the grid
   * @param {string} skillName - Skill identifier
   * @param {Object} skillInfo - Skill data from JSON
   * @param {number} progressLevel - Initial progress percentage
   * @param {string} badgeLabel - Skill level badge text
   */
  function addSkillBar(skillName, skillInfo, progressLevel, badgeLabel) {
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
      <div class="skill-level">${badgeLabel}</div>
    `;

    // Click handler for modal
    card.addEventListener('click', () => showModal(skillInfo, skillMetadata[skillName]));

    elements.grid.appendChild(card);

    // Trigger entry animation
    requestAnimationFrame(() => {
      void card.offsetWidth; // Force reflow
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
   * Shows placeholder when no skills are displayed
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
   * Update progress bar to reflect skill acquisition
   * Shows visual feedback of overall progress
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
   * Handles modal interactions and keyboard shortcuts
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

    // Keyboard shortcut (Escape key)
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
   * Show skill detail modal with current metadata
   * @param {Object} skillInfo - Skill data from JSON
   * @param {Object} metadata - Current skill metadata
   */
  function showModal(skillInfo, metadata) {
    if (!elements.modal) return;

    const modalElements = {
      icon: elements.modal.querySelector('.modal-icon'),
      title: elements.modal.querySelector('.modal-title'),
      category: elements.modal.querySelector('.category-badge'),
      level: elements.modal.querySelector('.level-value'),
      description: elements.modal.querySelector('.modal-description'),
    };

    if (modalElements.icon) {
      modalElements.icon.textContent = skillInfo.icon || '💡';
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
      // Show current badge or fallback to JSON level
      const displayLevel = metadata?.badgeLabel || skillInfo.level || 'Beginner';
      modalElements.level.textContent = displayLevel;
    }

    if (modalElements.description) {
      modalElements.description.textContent = skillInfo.desc || '';
    }

    elements.modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    console.log(`💡 [Skills] Modal opened: ${skillInfo.name} (${metadata?.badge || 'N/A'})`);
  }

  /**
   * Expose showModal globally for external access
   */
  window.showModal = showModal;

  /**
   * Reset skills section for language change
   * Clears state and prepares for re-initialization
   */
  function reset() {
    console.log('🔄 [Skills] Resetting...');
    
    clearAnimationQueue();
    
    isInitialized = false;
    currentSkills = [];
    skillMetadata = {};
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