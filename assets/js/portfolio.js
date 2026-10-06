const projectCategoryNames = {
  "land-records": "Land records",
  "spatial-planning": "Spatial planning",
  "remote-sensing": "Remote sensing",
  "web-gis": "Web GIS",
};
const projectGrid = document.querySelector("[data-portfolio-grid]");
const projectCount = document.querySelector("[data-portfolio-count]");
const noProjectsMessage = document.querySelector("[data-no-projects]");
let confirmedProjects = [];

function projectCategory(category) {
  return projectCategoryNames[category] || "GIS";
}

function makeProjectImage(project, index) {
  const firstImage = project.images?.[0];
  if (!firstImage) {
    return window.createProjectIllustration(index);
  }

  const imageData = window.validateProjectImageRecord(firstImage, project.title);
  const image = document.createElement("img");
  image.src = imageData.thumbnail || imageData.src;
  image.alt = imageData.alt;
  image.loading = "lazy";
  image.decoding = "async";
  const imageWidth = imageData.thumbnail ? imageData.thumbnailWidth : imageData.width;
  const imageHeight = imageData.thumbnail ? imageData.thumbnailHeight : imageData.height;
  if (Number.isInteger(imageWidth) && imageWidth > 0) {
    image.width = imageWidth;
  }
  if (Number.isInteger(imageHeight) && imageHeight > 0) {
    image.height = imageHeight;
  }
  image.addEventListener("error", () => {
    image.replaceWith(window.createProjectIllustration(index));
    const error = document.querySelector("[data-portfolio-error]");
    error.hidden = false;
    error.textContent = `A project image for "${project.title}" could not be loaded. The path in projects.json needs checking.`;
  }, { once: true });
  return image;
}

function renderProjectCard(project, index) {
  const card = document.createElement("a");
  card.className = "portfolio-card";
  card.href = `project.html?id=${encodeURIComponent(project.id)}`;

  const figure = document.createElement("figure");
  figure.className = "portfolio-card-figure";
  const visual = document.createElement("div");
  visual.className = "portfolio-card-visual";
  visual.append(makeProjectImage(project, index));

  const overlay = document.createElement("span");
  overlay.className = "portfolio-overlay";
  const title = document.createElement("strong");
  title.textContent = project.title;
  const client = document.createElement("span");
  client.textContent = project.client || "";
  overlay.append(title, client);

  visual.append(overlay);
  const touchCaption = document.createElement("figcaption");
  touchCaption.className = "portfolio-touch-caption";
  const touchTitle = document.createElement("strong");
  touchTitle.textContent = project.title;
  const touchClient = document.createElement("span");
  touchClient.textContent = project.client || "";
  touchCaption.append(touchTitle, touchClient);
  figure.append(visual, touchCaption);

  const meta = document.createElement("div");
  meta.className = "portfolio-card-meta";
  const category = document.createElement("span");
  category.className = `category-key category-${project.category}`;
  category.textContent = projectCategory(project.category);
  const period = document.createElement("span");
  period.textContent = project.period || "";
  meta.append(category, period);
  card.append(figure, meta);
  return card;
}

function applyProjectFilter(filter) {
  const allowed = ["all", ...Object.keys(projectCategoryNames)];
  const activeFilter = allowed.includes(filter) ? filter : "all";
  let visibleCount = 0;

  for (const button of document.querySelectorAll("[data-project-filter]")) {
    button.setAttribute("aria-pressed", String(button.dataset.projectFilter === activeFilter));
  }
  for (const card of projectGrid.children) {
    const isVisible = activeFilter === "all" || card.querySelector(".category-key").classList.contains(`category-${activeFilter}`);
    card.hidden = !isVisible;
    visibleCount += Number(isVisible);
  }
  projectCount.textContent = `${visibleCount} confirmed ${visibleCount === 1 ? "project" : "projects"}`;
  noProjectsMessage.hidden = visibleCount > 0;
}

async function loadPortfolioProjects() {
  if (typeof window.createProjectIllustration !== "function") {
    throw new Error("Project illustration support did not load.");
  }
  const response = await fetch("data/projects.json");
  if (!response.ok) {
    throw new Error(`Unable to load projects (${response.status}).`);
  }
  const projects = await response.json();
  confirmedProjects = projects.filter((project) => project.confirmed);
  confirmedProjects.forEach((project, index) => projectGrid.append(renderProjectCard(project, index)));
  applyProjectFilter(window.location.hash.slice(1));
}

document.querySelector("[data-project-filters]").addEventListener("click", (event) => {
  const button = event.target.closest("[data-project-filter]");
  if (!button) {
    return;
  }
  const filter = button.dataset.projectFilter;
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${filter}`);
  applyProjectFilter(filter);
});
window.addEventListener("hashchange", () => applyProjectFilter(window.location.hash.slice(1)));

loadPortfolioProjects().catch((error) => {
  console.error("Unable to load the project portfolio.", error);
  projectCount.textContent = "Project information is unavailable.";
  const errorNode = document.querySelector("[data-portfolio-error]");
  errorNode.hidden = false;
  errorNode.textContent = "The project portfolio could not be loaded. Please refresh the page.";
});
