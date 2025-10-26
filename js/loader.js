/* =======================================================
🧭 Loader for modular partials (home, skills, projects)
Enhanced version – emits individual & global events
======================================================= */
async function loadPartials() {
  const sections = [
    { id: "home-about", file: "partials/home.html" },
    { id: "skills-timeline", file: "partials/skills.html" },
    { id: "projects", file: "partials/projects.html" }
  ];

  for (const sec of sections) {
    try {
      // 🚫 جلوگیری از کش
      const response = await fetch(sec.file, { cache: "no-store" });
      const html = await response.text();

      const target = document.getElementById(sec.id);
      if (target) {
        target.innerHTML = html;
        console.log(`✅ Loaded partial: ${sec.file}`);

        // 📣 ارسال event اختصاصی برای هر partial
        document.dispatchEvent(
          new CustomEvent("partialsLoaded", { detail: { id: sec.id } })
        );
      } else {
        console.warn(`⚠️ No container found for ID: ${sec.id}`);
      }
    } catch (err) {
      console.error(`❌ Failed to load ${sec.file}:`, err);
    }
  }

  // ✅ بعد از لود کامل همه partialها
  document.dispatchEvent(new Event("partialsAllLoaded"));
  console.log("🚀 All partials loaded and events dispatched.");
}

// اجرای لودر
document.addEventListener("DOMContentLoaded", loadPartials);
