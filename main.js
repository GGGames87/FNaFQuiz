function setLang(lang) {
  const footer = document.getElementById("footer-text");
  const linksBtn = document.querySelector('.buttons a[href="https://bio.link/gggames"]');

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

document.addEventListener("click", (e) => {
  const el = e.target.closest('.lang-switch a[data-lang]');
  if (!el) return;
  e.preventDefault();
  setLang(el.getAttribute("data-lang"));
});

initLang();
