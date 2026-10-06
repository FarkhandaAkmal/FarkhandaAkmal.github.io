const root = document.documentElement;
root.classList.add("js");

const header = document.querySelector("[data-site-header]");
const backToTop = document.querySelector("[data-back-to-top]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const siteNavigation = document.querySelector("#site-navigation");

function setMenuOpen(isOpen) {
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  siteNavigation.dataset.open = String(isOpen);
}

menuToggle.addEventListener("click", () => {
  setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
});

siteNavigation.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement && window.matchMedia("(max-width: 900px)").matches) {
    setMenuOpen(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    setMenuOpen(false);
    menuToggle.focus();
  }
});

function updateScrollControls() {
  const isScrolled = window.scrollY > 12;
  header.classList.toggle("is-scrolled", isScrolled);
  backToTop.classList.toggle("is-visible", window.scrollY > 500);
}

window.addEventListener("scroll", updateScrollControls, { passive: true });
window.addEventListener("resize", () => {
  if (window.innerWidth > 900) {
    setMenuOpen(false);
  }
});
backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
updateScrollControls();

const today = new Date();
document.querySelector("[data-current-year]").textContent = String(today.getFullYear());

const experienceNode = document.querySelector("[data-experience-years]");
const [startYear, startMonth] = experienceNode.dataset.startDate.split("-").map(Number);
let yearsInPractice = today.getFullYear() - startYear;
if (today.getMonth() + 1 < startMonth) {
  yearsInPractice -= 1;
}
experienceNode.textContent = `Working in GIS since ${startYear} · ${yearsInPractice} years`;

for (const emailLink of document.querySelectorAll("[data-mail-user][data-mail-domain]")) {
  const address = `${emailLink.dataset.mailUser}@${emailLink.dataset.mailDomain}`;
  emailLink.href = `mailto:${address}`;
}

const artDrawings = [
  `<svg viewBox="0 0 480 360" role="img" aria-label="Fictional cadastral illustration, not project imagery" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="360" fill="#2f3e50"/><path d="M0 0h480v360H0z" fill="url(#g1)"/><g fill="none" stroke="#f4f6f9" stroke-width="2"><path d="m38 42 110-18 25 88-121 11zM148 24l118 16-8 87-85-15zM266 40l167-17 7 91-181 13zM52 123l121-11 18 101-133 5zM173 112l85 15 29 92-96-6zM258 127l181-13 8 94-160 11zM58 218l133-5 20 105-128-10zM191 213l96 6 35 100-111-1zM287 219l160-11-18 104-107 7z"/></g><path d="M10 177c99-27 151 7 241-17s142-27 221-11" fill="none" stroke="#ebd3e0" stroke-width="11" stroke-linecap="round"/><defs><pattern id="g1" width="26" height="26" patternUnits="userSpaceOnUse"><path d="M26 0H0V26" fill="none" stroke="#ffffff" stroke-opacity=".08"/></pattern></defs></svg>`,
  `<svg viewBox="0 0 480 360" role="img" aria-label="Fictional cadastral illustration, not project imagery" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="360" fill="#222e3c"/><g fill="#9c1f6b" fill-opacity=".28" stroke="#f4f6f9" stroke-width="2"><path d="m42 45 144-15 14 104-146 13z"/><path d="m186 30 98 18-13 86-85 0z"/><path d="m284 48 150-18 10 107-173-3z"/><path d="m54 147 146-13 18 94-155 14z"/><path d="m200 134 85 0 22 94-89 0z"/><path d="m285 134 159 3 5 91-142 4z"/><path d="m63 242 155-14 19 98-150-3z"/><path d="m218 228 89 0 35 99-105-1z"/><path d="m307 228 142-4-12 102-95 1z"/></g><path d="M20 214c89-29 142-9 212-36s132-21 227-42" fill="none" stroke="#eaac8b" stroke-width="7" stroke-dasharray="8 8"/></svg>`,
  `<svg viewBox="0 0 480 360" role="img" aria-label="Fictional cadastral illustration, not project imagery" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="360" fill="#2f3e50"/><g fill="none" stroke="#ebd3e0" stroke-width="2"><path d="M38 35 165 47 151 140 49 129zM165 47l121-22 22 107-157 8zM286 25l148 25-8 87-118-5zM49 129l102 11-15 109-112-10zM151 140l157-8 14 105-176 12zM308 132l118 5 8 111-112-11zM24 239l112 10 19 75-135-11zM145 249l176-12 23 89-189-2zM321 237l112 11 8 79-97-1z"/></g><path d="M7 184c106 17 145-27 234-18s145 22 232-2" fill="none" stroke="#eaac8b" stroke-width="12" stroke-linecap="round"/><g fill="#f4f6f9" font-family="sans-serif" font-size="12"><text x="83" y="98">01</text><text x="227" y="99">02</text><text x="358" y="99">03</text></g></svg>`,
  `<svg viewBox="0 0 480 360" role="img" aria-label="Fictional cadastral illustration, not project imagery" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="360" fill="#222e3c"/><g fill="#ebd3e0" fill-opacity=".12" stroke="#f4f6f9" stroke-width="2"><path d="m35 37 170 4-16 94-137 8z"/><path d="m205 41 92-15 20 105-128 4z"/><path d="m297 26 140 24-12 91-108-10z"/><path d="m52 143 137-8 5 111-131 7z"/><path d="m189 135 128-4 20 115-150 0z"/><path d="m317 131 108 10 2 105-110 0z"/><path d="m63 253 131-7 12 76-125 5z"/><path d="m194 246 150 0 19 74-257 2z"/><path d="m344 246 83 0-7 75h-57z"/></g><path d="M2 218c103-24 155-4 241-32s139-15 235-39" fill="none" stroke="#9c1f6b" stroke-width="10" stroke-opacity=".9"/></svg>`,
];
let artInstance = 0;

