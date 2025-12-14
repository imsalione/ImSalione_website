/**
 * =======================================================
 * 📊 GitHub Contributions Card – Glass UI Edition
 * File: js/github-contrib.js
 * Author: Saleh Abedinezhad (ImSalione)
 * =======================================================
 * ✅ FIXED: Better dependency checking and error handling
 * =======================================================
 */

(function initGithubContrib() {
  'use strict';

  /**
   * Configuration
   */
  const USERNAME = 'ImSalione';
  const API_URL = CONFIG.api.githubContributions(USERNAME);
  const GITHUB_PROFILE_URL = `https://github.com/${USERNAME}`;

  /**
   * State
   */
  let chart = null;
  let startTriggered = false;
  let watcherReady = false;
  let tooltipBound = false;

  /**
   * Get CSS variable with fallback
   */
  function getCSSVar(name, fallback = '') {
    return (
      getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim() || fallback
    );
  }

  /**
   * Get theme colors for chart
   */
  function getThemeColors() {
    return {
      primary: getCSSVar('--primary', '#6366f1'),
      grid: getCSSVar('--border-color', 'rgba(255,255,255,0.1)'),
      text: getCSSVar('--text-primary', '#e2e8f0'),
      textMuted: getCSSVar('--text-secondary', '#94a3b8'),
      tooltipBg: getCSSVar('--bg-secondary', '#1e293b'),
    };
  }

  /**
   * Create gradient for chart
   */
  function createGradient(ctx, color) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 100);
    gradient.addColorStop(0, color + '55');
    gradient.addColorStop(1, color + '05');
    return gradient;
  }

  /**
   * Update chart colors (for theme changes)
   */
  function updateChartColors() {
    if (!chart) return;

    const colors = getThemeColors();
    const ctx = chart.ctx;
    const dataset = chart.data.datasets[0];

    dataset.borderColor = colors.primary;
    dataset.backgroundColor = createGradient(ctx, colors.primary);

    chart.options.scales.x.ticks.color = colors.textMuted;
    chart.options.scales.y.ticks.color = colors.text;
    chart.options.scales.y.grid.color = colors.grid;

    chart.options.plugins.tooltip.backgroundColor = colors.tooltipBg;
    chart.options.plugins.tooltip.titleColor = colors.text;
    chart.options.plugins.tooltip.bodyColor = colors.text;

    chart.update('none');
  }

  /**
   * Parse date string safely
   */
  function parseDate(dateString) {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  }

  /**
   * Process contributions data (handles multiple formats)
   */
  function processContributionsData(json) {
    console.log('📊 [GitHub] Processing data format...');
    
    let contributions = [];

    if (Array.isArray(json.contributions) && 
        json.contributions.length > 0 && 
        json.contributions[0].date) {
      contributions = json.contributions;
      console.log('✅ [GitHub] Format: Simple array');
    }
    else if (Array.isArray(json.contributions) && 
             Array.isArray(json.contributions[0])) {
      contributions = json.contributions.flat();
      console.log('✅ [GitHub] Format: Nested array');
    }
    else if (json.data?.user?.contributionsCollection) {
      const collection = json.data.user.contributionsCollection;
      contributions = collection.contributionCalendar?.weeks
        ?.flat()
        .map(day => ({
          date: day.date,
          contributionCount: day.contributionCount
        })) || [];
      console.log('✅ [GitHub] Format: GraphQL');
    }
    else if (Array.isArray(json) && json[0]?.date) {
      contributions = json;
      console.log('✅ [GitHub] Format: Direct array');
    }
    else {
      throw new Error('Unsupported data format');
    }

    return contributions;
  }

  /**
   * Render GitHub contribution chart
   */
  async function renderChart() {
    const canvas = document.getElementById('ghContribChart');
    if (!canvas) {
      console.error('❌ [GitHub] Canvas #ghContribChart not found');
      return;
    }

    if (typeof Chart === 'undefined') {
      console.error('❌ [GitHub] Chart.js not loaded - Add Chart.js to your HTML!');
      showError('Chart.js library not loaded');
      return;
    }

    const loader = canvas.parentElement?.querySelector('.chart-loader');
    if (loader) loader.classList.remove('hidden');

    try {
      console.log('📊 [GitHub] Fetching data from:', API_URL);

      const response = await fetch(API_URL, { 
        cache: 'no-store',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const json = await response.json();
      const contributions = processContributionsData(json);

      if (!contributions || contributions.length === 0) {
        throw new Error('No contributions data');
      }

      const points = contributions
        .map((d) => ({
          x: parseDate(d.date),
          y: d.contributionCount || 0,
        }))
        .filter((d) => d.x);

      if (points.length === 0) {
        throw new Error('No valid data points');
      }

      console.log(`✅ [GitHub] ${points.length} data points processed`);

      const recentPoints = points.slice(-21);
      const labels = recentPoints.map((d, i) =>
        i % 5 === 0
          ? d.x.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })
          : ''
      );
      const commits = recentPoints.map((d) => d.y);
      const maxValue = Math.max(3, ...commits);

      if (chart) {
        chart.destroy();
        chart = null;
      }

      const colors = getThemeColors();
      const ctx = canvas.getContext('2d');

      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            data: commits,
            borderColor: colors.primary,
            backgroundColor: createGradient(ctx, colors.primary),
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 3,
            pointHitRadius: 8,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'nearest',
            intersect: false,
          },
          layout: {
            padding: {
              top: 5,
              right: 5,
              bottom: 5,
              left: 5,
            },
          },
          scales: {
            x: {
              ticks: {
                color: colors.textMuted,
                font: { size: 8 },
                maxRotation: 0,
                autoSkip: true,
              },
              grid: { display: false },
              border: { display: false },
            },
            y: {
              beginAtZero: true,
              suggestedMax: Math.ceil(maxValue * 1.2),
              grid: {
                color: colors.grid,
                lineWidth: 0.5,
              },
              ticks: { display: false },
              border: { display: false },
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              displayColors: false,
              backgroundColor: colors.tooltipBg,
              titleColor: colors.text,
              bodyColor: colors.text,
              padding: 6,
              cornerRadius: 6,
              titleFont: { size: 10 },
              bodyFont: { size: 10 },
              callbacks: {
                title: () => '',
                label: (item) => `${item.parsed.y} commits`,
              },
            },
          },
        },
      });

      setTimeout(() => {
        canvas.classList.add('loaded');
        if (loader) loader.classList.add('hidden');
      }, 300);

      bindLiveTooltip(recentPoints);
      console.log('✅ [GitHub] Chart rendered');
    } catch (err) {
      console.error('❌ [GitHub] Error:', err);
      showError(err.message);
    }
  }

  /**
   * Show error message
   */
  function showError(message) {
    const loader = document.querySelector('.chart-loader');
    if (loader) {
      loader.innerHTML = `
        <p style="font-size: 0.65rem; opacity: 0.7; color: var(--text-secondary); text-align: center; padding: 1rem;">
          ⚠️ ${message}
        </p>
      `;
    }
  }

  /**
   * Bind tooltip to LIVE label
   */
  function bindLiveTooltip(recentPoints) {
    if (tooltipBound) return;
    tooltipBound = true;

    const liveLabel = document.querySelector('.live-label');
    if (!liveLabel) return;

    let tooltip = document.querySelector('.gh-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.className = 'gh-tooltip';
      document.body.appendChild(tooltip);
    }

    liveLabel.addEventListener('mouseenter', () => {
      if (!recentPoints.length) return;

      const latest = recentPoints[recentPoints.length - 1];
      tooltip.textContent = `${latest.x.toLocaleDateString()}: ${latest.y} commits`;

      const rect = liveLabel.getBoundingClientRect();
      tooltip.style.top = `${rect.top - 35 + window.scrollY}px`;
      tooltip.style.left = `${rect.left + rect.width / 2}px`;
      tooltip.classList.add('visible');
    });

    liveLabel.addEventListener('mouseleave', () => {
      tooltip.classList.remove('visible');
    });
  }

  /**
   * Setup card click
   */
  function setupCardClick() {
    const card = document.querySelector('.github-activity-card');
    if (!card) return;

    card.addEventListener('click', (e) => {
      if (e.target.closest('.github-icon') || e.target.closest('.live-label')) {
        return;
      }
      window.open(GITHUB_PROFILE_URL, '_blank', 'noopener,noreferrer');
    });

    console.log('✅ [GitHub] Card click setup');
  }

  /**
   * Watch theme changes
   */
  function watchThemeChanges() {
    if (watcherReady) return;
    watcherReady = true;

    console.log('👀 [GitHub] Watching theme changes');

    document.addEventListener(CONFIG.events.themeChanged, updateChartColors);
    document.addEventListener(CONFIG.events.paletteChanged, updateChartColors);

    const observer = new MutationObserver((mutations) => {
      if (mutations.some((m) => m.attributeName === 'data-theme')) {
        updateChartColors();
      }
    });

    observer.observe(document.body, { attributes: true });
  }

  /**
   * ✅ IMPROVED: Better dependency checking
   */
  async function start() {
    if (startTriggered) return;
    startTriggered = true;

    console.log('🚀 [GitHub] Starting...');

    // Check Chart.js immediately
    if (typeof Chart === 'undefined') {
      console.error('❌ [GitHub] Chart.js not found! Please add:');
      console.error('   <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>');
      showError('Chart.js not loaded');
      return;
    }

    console.log('✅ [GitHub] Chart.js detected');

    // Wait for canvas with better timeout
    let attempts = 30; // زمان بیشتر
    let canvas = null;

    while (attempts-- > 0) {
      canvas = document.getElementById('ghContribChart');
      if (canvas) {
        console.log('✅ [GitHub] Canvas found');
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    if (!canvas) {
      console.error('❌ [GitHub] Canvas #ghContribChart not found after 6 seconds');
      showError('Canvas element not found');
      return;
    }

    watchThemeChanges();
    await renderChart();
    setupCardClick();
  }

  /**
   * Event listeners
   */
  document.addEventListener(CONFIG.events.renderReady, start);
  document.addEventListener(CONFIG.events.projectsRendered, () => {
    if (!startTriggered) {
      setTimeout(start, 500);
    }
  });

  /**
   * Expose globally
   */
  window.injectGithubCard = start;

  console.log('✅ [GitHub] Module loaded');
})();