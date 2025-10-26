/* =======================================================
📊 GitHub Contributions Chart – Final Loader Version
======================================================= */
(function () {
  const API_URL = "/api/github_contrib.php?user=ImSalione";

  let chart = null;
  let isRendering = false;
  let themeObserverInit = false;

  // --- CSS Vars
  function cssVar(name, fallback = "") {
    return (
      getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim() || fallback
    );
  }

  function themeColors() {
    return {
      primary: cssVar("--primary", "#6366f1"),
      grid: cssVar("--border-color", "rgba(99,102,241,0.2)"),
      text: cssVar("--text-secondary", "#94a3b8"),
    };
  }

  function gradient(ctx, colorHex) {
    const g = ctx.createLinearGradient(0, 0, 0, 180);
    g.addColorStop(0, colorHex + "55");
    g.addColorStop(1, colorHex + "00");
    return g;
  }

  /* -------------------------------
  📈 Render Chart (with loader)
  ------------------------------- */
  async function renderChart() {
    if (isRendering) return;
    const canvas = document.getElementById("ghContribChart");
    if (!canvas || typeof window.Chart === "undefined") return;

    isRendering = true;

    const loader = document.querySelector(".chart-loader");
    if (loader) loader.classList.remove("hidden"); // 👈 نمایش لودینگ

    try {
      canvas.classList.add("fade-out");

      const res = await fetch(API_URL, { cache: "no-store" });
      const payload = await res.json();

      // فقط 30 روز اخیر
      const today = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(today.getDate() - 30);
      const recent = payload.days.filter(d => new Date(d.date) >= oneMonthAgo);
      const days = recent.length ? recent : payload.days.slice(-30);

      const labels = days.map(d => d.date);
      const commits = days.map(d => d.commits);

      // لیبل‌های هفتگی محور X
      const tickLabels = labels.map((date, i) => {
        if (i % 7 === 0) {
          const d = new Date(date);
          return d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
        }
        return "";
      });

      if (chart) chart.destroy();
      const ctx = canvas.getContext("2d");
      const colors = themeColors();

      const maxVal = Math.max(...commits);
      const suggestedMax = maxVal === 0 ? 5 : Math.ceil(maxVal * 1.2);

      chart = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              data: commits,
              borderColor: colors.primary,
              backgroundColor: gradient(ctx, colors.primary),
              fill: true,
              tension: 0.35,
              borderWidth: 2,
              pointRadius: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 1000, easing: "easeOutQuart" },
          scales: {
            x: {
              display: true,
              ticks: {
                color: colors.text,
                autoSkip: false,
                maxRotation: 0,
                callback: (v, i) => tickLabels[i],
              },
              grid: { display: false },
            },
            y: {
              beginAtZero: true,
              suggestedMax,
              grid: { color: colors.grid },
              ticks: {
                color: colors.text,
                precision: 0,
                stepSize: Math.ceil(suggestedMax / 4),
              },
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              displayColors: false,
              callbacks: {
                title: (items) => items?.[0]?.label || "",
                label: (item) => `${item.parsed.y}`,
              },
            },
          },
        },
      });

      setTimeout(() => canvas.classList.remove("fade-out"), 200);
    } catch (err) {
      console.error("❌ GitHub chart render error:", err);
    } finally {
      // 👇 پنهان کردن لودینگ بعد از رندر
      if (loader) setTimeout(() => loader.classList.add("hidden"), 600);
      isRendering = false;
    }
  }

  /* -------------------------------
  🕓 Wait Until Canvas & Chart.js Ready
  ------------------------------- */
  async function waitFor(conditionFn, { tries = 30, delay = 200 } = {}) {
    for (let i = 0; i < tries; i++) {
      if (conditionFn()) return true;
      await new Promise((r) => setTimeout(r, delay));
    }
    return false;
  }

  const isChartLibReady = () => typeof window.Chart !== "undefined";
  const isCanvasReady = () => !!document.getElementById("ghContribChart");

  async function ensureReadyAndRender() {
    const ok = await waitFor(() => isChartLibReady() && isCanvasReady());
    if (!ok) {
      console.warn("⚠️ GitHub chart prerequisites not ready yet.");
      return;
    }
    renderChart();
  }

  /* -------------------------------
  🌗 Theme Change Observer
  ------------------------------- */
  function initThemeObserverOnce() {
    if (themeObserverInit) return;
    themeObserverInit = true;
    const obs = new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.type === "attributes" && m.attributeName === "data-theme") {
          if (isCanvasReady()) renderChart();
        }
      }
    });
    obs.observe(document.documentElement, { attributes: true });
  }

  /* -------------------------------
  🚀 Event Hooks
  ------------------------------- */
  document.addEventListener("githubCardReady", () => {
    initThemeObserverOnce();
    ensureReadyAndRender();
  });

  document.addEventListener("partialsLoaded", (e) => {
    if (e.detail && e.detail.id === "projects") {
      initThemeObserverOnce();
      ensureReadyAndRender();
    }
  });

  document.addEventListener("languageChanged", () => {
    ensureReadyAndRender();
  });

  document.addEventListener("DOMContentLoaded", () => {
    initThemeObserverOnce();
    ensureReadyAndRender();
  });

  window.renderChart = renderChart;
})();
