/* =======================================================
💡 Skills Module - interactions and animations
======================================================= */
function highlightSkill(skillName) {
  const tags = document.querySelectorAll(".skill-tag");
  tags.forEach(tag => {
    tag.classList.toggle("active", tag.textContent === skillName);
  });
}
