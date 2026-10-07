const publicationGroups = [
  { type: "journal", title: "Journal articles", selector: "[data-journal-publications]" },
  { type: "conference", title: "Conference papers", selector: "[data-conference-publications]" },
  { type: "report", title: "Reports and other publications", selector: "[data-report-publications]" },
];
const copyStatus = document.querySelector("[data-copy-status]");
const publicationCount = document.querySelector("[data-publication-count]");
let publicationEntries = [];

function authorList(authors) {
  return authors.map((author) => author.name).join(", ");
}

function citationFor(publication) {
  const authorPart = authorList(publication.authors);
  const authorYear = `${authorPart}${publication.year ? ` (${publication.year})` : ""}`;
  const venueAndVolume = [publication.venue, publication.volume_pages].filter(Boolean).join(", ");
  return `${authorYear ? `${authorYear}. ` : ""}${publication.title}.${venueAndVolume ? ` ${venueAndVolume}.` : ""}`;
}

function appendAuthors(target, authors) {
  authors.forEach((author, index) => {
    if (index > 0) {
      target.append(document.createTextNode(index === authors.length - 1 ? ", & " : ", "));
    }
    if (author.is_farkhanda) {
      const strong = document.createElement("strong");
      strong.textContent = author.name;
      target.append(strong);
    } else {
      target.append(document.createTextNode(author.name));
    }
  });
}

function makePublicationCard(publication) {
  const article = document.createElement("article");
  article.className = "publication-card";
  article.dataset.publicationType = publication.type;

  const details = document.createElement("div");
  if (publication.authors.length) {
    const authors = document.createElement("p");
    authors.className = "citation-authors";
    appendAuthors(authors, publication.authors);
    details.append(authors);
  }
  const title = document.createElement("h3");
  title.textContent = publication.title;
  const citation = document.createElement("p");
  citation.className = "citation-full";
  citation.textContent = citationFor(publication);
  details.append(title, citation);
  if (publication.citation_note) {
    const note = document.createElement("p");
    note.className = "citation-note";
    note.textContent = publication.citation_note;
    details.append(note);
  }

  const actions = document.createElement("div");
  actions.className = "citation-actions";
  const url = publication.doi ? `https://doi.org/${publication.doi}` : publication.url;
  if (url) {
    const link = document.createElement("a");
    link.className = "pill-button pill-button-outline";
    link.href = url;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = publication.doi ? "Open DOI" : "View";
    actions.append(link);
  }
  const copy = document.createElement("button");
  copy.className = "pill-button";
  copy.type = "button";
  copy.textContent = "Copy citation";
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(citationFor(publication));
      copyStatus.textContent = "Citation copied.";
    } catch (error) {
      console.error("Unable to copy publication citation.", error);
      copyStatus.textContent = "Could not copy the citation. Select and copy the citation text above.";
    }
  });
  actions.append(copy);
  article.append(details, actions);
  return article;
}

function applyPublicationFilter(type) {
  const normalizedType = publicationGroups.some((group) => group.type === type) ? type : "all";
  for (const button of document.querySelectorAll("[data-publication-filter]")) {
    const active = button.dataset.publicationFilter === normalizedType;
    button.setAttribute("aria-pressed", String(active));
  }
  for (const group of publicationGroups) {
    const section = document.querySelector(`[data-publication-group="${group.type}"]`);
    section.hidden = normalizedType !== "all" && normalizedType !== group.type;
  }
}

async function loadPublications() {
  const response = await fetch("data/publications.json");
  if (!response.ok) {
    throw new Error(`Unable to load publications (${response.status}).`);
  }
  publicationEntries = (await response.json())
    .filter((publication) => publication.confirmed)
    .sort((a, b) => (b.year || 0) - (a.year || 0));
  publicationCount.textContent = `${publicationEntries.length} confirmed publications`;

  for (const group of publicationGroups) {
    const container = document.querySelector(group.selector);
    const entries = publicationEntries.filter((publication) => publication.type === group.type);
    for (const publication of entries) {
      container.append(makePublicationCard(publication));
    }
    const section = document.querySelector(`[data-publication-group="${group.type}"]`);
    section.hidden = entries.length === 0;
  }
  const requestedFilter = window.location.hash.slice(1);
  applyPublicationFilter(requestedFilter);
}

document.querySelector("[data-publication-filters]").addEventListener("click", (event) => {
  const button = event.target.closest("[data-publication-filter]");
  if (!button) {
    return;
  }
  const type = button.dataset.publicationFilter;
  window.history.replaceState(null, "", type === "all" ? window.location.pathname : `#${type}`);
  applyPublicationFilter(type);
});
window.addEventListener("hashchange", () => applyPublicationFilter(window.location.hash.slice(1)));

loadPublications().catch((error) => {
  console.error("Unable to load the Publications page.", error);
  publicationCount.textContent = "Publication information is unavailable.";
  const errorNode = document.querySelector("[data-publications-error]");
  errorNode.hidden = false;
});
