// HW 5 part 2: <fact-card> web component

"use strict";

const FACTS_API = "https://uselessfacts.jsph.pl/api/v2/facts";
const REQUEST_TIMEOUT_MS = 10000;

const STARTER_FACT = {
  id: "starter",
  text: "Over 85 billion physical Pokémon cards have been produced since 1996.",
  source: "Katie's sample fact",
  sourceUrl: "",
  language: "en",
  kind: "sample",
};

function safeWebUrl(value) {
  if (typeof value !== "string") {
    return "";
  }
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
  } catch (error) {
    return "";
  }
}

// Checks that the response has the fields we use w/ expected types
function readFact(data, kind) {
  if (typeof data !== "object" || data === null) {
    throw new Error("The response wasn't a fact.");
  }
  if (typeof data.id !== "string" || data.id === "") {
    throw new Error("The fact was missing its ID.");
  }
  if (typeof data.text !== "string" || data.text.trim() === "") {
    throw new Error("The fact was missing its text.");
  }

  return {
    id: data.id,
    text: data.text.trim(),
    source: typeof data.source === "string" && data.source !== "" ? data.source : "Unknown source",
    sourceUrl: safeWebUrl(data.source_url),
    language: typeof data.language === "string" ? data.language : "unknown",
    kind: kind,
  };
}

class FactCard extends HTMLElement {
  static observedAttributes = ["compact"];

  constructor() {
    super();
    this.facts = [STARTER_FACT];
    this.currentIndex = 0;
    this.loading = false;
    this.built = false;
  }

  connectedCallback() {
    if (!this.built) {
      this.buildInterface();
      this.built = true;
    }
    this.showCurrentFact();
    this.updateView();
    this.setStatus("Showing a sample fact. Choose a fact type and press Get a fact for a live one.", "ok");
  }

  attributeChangedCallback(name) {
    if (name === "compact" && this.built) {
      this.updateView();
    }
  }

  buildInterface() {
    this.replaceChildren();

    const heading = document.createElement("h2");
    heading.textContent = "Useless Fact Finder";
    this.appendChild(heading);

    this.viewLabel = document.createElement("p");
    this.viewLabel.className = "fact-view-label";
    this.appendChild(this.viewLabel);

    const chooser = document.createElement("p");
    chooser.className = "fact-chooser";
    const selectLabel = document.createElement("label");
    selectLabel.htmlFor = "fact-kind";
    selectLabel.textContent = "Fact type";
    this.kindSelect = document.createElement("select");
    this.kindSelect.id = "fact-kind";
    this.kindSelect.append(
      new Option("Random fact", "random"),
      new Option("Today's fact", "today")
    );
    chooser.append(selectLabel, this.kindSelect);
    this.appendChild(chooser);

    // Where current fact is displayed
    this.display = document.createElement("article");
    this.display.className = "fact-display";

    this.factText = document.createElement("p");
    this.factText.className = "fact-text";
    this.display.appendChild(this.factText);

    this.details = document.createElement("dl");
    this.details.className = "fact-details";
    this.kindValue = this.addDetail("Type");
    this.sourceValue = this.addDetail("Source");
    this.languageValue = this.addDetail("Language");
    this.display.appendChild(this.details);

    this.appendChild(this.display);

    const controls = document.createElement("div");
    controls.className = "fact-controls";

    this.previousButton = document.createElement("button");
    this.previousButton.type = "button";
    this.previousButton.textContent = "Previous fact";
    this.previousButton.addEventListener("click", () => this.move(-1));

    this.getButton = document.createElement("button");
    this.getButton.type = "button";
    this.getButton.className = "fact-get";
    this.getButton.textContent = "Get a fact";
    this.getButton.addEventListener("click", () => this.requestFact());

    this.nextButton = document.createElement("button");
    this.nextButton.type = "button";
    this.nextButton.textContent = "Next fact";
    this.nextButton.addEventListener("click", () => this.move(1));

    controls.append(this.previousButton, this.getButton, this.nextButton);
    this.appendChild(controls);

    this.status = document.createElement("p");
    this.status.className = "fact-status";
    this.status.setAttribute("role", "status");
    this.appendChild(this.status);
  }

  addDetail(label) {
    const term = document.createElement("dt");
    term.textContent = label;
    const value = document.createElement("dd");
    this.details.append(term, value);
    return value;
  }

  setStatus(message, state) {
    this.status.textContent = message;
    this.status.dataset.state = state;
  }

  move(step) {
    const count = this.facts.length;
    this.currentIndex = (this.currentIndex + step + count) % count;
    this.showCurrentFact();
    this.setStatus(`Showing fact ${this.currentIndex + 1} of ${count}.`, "ok");
  }

