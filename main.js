
function getLangFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const q = (params.get("lang") || "").toLowerCase();
  return q === "en" || q === "es" ? q : null;
}

function browserLang() {
  const l = (navigator.language || navigator.userLanguage || "es").toLowerCase();
  return l.startsWith("en") ? "en" : "es";
}

function applyLang(lang) {
  const footer = document.getElementById("footer-text");
  const linksBtn = document.getElementById("links-btn");

  if (lang === "en") {
    footer && (footer.textContent = "Official website of GG Games");
    linksBtn && (linksBtn.textContent = "Links & Socials");
  } else {
    footer && (footer.textContent = "Web oficial de GG Games");
    linksBtn && (linksBtn.textContent = "Enlaces y Redes");
  }
  document.documentElement.setAttribute("lang", lang);
}

function setLang(lang, persist) {
  applyLang(lang);
  try {
    if (persist) localStorage.setItem("site_lang", lang);
  } catch {}
}

function initLang() {
  const q = getLangFromQuery();
  if (q) return setLang(q, true);

  let saved = null;
  try { saved = localStorage.getItem("site_lang"); } catch {}
  if (saved === "en" || saved === "es") return setLang(saved, false);

  setLang(browserLang(), false);
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("lang-en")?.addEventListener("click", () => setLang("en", true));
  document.getElementById("lang-es")?.addEventListener("click", () => setLang("es", true));
  initLang();
});
