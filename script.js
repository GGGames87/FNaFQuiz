const animatronics = [
  "freddy",
  "bonnie",
  "chica",
  "foxy",
  "golden freddy"
];

const found = [];

document.getElementById("guess").addEventListener("input", (e) => {
  const input = e.target.value.trim().toLowerCase();

  if (animatronics.includes(input) && !found.includes(input)) {
    found.push(input);
    updateFound();
    e.target.value = ""; // limpiar campo
  }

  if (found.length === animatronics.length) {
    document.getElementById("results").textContent = "¡Completado!";
  } else {
    document.getElementById("results").textContent = `Has encontrado ${found.length} de ${animatronics.length}`;
  }
});

function updateFound() {
  const container = document.getElementById("found");
  container.innerHTML = "";
  found.forEach(name => {
    const div = document.createElement("div");
    div.className = "found-name";
    div.textContent = name.charAt(0).toUpperCase() + name.slice(1);
    container.appendChild(div);
  });
}
