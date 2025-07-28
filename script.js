const animatronics = [
  {
    name: "freddy",
    img: "img/freddy.png"
  },
  {
    name: "bonnie",
    img: "img/bonnie.png"
  },
  {
    name: "chica",
    img: "img/chica.png"
  },
  {
    name: "foxy",
    img: "img/foxy.png"
  },
  {
    name: "golden freddy",
    img: "img/goldenfreddy.png"
  }
];

const found = [];

const correctSound = new Audio("sounds/correct.mp3");

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

function capitalize(text) {
  return text.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

document.getElementById("guess").addEventListener("input", (e) => {
  const input = e.target.value.trim().toLowerCase();

  animatronics.forEach(anim => {
    if (input === anim.name && !found.includes(anim.name)) {
      found.push(anim.name);
      correctSound.currentTime = 0; // reinicia si se repite rápido
      correctSound.play(); // 🔊 REPRODUCIR
      e.target.value = "";
    }

  });

  document.getElementById("results").textContent =
    `Has encontrado ${found.length} de ${animatronics.length}`;

  renderGrid();

  const total = animatronics.length;
  const count = found.length;

  if (count === total) {
    document.getElementById("results").textContent = `${count} de ${total} — ¡Completado! 🎉`;
  } else {
    document.getElementById("results").textContent = `${count} de ${total} encontrados`;
  }


});

renderGrid();
