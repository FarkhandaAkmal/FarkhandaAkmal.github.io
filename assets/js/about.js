const mapNode = document.querySelector("#work-map");
const mapError = document.querySelector("[data-map-error]");

function addMapMarker(layer, coordinates, title, kind) {
  const marker = L.circleMarker(coordinates, {
    radius: 7,
    color: "#ffffff",
    weight: 2,
    fillColor: kind === "project" ? "#0f766e" : "#f4a261",
    fillOpacity: 0.95,
  });
  const popup = document.createElement("div");
  const heading = document.createElement("strong");
  heading.textContent = title;
  const label = document.createElement("p");
  label.textContent = kind === "project" ? "Project location" : "Research study area";
  label.style.margin = "0.25rem 0 0";
  popup.append(heading, label);
  marker.bindPopup(popup);
  marker.addTo(layer);
}

async function initializeWorkMap() {
  if (!mapNode || !window.L) {
    throw new Error("The interactive map library could not be loaded.");
  }

  const map = L.map(mapNode, { scrollWheelZoom: false }).setView([31.5, 72.8], 6);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const projectLayer = L.layerGroup();
  const researchLayer = L.layerGroup();
  const coordinatesForBounds = [];
  const [projectsResponse, publicationsResponse] = await Promise.all([
    fetch("data/projects.json"),
    fetch("data/publications.json"),
  ]);
  if (!projectsResponse.ok) {
    throw new Error(`Unable to load project locations (${projectsResponse.status}).`);
  }
  if (!publicationsResponse.ok) {
    throw new Error(`Unable to load research locations (${publicationsResponse.status}).`);
  }
  const [projects, publications] = await Promise.all([
    projectsResponse.json(),
    publicationsResponse.json(),
  ]);

  for (const project of projects) {
    if (!project.confirmed || !Array.isArray(project.coords)) {
      continue;
    }
    for (const coordinates of project.coords) {
      if (coordinates.length === 2 && coordinates.every(Number.isFinite)) {
        addMapMarker(projectLayer, coordinates, project.title, "project");
        coordinatesForBounds.push(coordinates);
      }
    }
  }
  for (const publication of publications) {
    if (!publication.confirmed || !Array.isArray(publication.study_area_coords)) {
      continue;
    }
    for (const coordinates of publication.study_area_coords) {
      if (coordinates.length === 2 && coordinates.every(Number.isFinite)) {
        addMapMarker(researchLayer, coordinates, publication.title, "research");
        coordinatesForBounds.push(coordinates);
      }
    }
  }

  projectLayer.addTo(map);
  researchLayer.addTo(map);
  L.control.layers(
    {},
    { "Project locations": projectLayer, "Research study areas": researchLayer },
    { collapsed: false },
  ).addTo(map);
  if (coordinatesForBounds.length) {
    map.fitBounds(L.latLngBounds(coordinatesForBounds).pad(0.12));
  }
  window.setTimeout(() => map.invalidateSize(), 0);
}

initializeWorkMap().catch((error) => {
  console.error("Unable to initialize the About page map.", error);
  mapError.hidden = false;
  mapError.textContent = "The interactive map could not be loaded. Please check your connection and refresh the page.";
});

async function loadFeaturedArticles() {
  const response = await fetch("data/publications.json");
  if (!response.ok) {
    throw new Error(`Unable to load featured articles (${response.status}).`);
  }
  const publications = await response.json();
  const featured = publications
    .filter((publication) => publication.confirmed && publication.type === "journal")
    .sort((a, b) => (b.year || 0) - (a.year || 0))
    .slice(0, 3);
  const container = document.querySelector("[data-featured-articles]");

  for (const publication of featured) {
    const card = document.createElement("article");
    card.className = "article-card";
    const label = document.createElement("p");
    label.className = "publication-label";
    label.textContent = String(publication.year);
    const title = document.createElement("h3");
    title.textContent = publication.title;
    const venue = document.createElement("p");
    venue.textContent = publication.venue;
    card.append(label, title, venue);
    if (publication.doi) {
      const link = document.createElement("a");
      link.className = "pill-button pill-button-outline";
      link.href = `https://doi.org/${publication.doi}`;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.textContent = "Open DOI";
      card.append(link);
    }
    container.append(card);
  }
}

loadFeaturedArticles().catch((error) => {
  console.error("Unable to load About page articles.", error);
  const errorNode = document.querySelector("[data-articles-error]");
  errorNode.hidden = false;
  errorNode.textContent = "Featured articles could not be loaded. Please refresh the page.";
});
