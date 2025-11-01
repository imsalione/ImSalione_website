/* =======================================================
💼 Projects Module – Final Synced Version (2025)
🧩 Handles hover, GitHub Card reload, and language sync
✨ Updated for swapped project cards (image on front)
======================================================= */

let githubCardInjected = false;

/* =======================================================
🎨 Hover Animation for Project Cards
======================================================= */
function initProjectCards() {
  document.querySelectorAll(".project-card").forEach(card => {
    card.onmouseenter = null;
    card.onmouseleave = null;

    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-3px)";
      card.style.transition = "all 0.3s ease";
      card.style.boxShadow = "0 8px 25px var(--shadow)";
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "translateY(0)";
      card.style.boxShadow = "0 4px 12px var(--shadow)";
    });
  });

  syncFrontGhostImages();
}

/* =======================================================
👻 Copy back image → front ghost layer (legacy support)
======================================================= */
function syncFrontGhostImages() {
  const cards = document.querySelectorAll(".project-card");
  cards.forEach(card => {
    const front = card.querySelector(".card-front");
    const back = card.querySelector(".card-back");
    if (!front || !back) return;

    const inlineBg = back.style.backgroundImage;
    let bg = inlineBg && inlineBg !== "none" ? inlineBg : getComputedStyle(back).backgroundImage;

    if (bg && bg !== "none") {
      front.style.setProperty("--front-bg", bg);
      front.style.setProperty("--ghost-opacity", "0.08");
    }
  });
}

/* =======================================================
📊 Inject GitHub Activity Card
======================================================= */
async function injectGithubCard() {
  try {
    if (githubCardInjected) return;

    const wrapper = document.querySelector(".projects-wrapper");
    if (!wrapper) {
      console.warn("⚠️ Projects wrapper not found. Injection skipped.");
      return;
    }

    const res = await fetch("partials/github-contrib.html", { cache: "no-store" });
    const html = await res.text();
    wrapper.insertAdjacentHTML("afterbegin", html);
    githubCardInjected = true;

    initProjectCards();

    const canvas = document.getElementById("ghContribChart");
    if (canvas) {
      document.dispatchEvent(new CustomEvent("githubCardReady", { detail: { mounted: true } }));
      console.log("✅ GitHub Activity Card injected and ready.");
    }

    const oldScript = document.querySelector("script[data-gh-script]");
    if (oldScript) oldScript.remove();

    const ghScript = document.createElement("script");
    ghScript.src = "js/github-contrib.js?v=" + Date.now();
    ghScript.defer = true;
    ghScript.dataset.ghScript = "true";
    document.body.appendChild(ghScript);
  } catch (err) {
    console.error("❌ Failed to inject GitHub Activity Card:", err);
  }
}

/* =======================================================
🌐 Handle Language Change
======================================================= */
document.addEventListener("languageChanged", () => {
  console.log("🌍 Language changed → reinject GitHub card after projects render.");
  githubCardInjected = false;
  const once = () => {
    injectGithubCard();
    syncFrontGhostImages();
    document.removeEventListener("projectsRendered", once);
  };
  document.addEventListener("projectsRendered", once);
});

/* =======================================================
🧩 Handle Partial Reload (Projects)
======================================================= */
document.addEventListener("partialsLoaded", e => {
  if (e.detail && e.detail.id === "projects") {
    console.log("🧩 Projects partial loaded → Injecting GitHub card...");
    githubCardInjected = false;
    initProjectCards();
    injectGithubCard();
    syncFrontGhostImages();
  }
});

/* =======================================================
💫 Flip Direction for Swapped Cards
======================================================= */
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 DOM ready → waiting for project partial...");

  initProjectCards();

  // 🌀 Adjust flip direction for swapped cards
  const cards = document.querySelectorAll(".project-card.swapped .card-inner");
  cards.forEach(inner => {
    inner.addEventListener("mouseenter", () => {
      inner.style.transform = "rotateY(-180deg) rotateX(2deg) scale(1.02)";
    });
    inner.addEventListener("mouseleave", () => {
      inner.style.transform = "rotateY(0deg) rotateX(0) scale(1)";
    });
  });

  syncFrontGhostImages();
});

/* =======================================================
🌐 Localized Projects Title Loader
✨ Reads from en.json / fa.json and updates dynamically
======================================================= */
async function applyProjectsTitleLocale() {
  const titleEl = document.getElementById("projects-title");
  if (!titleEl) return;

  const textEl = titleEl.querySelector(".section-title-text");
  const html = document.documentElement;
  const lang = (html.getAttribute("lang") || "en").toLowerCase();
  const jsonPath = lang.startsWith("fa") ? "content/fa.json" : "content/en.json"; // ✅ مسیر اصلاح شد

  try {
    const res = await fetch(jsonPath, { cache: "no-store" });
    const data = await res.json();
    const localized = data.projects_title || (lang.startsWith("fa") ? "پروژه‌های من" : "My Projects");
    if (textEl) textEl.textContent = localized;
  } catch (err) {
    console.error("⚠️ Failed to load localized title:", err);
  }
}


// Initial load
document.addEventListener("DOMContentLoaded", applyProjectsTitleLocale);

// Update when language changes
document.addEventListener("languageChanged", applyProjectsTitleLocale);

// Update when project partial reloads
document.addEventListener("partialsLoaded", e => {
  if (e.detail && e.detail.id === "projects") {
    applyProjectsTitleLocale();
  }
});