function artFor(index, className) {
  const holder = document.createElement("div");
  holder.className = className;
  const uniquePatternId = `parcel-pattern-${artInstance}`;
  artInstance += 1;
  holder.innerHTML = artDrawings[index % artDrawings.length].replace(/g1/g, uniquePatternId);
  return holder.firstElementChild;
}

function projectVisual(project, index, className, loading = "lazy") {
  const imageData = project.images?.[0];
  if (!imageData) {
    const illustration = artFor(index, className);
    illustration.classList.add("work-art");
    return illustration;
  }

  const validatedImage = window.validateProjectImageRecord(imageData, project.title);
  const image = document.createElement("img");
  image.className = className;
  image.src = validatedImage.thumbnail || validatedImage.src;
  image.alt = validatedImage.alt;
  image.loading = loading;
  image.decoding = "async";
  image.width = validatedImage.thumbnail ? validatedImage.thumbnailWidth : validatedImage.width;
  image.height = validatedImage.thumbnail ? validatedImage.thumbnailHeight : validatedImage.height;
  image.addEventListener("error", () => {
    console.error(`Unable to load the project image for "${project.title}".`);
    image.replaceWith(artFor(index, className));
    const error = document.querySelector("[data-projects-error]");
    error.hidden = false;
    error.textContent = `A project image for "${project.title}" could not be loaded. An illustration is shown instead.`;
  }, { once: true });
  return image;
}

function categoryLabel(category) {
  const labels = {
    "land-records": "Land records",
    "spatial-planning": "Spatial planning",
    "remote-sensing": "Remote sensing",
    "web-gis": "Web GIS",
  };
  return labels[category] || "GIS";
}

