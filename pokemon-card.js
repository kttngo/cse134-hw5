// HW 5 part 1: <pokemon-card> web component

"use strict";

const SAMPLE_POKEMON = [
  {
    id: 25,
    name: "pikachu",
    types: ["electric"],
    height: 4,
    weight: 60,
    abilities: ["static", "lightning-rod"],
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
  },
  {
    id: 1,
    name: "bulbasaur",
    types: ["grass", "poison"],
    height: 7,
    weight: 69,
    abilities: ["overgrow", "chlorophyll"],
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
  },
  {
    id: 4,
    name: "charmander",
    types: ["fire"],
    height: 6,
    weight: 85,
    abilities: ["blaze", "solar-power"],
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png",
  },
  {
    id: 7,
    name: "squirtle",
    types: ["water"],
    height: 5,
    weight: 90,
    abilities: ["torrent", "rain-dish"],
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png",
  },
];

// "lightning-rod" becomes "Lightning rod"
function prettyName(text) {
  const spaced = text.replace(/-/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

class PokemonCard extends HTMLElement {
  static observedAttributes = ["compact"];

  constructor() {
    super();
    this.pokemonList = SAMPLE_POKEMON;
    this.currentIndex = 0;
    this.built = false;
  }

  connectedCallback() {
    if (!this.built) {
      this.buildInterface();
      this.built = true;
    }
    this.showCurrentPokemon();
    this.updateView();
  }

  attributeChangedCallback(name) {
    if (name === "compact" && this.built) {
      this.updateView();
    }
  }

  // Creates every part of the interface with DOM methods
  buildInterface() {
    this.replaceChildren();

    const heading = document.createElement("h2");
    heading.textContent = "Pokémon Card Browser";
    this.appendChild(heading);

    this.viewLabel = document.createElement("p");
    this.viewLabel.className = "pokemon-view-label";
    this.appendChild(this.viewLabel);

    // Where the current pokemon is displayed
    const display = document.createElement("article");
    display.className = "pokemon-display";

    this.image = document.createElement("img");
    this.image.width = 160;
    this.image.height = 160;
    display.appendChild(this.image);

    this.nameHeading = document.createElement("h3");
    display.appendChild(this.nameHeading);

    this.typeList = document.createElement("ul");
    this.typeList.className = "pokemon-types";
    this.typeList.setAttribute("aria-label", "Types");
    display.appendChild(this.typeList);

    this.details = document.createElement("dl");
    this.details.className = "pokemon-details";
    this.heightValue = this.addDetail("Height");
    this.weightValue = this.addDetail("Weight");
    this.abilitiesValue = this.addDetail("Abilities");
    display.appendChild(this.details);

    this.appendChild(display);

    // Controls inside the component for switching Pokémon
    const controls = document.createElement("div");
    controls.className = "pokemon-controls";

    const previousButton = document.createElement("button");
    previousButton.type = "button";
    previousButton.textContent = "Previous Pokémon";
    previousButton.addEventListener("click", () => this.move(-1));
    controls.appendChild(previousButton);

    const nextButton = document.createElement("button");
    nextButton.type = "button";
    nextButton.textContent = "Next Pokémon";
    nextButton.addEventListener("click", () => this.move(1));
    controls.appendChild(nextButton);

    this.appendChild(controls);

    // Status message
    this.status = document.createElement("p");
    this.status.className = "pokemon-status";
    this.status.setAttribute("role", "status");
    this.appendChild(this.status);
  }
  addDetail(label) {
    const term = document.createElement("dt");
    term.textContent = label;
    const value = document.createElement("dd");
    this.details.appendChild(term);
    this.details.appendChild(value);
    return value;
  }

  // Moves forward (1) or back (-1)
  move(step) {
    const count = this.pokemonList.length;
    this.currentIndex = (this.currentIndex + step + count) % count;
    this.showCurrentPokemon();
  }

  // Updates the display and status for the current Pokemon
  showCurrentPokemon() {
    const pokemon = this.pokemonList[this.currentIndex];
    const name = prettyName(pokemon.name);

    this.image.src = pokemon.image;
    this.image.alt = `Official artwork of ${name}`;
    this.nameHeading.textContent = `#${pokemon.id} ${name}`;

    const typeItems = pokemon.types.map((type) => {
      const item = document.createElement("li");
      item.textContent = prettyName(type);
      return item;
    });
    this.typeList.replaceChildren(...typeItems);

    this.heightValue.textContent = `${pokemon.height / 10} m`;
    this.weightValue.textContent = `${pokemon.weight / 10} kg`;
    this.abilitiesValue.textContent = pokemon.abilities.map(prettyName).join(", ");

    this.status.textContent = `Pokémon ${this.currentIndex + 1} of ${this.pokemonList.length}: ${name}`;
  }

  updateView() {
    const compact = this.hasAttribute("compact");
    this.details.hidden = compact;
    this.viewLabel.textContent = compact
      ? "Compact view: height, weight, and abilities are hidden."
      : "Expanded view: showing height, weight, and abilities.";
  }
}

customElements.define("pokemon-card", PokemonCard);

// --- Page button outside component ---
const viewToggle = document.getElementById("pokemon-view-toggle");
const pokemonCard = document.querySelector("pokemon-card");

if (viewToggle && pokemonCard) {
  function updateToggleLabel() {
    viewToggle.textContent = pokemonCard.hasAttribute("compact")
      ? "Switch to expanded view"
      : "Switch to compact view";
  }

  viewToggle.addEventListener("click", () => {
    pokemonCard.toggleAttribute("compact");
    updateToggleLabel();
  });

  updateToggleLabel();
  viewToggle.hidden = false;
}
