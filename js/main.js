const listaPokemon = document.querySelector("#listaPokemon");
const botonesHeader = document.querySelectorAll(".btn-header");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");
const pageText = document.getElementById("page");

let URL = "https://pokeapi.co/api/v2/pokemon/";
let todosLosPokemones = [];
let todosCargados = false;
let currentPage = 0; // Página 0 (0 * 50 = offset 0)
const limit = 50;
const totalPokemon = 1025;

function cargarPokemones(offset = 0) {
  fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`)
    .then((res) => res.json())
    .then((data) => {
      const pokemones = data.results;

      // Mapea los fetches individuales
      const fetches = pokemones.map((pokemon) =>
        fetch(pokemon.url).then((res) => res.json())
      );

      // Espera a que todos se completen
      Promise.all(fetches).then((resultados) => {
        // Ordenar por número (ID)
        resultados.sort((a, b) => a.id - b.id);

        // Mostrar todos ya ordenados
        resultados.forEach((data) => {
          mostrarPokemon(data);
          if (!todosCargados) todosLosPokemones.push(data);
        });
      });
    });
}
const TOTAL_POKEMON = 1025;

function precargarTodos() {
  for (let i = 0; i < TOTAL_POKEMON; i += limit) {
    fetch(`https://pokeapi.co/api/v2/pokemon?offset=${i}&limit=${limit}`)
      .then((res) => res.json())
      .then((data) => {
        data.results.forEach((pokemon) => {
          fetch(pokemon.url)
            .then((res) => res.json())
            .then((data) => {
              todosLosPokemones.push(data);
              if (todosLosPokemones.length === TOTAL_POKEMON) {
                todosCargados = true;
              }
            });
        });
      });
  }
}

btnNext.addEventListener("click", () => {
  if ((currentPage + 1) * limit < totalPokemon) {
    currentPage++;
    cargarPokemones(currentPage * limit);
    pageText.textContent = `Página ${currentPage + 1}`;
  }
});

btnPrev.addEventListener("click", () => {
  if (currentPage > 0) {
    currentPage--;
    cargarPokemones(currentPage * limit);
    pageText.textContent = `Página ${currentPage + 1}`;
  }
});

// Cargar los primeros 50 al iniciar
cargarPokemones();

function mostrarPokemon(data) {
  let tipos = data.types
    .map((type) => `<p class="${type.type.name} tipo">${type.type.name}</p>`)
    .join("");

  let dataId = data.id.toString().padStart(3, "0");

  // Stats HTML
  let statsHTML = data.stats
    .map(
      (stat) =>
        `<p class="stat-line"><strong>${stat.stat.name}:</strong> ${stat.base_stat}</p>`
    )
    .join("");

  // URLs para la imagen normal y shiny
  const imgNormal = data.sprites.other["official-artwork"].front_default;
  const imgShiny = data.sprites.other["official-artwork"].front_shiny;

  const div = document.createElement("div");
  div.classList.add("pokemon");
  div.innerHTML = `
        <p class="pokemon-id-back">${dataId}</p>
        <div class="pokemon-imagen">
            <img 
                src="${imgNormal}" 
                alt="${data.name}" 
                data-normal="${imgNormal}" 
                data-shiny="${imgShiny}" 
                data-shiny-active="false"
                class="pokemon-image"
                loading="lazy"
            >
            <button class="btn-shiny" title="Toggle shiny">✨</button>
        </div>  
        <div class="pokemon-info">
            <div class="nombre-contenedor">
                <p class="pokemon-id">#${dataId}</p>
                <h2 class="pokemon-nombre">${data.name}</h2>
            </div>
            <div class="pokemon-tipos">${tipos}</div>
            <div class="pokemon-stats">
                <p class="stat">${data.height}m</p>
                <p class="stat">${data.weight}kg</p>
            </div>
            <div class="pokemon-extra-stats">${statsHTML}</div>
        </div>
    `;

  listaPokemon.append(div);

  // Agregar listener al botón shiny para alternar imagen
  const btnShiny = div.querySelector(".btn-shiny");
  const img = div.querySelector(".pokemon-image");

  btnShiny.addEventListener("click", () => {
    const isShiny = img.getAttribute("data-shiny-active") === "true";
    if (isShiny) {
      img.src = img.getAttribute("data-normal");
      img.setAttribute("data-shiny-active", "false");
    } else {
      img.src = img.getAttribute("data-shiny");
      img.setAttribute("data-shiny-active", "true");
    }
  });
}

botonesHeader.forEach((boton) => {
  boton.addEventListener("click", (event) => {
    const botonId = event.currentTarget.id;
    listaPokemon.innerHTML = "";

    if (botonId === "ver-todos") {
      cargarPokemones(currentPage * limit);
    } else if (todosCargados) {
      const filtrados = todosLosPokemones.filter((pokemon) =>
        pokemon.types.some((t) => t.type.name === botonId)
      );
      filtrados.forEach(mostrarPokemon);
    } else {
      alert("Aún se están cargando todos los Pokémon. Por favor espera.");
    }
  });
});

/*
                      <p class="pokemon-id-back">#025</p>
                      <div class="pokemon-imagen">
                        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png" alt="Pikachu">
                      </div>  
                      <div class="pokemon-info">
                        <div class="nombre-contenedor">
                            <p class="pokemon-id">#025</p>
                            <h2 class="pokemon-nombre">Pikachu</h2>
                        </div>
                        <div class="pokemon-tipos">
                            <p class="electric tipo">ELECTRIC</p>
                            <p class="fighting tipo">FIGHTING</p>
                        </div>
                        <div class="pokemon-stats">
                            <p class="stat">4M</p>
                            <p class="stat">60Kg</p>
                        </div>
                      </div>
                
                    */