function renderFeaturedProjects(projects) {
  const featuredIds = ["pulse", "punjab-spatial-strategy", "uipt", "railways-land"];
  const featured = featuredIds.map((id) => projects.find((project) => project.id === id && project.confirmed));
  if (featured.some((project) => !project)) {
    throw new Error("One or more confirmed featured projects are missing.");
  }

  const slides = document.querySelector("[data-highlight-slides]");
  const dots = document.querySelector("[data-carousel-dots]");
  const latestWork = document.querySelector("[data-latest-work]");

  featured.forEach((project, index) => {
    const slide = document.createElement("article");
    slide.className = `highlight-slide${index === 0 ? " is-active" : ""}`;
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-roledescription", "slide");
    slide.setAttribute("aria-label", `${index + 1} of ${featured.length}`);
    slide.setAttribute("aria-hidden", String(index !== 0));

    const copy = document.createElement("div");
    copy.className = "highlight-copy";
    const title = document.createElement("h3");
    title.textContent = project.title;
    const subtitle = document.createElement("p");
    subtitle.className = "highlight-subtitle";
    subtitle.textContent = `${categoryLabel(project.category)} · ${project.period || "Project period not specified"}`;
    const summary = document.createElement("p");
    summary.className = "highlight-description";
    summary.textContent = project.summary.split(". ").slice(0, 2).join(". ") + ".";
    const link = document.createElement("a");
    link.className = "pill-button pill-button-outline";
    link.href = `project.html?id=${encodeURIComponent(project.id)}`;
    link.textContent = `More about ${project.title}`;
    copy.append(title, subtitle, summary, link);

    const figure = document.createElement("figure");
    figure.className = "highlight-image";
    figure.append(projectVisual(project, index, "highlight-art-image", "eager"));
    const credit = document.createElement("figcaption");
    credit.className = "image-credit";
    credit.textContent = project.images?.[0]?.caption || "Illustrative graphic · not project imagery";
    figure.append(credit);
    slide.append(copy, figure);
    slides.append(slide);

    const dot = document.createElement("button");
    dot.className = "carousel-dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Show project ${index + 1}: ${project.title}`);
    dot.setAttribute("aria-current", String(index === 0));
    dot.dataset.slideTo = String(index);
    dots.append(dot);

    const card = document.createElement("a");
    card.className = "work-tile";
    card.href = `project.html?id=${encodeURIComponent(project.id)}`;
    card.setAttribute("aria-label", `${project.title}. ${project.client}.`);
    const art = projectVisual(project, index, "work-art");
    card.append(art);
    const overlay = document.createElement("span");
    overlay.className = "work-overlay";
    const cardTitle = document.createElement("strong");
    cardTitle.textContent = project.title;
    const client = document.createElement("span");
    client.textContent = project.client;
    overlay.append(cardTitle, client);
    const caption = document.createElement("span");
    caption.className = "work-caption";
    caption.textContent = project.title;
    card.append(overlay, caption);
    latestWork.append(card);
  });

  initializeCarousel(slides, dots, featured.length);
}

function initializeCarousel(slides, dots, slideCount) {
  const carousel = document.querySelector("[data-carousel]");
  const slideNodes = [...slides.children];
  const dotNodes = [...dots.children];
  const counter = document.querySelector("[data-slide-counter]");
  const previous = document.querySelector("[data-slide-previous]");
  const next = document.querySelector("[data-slide-next]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeIndex = 0;
  let timer = null;
  let pointerStart = null;

  function showSlide(index) {
    activeIndex = (index + slideCount) % slideCount;
    slideNodes.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });
    dotNodes.forEach((dot, dotIndex) => {
      dot.setAttribute("aria-current", String(dotIndex === activeIndex));
    });
    counter.textContent = `${activeIndex + 1} / ${slideCount}`;
  }

  function stopTimer() {
    window.clearInterval(timer);
    timer = null;
  }

  function startTimer() {
    stopTimer();
    if (!reducedMotion.matches && !carousel.matches(":hover, :focus-within")) {
      timer = window.setInterval(() => showSlide(activeIndex + 1), 7000);
    }
  }

  previous.addEventListener("click", () => {
    showSlide(activeIndex - 1);
    startTimer();
  });
  next.addEventListener("click", () => {
    showSlide(activeIndex + 1);
    startTimer();
  });
  dots.addEventListener("click", (event) => {
    const dot = event.target.closest("[data-slide-to]");
    if (dot) {
      showSlide(Number(dot.dataset.slideTo));
      startTimer();
    }
  });
  carousel.addEventListener("mouseenter", stopTimer);
  carousel.addEventListener("mouseleave", startTimer);
  carousel.addEventListener("focusin", stopTimer);
  carousel.addEventListener("focusout", (event) => {
    if (!carousel.contains(event.relatedTarget)) {
      startTimer();
    }
  });
  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showSlide(activeIndex - 1);
      startTimer();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      showSlide(activeIndex + 1);
      startTimer();
    }
  });
  carousel.addEventListener("touchstart", (event) => {
    pointerStart = event.changedTouches[0].clientX;
    stopTimer();
  }, { passive: true });
  carousel.addEventListener("touchend", (event) => {
    if (pointerStart === null) {
      return;
    }
    const distance = event.changedTouches[0].clientX - pointerStart;
    if (Math.abs(distance) > 45) {
      showSlide(activeIndex + (distance < 0 ? 1 : -1));
    }
    pointerStart = null;
    startTimer();
  }, { passive: true });
  reducedMotion.addEventListener("change", startTimer);
  showSlide(0);
  startTimer();
}

