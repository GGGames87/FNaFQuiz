function setLang(lang) {
  const footer = document.getElementById("footer-text");
  const linksBtn = document.getElementById("links-btn");

  if (lang === "en") {
    footer.textContent = "Official website of GG Games";
    if (linksBtn) linksBtn.textContent = "Links & Socials";
  } else {
    footer.textContent = "Web oficial de GG Games";
    if (linksBtn) linksBtn.textContent = "Enlaces y Redes";
  }
  localStorage.setItem("site_lang", lang);
}

function initLang() {
  const saved = localStorage.getItem("site_lang");
  if (saved) {
    setLang(saved);
    return;
  }
  const userLang = navigator.language || navigator.userLanguage || "es";
  setLang(userLang.startsWith("en") ? "en" : "es");
}

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("lang-en")?.addEventListener("click", () => setLang("en"));
  document.getElementById("lang-es")?.addEventListener("click", () => setLang("es"));
  initLang();
});
