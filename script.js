let showSilhouettes = false;

let lastCorrect = null;


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

const foundFnaf1 = [];
const foundFnaf2 = [];

if (isMultiplayer) {
  document.getElementById("ranking").style.display = "block";
  username = prompt("Type your name to make a temporary room, then send the link to a friend!")?.trim().substring(0, 20) || "Anonym";

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
    foundFnaf1.length = 0;
    foundFnaf2.length = 0;
    let personalCount = 0;

    for (const key in data) {
      const [game, name] = key.split("-");
      if (game === "fnaf1") foundFnaf1.push(name);
      else if (game === "fnaf2") foundFnaf2.push(name);

      if (data[key] === username) personalCount++;
    }

    update(ref(db, `rooms/${roomId}/players/${username}`), { count: personalCount });
    renderGrids();
    updateResults();
  });

  onValue(playersRef, (snapshot) => {
    const data = snapshot.val() || {};
    const sorted = Object.entries(data).sort((a, b) => b[1].count - a[1].count);
    const ranking = sorted.map(([name, val]) => `<div>${name}: ${val.count}</div>`).join("");
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

const fnaf2Animatronics = [
  { name: "jj", img: "img/jj.png", aliases: ["jj", "balloon girl"] },
  { name: "bb", img: "img/bb.png", aliases: ["bb", "balloon boy"] },
  { name: "puppet", img: "img/puppet.png", aliases: ["puppet", "marionette", "the puppet", "the marionette"] },
  { name: "toy freddy", img: "img/toyfreddy.png", aliases: ["toy freddy"] },
  { name: "toy bonnie", img: "img/toybonnie.png", aliases: ["toy bonnie"] },
  { name: "toy chica", img: "img/toychica.png", aliases: ["toy chica"] },
  { name: "mangle", img: "img/mangle.png", aliases: ["mangle"] }
];

const correctSound = new Audio("sounds/correct.mp3");
function renderGrids() {
  renderGrid(animatronics, foundFnaf1, "grid");
  renderGrid(fnaf2Animatronics, foundFnaf2, "grid-fnaf2");
}
lastCorrect = null;


function capitalize(text) {
  return text.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function renderGrid(animList, foundList, containerId) {
  const grid = document.getElementById(containerId);
  grid.innerHTML = "";

  animList.forEach(anim => {
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.draggable = false;

    const isFound = foundList.includes(anim.name);
    
    img.classList.remove("silhouette");

    if (isFound) {
      img.src = anim.img;
    } else if (showSilhouettes) {
      img.src = anim.img;
      img.classList.add("silhouette");
    } else {
      img.src = "img/question.png";
    }


    if (isFound && anim.name === lastCorrect) {
      if (!img.classList.contains("silhouette")) {
        img.classList.remove("revealed");
        void img.offsetWidth;
        img.classList.add("revealed");
      }
    }



    const label = document.createElement("div");
    label.textContent = capitalize(anim.name);
    label.className = isFound ? "name-visible" : "name-hidden";

    card.appendChild(img);
    card.appendChild(label);
    grid.appendChild(card);
  });
}

function updateResults() {
  const total = animatronics.length + fnaf2Animatronics.length;
  const count = foundFnaf1.length + foundFnaf2.length;
  const results = document.getElementById("results");

  results.textContent = count === total
    ? `${count} de ${total} — ¡Completed! 🎉`
    : `${count} / ${total} found`;
}

document.getElementById("toggle-silhouettes").addEventListener("click", () => {
  showSilhouettes = !showSilhouettes;
  renderGrids();
});



const allAnimatronics = [
  ...animatronics.map(a => ({ ...a, game: "fnaf1", aliases: [a.name] })),
  ...fnaf2Animatronics.map(a => ({ ...a, game: "fnaf2" }))
];

document.getElementById("guess").addEventListener("input", (e) => {
  const input = e.target.value.trim().toLowerCase().replace(/\s+/g, "");

  for (const anim of allAnimatronics) {
    const aliases = anim.aliases.map(a => a.toLowerCase().replace(/\s+/g, ""));
    if (aliases.includes(input)) {
      const alreadyFound = anim.game === "fnaf1"
        ? foundFnaf1.includes(anim.name)
        : foundFnaf2.includes(anim.name);

      if (alreadyFound) break;

      if (anim.game === "fnaf1") foundFnaf1.push(anim.name);
      else foundFnaf2.push(anim.name);

      lastCorrect = anim.name;
      correctSound.currentTime = 0;
      correctSound.play();
      e.target.value = "";

      if (isMultiplayer) {
        update(ref(db, `rooms/${roomId}/found`), {
          [`${anim.game}-${anim.name}`]: username
        });
      }

      renderGrids();
      setTimeout(() => lastCorrect = null, 100);
      updateResults();

      break;
    }
  }
});

document.addEventListener("contextmenu", e => {
  if (e.target.tagName === "IMG") {
    e.preventDefault();
  }
});


renderGrids();
updateResults();

[...animatronics, ...fnaf2Animatronics].forEach(anim => {
  const img = new Image();
  img.src = anim.img;
});
