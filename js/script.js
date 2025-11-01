/* =======================================================
💫 ImSalione Portfolio - Main Script (2025, Synchronized + GitHub Safe)
======================================================= */

/**
 * ✅ Updates:
 * - Prevents GitHub card removal when rendering projects
 * - Executes initPortfolio only once after partialsAllLoaded
 * - Keeps all theme, language, and palette systems functional
 * - Full compatibility with projects.js & github-contrib.js
 * - Swapped project cards: image on front, text on back
 */

let currentLang = localStorage.getItem("lang") || "en";
let currentTheme = localStorage.getItem("theme") || "dark";
let currentThemeStyle = localStorage.getItem("themeStyle") || "modern";

/* =======================================================
⚙️ INIT PORTFOLIO
======================================================= */
async function initPortfolio() {
  console.log("✅ Portfolio initialization started...");

  // Direction & Theme Setup
  document.documentElement.setAttribute("dir", currentLang === "fa" ? "rtl" : "ltr");
  document.body.setAttribute("data-theme", currentTheme);
  document.documentElement.setAttribute("data-theme-style", currentThemeStyle);

  updateTheme(currentTheme);
  await updateLanguage(currentLang);
  createPaletteMenu();

  console.log("🚀 Portfolio initialized successfully!");
}

/* =======================================================
🌗 THEME CONTROL
======================================================= */
function updateTheme(theme) {
  document.body.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  currentTheme = theme;
}

/* =======================================================
🌐 LANGUAGE CONTROL
======================================================= */
async function updateLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang);
  document.documentElement.setAttribute("dir", lang === "fa" ? "rtl" : "ltr");

  // Cross-fade visual reset
  const wrapper = document.querySelector(".page-wrapper");
  if (wrapper) {
    wrapper.style.display = "none";
    void wrapper.offsetHeight;
    wrapper.style.display = "grid";
  }

  updateTheme(currentTheme);
  updatePaletteMenuLabels();
  await loadContent(lang);
}

/* =======================================================
🌈 CROSS-FADE PALETTE TRANSITION
======================================================= */
function animateThemeTransition(newStyle) {
  const oldOverlay = document.querySelector(".theme-transition-overlay");
  if (oldOverlay) oldOverlay.remove();

  const overlay = document.createElement("div");
  overlay.className = "theme-transition-overlay";
  overlay.style.background = getComputedStyle(document.documentElement).getPropertyValue("--gradient");
  document.body.appendChild(overlay);
  void overlay.offsetWidth;
  overlay.classList.add("active");

  setTimeout(() => {
    document.documentElement.setAttribute("data-theme-style", newStyle);
    localStorage.setItem("themeStyle", newStyle);
    currentThemeStyle = newStyle;

    setTimeout(() => {
      overlay.style.background = getComputedStyle(document.documentElement).getPropertyValue("--gradient");
      overlay.classList.remove("active");
      setTimeout(() => overlay.remove(), 800);
    }, 200);
  }, 150);
}

/* =======================================================
🎨 THEME STYLE SWITCHER
======================================================= */
function changeThemeStyle(style) {
  const styles = ["modern", "warm", "cool", "teal", "rose", "default"];
  if (!styles.includes(style)) style = "modern";

  animateThemeTransition(style);
  document.querySelectorAll(".palette-option").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.style === style);
  });
  document.dispatchEvent(new CustomEvent("fabPaletteSelect", { detail: { color: style } }));
}

/* =======================================================
🎨 CREATE PALETTE MENU
======================================================= */
function createPaletteMenu() {
  if (document.querySelector(".palette-panel")) return;

  const panel = document.createElement("div");
  panel.className = "palette-panel";
  panel.innerHTML = `
    <div class="palette-header">
      <i class="fas fa-palette"></i>
      <span>${currentLang === "fa" ? "پالت رنگی" : "Theme Style"}</span>
    </div>
    <div class="palette-options">
      <button class="palette-option" data-style="modern">Modern</button>
      <button class="palette-option" data-style="warm">Warm</button>
      <button class="palette-option" data-style="cool">Cool</button>
      <button class="palette-option" data-style="teal">Teal</button>
      <button class="palette-option" data-style="rose">Rose</button>
    </div>
  `;
  document.body.appendChild(panel);

  panel.querySelectorAll(".palette-option").forEach(btn => {
    btn.addEventListener("click", () => {
      changeThemeStyle(btn.dataset.style);
      panel.classList.remove("active");
    });
    if (btn.dataset.style === currentThemeStyle) btn.classList.add("active");
  });
}

function updatePaletteMenuLabels() {
  const header = document.querySelector(".palette-header span");
  if (header)
    header.textContent = currentLang === "fa" ? "پالت رنگی" : "Theme Style";
}

/* =======================================================
📦 LOAD CONTENT (No Cache)
======================================================= */
async function loadContent(lang) {
  try {
    const response = await fetch(`content/${lang}.json?v=${Date.now()}`);
    const data = await response.json();
    renderContent(data);
    console.log(`✅ Loaded latest content for language: ${lang}`);
  } catch (err) {
    console.error("❌ Error loading content:", err);
  }
}

