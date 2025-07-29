// 📌 Fetchs
// 👉 URL Base
const URL_BASE = 'https://pokeapi.co/api/v2/';

// 🔹 Fetch para buscar pokemon por nombre
async function searchByName(name) {
    try {
        const response = await fetch(`${URL_BASE}pokemon/${name}`);
        if(!response.ok) throw new Error(`Error al encontrar pokemon: ${name}`);

        const data = await response.json();
        return data;
    } catch(error) {
        console.log(error);
    }
}

// 🔹 Fetch para buscar pokemon aleatorios
async function fetchRandomPokemons() {
    try {
        const response = await fetch(`${URL_BASE}pokemon?limit=1000`);
        if(!response.ok) throw new Error(`Error al obtener lista completa de pokemons`);

        const data = await response.json();
        return data.results;
    } catch(error) {
        console.log(error);
    }
}

// Obtener la lista completa y asignar 5 ids aleatorios
function getRandomPokemonUrls(pokemonList, count = 6) {
    const randomUrls = [];
    for(let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * pokemonList.length);
        randomUrls.push(pokemonList[randomIndex].url);
    }
    return randomUrls;
}

// Obtener sus datos con fetch y devolver usando promesas
async function getMultiplePokemonData(urls) {
    const promises = urls.map(url => fetch(url).then(res => res.json()));
    return await Promise.all(promises);
}

// Gestionar todas las funciones y parametros para los pokemons aleatorios
async function loadRandomPokemon() {
    try {
        const pokemonList = await fetchRandomPokemons();
        const randomUrls = getRandomPokemonUrls(pokemonList);
        const randomPokemonData = await getMultiplePokemonData(randomUrls);
        renderRandomPokemon(randomPokemonData);
    } catch(error) {
        console.error('Error al cargar los Pokemons aleatorios: ', error);
    }
}

// 📌 Eventos del DOM
// 🔹 Evento para buscar por el formulario
document.getElementById('form-id').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    if(name) {
        const pokemon = await searchByName(name);
        if(pokemon) displayPokemons(pokemon);
    } else {
        alert('Fill Name Field'); 
    }
});

// 🔹 Evento para para cargar favoritos y randoms al cargar la pagina
document.addEventListener('DOMContentLoaded', (e) => {
    loadFavorites(load());
    loadRandomPokemon();
})

// 📌 Listar los datos
// 🔹 Mostrar pokemons por nombre en el dom
function displayPokemons(pokemon) {
    const display = document.getElementById('form-results');
    display.innerHTML = `
        <div>
            <h3>${pokemon.name}</h3>
            <img src='${pokemon.sprites.front_default}'>
            <p>Types: ${pokemon.types.map(type => type.type.name).join(', ')}</p>
            <p>Habilities: ${pokemon.abilities.map(hab => hab.ability.name).join(', ')}</p>
            <button data-name='${pokemon.name}'>Add to Favorites</button>
        </div>
    `;
}

// Evento único para clicks del contenedor de resultados
document.getElementById('form-results').addEventListener('click', (e) => {
    const name = e.target.getAttribute('data-name');
    if (name) save(name);
});

// 🔹 Funcion para cargar los favoritos
async function loadFavorites(load) {
    const display = document.getElementById('favorites-cont');
    display.innerHTML = '';

    for(let pokemons of load) {
        const pokemon = await searchByName(pokemons);

        display.innerHTML += `
            <div>
                <h3>${pokemon.name}</h3>
                <img src='${pokemon.sprites.front_default}'>
                <p>Types: ${pokemon.types.map(type => type.type.name).join(', ')}</p>
                <p>Habilities: ${pokemon.abilities.map(hab => hab.ability.name).join(', ')}</p>
            </div>
        `;
    }
}

// 🔹 Funcion para mostrar los pokemon aleatorios
function renderRandomPokemon(pokemonList) {
    const div = document.getElementById('random-cont');
    const lista = pokemonList.map(pokemon => `
    <div>
        <h3>${pokemon.name}</h3>
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" width="100">
        <p>Types: ${pokemon.types.map(type => type.type.name).join(', ')}</p>
        <p>Habilities: ${pokemon.abilities.map(hab => hab.ability.name).join(', ')}</p>
        <button data-name='${pokemon.name}'>Add to Favorites</button>
    </div>
    `).join('');
    div.innerHTML = lista;

    div.addEventListener('click', (e) => {
        const name = e.target.getAttribute('data-name');
        save(name);
    })
}

// 📌 Funciones para guardar y cargar desde localStorage
// 🔹 Cargar
function save(name) {
    if(!name) return; // Cortar si name no es valido

    let pokemonNames = load();
    if(!pokemonNames.find(n => n === name)) {
        pokemonNames.push(name);
        localStorage.setItem('pokemonlist', JSON.stringify(pokemonNames));
        loadFavorites(pokemonNames);
    } else {
        alert('El pokemon ya fue añadido a favoritos')
    }
}

// 🔹 Guardar
function load() {
    return JSON.parse(localStorage.getItem('pokemonlist')) || [];
}