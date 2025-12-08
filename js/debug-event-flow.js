/**
 * =======================================================
 * 🐛 Event Flow Debugger
 * =======================================================
 * Add this to index.html BEFORE all other scripts
 * to track ALL events and find duplicates
 */

(function EventFlowDebugger() {
  console.log('%c🐛 Event Flow Debugger Active', 'background:#000;color:#0f0;font-size:16px;padding:5px;');

  // Track event calls
  const eventLog = {};
  const renderCalls = {
    intro: 0,
    timeline: 0,
    skills: 0,
    projects: 0,
    domManagerRenderAll: 0
  };

  // Override DomManager.renderAll
  const originalRenderAll = window.DomManager?.renderAll;
  if (window.DomManager) {
    window.DomManager.renderAll = function(...args) {
      renderCalls.domManagerRenderAll++;
      console.log(`%c📢 DomManager.renderAll called (${renderCalls.domManagerRenderAll})`, 
        'background:#f00;color:#fff;font-weight:bold;padding:3px;');
      
      if (renderCalls.domManagerRenderAll > 1) {
        console.trace('⚠️ DUPLICATE RENDER! Stack trace:');
      }
      
      return originalRenderAll.apply(this, args);
    };
  }

  // Monitor all custom events
  const events = [
    'DOMContentLoaded',
    'appReady',
    'partialLoaded',
    'partialsReady',
    'dataReady',
    'renderReady',
    'languageChanged',
    'themeChanged',
    'paletteChanged',
    'introRendered',
    'timelineRendered',
    'skillsRendered',
    'projectsRendered',
    'timelineIndexChanged',
    'fabLangToggle',
    'fabThemeToggle',
    'fabPaletteSelect'
  ];

  events.forEach(eventName => {
    eventLog[eventName] = 0;
    
    document.addEventListener(eventName, (e) => {
      eventLog[eventName]++;
      
      const isDuplicate = eventLog[eventName] > 1;
      const style = isDuplicate 
        ? 'background:#f00;color:#fff;font-weight:bold;' 
        : 'background:#0f0;color:#000;';
      
      console.log(
        `%c📡 ${eventName} (${eventLog[eventName]})`,
        style + 'padding:2px 5px;',
        e.detail || ''
      );
      
      if (isDuplicate) {
        console.trace(`⚠️ DUPLICATE EVENT: ${eventName}`);
      }
    });
  });

  // Monitor DOM changes in specific containers
  const observeContainer = (selector, name) => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          renderCalls[name]++;
          console.log(
            `%c🔄 ${name} DOM changed (${renderCalls[name]})`,
            renderCalls[name] > 1 
              ? 'background:#f90;color:#000;font-weight:bold;padding:2px;'
              : 'background:#0ff;color:#000;padding:2px;'
          );
          
          if (renderCalls[name] > 1) {
            console.trace(`⚠️ DUPLICATE RENDER: ${name}`);
          }
        }
      });
    });

    const waitForElement = () => {
      const element = document.querySelector(selector);
      if (element) {
        observer.observe(element, { childList: true, subtree: true });
        console.log(`👀 Watching: ${name}`);
      } else {
        setTimeout(waitForElement, 100);
      }
    };

    waitForElement();
  };

  // Watch critical containers
  setTimeout(() => {
    observeContainer('#section-intro .about-content', 'intro');
    observeContainer('.skills-grid', 'skills');
    observeContainer('.timeline-list', 'timeline');
    observeContainer('.projects-grid', 'projects');
  }, 500);

  // Summary report after 5 seconds
  setTimeout(() => {
    console.group('📊 Event Flow Summary');
    console.log('Events fired:', eventLog);
    console.log('Render calls:', renderCalls);
    
    const duplicates = Object.entries(eventLog).filter(([_, count]) => count > 1);
    if (duplicates.length > 0) {
      console.warn('⚠️ Duplicate events detected:', duplicates);
    }
    
    const duplicateRenders = Object.entries(renderCalls).filter(([_, count]) => count > 1);
    if (duplicateRenders.length > 0) {
      console.warn('⚠️ Duplicate renders detected:', duplicateRenders);
    }
    
    console.groupEnd();
  }, 5000);

  // Export debug data to window
  window.debugEventLog = eventLog;
  window.debugRenderCalls = renderCalls;
  
  console.log('%c✅ Debugger ready. Check window.debugEventLog and window.debugRenderCalls', 'color:#0f0;');
})();