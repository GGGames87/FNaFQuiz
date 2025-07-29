function generateRoomId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < 6; i++) id += chars.charAt(Math.floor(Math.random() * chars.length));
  return id;
}

document.getElementById("create-room")?.addEventListener("click", () => {
  const newRoomId = generateRoomId();
  window.location.hash = newRoomId;
  window.location.reload();
});


import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getDatabase, ref, update, onValue } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

function getRoomIdFromURL() {
  return window.location.hash ? window.location.hash.substring(1).toUpperCase() : null;
}

const roomId = getRoomIdFromURL();
const isMultiplayer = !!roomId;
let username = "Jugador";

let db, foundRef, playersRef;

if (isMultiplayer) {
  document.getElementById("ranking").style.display = "block";
  username = prompt("Introduce tu nombre de jugador:")?.trim().substring(0, 20) || "Anónimo";

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
  db = getDatabase(app);

  foundRef = ref(db, `rooms/${roomId}/found`);
  playersRef = ref(db, `rooms/${roomId}/players`);

  onValue(foundRef, (snapshot) => {
    const data = snapshot.val() || {};
    found.length = 0;
    let personalCount = 0;
    for (const name in data) {
      found.push(name);
      if (data[name] === username) personalCount++;
    }
    update(ref(db, `rooms/${roomId}/players/${username}`), {
      count: personalCount
    });
    renderGrid();
    updateResults();
  });

  onValue(playersRef, (snapshot) => {
    const data = snapshot.val() || {};
    const sorted = Object.entries(data)
      .sort((a, b) => b[1].count - a[1].count);

    const ranking = sorted.map(([name, val]) =>
      `<div>${name}: ${val.count}</div>`).join("");

    document.getElementById("ranking").innerHTML = `<h3>Ranking:</h3>${ranking}`;
  });

} else {
  document.getElementById("ranking").style.display = "none";
}

const animatronics = [
  { name: "freddy", img: "img/freddy.png" },
  { name: "bonnie", img: "img/bonnie.png" },
  { name: "chica", img: "img/chica.png" },
  { name: "foxy", img: "img/foxy.png" },
  { name: "golden freddy", img: "img/goldenfreddy.png" }
];

const found = [];
const correctSound = new Audio("sounds/correct.mp3");

function capitalize(text) {
  return text.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function renderGrid() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  animatronics.forEach(anim => {
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    const isFound = found.includes(anim.name);
    img.src = isFound ? anim.img : "img/question.png";
    if (isFound && anim.name === lastCorrect) {
      img.classList.add("revealed");
    }


    const label = document.createElement("div");
    label.textContent = capitalize(anim.name);
    label.className = found.includes(anim.name) ? "name-visible" : "name-hidden";

    card.appendChild(img);
    card.appendChild(label);
    grid.appendChild(card);
  });
}

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

let lastCorrect = null;


document.getElementById("guess").addEventListener("input", (e) => {
  const input = e.target.value.trim().toLowerCase();


  animatronics.forEach(anim => {
    if (input === anim.name && !found.includes(anim.name)) {
      found.push(anim.name);
      correctSound.currentTime = 0;
      correctSound.play();
      e.target.value = "";

      if (isMultiplayer) {
        update(ref(db, `rooms/${roomId}/found`), {
          [anim.name]: username
        });
      }

      renderGrid();
      updateResults();
    }
  });
});

renderGrid();
updateResults();
