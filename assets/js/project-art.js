const projectParcelSets = [
  [
    "M38 42 148 24 173 112 52 123Z",
    "M148 24 266 40 258 127 173 112Z",
    "M266 40 433 23 440 114 259 127Z",
    "M52 123 173 112 191 213 58 218Z",
    "M173 112 258 127 287 219 191 213Z",
    "M258 127 439 114 447 208 287 219Z",
    "M58 218 191 213 211 318 83 308Z",
    "M191 213 287 219 322 319 211 318Z",
    "M287 219 447 208 429 312 322 319Z",
  ],
  [
    "M42 45 186 30 200 134 54 147Z",
    "M186 30 284 48 271 134 200 134Z",
    "M284 48 434 30 444 137 271 134Z",
    "M54 147 200 134 218 228 63 242Z",
    "M200 134 285 134 307 228 218 228Z",
    "M285 134 444 137 449 231 307 228Z",
    "M63 242 218 228 237 326 87 323Z",
    "M218 228 307 228 342 327 237 326Z",
    "M307 228 449 231 437 333 342 327Z",
  ],
  [
    "M38 35 165 47 151 140 49 129Z",
    "M165 47 286 25 308 132 151 140Z",
    "M286 25 434 50 426 137 308 132Z",
    "M49 129 151 140 136 249 24 239Z",
    "M151 140 308 132 322 237 136 249Z",
    "M308 132 426 137 434 248 322 237Z",
    "M24 239 136 249 155 324 20 313Z",
    "M136 249 322 237 345 326 155 324Z",
    "M322 237 434 248 442 327 345 326Z",
  ],
  [
    "M35 37 205 41 189 135 52 143Z",
    "M205 41 297 26 317 131 189 135Z",
    "M297 26 437 50 425 141 317 131Z",
    "M52 143 189 135 194 246 63 253Z",
    "M189 135 317 131 337 246 194 246Z",
    "M317 131 425 141 427 246 337 246Z",
    "M63 253 194 246 206 323 81 328Z",
    "M194 246 337 246 356 320 206 323Z",
    "M337 246 427 246 420 321 356 320Z",
  ],
];

let projectArtId = 0;

window.validateProjectImageRecord = function validateProjectImageRecord(image, projectTitle) {
  const isSupportedImageSource = (source) => {
    if (typeof source !== "string" || !source.trim()) {
      return false;
    }
    if (/^data:image\/(?:webp|png|jpeg)(?:;[^,]*)?,/i.test(source)) {
      return true;
    }
    try {
      return /\.(?:webp|png|jpe?g)$/i.test(new URL(source, window.location.href).pathname);
    } catch {
      return false;
    }
  };
  const hasDimensions = Number.isInteger(image?.width) && image.width > 0
    && Number.isInteger(image?.height) && image.height > 0;
  const hasThumbnail = image?.thumbnail === undefined || isSupportedImageSource(image.thumbnail);
  const hasThumbnailDimensions = image?.thumbnail === undefined
    ? image?.thumbnailWidth === undefined && image?.thumbnailHeight === undefined
    : Number.isInteger(image.thumbnailWidth) && image.thumbnailWidth > 0
      && Number.isInteger(image.thumbnailHeight) && image.thumbnailHeight > 0;

  if (!image || typeof image !== "object" || typeof image.alt !== "string" || !image.alt.trim()
      || !isSupportedImageSource(image.src) || !hasDimensions || !hasThumbnail || !hasThumbnailDimensions) {
    throw new Error(
      `Project image metadata for "${projectTitle}" must include a supported WebP, PNG or JPEG source, descriptive alt text, positive source dimensions, and an optional supported thumbnail with positive dimensions.`,
    );
  }
  return image;
};

window.createProjectIllustration = function createProjectIllustration(index) {
  const namespace = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(namespace, "svg");
  const uniqueId = `project-grid-${projectArtId}`;
  projectArtId += 1;
  svg.setAttribute("viewBox", "0 0 480 360");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Fictional cadastral illustration, not project imagery");
  svg.classList.add("project-illustration");

  const title = document.createElementNS(namespace, "title");
  title.textContent = "Illustrative parcel pattern";
  const description = document.createElementNS(namespace, "desc");
  description.textContent = "Invented parcel boundaries and a route line; this illustration is not a project map or a land record.";
  svg.append(title, description);

  const definitions = document.createElementNS(namespace, "defs");
  const pattern = document.createElementNS(namespace, "pattern");
  pattern.setAttribute("id", uniqueId);
  pattern.setAttribute("width", "28");
  pattern.setAttribute("height", "28");
  pattern.setAttribute("patternUnits", "userSpaceOnUse");
  const gridPath = document.createElementNS(namespace, "path");
  gridPath.setAttribute("d", "M28 0H0V28");
  gridPath.setAttribute("class", "art-grid-line");
  pattern.append(gridPath);
  definitions.append(pattern);
  svg.append(definitions);

  const ground = document.createElementNS(namespace, "rect");
  ground.setAttribute("width", "480");
  ground.setAttribute("height", "360");
  ground.setAttribute("class", `art-ground art-ground-${index % projectParcelSets.length}`);
  svg.append(ground);

  const grid = document.createElementNS(namespace, "rect");
  grid.setAttribute("width", "480");
  grid.setAttribute("height", "360");
  grid.setAttribute("fill", `url(#${uniqueId})`);
  svg.append(grid);

  const parcels = document.createElementNS(namespace, "g");
  parcels.setAttribute("class", "art-parcels");
  for (const pathData of projectParcelSets[index % projectParcelSets.length]) {
    const path = document.createElementNS(namespace, "path");
    path.setAttribute("d", pathData);
    parcels.append(path);
  }
  svg.append(parcels);

  const route = document.createElementNS(namespace, "path");
  route.setAttribute("d", `M10 ${176 + (index % 3) * 9}c99-27 151 7 241-17s142-27 221-11`);
  route.setAttribute("class", `art-route art-route-${index % projectParcelSets.length}`);
  svg.append(route);

  const labels = document.createElementNS(namespace, "g");
  labels.setAttribute("class", "art-parcel-labels");
  ["P-014", "P-027", "P-038", "P-041", "P-052", "P-063"].forEach((value, labelIndex) => {
    const text = document.createElementNS(namespace, "text");
    const positions = [[88, 91], [225, 91], [355, 89], [91, 190], [332, 188], [120, 281]];
    text.setAttribute("x", String(positions[labelIndex][0]));
    text.setAttribute("y", String(positions[labelIndex][1]));
    text.textContent = value;
    labels.append(text);
  });
  svg.append(labels);
  return svg;
};
