const MAX_SELECTIONS = 10;


const SUBMIT_URL = "https://hsseihsjrihlcxdcgfyr.supabase.co/functions/v1/submit-vote";

const audioFiles = [
  "01 hola a todos.mp3",
  "02 lemine.mp3",
  "03 que rabia.mp3",
  "04 ey eres tu gg games.mp3",
  "05 en realidad queremos.mp3",
  "06 Toma Un Pescado.mp3",
  "07 todo lo que ocurre.mp3",
  "08 chiiiiicos.mp3",
  "09 risa.mp3",
  "10 kazoo.mp3",
  "11 siete.mp3",
  "12 alcachofa.mp3",
  "13 acasoSoyMasFuerte.mp3",
  "14 hijo mio.mp3",
  "15 ese es papyrus.mp3",
  "16 nyeheheheh.mp3",
  "17 nonono.mp3",
  "18 color baby.mp3",
  "19 como un ladrillo.mp3",
  "20 mi casa tio.mp3",
  "21 welcome.mp3",
  "22 hambuguesa.mp3",
  "23 5020.mp3",
  "24 siSoloVieras.mp3",
  "25 mosquito.mp3",
  "26 LEMINEstars.mp3",
  "27 descargado.mp3",
  "28 fixed ennard.mp3",
  "29 lucknload.mp3",
  "30 pero tu quien eres spring bonnie plush.mp3",
  "31 me apetece pizza.mp3",
  "32 undostres.mp3",
  "33 chiiiicos2.mp3",
  "34 noHayCajaDeMusica.mp3",
  "35 jumpscare.mp3",
  "36 robada de cartera.mp3",
  "37 rogelioComeraBien.mp3",
  "38 queee.mp3",
  "39 eleanor.mp3",
  "40 deberiaContarteCuento.mp3",
  "41 platosgamer.mp3",
  "42 vamos.mp3",
  "43 puedoSerMuchoPeor.mp3",
  "44 saludo willy.mp3",
  "45 adeu.mp3"
];

const selected = new Set();

const audioList = document.getElementById("audioList");
const selectedCount = document.getElementById("selectedCount");
const selectionMessage = document.getElementById("selectionMessage");
const emailInput = document.getElementById("email");
const submitBtn = document.getElementById("submitBtn");
const statusEl = document.getElementById("status");
const honeypot = document.getElementById("website");

function escapeHtml(text) {
  const el = document.createElement("div");
  el.textContent = text;
  return el.innerHTML;
}

function audioUrl(file) {
  return "audios/" + encodeURIComponent(file);
}

function titleFromFile(file) {
  return file.replace(/\.mp3$/i, "");
}

function renderAudios() {
  audioFiles.forEach((file, index) => {
    const id = index + 1;
    const item = document.createElement("article");
    item.className = "audio-item";
    item.dataset.id = String(id);

    item.innerHTML = `
      <input class="audio-check" id="audio-${id}" type="checkbox">
      <div>
        <p class="audio-title">${escapeHtml(titleFromFile(file))}</p>
        <audio controls preload="none">
          <source src="${audioUrl(file)}" type="audio/mpeg">
          Tu navegador no soporta audio HTML5.
        </audio>
      </div>
    `;

    const checkbox = item.querySelector(".audio-check");

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        if (selected.size >= MAX_SELECTIONS) {
          checkbox.checked = false;
          return;
        }
        selected.add(id);
      } else {
        selected.delete(id);
      }

      updateUI();
    });

    audioList.appendChild(item);
  });
}

function setStatus(message, type = "") {
  statusEl.textContent = message;
  statusEl.className = "status" + (type ? " " + type : "");
}

function validEmail() {
  return (
    !emailInput.disabled &&
    emailInput.value.trim() !== "" &&
    emailInput.checkValidity()
  );
}

function refreshSubmitState() {
  submitBtn.disabled = !(selected.size === MAX_SELECTIONS && validEmail());
}

function updateUI() {
  const ready = selected.size === MAX_SELECTIONS;
  selectedCount.textContent = selected.size;

  document.querySelectorAll(".audio-item").forEach((item) => {
    const id = Number(item.dataset.id);
    const checkbox = item.querySelector(".audio-check");
    const isSelected = selected.has(id);
    const locked = ready && !isSelected;

    item.classList.toggle("selected", isSelected);
    item.classList.toggle("locked", locked);
    checkbox.disabled = locked;
  });

  emailInput.disabled = !ready;

  selectionMessage.textContent = ready
    ? "Perfecto. Introduce tu correo y envía tus votos."
    : `Te faltan ${MAX_SELECTIONS - selected.size} selecciones.`;

  refreshSubmitState();
}

emailInput.addEventListener("input", refreshSubmitState);

submitBtn.addEventListener("click", async () => {
  if (selected.size !== MAX_SELECTIONS) {
    setStatus("Debes seleccionar exactamente 10 audios.", "error");
    return;
  }

  if (!validEmail()) {
    setStatus("Introduce un correo válido.", "error");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Enviando...";
  setStatus("");

  const payload = {
    email: emailInput.value.trim().toLowerCase(),
    choices: [...selected].sort((a, b) => a - b),
    website: honeypot.value
  };

  try {
    const response = await fetch(SUBMIT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    let data = {};
    try {
      data = await response.json();
    } catch (_) {}

    if (!response.ok) {
      if (response.status === 409) {
        throw new Error("Este correo ya ha enviado sus votos.");
      }

      throw new Error(data.error || "No se pudieron guardar los votos.");
    }

    setStatus("¡Votos enviados correctamente! Gracias.", "success");

    document.querySelectorAll(".audio-check").forEach((el) => {
      el.disabled = true;
    });

    emailInput.disabled = true;
    submitBtn.textContent = "Votos enviados";
    submitBtn.disabled = true;
  } catch (error) {
    setStatus(error.message || "Ha ocurrido un error.", "error");
    submitBtn.textContent = "Enviar mis 10 votos";
    refreshSubmitState();
  }
});

renderAudios();
updateUI();