function renderFeaturedPublication(publications) {
  const publication = publications.find((item) => item.id === "sialkot-urban-sprawl-2022" && item.confirmed);
  if (!publication) {
    throw new Error("The confirmed featured Sialkot publication is missing.");
  }

  const container = document.querySelector("[data-featured-publication]");
  const label = document.createElement("p");
  label.className = "publication-label";
  label.textContent = `${publication.year} · First author`;
  const title = document.createElement("h3");
  title.textContent = publication.title;

  const authors = document.createElement("p");
  authors.className = "publication-authors";
  publication.authors.forEach((author, index) => {
    if (index > 0) {
      authors.append(document.createTextNode(", "));
    }
    if (author.is_farkhanda) {
      const emphasized = document.createElement("strong");
      emphasized.textContent = author.name;
      authors.append(emphasized);
    } else {
      authors.append(document.createTextNode(author.name));
    }
  });

  const venue = document.createElement("p");
  venue.className = "publication-venue";
  venue.textContent = `${publication.venue}, ${publication.volume_pages}`;
  const actions = document.createElement("div");
  actions.className = "publication-actions";

  if (publication.doi) {
    const doi = document.createElement("a");
    doi.className = "pill-button";
    doi.href = `https://doi.org/${publication.doi}`;
    doi.target = "_blank";
    doi.rel = "noreferrer";
    doi.textContent = "Open DOI";
    actions.append(doi);
  }
  const allPublications = document.createElement("a");
  allPublications.className = "pill-button pill-button-outline";
  allPublications.href = "publications.html";
  allPublications.textContent = "All publications";
  actions.append(allPublications);
  container.append(label, title, authors, venue, actions);
}

async function loadHomeContent() {
  const [projectsResponse, publicationsResponse] = await Promise.all([
    fetch("data/projects.json"),
    fetch("data/publications.json"),
  ]);
  if (!projectsResponse.ok) {
    throw new Error(`Unable to load projects (${projectsResponse.status}).`);
  }
  if (!publicationsResponse.ok) {
    throw new Error(`Unable to load publications (${publicationsResponse.status}).`);
  }
  const [projects, publications] = await Promise.all([
    projectsResponse.json(),
    publicationsResponse.json(),
  ]);
  const confirmedPapers = publications.filter(
    (item) => item.confirmed && (item.type === "journal" || item.type === "conference"),
  );
  document.querySelector("[data-paper-count]").textContent = `${confirmedPapers.length} peer-reviewed publications`;

  renderFeaturedProjects(projects.filter((project) => project.confirmed));
  renderFeaturedPublication(publications);
}

loadHomeContent().catch((error) => {
  console.error("Unable to load Home page content.", error);
  document.querySelector("[data-projects-error]").hidden = false;
  document.querySelector("[data-latest-error]").hidden = false;
  document.querySelector("[data-publication-error]").hidden = false;
});
