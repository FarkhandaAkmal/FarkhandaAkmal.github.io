const projectError = document.querySelector("[data-project-error]");
const projectErrorMessage = document.querySelector("[data-project-error-message]");
const projectContent = document.querySelector("[data-project-content]");
const projectCategoryLabels = {
  "land-records": "Land records",
  "spatial-planning": "Spatial planning",
  "remote-sensing": "Remote sensing",
  "web-gis": "Web GIS",
};
const lightbox = document.querySelector("[data-lightbox]");
let galleryImages = [];
let lightboxOpener = null;
let currentLightboxIndex = 0;

function showProjectError(message) {
  projectContent.hidden = true;
  projectError.hidden = false;
  projectErrorMessage.textContent = message;
}

function categoryName(category) {
  return projectCategoryLabels[category] || "GIS";
}

function addFact(container, label, value) {
  if (typeof value !== "string" || !value.trim()) {
    return;
  }
  const wrapper = document.createElement("div");
  wrapper.className = "project-fact";
  const term = document.createElement("dt");
  term.textContent = label;
  const description = document.createElement("dd");
  description.textContent = value;
  wrapper.append(term, description);
  container.append(wrapper);
}

function createProjectImage(source, alt, width, height, loading = "lazy") {
  const image = document.createElement("img");
  image.src = source;
  image.alt = alt;
  image.loading = loading;
  image.decoding = "async";
  if (Number.isInteger(width) && width > 0) {
    image.width = width;
  }
  if (Number.isInteger(height) && height > 0) {
    image.height = height;
  }
  return image;
}

function renderProjectLead(project, projectIndex) {
  const container = document.querySelector("[data-project-lead-visual]");
  const credit = document.querySelector("[data-project-lead-credit]");
  const firstImage = galleryImages[0];
  if (firstImage) {
    const image = createProjectImage(firstImage.src, firstImage.alt, firstImage.width, firstImage.height, "eager");
    image.addEventListener("error", () => {
      const error = document.querySelector("[data-lead-image-error]");
      image.replaceWith(window.createProjectIllustration(projectIndex));
      credit.textContent = "Illustrative graphic · not project imagery";
      error.hidden = false;
      error.textContent = "The selected project image could not be loaded. Please check its file path.";
    }, { once: true });
    container.append(image);
    credit.textContent = firstImage.caption || firstImage.alt;
    return;
  }

  if (typeof window.createProjectIllustration !== "function") {
    throw new Error("Project illustration support did not load.");
  }
  container.append(window.createProjectIllustration(projectIndex));
  credit.textContent = "Illustrative graphic · not project imagery";
}

function renderProjectFacts(project) {
  const facts = document.querySelector("[data-project-facts]");
  addFact(facts, "Client", project.client);
  addFact(facts, "Funding", project.funding);
  addFact(facts, "Period", project.period);
  addFact(facts, "Location", project.location_label);
  facts.hidden = facts.children.length === 0;
}

function renderProjectMap(project) {
  if (!Array.isArray(project.coords) || project.coords.length === 0) {
    return;
  }
  if (!Array.isArray(project.coord_labels) || project.coord_labels.length !== project.coords.length
      || project.coord_labels.some((label) => typeof label !== "string" || !label.trim())) {
    throw new Error(`Project map locations for "${project.title}" must have a label for every coordinate.`);
  }
  for (const coordinates of project.coords) {
    if (!Array.isArray(coordinates) || coordinates.length !== 2
        || !Number.isFinite(coordinates[0]) || coordinates[0] < -90 || coordinates[0] > 90
        || !Number.isFinite(coordinates[1]) || coordinates[1] < -180 || coordinates[1] > 180) {
      throw new Error(`Project map coordinates for "${project.title}" must be valid latitude/longitude pairs.`);
    }
  }

  const section = document.querySelector("[data-project-map-section]");
  const note = document.querySelector("[data-project-map-note]");
  const locations = document.querySelector("[data-project-map-locations]");
  const mapNode = document.querySelector("[data-project-map]");
  const mapError = document.querySelector("[data-project-map-error]");
  note.textContent = project.map_scope_note || "Pins are location references from the project data, not project boundaries.";

  project.coords.forEach((coordinates, index) => {
    const item = document.createElement("li");
    item.textContent = project.coord_labels[index];
    locations.append(item);
  });
  section.hidden = false;

  if (!window.L) {
    mapError.hidden = false;
    mapError.textContent = "The interactive map could not be loaded. The project locations are listed below.";
    return;
  }

  const map = L.map(mapNode, { scrollWheelZoom: false }).setView(project.coords[0], 7);
  const tiles = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  tiles.once("tileerror", () => {
    mapError.hidden = false;
    mapError.textContent = "Some map tiles could not be loaded. The project locations are listed below.";
  });

  project.coords.forEach((coordinates, index) => {
    const marker = L.circleMarker(coordinates, {
      radius: 8,
      color: "#ffffff",
      weight: 2,
      fillColor: "#9c1f6b",
      fillOpacity: 0.95,
    });
    const popup = document.createElement("div");
    const heading = document.createElement("strong");
    heading.textContent = project.coord_labels[index];
    const label = document.createElement("p");
    label.textContent = project.title;
    label.style.margin = "0.25rem 0 0";
    popup.append(heading, label);
    marker.bindPopup(popup).addTo(map);
  });

  if (project.coords.length > 1) {
    map.fitBounds(L.latLngBounds(project.coords).pad(0.15));
  }
  L.control.scale({ metric: true, imperial: false }).addTo(map);
  window.setTimeout(() => map.invalidateSize(), 0);
}

