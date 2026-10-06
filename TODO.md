# Items to confirm or supply

These items are not published on the website until confirmed.

1. A higher-resolution profile photo at least 800 x 800 px. The supplied 196 x 206 px portrait is now used, but is below the preferred resolution.
2. A PDF copy of the CV for the download button.
3. Approval or edits for the draft bio and hero positioning line.
4. Two to four responsibility bullets for each role, including any shareable figures.
5. Farkhanda's own role in each confirmed project (two or three sentences per project).
6. Client, period, location, summary and category for "Space Technology Application in Socioeconomic Development"; details for "Digitization of Roads Directory (NTRC)".
7. Dates of Farkhanda's involvement in the flood-district record preservation project.
8. Farkhanda's specific role and responsibilities on Mouza Sheesh Mahal, the District Nankana Sahib pilot, FGEHF Islamabad, the PLGA 2019 local-areas project, and the aviation-land mapping project.
9. Farkhanda's role, responsibilities, and project period for Cadastral Mapping of Rawalpindi Division.
10. User requested project-specific source maps. Every project location map uses confirmed project coordinates; its markers do not claim to show project boundaries or work products. Punjab Spatial Strategy has two maps from Reference Material 2: population-density analysis and local-government boundary demarcation. UIPT and FGEHF use privacy-redacted WebP maps; Sheesh Mahal and Nankana Sahib use cropped WebP maps. Pakistan Railways uses a pixelated GIS screenshot and a source-document land-record workflow overview. Raw source images remain private; the Nankana crop omits the adjacent occupant-name table. Reference Material 3 contains only the Rawalpindi project heading and no embedded image or location details; that project is published using its existing text and an explicitly illustrative graphic, without an invented source map or location marker. Reference Material 4's confirmed Kot Radha Kishan/PLGA project uses two WebP maps. The aviation-land mapping project is confirmed and uses an abstracted image mosaic; its original facility map and parcel cross-check remain private. The local [source-image shortlist](./assets/img/raw/source-image-shortlist.html) and [assignment draft](./assets/img/raw/assignments-draft.json) remain private review aids, not publication manifests. The draft image associations are based on nearby source text, captions or visible project labels:
   - Punjab Spatial Strategy: `reference material 2/image4.png`, `image5.png`; `image2.png` is a non-map graphic with named people and is not published.
   - UIPT: `reference material 2/image71.PNG`
   - SLIMS Lahore: the draft matches were reviewed; `image8.emf` is a Railway workflow graphic and `image9.png` is a government-building inventory, so neither is assigned as a SLIMS map.
   - Mouza Sheesh Mahal: `reference material 1/image10.png`
   - Nankana Sahib pilot: `reference material 1/image11.png`
   - FGEHF Islamabad: `reference material 1/image12.emf`
   - PLGA 2019 local areas: `reference material 4/image6.png`, `image7.png`.
   - Aviation-land mapping: `reference material 4/image2.jpeg` is shown only as an abstracted mosaic; `image3.jpeg` remains private because it is a detailed parcel cross-check.
   All 221 other extracted images remain unassigned; their exact paths are listed in the draft JSON. Six images under 200 px are listed in the contact sheet but were not extracted. Check carefully for owner names, CNIC numbers or other personal land-ownership data before publishing any image.
11. Whether the petrol pumps references describe one paper or two, the Kuwait Journal of Science paper's publication status, and the year of the Narowal rice paper.
12. Software tools she wants listed.
13. Optional Google Scholar, ResearchGate and ORCID links.
14. Optional training providers and years, awards, memberships and languages.
15. GitHub username and whether she wants a custom domain.
16. Review and confirmation of the supplied draft biography and project descriptions before publication.

## Phase 0 inventory status

- The source DOCX files are present. The local contact sheet contains 230 extracted images; 6 images under 200 px on their long side were skipped. Sami Ullah Khan's two documents are excluded from image extraction because they are for citation cross-checking only.
- Git/GitHub setup is intentionally deferred until Phase 6. Keep the project local until then.
- Review the contact sheet to confirm each image's project association and permission. Do not publish an image containing owner names, CNIC numbers or other personal land-ownership data.
- The CV headshot is 196 x 206 px, below the preferred 800 x 800 px minimum. It is used on the Home and About pages while a higher-resolution photo is still requested.

## Phase 1 status

- Project and publication records are in `data/projects.json` and `data/publications.json`.
- Review project and publication wording before public launch.
- Mouza Sheesh Mahal, the District Nankana Sahib pilot, and FGEHF Islamabad were confirmed for publication. Their reviewed Reference Material 1 derivatives are in the corresponding project records; the originals remain private.
- Cadastral Mapping of Rawalpindi Division was confirmed for publication using its existing draft description; Reference Material 3 has no embedded project image.
- The PLGA 2019 local-areas project was confirmed for publication; Reference Material 4's Kot Radha Kishan boundary maps are included as WebP gallery images.
- The aviation-land mapping project was confirmed for publication; a heavily generalized derivative is shown, while the unredacted site map and parcel cross-check remain private.

## Phase 2 status

- The redesigned Home page follows the updated reference-inspired brief and has been approved.
- The actual CV PDF and a sufficiently large profile photo have not been supplied. The Home and About pages use the supplied low-resolution portrait; the Home page links to CV details rather than presenting a broken download.
- Featured project slides and the latest-work mosaic use reviewed project images when available; projects without a verified source image continue using explicitly fictional cadastral illustrations. The source-map captions and surrounding project text remain the basis for image-to-project matching.
- Featured projects and publication data are loaded from the confirmed JSON records; still-unconfirmed candidates remain excluded.

## Phase 3 status

- About, Resume/print, Publications, Contact and 404 pages have been approved.
- About includes separate project and research-study map overlays with city-level markers and OpenStreetMap attribution.
- Still-unconfirmed candidate projects and unconfirmed publications remain excluded from public pages.
- Resume printing is styled for A4 and the CV PDF action remains disabled until the PDF is supplied.

## Phase 4 status

- Portfolio filters, confirmed-project cards and individual detail pages are implemented and ready for review.
- Only confirmed projects render. Projects with source images use them; others use clearly labelled fictional cadastral illustrations. Punjab Spatial Strategy uses two Reference Material 2 maps; UIPT and FGEHF use privacy-redacted WebP maps; Sheesh Mahal and Nankana Sahib use reviewed cropped WebP maps; Pakistan Railways uses its GIS image and workflow overview. The PLGA 2019 project uses two Reference Material 4 WebP boundary maps. Aviation-land mapping uses a strongly abstracted mosaic; exact site geometry and the parcel cross-check are not published. Rawalpindi Division is published with its illustrative graphic only because Reference Material 3 contains no source image or location data. The role section remains hidden until verified content is supplied.
- Image metadata is validated before use, and the optional image gallery supports keyboard-accessible lightbox navigation.
- On touch-sized layouts, project titles and clients appear in caption bars below the imagery.
- Phase 4 has been approved.

## Phase 5 status

- Quality checks are in progress. The site uses one light theme only; dark-mode and theme-toggle checks are out of scope, per user instruction.
- Approved project images must be WebP with descriptive alt text and explicit dimensions. Punjab Spatial Strategy and PLGA 2019 each have two, UIPT has one, Pakistan Railways has two, and Sheesh Mahal, Nankana Sahib, FGEHF, and aviation-land mapping each have one source-derived WebP image.
- `robots.txt` is ready. `sitemap.xml` awaits the absolute GitHub Pages address, which will be added in Phase 6.
