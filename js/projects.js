/* =======================================================
💼 Projects Module – Final Stable Version
🧩 Handles hover, GitHub Card, and language sync
======================================================= */

let githubCardInjected = false;

/* -------------------------------
🎨 Hover Animation for Project Cards
------------------------------- */
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
}

/* -------------------------------
📊 Inject GitHub Activity Card
------------------------------- */
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
  } catch (err) {
    console.error("❌ Failed to inject GitHub Activity Card:", err);
  }
}

/* -------------------------------
🌐 Handle Language Change
------------------------------- */
document.addEventListener("languageChanged", () => {
  console.log("🌍 Language changed → reinject GitHub card after projects render.");
  githubCardInjected = false;
  const once = () => {
    injectGithubCard();
    document.removeEventListener("projectsRendered", once);
  };
  document.addEventListener("projectsRendered", once);
});

/* -------------------------------
🧩 Handle Partial Reload (Projects)
------------------------------- */
document.addEventListener("partialsLoaded", e => {
  if (e.detail && e.detail.id === "projects") {
    console.log("🧩 Projects partial loaded → Injecting GitHub card...");
    githubCardInjected = false;
    initProjectCards();
    injectGithubCard();
  }
});

/* -------------------------------
🚀 Initialize on First Load
------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 DOM ready → waiting for project partial...");
  initProjectCards();
});
