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
      e.target.value = "";
    }
  });

  document.getElementById("results").textContent =
    `Has encontrado ${found.length} de ${animatronics.length}`;

  renderGrid();

  if (found.length === animatronics.length) {
    document.getElementById("results").textContent = "¡Completado!";
  }
});

renderGrid();
