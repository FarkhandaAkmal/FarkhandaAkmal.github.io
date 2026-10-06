const root = document.documentElement;
root.classList.add("js");
const themeToggle = document.querySelector("[data-theme-toggle]");
const themePreference = window.matchMedia("(prefers-color-scheme: dark)");
const storedTheme = window.localStorage.getItem("farkhanda-portfolio-theme");

if (storedTheme === "light" || storedTheme === "dark") {
  root.dataset.theme = storedTheme;
}

function isDarkTheme() {
  if (root.dataset.theme) {
    return root.dataset.theme === "dark";
  }
  return themePreference.matches;
}

function updateThemeToggle() {
  const nextTheme = isDarkTheme() ? "light" : "dark";
  themeToggle.textContent = nextTheme === "dark" ? "Dark" : "Light";
  themeToggle.setAttribute("aria-label", `Switch to ${nextTheme} theme`);
}

themeToggle.addEventListener("click", () => {
  const nextTheme = isDarkTheme() ? "light" : "dark";
  root.dataset.theme = nextTheme;
  window.localStorage.setItem("farkhanda-portfolio-theme", nextTheme);
  updateThemeToggle();
});

themePreference.addEventListener("change", updateThemeToggle);
updateThemeToggle();

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
  if (event.target instanceof HTMLAnchorElement && window.matchMedia("(max-width: 700px)").matches) {
    setMenuOpen(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    setMenuOpen(false);
    menuToggle.focus();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 700) {
    setMenuOpen(false);
  }
});

const experienceNode = document.querySelector("[data-experience-years]");
const [startYear, startMonth] = experienceNode.dataset.startDate.split("-").map(Number);
const today = new Date();
let yearsInPractice = today.getFullYear() - startYear;

if (today.getMonth() + 1 < startMonth) {
  yearsInPractice -= 1;
}

experienceNode.textContent = `${yearsInPractice} years in GIS`;

document.querySelector("[data-current-year]").textContent = String(today.getFullYear());

const lastUpdated = document.querySelector("[data-last-updated]");
lastUpdated.textContent = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "long",
  day: "numeric",
}).format(new Date(`${lastUpdated.dateTime}T00:00:00`));

function addCategoryKey(parent, category) {
  const labelByCategory = {
    "land-records": "Land records",
    "spatial-planning": "Spatial planning",
    "remote-sensing": "Remote sensing",
    "web-gis": "Web GIS",
  };
  const key = document.createElement("span");
  key.className = `category-key category-${category}`;

  const swatch = document.createElement("span");
  swatch.className = "category-swatch";
  swatch.setAttribute("aria-hidden", "true");

  const label = document.createElement("span");
  label.textContent = labelByCategory[category] || category;
  key.append(swatch, label);
  parent.append(key);
}

function renderFeaturedProjects(projects) {
  const container = document.querySelector("[data-featured-projects]");
  const featured = projects.filter((project) => project.confirmed && project.featured);

  for (const project of featured) {
    const card = document.createElement("a");
    card.className = "project-preview";
    card.href = `project.html?id=${encodeURIComponent(project.id)}`;

    const main = document.createElement("span");
    main.className = "project-preview-main";

    const title = document.createElement("span");
    title.className = "project-title";
    title.textContent = project.title;
    main.append(title);

    const client = document.createElement("span");
    client.className = "project-period";
    client.textContent = project.period;
    card.append(main, client);
    addCategoryKey(card, project.category);
    container.append(card);
  }
}

function renderFeaturedPublication(publications) {
  const container = document.querySelector("[data-featured-publication]");
  const publication = publications.find((item) => item.confirmed && item.featured);
  if (!publication) {
    throw new Error("No confirmed featured publication is available.");
  }

  const label = document.createElement("p");
  label.className = "publication-label";
  label.textContent = `${publication.year} · First author`;

  const title = document.createElement("h3");
  title.className = "publication-title";
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
    const doiLink = document.createElement("a");
    doiLink.href = `https://doi.org/${publication.doi}`;
    doiLink.target = "_blank";
    doiLink.rel = "noreferrer";
    doiLink.textContent = "Open DOI";
    actions.append(doiLink);
  }

  const publicationsLink = document.createElement("a");
  publicationsLink.href = "publications.html";
  publicationsLink.textContent = "More publications";
  actions.append(publicationsLink);

  container.append(label, title, authors, venue, actions);
}

async function loadFeaturedContent() {
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
  renderFeaturedProjects(projects);
  renderFeaturedPublication(publications);
}

loadFeaturedContent().catch((error) => {
  console.error("Unable to load the Home page highlights.", error);
  document.querySelector("[data-projects-error]").hidden = false;
  document.querySelector("[data-publication-error]").hidden = false;
});