function renderDeliverables(project) {
  if (!Array.isArray(project.delivered) || project.delivered.length === 0) {
    return;
  }
  const section = document.querySelector("[data-delivered-section]");
  const list = document.querySelector("[data-project-delivered]");
  for (const item of project.delivered) {
    if (typeof item !== "string" || !item.trim()) {
      throw new Error(`A delivered item for "${project.title}" must be a non-empty string.`);
    }
    const listItem = document.createElement("li");
    listItem.textContent = item;
    list.append(listItem);
  }
  section.hidden = false;
}

function renderRole(project) {
  if (typeof project.my_role !== "string" || !project.my_role.trim()) {
    return;
  }
  document.querySelector("[data-project-role]").textContent = project.my_role;
  document.querySelector("[data-role-section]").hidden = false;
}

function renderRelatedLinks(project) {
  if (!Array.isArray(project.related_links) || project.related_links.length === 0) {
    return;
  }
  const container = document.querySelector("[data-project-related]");
  for (const related of project.related_links) {
    if (!related || typeof related.label !== "string" || typeof related.url !== "string") {
      throw new Error(`A related link for "${project.title}" is missing its label or URL.`);
    }
    const target = new URL(related.url, window.location.href);
    if (target.protocol !== "https:" && target.protocol !== "http:") {
      throw new Error(`A related link for "${project.title}" uses an unsupported URL scheme.`);
    }
    const link = document.createElement("a");
    link.className = "pill-button pill-button-outline";
    link.href = related.url;
    link.textContent = related.label;
    if (target.origin !== window.location.origin) {
      link.target = "_blank";
      link.rel = "noreferrer";
    }
    container.append(link);
  }
  container.hidden = container.children.length === 0;
}

function renderPagination(projects, currentIndex) {
  const container = document.querySelector("[data-project-pagination]");
  const previousProject = projects[currentIndex - 1];
  const nextProject = projects[currentIndex + 1];

  if (previousProject) {
    const previous = document.createElement("a");
    previous.href = `project.html?id=${encodeURIComponent(previousProject.id)}`;
    const label = document.createElement("span");
    label.textContent = "← Previous project";
    const title = document.createElement("strong");
    title.textContent = previousProject.title;
    previous.append(label, title);
    container.append(previous);
  } else {
    const spacer = document.createElement("span");
    spacer.setAttribute("aria-hidden", "true");
    container.append(spacer);
  }

  if (nextProject) {
    const next = document.createElement("a");
    next.href = `project.html?id=${encodeURIComponent(nextProject.id)}`;
    const label = document.createElement("span");
    label.textContent = "Next project →";
    const title = document.createElement("strong");
    title.textContent = nextProject.title;
    next.append(label, title);
    container.append(next);
  }
}

function setLightboxImage(index) {
  currentLightboxIndex = (index + galleryImages.length) % galleryImages.length;
  const imageData = galleryImages[currentLightboxIndex];
  const image = document.querySelector("[data-lightbox-image]");
  image.hidden = false;
  document.querySelector("[data-lightbox-error]").hidden = true;
  image.width = imageData.width;
  image.height = imageData.height;
  image.src = imageData.src;
  image.alt = imageData.alt;
  document.querySelector("[data-lightbox-count]").textContent =
    `${currentLightboxIndex + 1} / ${galleryImages.length}`;
  document.querySelector("[data-lightbox-caption]").textContent =
    imageData.caption || imageData.alt;
}

