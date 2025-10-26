/* =======================================================
⚙️ FAB Menu - Unified Palette System (Final)
======================================================= */
/**
 * Unified palette manager for ImSalione Portfolio.
 * - Controls theme style via <html data-theme-style="...">
 * - Saves themeStyle in localStorage
 * - Works seamlessly with createPaletteMenu() from script.js
 * - Emits: fabThemeToggle, fabLangToggle, fabPaletteSelect
 */
function initFabMenu() {
  const STORAGE_KEY = 'themeStyle'; // unified with script.js

  const fabMenu = document.getElementById("fabMenu");
  const fabMain = document.getElementById("fabMain");
  const submenu = document.getElementById("fabSubmenu");
  const paletteBtn = document.getElementById("paletteToggle");
  const paletteMenu = document.getElementById("fabPalette");

  if (!fabMenu || !fabMain || !submenu) return;
  console.log("✅ FAB (Unified Palette System) initialized.");

  // ---------- Helpers ----------
  /** Apply theme style to <html> and persist it. */
  const applyThemeStyle = (styleName, persist = true) => {
    if (!styleName) return;
    document.documentElement.setAttribute("data-theme-style", styleName);
    if (persist) {
      try { localStorage.setItem(STORAGE_KEY, styleName); } catch {}
    }
    highlightActiveSwatch(styleName);
    document.dispatchEvent(new CustomEvent("fabPaletteSelect", { detail: { color: styleName } }));
  };

  /** Highlight active color swatch. */
  const highlightActiveSwatch = (styleName) => {
    if (!paletteMenu) return;
    paletteMenu.querySelectorAll(".color-swatch").forEach(el => {
      if (el.getAttribute("data-color") === styleName) {
        el.style.outline = "2px solid var(--primary)";
        el.style.outlineOffset = "2px";
      } else {
        el.style.outline = "none";
        el.style.outlineOffset = "0";
      }
    });
  };

  // ---------- Load last saved palette ----------
  const saved = localStorage.getItem(STORAGE_KEY);
  const initial = saved || document.documentElement.getAttribute("data-theme-style") || "default";
  applyThemeStyle(initial, !saved);

  // ---------- Toggle main FAB ----------
  let isOpen = false;
  fabMain.addEventListener("click", e => {
    e.preventDefault();
    e.stopPropagation();
    isOpen = !isOpen;
    fabMenu.classList.toggle("open", isOpen);
    if (!isOpen) paletteMenu?.classList.remove("open");
  });

  // ---------- Close when clicking outside ----------
  document.addEventListener("click", e => {
    if (!fabMenu.contains(e.target)) {
      fabMenu.classList.remove("open");
      paletteMenu?.classList.remove("open");
      isOpen = false;
    }
  });

  // ---------- Toggle palette submenu ----------
  paletteBtn?.addEventListener("click", e => {
    e.stopPropagation();
    paletteMenu.classList.toggle("open");
  });

  // ---------- Palette selection ----------
  paletteMenu?.querySelectorAll(".color-swatch").forEach(swatch => {
    swatch.addEventListener("click", () => {
      const styleName = swatch.getAttribute("data-color")?.trim().toLowerCase();
      applyThemeStyle(styleName, true);
      paletteMenu.classList.remove("open");
    });
  });

  // ---------- Theme & Language toggle ----------
  document.getElementById("themeToggle")?.addEventListener("click", () =>
    document.dispatchEvent(new CustomEvent("fabThemeToggle"))
  );
  document.getElementById("langToggle")?.addEventListener("click", () =>
    document.dispatchEvent(new CustomEvent("fabLangToggle"))
  );
}

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
  try { initFabMenu(); } catch (err) { console.error("❌ FAB init error:", err); }
});
