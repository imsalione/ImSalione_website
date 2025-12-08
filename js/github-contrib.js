/**
 * =======================================================
 * 📊 GitHub Contributions Card — Glass UI Edition
 * File: js/github-contrib.js
 * Author: Saleh Abedinezhad (ImSalione)
 * =======================================================
 * Purpose: Fetch and display GitHub contribution data
 * Features:
 * - Real-time contribution chart
 * - Theme-aware color scheme
 * - Glassmorphism design
 * - Auto-updates on theme change
 * =======================================================
 */

(function initGithubContrib() {
  'use strict';

  /**
   * Configuration
   */
  const USERNAME = 'ImSalione';
  const API_URL = CONFIG.api.githubContributions(USERNAME);

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
    const gradient = ctx.createLinearGradient(0, 0, 0, 120);
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

    // Update dataset colors
    dataset.borderColor = colors.primary;
    dataset.backgroundColor = createGradient(ctx, colors.primary);

    // Update scales
    chart.options.scales.x.ticks.color = colors.textMuted;
    chart.options.scales.y.ticks.color = colors.text;
    chart.options.scales.y.grid.color = colors.grid;

    // Update tooltip
    chart.options.plugins.tooltip.backgroundColor = colors.tooltipBg;
    chart.options.plugins.tooltip.titleColor = colors.text;
    chart.options.plugins.tooltip.bodyColor = colors.text;

    // Refresh chart
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
   * Render GitHub contribution chart
   */
  async function renderChart() {
    const canvas = document.getElementById('ghContribChart');
    if (!canvas) {
      console.warn('⚠️ [GitHub] Canvas not found');
      return;
    }

    if (typeof Chart === 'undefined') {
      console.error('❌ [GitHub] Chart.js not loaded');
      return;
    }

    const loader = canvas.parentElement?.querySelector('.chart-loader');
    if (loader) loader.classList.remove('hidden');

    try {
      console.log('📊 [GitHub] Fetching contribution data...');

      const response = await fetch(API_URL, { cache: 'no-store' });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const json = await response.json();

      // Process data
      const flatContributions = json.contributions.flat();
      const points = flatContributions
        .map((d) => ({
          x: parseDate(d.date),
          y: d.contributionCount,
        }))
        .filter((d) => d.x);

      if (points.length === 0) {
        throw new Error('No valid data points');
      }

      // Get last 21 days
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

      // Destroy existing chart
      if (chart) {
        chart.destroy();
        chart = null;
      }

      // Get theme colors
      const colors = getThemeColors();
      const ctx = canvas.getContext('2d');

      // Create chart
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              data: commits,
              borderColor: colors.primary,
              backgroundColor: createGradient(ctx, colors.primary),
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointRadius: 0,
              pointHoverRadius: 4,
              pointHitRadius: 10,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'nearest',
            intersect: false,
          },
          layout: {
            padding: 5,
          },
          scales: {
            x: {
              ticks: {
                color: colors.textMuted,
                font: { size: 9 },
                maxRotation: 0,
                autoSkip: true,
              },
              grid: { display: false },
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
              padding: 8,
              cornerRadius: 8,
              callbacks: {
                title: () => '',
                label: (item) => `${item.parsed.y} commits`,
              },
            },
          },
        },
      });

      // Show chart with fade-in
      setTimeout(() => {
        canvas.classList.add('loaded');
        if (loader) loader.classList.add('hidden');
      }, 300);

      // Bind live tooltip
      bindLiveTooltip(recentPoints);

      console.log('✅ [GitHub] Chart rendered successfully');
    } catch (err) {
      console.error('❌ [GitHub] Chart error:', err);

      if (loader) {
        loader.innerHTML = `
          <p style="font-size: 0.7rem; opacity: 0.7; color: var(--text-secondary);">
            Data unavailable
          </p>
        `;
      }
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
      tooltip.textContent = `${latest.x.toLocaleDateString()}: ${
        latest.y
      } commits`;

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
   * Watch for theme changes
   */
  function watchThemeChanges() {
    if (watcherReady) return;
    watcherReady = true;

    console.log('👀 [GitHub] Watching theme changes...');

    // Listen to theme change events
    document.addEventListener(CONFIG.events.themeChanged, updateChartColors);
    document.addEventListener(CONFIG.events.paletteChanged, updateChartColors);

    // Watch data-theme attribute changes
    const observer = new MutationObserver((mutations) => {
      if (mutations.some((m) => m.attributeName === 'data-theme')) {
        updateChartColors();
      }
    });

    observer.observe(document.body, { attributes: true });
  }

  /**
   * Start rendering
   */
  async function start() {
    if (startTriggered) return;
    startTriggered = true;

    console.log('🚀 [GitHub] Starting...');

    // Wait for Chart.js and canvas
    let attempts = 20;
    while (
      (typeof Chart === 'undefined' ||
        !document.getElementById('ghContribChart')) &&
      attempts-- > 0
    ) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    if (attempts > 0) {
      watchThemeChanges();
      await renderChart();
    } else {
      console.error('❌ [GitHub] Timeout waiting for dependencies');
    }
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
   * Expose start function
   */
  window.injectGithubCard = start;

  console.log('✅ [GitHub] Module loaded');
})();