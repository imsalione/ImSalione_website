/**
 * =======================================================
 * 📄 File: js/sections/section-timeline.js
 * 🎯 Purpose: Vertical Slot Machine Timeline with Skills Sync
 * Author: Saleh Abedinezhad (ImSalione)
 * =======================================================
 * ✅ FIXED: Proper synchronization with skills section
 * ✅ FIXED: Correct index management for past/future cards
 * ✅ FIXED: Accurate event data dispatching
 * =======================================================
 */

(function initTimelineSection() {
  'use strict';

  /**
   * State management
   * currentIndex: Display position (0 = past, 1+ = real events, last+1 = future)
   * totalRealItems: Count of actual timeline events (excluding past/future)
   */
  let currentIndex = 1; // Start at first real event
  let totalRealItems = 0;
  let elements = {};
  let isInitialized = false;
  let timelineData = [];
  
  // Cleanup trackers
  let eventListeners = [];
  let resizeObserver = null;
  let wheelTimeout = null;

  /**
   * Add tracked event listener for proper cleanup
   * @param {EventTarget} target - Element to attach listener to
   * @param {string} event - Event type
   * @param {Function} handler - Event handler function
   * @param {Object} options - Event listener options
   */
  function addTrackedListener(target, event, handler, options) {
    target.addEventListener(event, handler, options);
    eventListeners.push({ target, event, handler, options });
  }

  /**
   * Cleanup all event listeners
   * Prevents memory leaks when language changes or page reloads
   */
  function cleanupListeners() {
    eventListeners.forEach(({ target, event, handler, options }) => {
      target.removeEventListener(event, handler, options);
    });
    eventListeners = [];
    
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    
    if (wheelTimeout) {
      clearTimeout(wheelTimeout);
      wheelTimeout = null;
    }
    
    console.log('🧹 [Timeline] Listeners cleaned up');
  }

  /**
   * Add past card to timeline
   * This card represents the state before any events
   * @param {HTMLElement} list - Timeline list container
   */
  function addPastCard(list) {
    const lang = document.documentElement.lang || 'fa';

    const texts = {
      fa: {
        title: 'آغاز مسیر...',
        subtitle: 'قبل از شروع این ماجراجویی ✨',
        date: 'گذشته',
      },
      en: {
        title: 'The Beginning...',
        subtitle: 'Before this journey started ✨',
        date: 'Past',
      },
    };

    const text = texts[lang] || texts.en;

    const pastCard = document.createElement('div');
    pastCard.classList.add('timeline-item', 'past-card');
    pastCard.dataset.index = '-1';
    pastCard.dataset.type = 'past';

    pastCard.innerHTML = `
      <div>
        <h3>${text.title}</h3>
        <small>${text.date}</small>
        <p>${text.subtitle}</p>
      </div>
    `;

    list.insertBefore(pastCard, list.firstChild);
    console.log('✅ [Timeline] Past card added at index -1');
  }

  /**
   * Add future card to timeline
   * This card represents future opportunities
   * @param {HTMLElement} list - Timeline list container
   */
  function addFutureCard(list) {
    const lang = document.documentElement.lang || 'fa';

    const texts = {
      fa: {
        title: 'قدم بعدی...؟',
        subtitle: 'در حال کشف فرصت‌های جدید 🚀',
        date: 'آینده',
      },
      en: {
        title: "What's Next...?",
        subtitle: 'Exploring new opportunities 🚀',
        date: 'Future',
      },
    };

    const text = texts[lang] || texts.en;

    const futureCard = document.createElement('div');
    futureCard.classList.add('timeline-item', 'future-card');
    futureCard.dataset.index = String(totalRealItems);
    futureCard.dataset.type = 'future';

    futureCard.innerHTML = `
      <div>
        <h3>${text.title}</h3>
        <small>${text.date}</small>
        <p>${text.subtitle}</p>
      </div>
    `;

    list.appendChild(futureCard);
    console.log(`✅ [Timeline] Future card added at index ${totalRealItems}`);
  }

  /**
   * Create indicator dots for navigation
   * Only real events get dots (past and future don't)
   */
  function createIndicator() {
    if (!elements.indicator) return;

    elements.indicator.innerHTML = '';

    for (let i = 0; i < totalRealItems; i++) {
      const dot = document.createElement('span');
      dot.dataset.index = i;

      // Highlight active dot (currentIndex - 1 because index 0 is past card)
      if (i === currentIndex - 1) {
        dot.classList.add('active');
      }

      addTrackedListener(dot, 'click', () => goToSlide(i + 1));

      elements.indicator.appendChild(dot);
    }

    console.log(`📊 [Timeline] Created ${totalRealItems} indicator dots`);
  }

  /**
   * Update positions of all timeline cards
   * Creates slot machine effect with proper stacking
   */
  function updatePositions() {
    const allItems = elements.list.querySelectorAll('.timeline-item');

    allItems.forEach((item, index) => {
      // Remove all position classes
      item.classList.remove(
        'center',
        'above-1',
        'above-2',
        'above-3',
        'below-1',
        'below-2',
        'below-3',
        'hidden'
      );

      const diff = index - currentIndex;

      // Apply position class based on distance from center
      if (diff === 0) {
        item.classList.add('center');
      } else if (diff === -1) {
        item.classList.add('above-1');
      } else if (diff === -2) {
        item.classList.add('above-2');
      } else if (diff <= -3) {
        item.classList.add('above-3');
      } else if (diff === 1) {
        item.classList.add('below-1');
      } else if (diff === 2) {
        item.classList.add('below-2');
      } else if (diff >= 3) {
        item.classList.add('below-3');
      }
    });

    updateIndicator();
    updateButtons();
    
    // Always notify skills section when positions change
    notifySkillsSection();
  }

  /**
   * Update indicator dots to reflect current position
   */
  function updateIndicator() {
    if (!elements.indicator) return;

    const dots = elements.indicator.querySelectorAll('span');

    dots.forEach((dot, index) => {
      if (index === currentIndex - 1) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  /**
   * Update navigation button states
   * Disable buttons at boundaries
   */
  function updateButtons() {
    if (!elements.prevBtn || !elements.nextBtn) return;

    elements.prevBtn.disabled = currentIndex <= 0;
    elements.nextBtn.disabled = currentIndex >= totalRealItems + 1;
  }

  /**
   * Notify skills section about timeline changes
   * This is the key function for synchronization
   */
  function notifySkillsSection() {
    let dataIndex;
    let eventData = null;

    /**
     * Index mapping:
     * currentIndex = 0 (past card) → dataIndex = -1 → no skills
     * currentIndex = 1 (first event) → dataIndex = 0 → first event's skills
     * currentIndex = 2 (second event) → dataIndex = 1 → cumulative skills up to second event
     * ...
     * currentIndex = totalRealItems (last event) → dataIndex = totalRealItems - 1 → all skills
     * currentIndex = totalRealItems + 1 (future card) → dataIndex = totalRealItems - 1 → keep last skills
     */
    if (currentIndex === 0) {
      // Past card - no skills
      dataIndex = -1;
      eventData = null;
    } else if (currentIndex > 0 && currentIndex <= totalRealItems) {
      // Real event - get corresponding data
      dataIndex = currentIndex - 1;
      eventData = timelineData[dataIndex] || null;
    } else {
      // Future card - keep last event's skills
      dataIndex = totalRealItems - 1;
      eventData = timelineData[dataIndex] || null;
    }

    // Dispatch custom event for skills section
    const event = new CustomEvent(CONFIG.events.timelineIndexChanged, {
      detail: {
        index: dataIndex, // Data array index (-1 for past, 0+ for real events)
        total: totalRealItems, // Total number of real events
        eventData: eventData, // Full event data object
        displayIndex: currentIndex, // Display position (0 for past, 1+ for events)
      },
    });

    document.dispatchEvent(event);

    console.log(
      `📡 [Timeline] Event dispatched: display=${currentIndex}, data=${dataIndex}, total=${totalRealItems}`
    );
    
    if (eventData) {
      console.log(`   └─ Event: "${eventData.title}" with ${eventData.skills_cumulative?.length || 0} cumulative skills`);
    }
  }

  /**
   * Navigate to specific slide
   * @param {number} index - Target display index
   */
  function goToSlide(index) {
    if (index < 0 || index > totalRealItems + 1) return;

    currentIndex = index;
    updatePositions();
    
    console.log(`🎯 [Timeline] Navigated to display index ${index}`);
  }

  /**
   * Navigate to previous slide
   */
  function prevSlide() {
    if (currentIndex > 0) {
      currentIndex--;
      updatePositions();
      console.log(`⬆️ [Timeline] Moved to previous: ${currentIndex}`);
    }
  }

  /**
   * Navigate to next slide
   */
  function nextSlide() {
    if (currentIndex <= totalRealItems) {
      currentIndex++;
      updatePositions();
      console.log(`⬇️ [Timeline] Moved to next: ${currentIndex}`);
    }
  }

  /**
   * Setup navigation controls
   * Handles button clicks, keyboard, touch, and mouse wheel
   */
  function setupNavigation() {
    // Button navigation
    if (elements.prevBtn) {
      addTrackedListener(elements.prevBtn, 'click', prevSlide);
    }

    if (elements.nextBtn) {
      addTrackedListener(elements.nextBtn, 'click', nextSlide);
    }

    // Keyboard navigation
    const keyHandler = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
      }
    };
    addTrackedListener(document, 'keydown', keyHandler);

    // Touch/Swipe support
    let touchStartY = 0;
    let touchEndY = 0;

    const touchStartHandler = (e) => {
      touchStartY = e.changedTouches[0].screenY;
    };

    const touchEndHandler = (e) => {
      touchEndY = e.changedTouches[0].screenY;
      const threshold = 50;
      const diff = touchStartY - touchEndY;

      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    };

    addTrackedListener(elements.list, 'touchstart', touchStartHandler, { passive: true });
    addTrackedListener(elements.list, 'touchend', touchEndHandler, { passive: true });

    // Mouse wheel navigation with debounce
    let isScrolling = false;

    const wheelHandler = (e) => {
      if (isScrolling) return;

      e.preventDefault();
      isScrolling = true;

      if (e.deltaY > 0) {
        nextSlide();
      } else {
        prevSlide();
      }

      if (wheelTimeout) {
        clearTimeout(wheelTimeout);
      }

      wheelTimeout = setTimeout(() => {
        isScrolling = false;
      }, 600);
    };

    addTrackedListener(elements.list, 'wheel', wheelHandler, { passive: false });

    console.log('✅ [Timeline] Navigation setup complete');
  }

  /**
   * Initialize timeline section
   * Loads data, creates cards, and sets up navigation
   */
  function initialize() {
    if (isInitialized) {
      console.log('ℹ️ [Timeline] Already initialized');
      return;
    }

    console.log('🎰 [Timeline] Initializing...');

    // Get DOM elements
    elements = {
      list: document.querySelector('.timeline-list'),
      prevBtn: document.querySelector('.timeline-prev'),
      nextBtn: document.querySelector('.timeline-next'),
      indicator: document.querySelector('.timeline-indicator'),
    };

    if (!elements.list) {
      console.warn('⚠️ [Timeline] List not found, retrying...');
      setTimeout(initialize, 200);
      return;
    }

    // Load timeline data from global scope
    const content = window.currentContent || {};
    timelineData = window.timelineData || content.timeline || [];

    // Filter out past/future cards from data (they're added separately)
    timelineData = timelineData.filter(
      (item) => item.type !== 'past' && item.type !== 'future'
    );

    // Count existing real timeline items
    const existingItems = Array.from(
      elements.list.querySelectorAll('.timeline-item')
    );

    totalRealItems = existingItems.length;

    if (totalRealItems === 0) {
      console.warn('⚠️ [Timeline] No real items found');
      return;
    }

    console.log(`📊 [Timeline] Found ${totalRealItems} real events`);

    // Add special cards
    addPastCard(elements.list);
    addFutureCard(elements.list);

    // Setup navigation and indicators
    setupNavigation();
    createIndicator();

    // Set initial position to first real event (index 1)
    currentIndex = 1;
    updatePositions(); // This will call notifySkillsSection()

    isInitialized = true;

    console.log(
      `✅ [Timeline] Initialized: ${totalRealItems} events + 2 special cards`
    );
    console.log(`   └─ Initial position: display index ${currentIndex} (first real event)`);
  }

  /**
   * Reset timeline for language change
   * Cleans up everything and prepares for re-initialization
   */
  function reset() {
    console.log('🔄 [Timeline] Resetting...');
    
    // Critical: cleanup first to prevent memory leaks
    cleanupListeners();
    
    isInitialized = false;
    currentIndex = 1;
    totalRealItems = 0;
    elements = {};
    timelineData = [];
    
    console.log('✅ [Timeline] Reset complete');
  }

  /**
   * Event listeners
   */
  document.addEventListener(CONFIG.events.timelineRendered, () => {
    console.log('📣 [Timeline] Received timelineRendered event');
    setTimeout(initialize, 100);
  });

  document.addEventListener(CONFIG.events.languageChanged, () => {
    console.log('🌍 [Timeline] Language changed, resetting...');
    reset();
    setTimeout(initialize, 300);
  });

  console.log('✅ [Timeline] Module loaded');
})();