  showCurrentFact() {
    const fact = this.facts[this.currentIndex];

    this.factText.textContent = fact.text;

    const kindNames = { random: "Random fact", today: "Today's fact", sample: "Sample fact" };
    this.kindValue.textContent = kindNames[fact.kind];

    if (fact.sourceUrl) {
      const link = document.createElement("a");
      link.href = fact.sourceUrl;
      link.textContent = fact.source;
      this.sourceValue.replaceChildren(link);
    } else {
      this.sourceValue.textContent = fact.source;
    }

    this.languageValue.textContent = fact.language.toUpperCase();

    const onlyOne = this.facts.length < 2;
    this.previousButton.disabled = onlyOne;
    this.nextButton.disabled = onlyOne;
  }

  updateView() {
    const compact = this.hasAttribute("compact");
    this.details.hidden = compact;
    this.viewLabel.textContent = compact
      ? "Compact view: type, source, and language are hidden."
      : "Expanded view: showing type, source, and language.";
  }

  async requestFact() {
    if (this.loading) {
      return;
    }

    const kind = this.kindSelect.value === "today" ? "today" : "random";
    const kindName = kind === "today" ? "today's fact" : "a random fact";

    this.loading = true;
    this.getButton.setAttribute("aria-disabled", "true");
    this.kindSelect.disabled = true;
    this.display.setAttribute("aria-busy", "true");
    this.setStatus(`Loading ${kindName}…`, "loading");

    // Give up if it takes too long
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${FACTS_API}/${kind}?language=en`, {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`The fact server responded with an error (status ${response.status}).`);
      }

      let data;
      try {
        data = await response.json();
      } catch (error) {
        throw new Error("The fact server sent a response that wasn't valid JSON.");
      }

      const fact = readFact(data, kind);

      // Don't add today's fact twice
      const existing = this.facts.findIndex((f) => f.id === fact.id);
      if (existing !== -1) {
        this.currentIndex = existing;
        this.showCurrentFact();
        this.setStatus(
          `That fact was already loaded, here is it again. Showing fact ${existing + 1} of ${this.facts.length}.`,
          "ok"
        );
      } else {
        this.facts.push(fact);
        this.currentIndex = this.facts.length - 1;
        this.showCurrentFact();
        this.setStatus(
          `Loaded ${kindName}. Showing fact ${this.currentIndex + 1} of ${this.facts.length}.`,
          "ok"
        );
      }

      this.getButton.textContent = "Get a fact";
    } catch (error) {
      let reason = error.message;
      if (error.name === "AbortError") {
        reason = "The request took too long.";
      } else if (error instanceof TypeError) {
        reason = "Couldn't reach the fact server. Check your internet connection.";
      }
      this.setStatus(`Couldn't load ${kindName}. ${reason} Press Try again to retry.`, "error");
      this.getButton.textContent = "Try again";
    } finally {
      clearTimeout(timer);
      this.loading = false;
      this.getButton.removeAttribute("aria-disabled");
      this.kindSelect.disabled = false;
      this.display.removeAttribute("aria-busy");
    }
  }
}

customElements.define("fact-card", FactCard);

const VIEW_STORAGE_KEY = "hw5-fact-card-mode";
const VIEW_MODES = ["compact", "expanded"];
const DEFAULT_VIEW_MODE = "expanded";

const viewToggle = document.getElementById("fact-view-toggle");
const factCard = document.querySelector("fact-card");

function readSavedViewMode() {
  try {
    const saved = localStorage.getItem(VIEW_STORAGE_KEY);
    return VIEW_MODES.includes(saved) ? saved : DEFAULT_VIEW_MODE;
  } catch (error) {
    return DEFAULT_VIEW_MODE;
  }
}

function saveViewMode(mode) {
  try {
    localStorage.setItem(VIEW_STORAGE_KEY, mode);
  } catch (error) {
    
  }
}

if (viewToggle && factCard) {
  function updateToggleLabel() {
    viewToggle.textContent = factCard.hasAttribute("compact")
      ? "Switch to expanded view"
      : "Switch to compact view";
  }
  
   function applyViewMode(mode) {
    factCard.toggleAttribute("compact", mode === "compact");
    updateToggleLabel();
  }

  viewToggle.addEventListener("click", () => {
    const newMode = factCard.hasAttribute("compact") ? "expanded" : "compact";
    applyViewMode(newMode);
    saveViewMode(newMode);
  });

  applyViewMode(readSavedViewMode());
  viewToggle.hidden = false;
}
