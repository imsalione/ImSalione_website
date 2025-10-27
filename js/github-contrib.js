/* =======================================================
📊 GitHub Contributions Card (Final Version)
- Fixed loader visibility
- Inline header (GitHub Live + Icon)
- Full style parity with project cards (no flip)
======================================================= */
(function () {
  const USERNAME = "ImSalione";
  const PROFILE_URL = `https://github.com/${USERNAME}`;
  const API_URL = `https://github-contributions-api.deno.dev/${USERNAME}.json`;

  let chart = null;
  let isRendering = false;
  let themeObserverInit = false;

  // Utility: get CSS var
  const cssVar = (name, fallback = "") =>
    getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim() || fallback;

  // Utility: color palette
  function themeColors() {
    return {
      primary: cssVar("--primary", "#6366f1"),
      grid: cssVar("--border-color", "rgba(99,102,241,0.2)"),
      text: cssVar("--text-primary", "#e2e8f0"),
      textMuted: cssVar("--text-secondary", "#94a3b8"),
      cardBg: cssVar("--bg-card", "#ffffff"),
    };
  }

  // Gradient generator
  function gradient(ctx, color) {
    const g = ctx.createLinearGradient(0, 0, 0, 180);
    g.addColorStop(0, color + "33");
    g.addColorStop(1, color + "00");
    return g;
  }

  // Safe date parser
  const parseDate = (str) => {
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  };

  // Inject CSS override for no-flip behavior (stronger selector)
  function ensureNoFlipCSS() {
    if (document.getElementById("gh-no-flip-css")) return;
    const style = document.createElement("style");
    style.id = "gh-no-flip-css";
    style.textContent = `
      .project-card.github-activity-card.no-flip:hover .card-inner { transform: none !important; }
      .project-card.github-activity-card.no-flip .card-back { display: none !important; }
      .project-card.github-activity-card.no-flip .card-front { backface-visibility: visible !important; }
    `;
    document.head.appendChild(style);
  }

  // Build HTML structure
  function buildCardHTML() {
    return `
      <div class="project-card github-activity-card no-flip">
        <div class="card-inner">
          <div class="card-front">
            <div class="header">
              <div class="header-left">
                <span class="live-label">GITHUB LIVE</span>
                <span class="project-title">GitHub Activity</span>
              </div>
              <a class="github-icon" href="${PROFILE_URL}" target="_blank" rel="noopener">
                <i class="fab fa-github"></i>
              </a>
            </div>
            <div class="project-desc">Last 30 days of commits</div>
            <div class="chart-wrap">
              <div class="chart-loader"><span>Loading GitHub Data...</span></div>
              <canvas id="ghContribChart" height="160"></canvas>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Inject card into projects grid
  function injectCard() {
    const wrapper = document.querySelector(".projects-wrapper");
    if (!wrapper) return false;
    if (wrapper.querySelector(".github-activity-card")) return true;

    const temp = document.createElement("div");
    temp.innerHTML = buildCardHTML();
    const node = temp.firstElementChild;
    wrapper.prepend(node);
    ensureNoFlipCSS();

    document.dispatchEvent(
      new CustomEvent("githubCardReady", { detail: { el: node } })
    );
    return true;
  }

  // Render GitHub commits chart
  async function renderChart() {
    if (isRendering) return;
    const canvas = document.getElementById("ghContribChart");
    if (!canvas || typeof window.Chart === "undefined") return;
    isRendering = true;

    const loader = canvas.parentElement.querySelector(".chart-loader");
    if (loader) loader.classList.remove("hidden");

    try {
      const res = await fetch(API_URL, { cache: "no-store" });
      const data = await res.json();
      if (!data || !Array.isArray(data.contributions)) throw new Error("Bad data");

      // Prepare dataset
      const flat = data.contributions.flat();
      const points = flat
        .map((d) => ({ x: parseDate(d.date), y: d.contributionCount }))
        .filter((d) => d.x);
      const last = points.slice(-30);
      const labels = last.map((d, i) =>
        i % 7 === 0
          ? d.x.toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : ""
      );
      const commits = last.map((d) => d.y);

      if (chart) chart.destroy();
      const ctx = canvas.getContext("2d");
      const colors = themeColors();
      const maxVal = Math.max(3, ...commits);

      chart = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              data: commits,
              borderColor: colors.primary,
              backgroundColor: gradient(ctx, colors.primary),
              borderWidth: 2.5,
              fill: true,
              tension: 0.35,
              pointRadius: 2,
              pointHoverRadius: 5,
              pointHitRadius: 10,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "nearest", intersect: true },
          animations: {
            tension: {
              duration: 600,
              easing: "easeOutQuad",
              from: 0.7,
              to: 0.35,
            },
          },
          scales: {
            x: {
              ticks: {
                color: colors.textMuted,
                maxRotation: 0,
                autoSkip: true,
              },
              grid: { display: false },
            },
            y: {
              beginAtZero: true,
              suggestedMax: Math.ceil(maxVal * 1.3),
              grid: { color: colors.grid },
              ticks: { color: colors.text, precision: 0 },
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              displayColors: false,
              callbacks: {
                title: (items) => items?.[0]?.label || "",
                label: (item) => `${item.parsed.y} commits`,
              },
            },
          },
        },
      });

      // Hide loader and show chart
      setTimeout(() => {
        if (loader) loader.classList.add("hidden");
        canvas.classList.add("loaded");
      }, 400);
    } catch (err) {
      console.error("❌ Error rendering GitHub chart:", err);
      if (loader) loader.querySelector("span").textContent = "Failed to load data";
    } finally {
      isRendering = false;
    }
  }

  // Re-render on theme change
  function watchTheme() {
    if (themeObserverInit) return;
    const obs = new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.type === "attributes" && m.attributeName === "data-theme") {
          if (chart) chart.destroy();
          chart = null;
          renderChart();
        }
      }
    });
    obs.observe(document.documentElement, { attributes: true });
    themeObserverInit = true;
  }

  // Wait for dependencies
  async function waitFor(fn, { tries = 40, delay = 200 } = {}) {
    for (let i = 0; i < tries; i++) {
      if (fn()) return true;
      await new Promise((r) => setTimeout(r, delay));
    }
    return false;
  }

  // Init
  async function start() {
    const ok = await waitFor(
      () =>
        typeof window.Chart !== "undefined" &&
        document.querySelector(".projects-wrapper")
    );
    if (!ok) return;

    injectCard();
    watchTheme();
    renderChart();
  }

  document.addEventListener("DOMContentLoaded", start);
  document.addEventListener("projectsPartialReady", start);
})();