document.querySelector("[data-lightbox-image]").addEventListener("error", () => {
  document.querySelector("[data-lightbox-image]").hidden = true;
  const error = document.querySelector("[data-lightbox-error]");
  error.hidden = false;
  error.textContent = "This project image could not be loaded. Please check its file path.";
});

function renderGallery(project) {
  if (galleryImages.length === 0) {
    return;
  }
  const section = document.querySelector("[data-gallery-section]");
  const container = document.querySelector("[data-project-gallery]");
  const error = document.querySelector("[data-gallery-error]");

  galleryImages.forEach((imageData, index) => {
    const image = window.validateProjectImageRecord(imageData, project.title);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "gallery-open";
    button.setAttribute("aria-label", `Open image: ${image.caption || image.alt}`);
    const thumbnail = createProjectImage(
      image.thumbnail || image.src,
      image.alt,
      image.thumbnail ? image.thumbnailWidth : image.width,
      image.thumbnail ? image.thumbnailHeight : image.height,
    );
    thumbnail.addEventListener("error", () => {
      thumbnail.remove();
      button.disabled = true;
      error.hidden = false;
      error.textContent = "One or more project images could not be loaded. Please check the image file paths.";
    }, { once: true });
    const caption = document.createElement("span");
    caption.className = "gallery-caption";
    caption.textContent = image.caption || image.alt;
    button.append(thumbnail, caption);
    button.addEventListener("click", () => {
      lightboxOpener = button;
      setLightboxImage(index);
      lightbox.showModal();
    });
    container.append(button);
  });
  section.hidden = false;
}

document.querySelector("[data-lightbox-close]").addEventListener("click", () => lightbox.close());
document.querySelector("[data-lightbox-previous]").addEventListener("click", () => {
  setLightboxImage(currentLightboxIndex - 1);
});
document.querySelector("[data-lightbox-next]").addEventListener("click", () => {
  setLightboxImage(currentLightboxIndex + 1);
});
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    lightbox.close();
  }
});
lightbox.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    setLightboxImage(currentLightboxIndex - 1);
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    setLightboxImage(currentLightboxIndex + 1);
  } else if (event.key === "Escape") {
    event.preventDefault();
    lightbox.close();
  }
});
lightbox.addEventListener("close", () => lightboxOpener?.focus());

async function loadProject() {
  if (typeof window.createProjectIllustration !== "function") {
    throw new Error("Project illustration support did not load.");
  }
  const requestedId = new URLSearchParams(window.location.search).get("id");
  if (!requestedId) {
    showProjectError("The project address is missing an ID. Browse the confirmed projects to choose a project.");
    return;
  }

  const response = await fetch("data/projects.json");
  if (!response.ok) {
    throw new Error(`Unable to load project data (${response.status}).`);
  }
  const projects = (await response.json()).filter((project) => project.confirmed);
  const projectIndex = projects.findIndex((entry) => entry.id === requestedId);
  if (projectIndex === -1) {
    showProjectError("No confirmed project matches this address. Browse the portfolio to see available projects.");
    return;
  }
  const project = projects[projectIndex];
  if (typeof project.title !== "string" || !project.title.trim()
      || typeof project.summary !== "string" || !project.summary.trim()) {
    throw new Error("The selected project is missing its title or summary.");
  }
  if (!Array.isArray(project.images)) {
    throw new Error(`Project images for "${project.title}" must be an array.`);
  }
  galleryImages = project.images.map((image) => window.validateProjectImageRecord(image, project.title));

  document.title = `${project.title} | Farkhanda Akmal`;
  document.querySelector('meta[name="description"]').content = project.summary || project.title;
  document.querySelector('meta[property="og:title"]').content = document.title;
  document.querySelector('meta[property="og:description"]').content = project.summary || project.title;
  document.querySelector('meta[name="twitter:title"]').content = document.title;
  document.querySelector('meta[name="twitter:description"]').content = project.summary || project.title;
  document.querySelector("[data-project-category]").textContent = categoryName(project.category);
  document.querySelector("[data-project-title]").textContent = project.title;
  document.querySelector("[data-project-subtitle]").textContent =
    [categoryName(project.category), project.period].filter(Boolean).join(" · ");
  document.querySelector("[data-project-summary]").textContent = project.summary;
  renderProjectLead(project, projectIndex);
  renderProjectFacts(project);
  renderDeliverables(project);
  renderRole(project);
  renderRelatedLinks(project);
  renderGallery(project);
  renderPagination(projects, projectIndex);
  projectContent.hidden = false;
  renderProjectMap(project);
}

loadProject().catch((error) => {
  console.error("Unable to load project details.", error);
  showProjectError("Project details could not be loaded. Please refresh the page.");
});
