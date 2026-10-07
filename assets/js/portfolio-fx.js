/*
 * Visual effects for the portfolio page (night theme).
 *
 * - Hero: an animated survey network on a canvas, with a coordinate readout
 *   that follows the pointer.
 * - Cards: category colour, pointer-driven tilt and light.
 * - Filter pills: per-category project counts.
 * - Scroll reveal for sections and cards.
 *
 * Everything here is decoration. The project list itself is rendered by
 * portfolio.js and works without this file.
 */
(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const grid = document.querySelector("[data-portfolio-grid]");
  const filters = document.querySelector("[data-project-filters]");

  /* ---------------------------------------------------------------- reveal */

  const canReveal = "IntersectionObserver" in window && !reducedMotion.matches;
  let revealObserver = null;

  if (canReveal) {
    root.classList.add("fx-ready");
    revealObserver = new IntersectionObserver(
      (entries) => {
        // Elements that enter together are staggered left to right, top to bottom.
        const entering = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top
            || a.boundingClientRect.left - b.boundingClientRect.left);
        entering.forEach((entry, index) => {
          entry.target.style.setProperty("--reveal-delay", `${Math.min(index, 8) * 80}ms`);
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    for (const element of document.querySelectorAll("[data-reveal]")) {
      element.classList.add("reveal");
      revealObserver.observe(element);
    }
  }

  /* ----------------------------------------------------------------- cards */

  const categories = ["land-records", "spatial-planning", "remote-sensing", "web-gis"];

  function cardCategory(card) {
    const key = card.querySelector(".category-key");
    return categories.find((category) => key?.classList.contains(`category-${category}`)) || "";
  }

  function prepareCard(card) {
    if (!(card instanceof HTMLElement) || card.dataset.fx === "ready") {
      return;
    }
    card.dataset.fx = "ready";
    const category = cardCategory(card);
    if (category) {
      card.dataset.category = category;
    }
    if (revealObserver) {
      card.classList.add("reveal");
      revealObserver.observe(card);
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

    // Tilt the card toward the pointer and move the light across the glass.
    const maxTilt = 5;
    let tiltedCard = null;

    function releaseTilt() {
      if (!tiltedCard) {
        return;
      }
      tiltedCard.classList.remove("is-tilting");
      tiltedCard.style.removeProperty("--tilt-x");
      tiltedCard.style.removeProperty("--tilt-y");
      tiltedCard = null;
    }

    grid.addEventListener("pointermove", (event) => {
      if (!finePointer.matches || reducedMotion.matches) {
        return;
      }
      const card = event.target instanceof Element ? event.target.closest(".portfolio-card") : null;
      if (card !== tiltedCard) {
        releaseTilt();
        tiltedCard = card;
      }
      if (!card) {
        return;
      }
      const box = card.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width;
      const y = (event.clientY - box.top) / box.height;
      card.classList.add("is-tilting");
      card.style.setProperty("--tilt-x", `${((0.5 - y) * 2 * maxTilt).toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${((x - 0.5) * 2 * maxTilt).toFixed(2)}deg`);
      card.style.setProperty("--light-x", `${(x * 100).toFixed(1)}%`);
      card.style.setProperty("--light-y", `${(y * 100).toFixed(1)}%`);
    });
    grid.addEventListener("pointerleave", releaseTilt);
  }

  // When a filter is chosen, replay the entrance on the cards that remain.
  filters?.addEventListener("click", (event) => {
    if (!revealObserver || !grid || !(event.target instanceof Element) || !event.target.closest("[data-project-filter]")) {
      return;
    }
    const shown = [...grid.children].filter((card) => !card.hidden);
    for (const card of shown) {
      revealObserver.unobserve(card);
      card.classList.remove("is-visible");
    }
    void grid.offsetWidth;
    shown.forEach((card, index) => {
      card.style.setProperty("--reveal-delay", `${Math.min(index, 11) * 45}ms`);
      card.classList.add("reveal", "is-visible");
    });
  });

  /* ------------------------------------------------------------------ hero */

  const hero = document.querySelector("[data-hero]");
  const canvas = document.querySelector("[data-hero-canvas]");
  const readoutLabel = document.querySelector("[data-readout-label]");
  const readoutLat = document.querySelector("[data-readout-lat]");
  const readoutLon = document.querySelector("[data-readout-lon]");
  const context = canvas?.getContext("2d");
  if (!hero || !canvas || !context) {
    return;
  }

  // The hero stands in for a map of Punjab: left to right is west to east.
  const bounds = { north: 34.0, south: 27.7, west: 69.3, east: 75.4 };
  const home = { label: "Lahore", lat: 31.5204, lon: 74.3587 };
  const linkDistance = 150;
  const pointerDistance = 190;
  const sweepSeconds = 12;

  let width = 0;
  let height = 0;
  let nodes = [];
  let pointer = null;
  let frame = 0;
  let running = false;
  let inView = true;
  let lastTime = 0;
  let sweep = 0.15;

  function showCoordinates(label, lat, lon) {
    if (!readoutLabel || !readoutLat || !readoutLon) {
      return;
    }
    readoutLabel.textContent = label;
    readoutLat.textContent = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? "N" : "S"}`;
    readoutLon.textContent = `${Math.abs(lon).toFixed(4)}° ${lon >= 0 ? "E" : "W"}`;
  }

  function seedNodes() {
    const count = Math.round(Math.min(74, Math.max(24, (width * height) / 20000)));
    nodes = Array.from({ length: count }, (_, index) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 9,
      vy: (Math.random() - 0.5) * 9,
      radius: 1 + Math.random() * 1.5,
      // Every fifth point is a "control point" drawn in emerald.
      control: index % 5 === 0,
    }));
  }

  function resize() {
    const box = hero.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, Math.round(box.width));
    height = Math.max(1, Math.round(box.height));
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    seedNodes();
    draw(0);
  }

  function draw(delta) {
    context.clearRect(0, 0, width, height);

    for (const node of nodes) {
      node.x += node.vx * delta;
      node.y += node.vy * delta;
      if (node.x < -20) node.x = width + 20;
      if (node.x > width + 20) node.x = -20;
      if (node.y < -20) node.y = height + 20;
      if (node.y > height + 20) node.y = -20;
    }

    // Satellite swath: a soft band that crosses the hero from west to east.
    sweep = (sweep + delta / sweepSeconds) % 1;
    const sweepX = (sweep * 1.5 - 0.25) * width;
    const band = Math.max(140, width * 0.14);
    const swath = context.createLinearGradient(sweepX - band, 0, sweepX, 0);
    swath.addColorStop(0, "rgba(34, 228, 242, 0)");
    swath.addColorStop(1, "rgba(34, 228, 242, 0.075)");
    context.fillStyle = swath;
    context.fillRect(sweepX - band, 0, band, height);
    context.fillStyle = "rgba(125, 243, 251, 0.34)";
    context.fillRect(sweepX, 0, 1, height);

    // Links between neighbouring points.
    context.lineWidth = 1;
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i];
        const b = nodes[j];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance < linkDistance) {
          context.strokeStyle = `rgba(120, 215, 255, ${(1 - distance / linkDistance) * 0.2})`;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
      }
    }

    // Links from the pointer to the points around it.
    if (pointer) {
      for (const node of nodes) {
        const distance = Math.hypot(node.x - pointer.x, node.y - pointer.y);
        if (distance < pointerDistance) {
          context.strokeStyle = `rgba(46, 242, 160, ${(1 - distance / pointerDistance) * 0.55})`;
          context.beginPath();
          context.moveTo(pointer.x, pointer.y);
          context.lineTo(node.x, node.y);
          context.stroke();
        }
      }
      context.strokeStyle = "rgba(234, 244, 255, 0.75)";
      context.beginPath();
      context.moveTo(pointer.x - 9, pointer.y);
      context.lineTo(pointer.x + 9, pointer.y);
      context.moveTo(pointer.x, pointer.y - 9);
      context.lineTo(pointer.x, pointer.y + 9);
      context.stroke();
    }

    // Points. Those just behind the swath line light up as it passes.
    for (const node of nodes) {
      const behind = sweepX - node.x;
      const lit = behind >= 0 && behind < band ? 1 - behind / band : 0;
      const colour = node.control ? "46, 242, 160" : "34, 228, 242";
      if (lit > 0.02) {
        context.strokeStyle = `rgba(${colour}, ${lit * 0.55})`;
        context.beginPath();
        context.arc(node.x, node.y, node.radius + 3 + (1 - lit) * 12, 0, Math.PI * 2);
        context.stroke();
      }
      context.fillStyle = `rgba(${colour}, ${0.5 + lit * 0.5})`;
      context.beginPath();
      context.arc(node.x, node.y, node.radius + lit * 1.2, 0, Math.PI * 2);
      context.fill();
    }
  }

  function tick(time) {
    const delta = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    draw(delta);
    frame = window.requestAnimationFrame(tick);
  }

  function setRunning(shouldRun) {
    const next = shouldRun && !reducedMotion.matches;
    if (next === running) {
      return;
    }
    running = next;
    window.cancelAnimationFrame(frame);
    if (running) {
      lastTime = performance.now();
      frame = window.requestAnimationFrame(tick);
    }
  }

  function refreshRunning() {
    setRunning(inView && !document.hidden);
  }

  hero.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") {
      return;
    }
    const box = hero.getBoundingClientRect();
    pointer = { x: event.clientX - box.left, y: event.clientY - box.top };
    const lat = bounds.north - (pointer.y / box.height) * (bounds.north - bounds.south);
    const lon = bounds.west + (pointer.x / box.width) * (bounds.east - bounds.west);
    showCoordinates("Cursor", lat, lon);
    if (!running) {
      draw(0);
    }
  });

  hero.addEventListener("pointerleave", () => {
    pointer = null;
    showCoordinates(home.label, home.lat, home.lon);
    if (!running) {
      draw(0);
    }
  });

  if ("ResizeObserver" in window) {
    new ResizeObserver(resize).observe(hero);
  } else {
    window.addEventListener("resize", resize);
    resize();
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      inView = entries[entries.length - 1].isIntersecting;
      refreshRunning();
    }).observe(hero);
  }
  document.addEventListener("visibilitychange", refreshRunning);
  reducedMotion.addEventListener?.("change", refreshRunning);

  showCoordinates(home.label, home.lat, home.lon);
  refreshRunning();
})();