/* =======================================================
🧩 RENDER CONTENT
======================================================= */
function renderContent(data) {
  // About section
  const title = document.querySelector("#home-about h1");
  const subtitle = document.querySelector("#home-about .subtitle");
  const desc = document.querySelector("#home-about .description");
  const aboutTitle = document.querySelector("#home-about .section-title");
  const bioBox = document.querySelector("#home-about .bio-box");

  if (title) title.textContent = data.home?.title || "";
  if (subtitle) subtitle.textContent = data.home?.subtitle || "";
  if (desc) desc.textContent = data.home?.description || "";
  if (aboutTitle) aboutTitle.textContent = data.about?.title || "";

  if (bioBox) {
    bioBox.innerHTML = "";
    (data.about?.paragraphs || []).forEach(p => {
      const el = document.createElement("p");
      el.textContent = p;
      bioBox.appendChild(el);
    });
  }

  // Modules
  renderSkills(data.skills || []);
  renderTimeline(data.timeline || []);
  renderProjects(data.projects || []);
}

/* =======================================================
🧠 MODULE RENDERERS
======================================================= */
function renderSkills(skills) {
  const skillsGrid = document.querySelector(".skills-grid");
  const skillDesc = document.getElementById("skillDescription");
  if (!skillsGrid) return;

  skillsGrid.innerHTML = "";
  skills.forEach(skill => {
    const tag = document.createElement("div");
    tag.classList.add("skill-tag");
    tag.textContent = skill.name;
    tag.setAttribute("data-desc", skill.desc);
    skillsGrid.appendChild(tag);
  });

  bindSkillEvents(skillsGrid, skillDesc);
}

function renderTimeline(items) {
  const timeline = document.querySelector(".timeline");
  if (!timeline) return;
  timeline.innerHTML = "";
  items.forEach(item => {
    const entry = document.createElement("div");
    entry.classList.add("timeline-item");
    entry.innerHTML = `
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <div class="timeline-date">${item.date || ""}</div>
        <div class="timeline-title">${item.title || ""}</div>
        <div class="timeline-subtitle">${item.subtitle || ""}</div>
      </div>`;
    timeline.appendChild(entry);
  });
}

/* =======================================================
💼 RENDER PROJECTS (Swapped Image/Text + GitHub Icon)
======================================================= */
function renderProjects(projects) {
  const container = document.querySelector(".projects-wrapper");
  if (!container) return;

  // ✅ Remove only non-GitHub cards
  [...container.querySelectorAll(".project-card")].forEach(card => {
    if (!card.classList.contains("github-activity-card")) card.remove();
  });

  // 🧩 Add project cards (swapped)
  projects.forEach(p => {
    const card = document.createElement("div");
    card.classList.add("project-card", "swapped");

    card.innerHTML = `
      <div class="card-inner">
        <!-- 🖼️ FRONT SIDE (Image) -->
        <div class="card-back" style="background-image: url('${p.image || ""}')">
        </div>

        <!-- 📝 BACK SIDE (Text + GitHub Icon) -->
        <div class="card-front">
          <div class="title-row">
            <h3>${p.title || ""}</h3>
            ${
              p.link
                ? `<a href="${p.link}" target="_blank" rel="noopener" class="github-icon" title="View on GitHub">
                     <i class="fab fa-github"></i>
                   </a>`
                : ""
            }
          </div>
          <p>${p.desc || ""}</p>
        </div>
      </div>
    `;

    container.appendChild(card);
  });

  // 📢 Notify other scripts
  document.dispatchEvent(new Event("projectsRendered"));
}

/* =======================================================
💬 SKILL INTERACTIONS
======================================================= */
function bindSkillEvents(skillsGrid, descBox) {
  const tags = skillsGrid.querySelectorAll(".skill-tag");
  if (!tags.length) return;

  tags.forEach(tag => {
    tag.addEventListener("click", () => {
      tags.forEach(t => t.classList.remove("active"));
      tag.classList.add("active");
      if (descBox) {
        descBox.style.opacity = "0";
        setTimeout(() => {
          descBox.textContent = tag.getAttribute("data-desc") || "";
          descBox.style.opacity = "1";
        }, 150);
      }
    });
  });

  const first = tags[0];
  if (first && descBox) {
    first.classList.add("active");
    descBox.textContent = first.getAttribute("data-desc") || "";
  }
}

/* =======================================================
🚀 KICKOFF
======================================================= */
document.addEventListener("partialsAllLoaded", async () => {
  try {
    await initPortfolio();
  } catch (err) {
    console.error("❌ Portfolio initialization error:", err);
  }
});

/* =======================================================
🌐 Section Titles Localization
======================================================= */
async function applySectionTitle(id, jsonKey) {
  const el = document.getElementById(id);
  if (!el) return;

  const textEl = el.querySelector(".section-title-text");
  const html = document.documentElement;
  const lang = (html.getAttribute("lang") || "en").toLowerCase();
  const jsonPath = lang.startsWith("fa") ? "content/fa.json" : "content/en.json";

  try {
    const res = await fetch(jsonPath, { cache: "no-store" });
    const data = await res.json();
    const localized = data[jsonKey] || jsonKey;
    if (textEl) textEl.textContent = localized;
  } catch (err) {
    console.error(`⚠️ Failed to load localized title for ${jsonKey}:`, err);
  }
}

/* =======================================================
🧩 Auto Apply Section Titles after partial load
======================================================= */
document.addEventListener("partialsLoaded", e => {
  const id = e.detail?.id;
  if (!id) return;

  switch (id) {
    case "home-about":
      applySectionTitle("about-title", "about_title");
      break;
    case "skills-timeline":
      applySectionTitle("skills-title", "skills_title");
      break;
    case "projects":
      applySectionTitle("projects-title", "projects_title");
      break;
  }
});

// 🔄 Reapply when language changes
document.addEventListener("languageChanged", () => {
  applySectionTitle("about-title", "about_title");
  applySectionTitle("skills-title", "skills_title");
  applySectionTitle("projects-title", "projects_title");
});
