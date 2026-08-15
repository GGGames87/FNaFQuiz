import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// =========================================================
// CONFIGURA ESTOS DOS VALORES CON LOS DE TU PROYECTO SUPABASE
// =========================================================
const SUPABASE_URL = "https://TU-PROYECTO.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "TU_PUBLISHABLE_KEY";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const MAX_SELECTIONS = 10;
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

const audioList = document.getElementById("audioList");
const selectedCount = document.getElementById("selectedCount");
const emailInput = document.getElementById("email");
const sendCodeBtn = document.getElementById("sendCodeBtn");
const otpArea = document.getElementById("otpArea");
const otpInput = document.getElementById("otp");
const verifyBtn = document.getElementById("verifyBtn");
const statusEl = document.getElementById("status");
const selectionMessage = document.getElementById("selectionMessage");

const selected = new Set();
let verificationEmail = "";

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function displayName(fileName) {
  return fileName.replace(/\.mp3$/i, "");
}

function audioUrl(fileName) {
  return "audios/" + encodeURIComponent(fileName);
}

function renderAudios() {
  audioList.innerHTML = "";

  audioFiles.forEach((fileName, index) => {
    const id = index + 1;
    const article = document.createElement("article");
    article.className = "audio-item";
    article.dataset.id = id;

    article.innerHTML = `
      <input
        class="audio-check"
        type="checkbox"
        id="audio-${id}"
        aria-label="Seleccionar ${escapeHtml(displayName(fileName))}"
      >
      <div class="audio-content">
        <p class="audio-title">${escapeHtml(displayName(fileName))}</p>
        <audio controls preload="none">
          <source src="${audioUrl(fileName)}" type="audio/mpeg">
          Tu navegador no soporta audio HTML5.
        </audio>
      </div>
    `;

    const checkbox = article.querySelector(".audio-check");
    checkbox.addEventListener("change", () => onSelectionChange(id, checkbox));

    audioList.appendChild(article);
  });
}

function onSelectionChange(id, checkbox) {
  if (checkbox.checked) {
    if (selected.size >= MAX_SELECTIONS) {
      checkbox.checked = false;
      return;
    }
    selected.add(id);
  } else {
    selected.delete(id);
  }

  updateSelectionUI();
}

function updateSelectionUI() {
  selectedCount.textContent = selected.size;

  document.querySelectorAll(".audio-item").forEach((item) => {
    const id = Number(item.dataset.id);
    const checkbox = item.querySelector(".audio-check");
    const isSelected = selected.has(id);
    const lock = selected.size === MAX_SELECTIONS && !isSelected;

    item.classList.toggle("selected", isSelected);
    item.classList.toggle("locked", lock);
    checkbox.disabled = lock;
  });

  const ready = selected.size === MAX_SELECTIONS;
  emailInput.disabled = !ready;
  sendCodeBtn.disabled = !ready;

  selectionMessage.textContent = ready
    ? "Perfecto: has seleccionado exactamente 10. Verifica tu correo para enviar."
    : `Te faltan ${MAX_SELECTIONS - selected.size} selecciones.`;

  if (!ready) {
    otpArea.classList.add("hidden");
    verificationEmail = "";
  }
}

function setStatus(message, type = "") {
  statusEl.textContent = message;
  statusEl.className = "status";
  if (type) statusEl.classList.add(type);
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

sendCodeBtn.addEventListener("click", async () => {
  setStatus("");

  if (selected.size !== MAX_SELECTIONS) {
    setStatus("Debes seleccionar exactamente 10 audios.", "error");
    return;
  }

  const email = normalizeEmail(emailInput.value);

  if (!email || !emailInput.checkValidity()) {
    setStatus("Introduce un correo electrónico válido.", "error");
    emailInput.focus();
    return;
  }

  sendCodeBtn.disabled = true;
  sendCodeBtn.textContent = "Enviando código...";

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true
    }
  });

  sendCodeBtn.textContent = "Enviar código de verificación";
  sendCodeBtn.disabled = false;

  if (error) {
    console.error(error);
    setStatus("No se pudo enviar el código. Inténtalo de nuevo más tarde.", "error");
    return;
  }

  verificationEmail = email;
  otpArea.classList.remove("hidden");
  setStatus("Código enviado. Revisa tu correo.", "success");
  otpInput.focus();
});

verifyBtn.addEventListener("click", async () => {
  setStatus("");

  if (selected.size !== MAX_SELECTIONS) {
    setStatus("La selección ya no contiene exactamente 10 audios.", "error");
    return;
  }

  const token = otpInput.value.trim();

  if (!verificationEmail || !token) {
    setStatus("Introduce el código que has recibido.", "error");
    return;
  }

  verifyBtn.disabled = true;
  verifyBtn.textContent = "Verificando...";

  const {
    data: authData,
    error: verifyError
  } = await supabase.auth.verifyOtp({
    email: verificationEmail,
    token,
    type: "email"
  });

  if (verifyError || !authData.user) {
    console.error(verifyError);
    verifyBtn.disabled = false;
    verifyBtn.textContent = "Verificar y enviar respuestas";
    setStatus("El código no es válido o ha caducado.", "error");
    return;
  }

  const choices = Array.from(selected).sort((a, b) => a - b);

  const { error: insertError } = await supabase
    .from("submissions")
    .insert({
      user_id: authData.user.id,
      email: authData.user.email,
      choices
    });

  if (insertError) {
    console.error(insertError);

    // PostgreSQL unique_violation
    if (insertError.code === "23505") {
      setStatus("Este correo ya ha enviado una respuesta.", "error");
    } else {
      setStatus("No se pudieron guardar las respuestas.", "error");
    }

    await supabase.auth.signOut();
    verifyBtn.disabled = false;
    verifyBtn.textContent = "Verificar y enviar respuestas";
    return;
  }

  setStatus("¡Respuesta enviada correctamente! Gracias.", "success");

  document.querySelectorAll(".audio-check").forEach((el) => {
    el.disabled = true;
  });
  emailInput.disabled = true;
  sendCodeBtn.disabled = true;
  verifyBtn.disabled = true;
  verifyBtn.textContent = "Enviado";

  await supabase.auth.signOut();
});

renderAudios();
updateSelectionUI();
