/**
 * =======================================================
 * 📄 File: js/sections/section-timeline.js
 * 🎯 Purpose: Vertical Slot Machine Timeline with Skills Sync
 * Author: Saleh Abedinezhad (ImSalione)
 * =======================================================
 * FIXED: Proper index mapping and event dispatching
 * =======================================================
 */

(function initTimelineSection() {
  'use strict';

  /**
   * State
   */
  let currentIndex = 1; // Start at first real item (past card is at 0)
  let totalRealItems = 0; // Count of real timeline events (excluding past/future)
  let elements = {};
  let isInitialized = false;
  let timelineData = [];

  /**
   * Add past card dynamically
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
    pastCard.dataset.index = '-1'; // Special index for past
    pastCard.dataset.type = 'past';

    pastCard.innerHTML = `
      <div>
        <h3>${text.title}</h3>
        <small>${text.date}</small>
        <p>${text.subtitle}</p>
      </div>
    `;

    list.insertBefore(pastCard, list.firstChild);
    console.log('✅ [Timeline] Past card added');
  }

  /**
   * Add future card dynamically
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
    futureCard.dataset.index = String(totalRealItems); // After last real item
    futureCard.dataset.type = 'future';

    futureCard.innerHTML = `
      <div>
        <h3>${text.title}</h3>
        <small>${text.date}</small>
        <p>${text.subtitle}</p>
      </div>
    `;

    list.appendChild(futureCard);
    console.log('✅ [Timeline] Future card added');
  }

  /**
   * Create indicator dots (only for real items)
   */
  function createIndicator() {
    if (!elements.indicator) return;

    elements.indicator.innerHTML = '';

    for (let i = 0; i < totalRealItems; i++) {
      const dot = document.createElement('span');
      dot.dataset.index = i;

      if (i === currentIndex - 1) {
        dot.classList.add('active');
      }

      dot.addEventListener('click', () => goToSlide(i + 1));

      elements.indicator.appendChild(dot);
    }

    console.log(`📊 [Timeline] Created ${totalRealItems} indicator dots`);
  }

  /**
   * Update positions of all cards
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

      // Assign position class
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
    notifySkillsSection();
  }

  /**
   * Update indicator dots
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
   * Update navigation buttons
   */
  function updateButtons() {
    if (!elements.prevBtn || !elements.nextBtn) return;

    // Disable prev if at past card (index 0)
    elements.prevBtn.disabled = currentIndex <= 0;

    // Disable next if at future card (index totalRealItems + 1)
    elements.nextBtn.disabled = currentIndex >= totalRealItems + 1;
  }

  /**
   * Notify skills section of timeline change
   * CRITICAL: Convert display index to data index
   */
  function notifySkillsSection() {
    // currentIndex = 0 → past card (no skills)
    // currentIndex = 1 → first real event → dataIndex = 0
    // currentIndex = 2 → second real event → dataIndex = 1
    // etc.
    
    let dataIndex;
    let eventData = null;

    if (currentIndex === 0) {
      // Past card - no skills
      dataIndex = -1;
    } else if (currentIndex > 0 && currentIndex <= totalRealItems) {
      // Real event
      dataIndex = currentIndex - 1;
      eventData = timelineData[dataIndex] || null;
    } else {
      // Future card - show all skills
      dataIndex = totalRealItems - 1;
      eventData = timelineData[dataIndex] || null;
    }

    const event = new CustomEvent(CONFIG.events.timelineIndexChanged, {
      detail: {
        index: dataIndex,
        total: totalRealItems,
        eventData: eventData,
        displayIndex: currentIndex,
      },
    });

    document.dispatchEvent(event);

    console.log(
      `📡 [Timeline] Index: display=${currentIndex}, data=${dataIndex}, event="${eventData?.title || 'N/A'}"`
    );
  }

  /**
   * Navigate to specific slide
   */
  function goToSlide(index) {
    // Allow navigation to past (0) and future (totalRealItems + 1)
    if (index < 0 || index > totalRealItems + 1) return;

    currentIndex = index;
    updatePositions();
  }

  /**
   * Navigate to previous slide
   */
  function prevSlide() {
    if (currentIndex > 0) {
      currentIndex--;
      updatePositions();
    }
  }

  /**
   * Navigate to next slide
   */
  function nextSlide() {
    if (currentIndex <= totalRealItems) {
      currentIndex++;
      updatePositions();
    }
  }

  /**
   * Setup navigation
   */
  function setupNavigation() {
    // Button navigation
    if (elements.prevBtn) {
      elements.prevBtn.addEventListener('click', prevSlide);
    }

    if (elements.nextBtn) {
      elements.nextBtn.addEventListener('click', nextSlide);
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
      }
    });

    // Touch/Swipe support
    let touchStartY = 0;
    let touchEndY = 0;

    elements.list.addEventListener(
      'touchstart',
      (e) => {
        touchStartY = e.changedTouches[0].screenY;
      },
      { passive: true }
    );

    elements.list.addEventListener(
      'touchend',
      (e) => {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
      },
      { passive: true }
    );

    function handleSwipe() {
      const threshold = 50;
      const diff = touchStartY - touchEndY;

      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    }

    // Mouse wheel support
    let isScrolling = false;

    elements.list.addEventListener(
      'wheel',
      (e) => {
        if (isScrolling) return;

        e.preventDefault();
        isScrolling = true;

        if (e.deltaY > 0) {
          nextSlide();
        } else {
          prevSlide();
        }

        setTimeout(() => {
          isScrolling = false;
        }, 600);
      },
      { passive: false }
    );

    console.log('✅ [Timeline] Navigation setup complete');
  }

  /**
   * Initialize timeline
   */
  function initialize() {
    if (isInitialized) {
      console.log('ℹ️ [Timeline] Already initialized');
      return;
    }

    console.log('🎰 [Timeline] Initializing...');

    // Get elements
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

    // Load timeline data
    const content = window.currentContent || {};
    timelineData = window.timelineData || content.timeline || [];

    // Filter real events (exclude past/future if they exist in data)
    timelineData = timelineData.filter(
      (item) => item.type !== 'past' && item.type !== 'future'
    );

    // Get existing real items from DOM
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

    // Setup navigation
    setupNavigation();

    // Create indicator dots
    createIndicator();

    // Initial position: first real event (index 1)
    currentIndex = 1;
    updatePositions();

    isInitialized = true;

    console.log(
      `✅ [Timeline] Initialized: ${totalRealItems} events + 2 special cards`
    );
  }

  /**
   * Reset timeline (for language change)
   */
  function reset() {
    isInitialized = false;
    currentIndex = 1;
    totalRealItems = 0;
    elements = {};
    timelineData = [];
    console.log('🔄 [Timeline] Reset');
  }

  /**
   * Event listeners
   */
  document.addEventListener(CONFIG.events.timelineRendered, () => {
    console.log('📣 [Timeline] Received timelineRendered event');
    setTimeout(initialize, 100);
  });

  document.addEventListener(CONFIG.events.languageChanged, () => {
    reset();
    setTimeout(initialize, 300);
  });

  console.log('✅ [Timeline] Module loaded');
})();