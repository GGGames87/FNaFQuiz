
function getLangFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const q = (params.get("lang") || "").toLowerCase();
  return q === "en" || q === "es" ? q : null;
}

function applyLang(lang) {
  const footer = document.getElementById("footer-text");
  const linksBtn = document.getElementById("links-btn");


  if (lang === "en") {
    footer.textContent = "Official website of GG Games";
    if (linksBtn) linksBtn.textContent = "Links & Socials";
  } else {
    footer.textContent = "Web oficial de GG Games";
    if (linksBtn) linksBtn.textContent = "Enlaces y Redes";
  }


  document.documentElement.setAttribute("lang", lang);
}

function setLang(lang, persist = true) {
  applyLang(lang);
  if (persist) localStorage.setItem("site_lang", lang);
}

function detectBrowserLang() {
  const userLang = navigator.language || navigator.userLanguage || "es";
  return userLang.toLowerCase().startsWith("en") ? "en" : "es";
}

function initLang() {
  
  const queryLang = getLangFromQuery();
  if (queryLang) {
    setLang(queryLang, true);
    return;
  }

  
  const saved = localStorage.getItem("site_lang");
  if (saved === "en" || saved === "es") {
    setLang(saved, false);
    return;
  }


  const auto = detectBrowserLang();
  setLang(auto, true);
}


window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("lang-en")?.addEventListener("click", () => setLang("en", true));
  document.getElementById("lang-es")?.addEventListener("click", () => setLang("es", true));
  initLang();
});
