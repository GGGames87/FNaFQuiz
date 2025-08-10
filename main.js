function setLang(lang) {
  const footer = document.getElementById("footer-text");
  const linksBtn = document.querySelector('.button-container a[href="https://bio.link/gggames"]');

  if (lang === "en") {
    footer.textContent = "Official website of GG Games";
    linksBtn.textContent = "Links & Socials";
  } else {
    footer.textContent = "Web oficial de GG Games";
    linksBtn.textContent = "Enlaces y Redes";
  }
  localStorage.setItem("site_lang", lang);
}

function initLang() {
  const saved = localStorage.getItem("site_lang");
  if (saved) return setLang(saved);

  const userLang = navigator.language || navigator.userLanguage || "es";
  setLang(userLang.startsWith("en") ? "en" : "es");
}

document.getElementById("lang-en")?.addEventListener("click", () => setLang("en"));
document.getElementById("lang-es")?.addEventListener("click", () => setLang("es"));

initLang();
