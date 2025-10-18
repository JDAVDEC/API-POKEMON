// =================== CONFIG =====================
const POKE_URL = "https://pokeapi.co/api/v2/pokemon/";
const API_FAKE = "https://jsonplaceholder.typicode.com/posts";

// =================== ELEMENTOS ==================
const pokemonContainer = document.querySelector("#pokemonContainer");
const triviaContainer = document.querySelector("#triviaContainer");
const btnGallery = document.querySelector("#btnGallery");
const btnTrivia = document.querySelector("#btnTrivia");
const btnAdd = document.querySelector("#btnAdd");

// =================== VARIABLES ==================
let pokemons = [];
let favoritos = [];

// =================== NAVEGACIÓN =================
btnGallery.addEventListener("click", () => {
  document.querySelector("#gallery").classList.add("active");
  document.querySelector("#trivia").classList.remove("active");
  btnGallery.classList.add("active");
  btnTrivia.classList.remove("active");
});

btnTrivia.addEventListener("click", () => {
  document.querySelector("#gallery").classList.remove("active");
  document.querySelector("#trivia").classList.add("active");
  btnTrivia.classList.add("active");
  btnGallery.classList.remove("active");
});

// =================== CARGAR POKÉMON =================
async function cargarPokemons() {
  for (let i = 1; i <= 151; i++) {
    const res = await fetch(POKE_URL + i);
    const data = await res.json();
    pokemons.push(data);
    mostrarPokemon(data);
  }
}

// =================== MOSTRAR POKÉMON =================
function mostrarPokemon(poke) {
  const tipos = poke.types.map(t => `<p class="${t.type.name} tipo">${t.type.name}</p>`).join("");
  const pokeId = poke.id.toString().padStart(3, "0");

  const div = document.createElement("div");
  div.classList.add("pokemon-card");
  div.innerHTML = `
    <p class="pokemon-id">#${pokeId}</p>
    <img src="${poke.sprites.other["official-artwork"].front_default}" alt="${poke.name}">
    <h3>${poke.name}</h3>
    <div class="pokemon-tipos">${tipos}</div>
    <p class="stat">Altura: ${poke.height}m</p>
    <p class="stat">Peso: ${poke.weight}kg</p>
    <button class="fav-btn" data-id="${poke.id}">❤️ Me gusta</button>
  `;

  // Evento de "Me gusta"
  div.querySelector(".fav-btn").addEventListener("click", () => guardarFavorito(poke.id));

  pokemonContainer.append(div);
}

// =================== GUARDAR FAVORITO (POST) =================
async function guardarFavorito(id) {
  const poke = pokemons.find(p => p.id === id);
  if (!poke) return;

  // Evitar duplicados
  if (favoritos.some(f => f.id === id)) {
    alert(`${poke.name} ya está en tus favoritos.`);
    return;
  }

  const nuevoFav = {
    id: poke.id,
    name: poke.name,
    image: poke.sprites.other["official-artwork"].front_default
  };

  // Simular POST
  await fetch(API_FAKE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nuevoFav)
  });

  favoritos.push(nuevoFav);
  alert(`❤️ Has agregado a ${poke.name} a tus favoritos.`);
  mostrarFavoritos();
}

// =================== MOSTRAR FAVORITOS =================
function mostrarFavoritos() {
  // Si ya existe la sección, eliminarla antes de volver a crearla
  const existente = document.querySelector("#favoritos");
  if (existente) existente.remove();

  const seccion = document.createElement("section");
  seccion.id = "favoritos";
  seccion.innerHTML = `
    <h2>Mis Pokémon Favoritos</h2>
    <div id="favContainer" class="grid"></div>
  `;

  document.querySelector("main").append(seccion);

  const favContainer = seccion.querySelector("#favContainer");

  favoritos.forEach(poke => {
    const div = document.createElement("div");
    div.classList.add("pokemon-card");
    div.innerHTML = `
      <p class="pokemon-id">#${poke.id.toString().padStart(3, "0")}</p>
      <img src="${poke.image}" alt="${poke.name}">
      <h3>${poke.name}</h3>
      <button class="main-btn" onclick="eliminarFavorito(${poke.id})">❌ Eliminar</button>
    `;
    favContainer.append(div);
  });
}

// =================== ELIMINAR FAVORITO (DELETE) =================
async function eliminarFavorito(id) {
  favoritos = favoritos.filter(p => p.id !== id);
  mostrarFavoritos();

  // Simular DELETE
  await fetch(`${API_FAKE}/${id}`, { method: "DELETE" });
  console.log(`🗑 Pokémon ${id} eliminado del servidor.`);
  alert("Favorito eliminado correctamente.");
}

// =================== AGREGAR POKÉMON MANUALMENTE (POST) =================
btnAdd.addEventListener("click", async () => {
  const nombre = prompt("Escribe el nombre del Pokémon que quieres agregar (ej: pikachu):");
  if (!nombre) return;

  try {
    const res = await fetch(`${POKE_URL}${nombre.toLowerCase()}`);
    if (!res.ok) throw new Error("Pokémon no encontrado");
    const data = await res.json();
    pokemons.push(data);
    mostrarPokemon(data);

    await fetch(API_FAKE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: data.name, id: data.id })
    });

    alert(`${data.name} agregado a la galería 🐾`);
  } catch (error) {
    alert("❌ Pokémon no encontrado, intenta otro nombre.");
  }
});

// =================== TRIVIA =================
const preguntas = [
  {
    pregunta: "¿Cuál es el tipo principal de Pikachu?",
    opciones: ["Fuego", "Eléctrico", "Agua", "Normal"],
    respuesta: "Eléctrico"
  },
  {
    pregunta: "¿Qué Pokémon es el inicial de tipo agua en Kanto?",
    opciones: ["Charmander", "Squirtle", "Bulbasaur", "Psyduck"],
    respuesta: "Squirtle"
  },
  {
    pregunta: "¿Quién es el Pokémon número 1 en la Pokédex Nacional?",
    opciones: ["Bulbasaur", "Pikachu", "Mew", "Ditto"],
    respuesta: "Bulbasaur"
  }
];

let indice = 0;

function mostrarPregunta() {
  if (indice >= preguntas.length) {
    triviaContainer.innerHTML = `<h3>🎉 ¡Has completado la trivia Pokémon!</h3>`;
    return;
  }

  const actual = preguntas[indice];
  triviaContainer.innerHTML = `
    <h3>${actual.pregunta}</h3>
    <div id="opciones"></div>
  `;

  const opcionesDiv = triviaContainer.querySelector("#opciones");
  actual.opciones.forEach(op => {
    const btn = document.createElement("button");
    btn.textContent = op;
    btn.classList.add("opcion-btn");
    btn.addEventListener("click", () => verificarRespuesta(op));
    opcionesDiv.append(btn);
  });
}

function verificarRespuesta(opcion) {
  const actual = preguntas[indice];
  if (opcion === actual.respuesta) {
    alert("✅ ¡Correcto!");
    indice++;
    mostrarPregunta();
  } else {
    alert("❌ Incorrecto, sigue intentando.");
  }
}

// =================== INICIALIZACIÓN =================
cargarPokemons();
mostrarPregunta();
