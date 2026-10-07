/*
 * Portfolio page extras for the dark theme.
 *
 * - Marks each project card with its category, so the stylesheet can colour it.
 * - Shows a project count on every filter pill.
 * - Replays the card entrance when a filter is chosen.
 * - Drives the coordinate readout in the page header area.
 *
 * The project list itself is rendered by portfolio.js and works without
 * this file. Scroll reveal and card tilt live in theme-fx.js.
 */
(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const grid = document.querySelector("[data-portfolio-grid]");
  const filters = document.querySelector("[data-project-filters]");
  const categories = ["land-records", "spatial-planning", "remote-sensing", "web-gis"];

  function prepareCard(card) {
    if (!(card instanceof HTMLElement) || card.dataset.category) {
      return;
    }
    const key = card.querySelector(".category-key");
    const category = categories.find((name) => key?.classList.contains(`category-${name}`));
    if (category) {
      card.dataset.category = category;
    }
  }

  function updatePillCounts() {
    if (!grid || !filters) {
      return;
    }
    const cards = [...grid.children];
    for (const pill of filters.querySelectorAll("[data-project-filter]")) {
      const filter = pill.dataset.projectFilter;
      const count = filter === "all"
        ? cards.length
        : cards.filter((card) => card.dataset.category === filter).length;
      let badge = pill.querySelector(".pill-count");
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "pill-count";
        pill.append(badge);
      }
      badge.textContent = String(count);
      badge.setAttribute("aria-label", `${count} ${count === 1 ? "project" : "projects"}`);
    }
  }

  if (grid) {
    [...grid.children].forEach(prepareCard);
    if (grid.children.length > 0) {
      updatePillCounts();
    }
    new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach(prepareCard);
      }
      updatePillCounts();
    }).observe(grid, { childList: true });
  }

  // When a filter is chosen, replay the entrance on the cards that remain.
  filters?.addEventListener("click", (event) => {
    if (reducedMotion.matches || !grid || !(event.target instanceof Element) || !event.target.closest("[data-project-filter]")) {
      return;
    }
    const shown = [...grid.children].filter((card) => !card.hidden && card.classList.contains("reveal"));
    for (const card of shown) {
      card.classList.remove("is-visible");
    }
    void grid.offsetWidth;
    shown.forEach((card, index) => {
      card.style.setProperty("--reveal-delay", `${Math.min(index, 11) * 45}ms`);
      card.classList.add("is-visible");
    });
  });

  /* ------------------------------------------------------ coordinate readout */

  const hero = document.querySelector("[data-hero]");
  const label = document.querySelector("[data-readout-label]");
  const latitude = document.querySelector("[data-readout-lat]");
  const longitude = document.querySelector("[data-readout-lon]");
  if (!hero || !label || !latitude || !longitude) {
    return;
  }

  // The header area stands in for a map of Punjab: left to right is west to east.
  const bounds = { north: 34.0, south: 27.7, west: 69.3, east: 75.4 };
  const home = { label: "Lahore", lat: 31.5204, lon: 74.3587 };

  function show(name, lat, lon) {
    label.textContent = name;
    latitude.textContent = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? "N" : "S"}`;
    longitude.textContent = `${Math.abs(lon).toFixed(4)}° ${lon >= 0 ? "E" : "W"}`;
  }

  hero.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") {
      return;
    }
    const box = hero.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width;
    const y = (event.clientY - box.top) / box.height;
    show("Cursor", bounds.north - y * (bounds.north - bounds.south), bounds.west + x * (bounds.east - bounds.west));
  });
  hero.addEventListener("pointerleave", () => show(home.label, home.lat, home.lon));
  show(home.label, home.lat, home.lon);
})();
