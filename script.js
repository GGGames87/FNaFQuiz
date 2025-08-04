let showSilhouettes = false;

let lastCorrect = null;


function normalizeKey(text) {
  return text.toLowerCase().replace(/[\s\.\-_'"]/g, "");
}



function generateRoomId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < 6; i++) id += chars.charAt(Math.floor(Math.random() * chars.length));
  return id;
}

document.getElementById("create-room")?.addEventListener("click", () => {
  const newRoomId = generateRoomId();
  localStorage.setItem("justCreatedRoom", newRoomId);
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

const createdId = localStorage.getItem("justCreatedRoom");
if (createdId && createdId === roomId) {
  const now = new Date().toISOString();
  update(ref(db, `rooms/${roomId}`), { createdAt: now });
  localStorage.removeItem("justCreatedRoom");
}



  foundRef = ref(db, `rooms/${roomId}/found`);
  playersRef = ref(db, `rooms/${roomId}/players`);

  onValue(foundRef, (snapshot) => {
    const data = snapshot.val() || {};
    foundFnaf1.length = 0;
    foundFnaf2.length = 0;
    let personalCount = 0;

    for (const key in data) {
      const game = key.startsWith("fnaf1-") ? "fnaf1" : "fnaf2";
      const name = normalizeKey(key.replace(`${game}-`, ""));


  
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
  { name: "golden freddy", img: "img/goldenfreddy.png" },
  { name: "endo-01", img: "img/endo01.png", aliases: ["endo-01", "endo 01", "endo1", "endo-1"], displayName: "Endo-01" },
  { name: "mr. cupcake", img: "img/mrcupcake.png", aliases: ["cupcake", "mr. cupcake", "mr cupcake", "mrcupcake"], displayName: "Mr. Cupcake" },
  { name: "phone guy", img: "img/phoneguy.png", aliases: ["ralph", "phone guy"], displayName: "Phone Guy" },
];


const fnaf2Animatronics = [
  { name: "jj", img: "img/jj.png", aliases: ["jj", "balloon girl"], displayName: "JJ" },
  { name: "bb", img: "img/bb.png", aliases: ["bb", "balloon boy"], displayName: "Balloon Boy" },
  { name: "puppet", img: "img/puppet.png", aliases: ["puppet", "marionette", "the puppet", "the marionette"], displayName: "The Puppet" },
  { name: "toy freddy", img: "img/toyfreddy.png", aliases: ["toy freddy"], displayName: "Toy Freddy" },
  { name: "toy bonnie", img: "img/toybonnie.png", aliases: ["toy bonnie"], displayName: "Toy Bonnie" },
  { name: "toy chica", img: "img/toychica.png", aliases: ["toy chica"], displayName: "Toy Chica" },
  { name: "mangle", img: "img/mangle.png", aliases: ["mangle"], displayName: "Mangle" } ,
  { name: "Toy Cupcake", img: "img/toycupcake.png", aliases: ["toy cupcake", "toy mr cupcake"] },
  { name: "endo-02", img: "img/endo02.png", aliases: ["endo-02", "endo 02", "endo2", "endo-2"], displayName: "Endo-02" },
  { name: "Withered Freddy", img: "img/wfreddy.png", aliases: ["withered freddy", "w freddy"] },
  { name: "Withered Bonnie", img: "img/wbonnie.png", aliases: ["withered bonnie", "w bonnie"] },
  { name: "Withered Chica", img: "img/wchica.png", aliases: ["withered chica", "w chica"] },
  { name: "Withered Foxy", img: "img/wfoxy.png", aliases: ["withered foxy", "w foxy"] },
  { name: "Withered Golden Freddy", img: "img/wgolden.png", aliases: ["withered golden freddy", "w golden freddy", "w g freddy"] },
  { name: "RWQFSFASXC", img: "img/shadowbonnie.png", aliases: ["rwqfsfasxc", "shadow bonnie", "rxq"] },
  { name: "Shadow Freddy", img: "img/shadowfreddy.png", aliases: ["shadow freddy", "purple freddy"] },
  { name: "Paperpals", img: "img/paperpals.png", aliases: ["paperpals"] },
  { name: "Fritz Smith", img: "img/FritzSmith.png", aliases: ["fritz smith"] },
  { name: "Jeremy Fitzgerald", img: "img/JeremyFitzgerald.png", aliases: ["jeremy fitzgerald"] },
  { name: "William Afton", img: "img/william.png", aliases: ["william", "purple guy", "vincent"] },
  
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

    const isFound = foundList.includes(normalizeKey(anim.name));

    
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
    label.textContent = anim.displayName || capitalize(anim.name);
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
  ...animatronics.map(a => ({
    ...a,
    game: "fnaf1",
    aliases: a.aliases || [a.name]
  })),
  ...fnaf2Animatronics.map(a => ({
    ...a,
    game: "fnaf2",
    aliases: a.aliases || [a.name]
  }))
];

function normalize(text) {
  return text.toLowerCase().replace(/[\s\.\-_'"]/g, "");
}


document.getElementById("guess").addEventListener("input", (e) => {
  const input = normalize(e.target.value);


  for (const anim of allAnimatronics) {
    const normalizedInput = input;
    const normalizedAliases = (anim.aliases || [anim.name]).map(normalize);


    if (normalizedAliases.includes(normalizedInput)) {
      const normalizedName = normalizeKey(anim.name);
      const alreadyFound = anim.game === "fnaf1"
        ? foundFnaf1.includes(normalizedName)
        : foundFnaf2.includes(normalizedName);

      if (alreadyFound) break;

      if (anim.game === "fnaf1") foundFnaf1.push(normalizedName);
      else foundFnaf2.push(normalizedName);


      lastCorrect = anim.name;
      correctSound.currentTime = 0;
      correctSound.play();
      e.target.value = "";

      if (isMultiplayer) {
        update(ref(db, `rooms/${roomId}/found`), {
          [`${anim.game}-${normalizedName}`]: username
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

function toggleSection(header) {
  header.classList.toggle("collapsed");
}


renderGrids();
updateResults();


setTimeout(() => {
  document.querySelectorAll(".card div").forEach(label => {
    let fontSize = 14;
    label.style.fontSize = fontSize + "px";
    const parent = label.parentElement;

    while (
      (label.scrollWidth > parent.clientWidth || label.scrollHeight > 40) &&
      fontSize > 6
    ) {
      fontSize--;
      label.style.fontSize = fontSize + "px";
    }
  });
}, 0);







[...animatronics, ...fnaf2Animatronics].forEach(anim => {
  const img = new Image();
  img.src = anim.img;
});
