/* =======================================================
📊 GitHub Contributions Card (Dynamic Line Color)
Author: ImSalione
======================================================= */
(function () {
  const USERNAME = "ImSalione";
  const PROFILE_URL = `https://github.com/${USERNAME}`;
  const API_URL = `https://github-contributions-api.deno.dev/${USERNAME}.json`;

  let chart = null;
  let isRendering = false;
  let themeObserverInit = false;

  // Utility: read CSS variable
  const cssVar = (name, fallback = "") =>
    getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim() || fallback;

  // Get current theme colors
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

  const parseDate = (str) => {
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  };

  // 🟢 Update chart colors dynamically
  function updateChartColors() {
    if (!chart) return;
    const ctx = chart.ctx;
    const colors = themeColors();
    const dataset = chart.data.datasets[0];

    dataset.borderColor = colors.primary;
    dataset.backgroundColor = gradient(ctx, colors.primary);

    chart.options.scales.x.ticks.color = colors.textMuted;
    chart.options.scales.y.ticks.color = colors.text;
    chart.options.scales.y.grid.color = colors.grid;

    chart.update("none"); // no re-animation, instant update
  }

  // Main render function
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
      if (!data || !Array.isArray(data.contributions)) throw new Error("Invalid data");

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
            tension: { duration: 600, easing: "easeOutQuad", from: 0.7, to: 0.35 },
          },
          scales: {
            x: {
              ticks: { color: colors.textMuted, maxRotation: 0, autoSkip: true },
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

      // Fade-in chart
      setTimeout(() => {
        canvas.classList.add("loaded");
        if (loader) loader.classList.add("hidden");
      }, 400);

      // Tooltip setup for "GITHUB LIVE"
      const liveLabel = document.querySelector(".github-activity-card .live-label");
      if (liveLabel) {
        let customTooltip = document.querySelector(".gh-tooltip");
        if (!customTooltip) {
          customTooltip = document.createElement("div");
          customTooltip.className = "gh-tooltip";
          document.body.appendChild(customTooltip);
        }

        if (last && last.length > 0) {
          const latest = last[last.length - 1];
          const latestDate = latest.x.toISOString().split("T")[0];
          const latestCount = latest.y;
          const text = `Updated: ${latestDate} | ${latestCount} commit${latestCount !== 1 ? "s" : ""}`;

          console.log(`✅ GitHub Activity Updated: ${latestDate} (${latestCount} commits)`);

          customTooltip.textContent = text;
          liveLabel.addEventListener("mouseenter", () => {
            const rect = liveLabel.getBoundingClientRect();
            customTooltip.style.top = `${rect.top - 40 + window.scrollY}px`;
            customTooltip.style.left = `${rect.left + rect.width / 2 - customTooltip.offsetWidth / 2}px`;
            customTooltip.classList.add("visible");
          });
          liveLabel.addEventListener("mouseleave", () => customTooltip.classList.remove("visible"));
        } else {
          customTooltip.textContent = "No recent data yet";
        }
      }
    } catch (err) {
      console.error("❌ Error rendering GitHub chart:", err);
    } finally {
      isRendering = false;
    }
  }

  // 🟣 Watch theme and palette changes
  function watchTheme() {
    if (themeObserverInit) return;
    const obs = new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.type === "attributes" && m.attributeName === "data-theme") {
          updateChartColors();
        }
      }
    });
    obs.observe(document.documentElement, { attributes: true });

    // custom event from FAB palette switcher
    document.addEventListener("paletteChanged", () => {
      updateChartColors();
    });

    themeObserverInit = true;
  }

  // Wait for prerequisites
  async function waitFor(fn, { tries = 40, delay = 200 } = {}) {
    for (let i = 0; i < tries; i++) {
      if (fn()) return true;
      await new Promise((r) => setTimeout(r, delay));
    }
    return false;
  }

  async function start() {
    const ok = await waitFor(
      () =>
        typeof window.Chart !== "undefined" &&
        document.querySelector(".projects-wrapper")
    );
    if (!ok) return;

    watchTheme();
    renderChart();
  }

  document.addEventListener("DOMContentLoaded", start);
  document.addEventListener("projectsPartialReady", start);
})();
