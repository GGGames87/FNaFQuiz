// ✅ Firebase setup completo
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getDatabase, ref, update, onValue } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

// ✅ Configuración de tu Firebase
const firebaseConfig = {
  apiKey: "AIzaSyASXBFvzjCcp21g5NcI1PqYbX7rFN1UVIs",
  authDomain: "fnafquiz1.firebaseapp.com",
  databaseURL: "https://fnafquiz1-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "fnafquiz1",
  storageBucket: "fnafquiz1.firebasestorage.app",
  messagingSenderId: "812258358214",
  appId: "1:812258358214:web:9466fc6efa4e0009d538c7",
  measurementId: "G-9BHX9G7GT1"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);


// ✅ Importaciones Firebase (versión módulo)
import { ref, update, onValue } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

const playersRef = ref(db, `rooms/${roomId}/players`);
onValue(playersRef, (snapshot) => {
  const data = snapshot.val() || {};
  const sorted = Object.entries(data)
    .sort((a, b) => b[1].count - a[1].count);

  const ranking = sorted.map(([name, val]) => 
    `<div>${name}: ${val.count}</div>`
  ).join("");

  document.getElementById("ranking").innerHTML = `
    <h3>Ranking:</h3>${ranking}
  `;
});


// ✅ Obtener ID de sala desde la URL
function getRoomIdFromURL() {
  const path = window.location.pathname;
  const match = path.match(/\/([A-Z0-9]{6})$/);
  return match ? match[1] : null;
}

const roomId = getRoomIdFromURL();

if (!roomId) {
  alert("Debes entrar con una URL de sala válida (como /ABC123)");
  throw new Error("No hay sala");
}

// ✅ Pedir nombre al jugador
let username = prompt("Introduce tu nombre de jugador:");
username = username?.trim().substring(0, 20) || "Anónimo";

// ✅ Configuración del juego
const animatronics = [
  { name: "freddy", img: "img/freddy.png" },
  { name: "bonnie", img: "img/bonnie.png" },
  { name: "chica", img: "img/chica.png" },
  { name: "foxy", img: "img/foxy.png" },
  { name: "golden freddy", img: "img/goldenfreddy.png" }
];

const found = [];
const correctSound = new Audio("sounds/correct.mp3");

// ✅ Referencia a sala en Firebase
const foundRef = ref(db, `rooms/${roomId}/found`);

// ✅ Escuchar nombres acertados en tiempo real
onValue(foundRef, (snapshot) => {
  const data = snapshot.val() || {};
  found.length = 0;
  for (const name in data) {
    if (!found.includes(name)) found.push(name);
  }
  renderGrid();
  updateResults();
});

// ✅ Mostrar animatrónicos
function renderGrid() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  animatronics.forEach(anim => {
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.src = found.includes(anim.name) ? anim.img : "img/question.png";

    const label = document.createElement("div");
    label.textContent = capitalize(anim.name);
    label.className = found.includes(anim.name) ? "name-visible" : "name-hidden";

    card.appendChild(img);
    card.appendChild(label);
    grid.appendChild(card);
  });
}

// ✅ Capitalizar nombres
function capitalize(text) {
  return text.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

// ✅ Actualizar contador
function updateResults() {
  const total = animatronics.length;
  const count = found.length;
  const results = document.getElementById("results");

  if (count === total) {
    results.textContent = `${count} de ${total} — ¡Completado! 🎉`;
  } else {
    results.textContent = `${count} de ${total} encontrados`;
  }
}

// ✅ Entrada de texto del jugador
document.getElementById("guess").addEventListener("input", (e) => {
  const input = e.target.value.trim().toLowerCase();

  animatronics.forEach(anim => {
    if (input === anim.name && !found.includes(anim.name)) {
      found.push(anim.name);
      correctSound.currentTime = 0;
      correctSound.play();
      e.target.value = "";

      // 🔁 Guardar progreso del jugador
      const userRef = ref(db, `rooms/${roomId}/players/${username}`);
      update(userRef, {
        count: found.length
      });

      // ✅ Añadir animatrónico a la lista compartida
      update(foundRef, {
        [anim.name]: true
      });
    }
  });

  updateResults();
  renderGrid();
});

// ✅ Render inicial
renderGrid();
updateResults();
