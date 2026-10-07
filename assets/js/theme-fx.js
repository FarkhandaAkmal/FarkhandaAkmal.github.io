/*
 * Site-wide interface effects for the dark theme.
 *
 * - Scroll reveal for panels and cards, including ones added later by the
 *   page scripts.
 * - Pointer-driven tilt and light on project cards.
 * - Resume: the timeline "route" fills in as the page scrolls.
 *
 * All of it is decoration. Pages work without this file, and nothing here
 * runs its animations when the visitor prefers reduced motion.
 */
(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  /* ---------------------------------------------------------------- reveal */

  const revealSelector = [
    "[data-reveal]",
    ".glance-grid",
    ".about-preview",
    ".highlight-carousel",
    ".latest-grid",
    ".latest-copy",
    ".publication-entry",
    ".about-profile",
    ".terms-block",
    ".article-card",
    ".education-card",
    ".timeline-item",
    ".resume-project-list li",
    ".skill-group",
    ".training-panel",
    ".publication-card",
    ".contact-grid",
    ".portfolio-card",
    ".project-facts",
    ".project-location",
    ".project-description",
    ".project-delivered",
    ".project-role",
    ".gallery-open",
    ".contact-inner",
    "#work-map",
  ].join(",");

  if ("IntersectionObserver" in window && !reducedMotion.matches) {
    root.classList.add("fx-ready");
    const observer = new IntersectionObserver(
      (entries) => {
        // Elements that arrive together are staggered in reading order.
        const entering = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top
            || a.boundingClientRect.left - b.boundingClientRect.left);
        entering.forEach((entry, index) => {
          entry.target.style.setProperty("--reveal-delay", `${Math.min(index, 8) * 70}ms`);
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
    );

    const pending = new Set();
    const watch = (element) => {
      if (!(element instanceof HTMLElement) || element.dataset.revealBound === "true") {
        return;
      }
      element.dataset.revealBound = "true";
      element.classList.add("reveal");
      pending.add(element);
      observer.observe(element);
    };

    // Safety net: after a fast scroll or a jump (End key, in-page link), show
    // anything that is now on screen or above it, so nothing stays hidden.
    let settleTimer = 0;
    window.addEventListener("scroll", () => {
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        for (const element of pending) {
          if (element.classList.contains("is-visible")) {
            pending.delete(element);
          } else if (element.getBoundingClientRect().top < window.innerHeight) {
            element.classList.add("is-visible");
            observer.unobserve(element);
            pending.delete(element);
          }
        }
      }, 180);
    }, { passive: true });

    document.querySelectorAll(revealSelector).forEach(watch);
    new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) {
            continue;
          }
          if (node.matches(revealSelector)) {
            watch(node);
          }
          node.querySelectorAll(revealSelector).forEach(watch);
        }
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  /* ------------------------------------------------------------- card tilt */

  const maxTilt = 5;
  let tilted = null;

  function releaseTilt() {
    if (!tilted) {
      return;
    }
    tilted.classList.remove("is-tilting");
    tilted.style.removeProperty("--tilt-x");
    tilted.style.removeProperty("--tilt-y");
    tilted = null;
  }

  document.addEventListener("pointermove", (event) => {
    if (!finePointer.matches || reducedMotion.matches) {
      return;
    }
    const card = event.target instanceof Element ? event.target.closest(".portfolio-card") : null;
    if (card !== tilted) {
      releaseTilt();
      tilted = card;
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
  }, { passive: true });
  root.addEventListener("pointerleave", releaseTilt);

  /* ------------------------------------------------- resume: GPS route line */

  const timeline = document.querySelector(".timeline");
  if (timeline) {
    const items = [...timeline.querySelectorAll(".timeline-item")];
    let queued = false;

    function updateRoute() {
      queued = false;
      const box = timeline.getBoundingClientRect();
      // The "vehicle" is 62% of the way down the window.
      const marker = window.innerHeight * 0.62;
      const progress = reducedMotion.matches
        ? 1
        : Math.min(1, Math.max(0, (marker - box.top) / Math.max(1, box.height)));
      timeline.style.setProperty("--route-progress", progress.toFixed(4));
      timeline.classList.toggle("is-complete", progress >= 0.999);
      for (const item of items) {
        const itemBox = item.getBoundingClientRect();
        const waypoint = itemBox.top + itemBox.height / 2;
        item.classList.toggle("is-reached", reducedMotion.matches || waypoint <= marker + 1);
      }
    }

    function requestUpdate() {
      if (!queued) {
        queued = true;
        window.requestAnimationFrame(updateRoute);
      }
    }

    root.classList.add("route-ready");
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    updateRoute();
  }
})();
