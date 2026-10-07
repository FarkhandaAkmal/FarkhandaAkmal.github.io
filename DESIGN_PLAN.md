# Phase 2 design plan

## Direction

Follow the supplied portfolio reference's page rhythm—dark slate navigation and
hero, alternating white and mist bands, pill actions, a featured-project
slideshow, a project mosaic, and a dark social footer—while using original
markup, illustrations and content. Keep the visual finish spacious and
professional, with a clear type scale, consistent band spacing, rounded
imagery and restrained motion. No unreviewed source-document images are used.
Use one light theme only; do not add automatic dark mode or a theme toggle.

## Tokens

| Token | Value | Use |
| --- | --- | --- |
| `--slate` | `#183B56` | Navigation, hero and footer |
| `--slate-deep` | `#102A43` | Copyright strip and image overlays |
| `--white` | `#FFFFFF` | Main content bands |
| `--mist` | `#F3F7F7` | Alternate bands and text on dark bands |
| `--plum` | `#0F766E` | Teal accent on light bands |
| `--rose` | `#D9F0EB` | Mint accent on dark bands |
| `--peach` | `#F4A261` | Warm highlight and carousel counter |
| `--text` | `#263645` | Body copy |
| `--text-muted` | `#526679` | Captions and supporting information |

Montserrat is used for navigation, names, headings and buttons; Source Sans 3
is used for body text. Body copy is 18 px with a 1.65 line height. Band padding
is 96 px on desktop and 56 px on mobile, and section headings use a short peach
bar. Internal links remain relative for GitHub Pages sub-path hosting.

## Home wireframe

```text
┌─────────────────────────────────────────────────────────────────────────┐
│             HOME   ABOUT ME   RESUME   PORTFOLIO   PUBLICATIONS   CONTACT│
├─────────────────────────────────────────────────────────────────────────┤
│ Slate hero: name, GIS role, welcome and pill actions │ fictional parcel  │
│                                                     │ illustration     │
├─────────────────────────────────────────────────────────────────────────┤
│ At a glance: GIS since 2012 | MPhil | papers | PULSE role                │
├─────────────────────────────────────────────────────────────────────────┤
│ About preview: initials portrait                 │ short bio + link     │
├─────────────────────────────────────────────────────────────────────────┤
│ Featured project text + controls                 │ illustrative art    │
├─────────────────────────────────────────────────────────────────────────┤
│ Latest-work illustrative mosaic                  │ latest-work text     │
├─────────────────────────────────────────────────────────────────────────┤
│ Featured Sialkot publication                                          │
├─────────────────────────────────────────────────────────────────────────┤
│ Contact callout                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ Dark contact footer + darker copyright strip                            │
└─────────────────────────────────────────────────────────────────────────┘
```

## Portfolio wireframe

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ Shared sticky navigation                                                 │
├─────────────────────────────────────────────────────────────────────────┤
│ PORTFOLIO                                      Show all · category pills │
├─────────────────────────────────────────────────────────────────────────┤
│ 4:3 project image grid; dark hover labels / touch captions                │
│ Only confirmed projects; approved source imagery replaces illustrations │
└─────────────────────────────────────────────────────────────────────────┘
```

## Motion and accessibility

- The hero entrance, slideshow cross-fade, hover overlay and button changes
  respect `prefers-reduced-motion`.
- The carousel has previous/next controls, labeled dots, arrow-key and swipe
  navigation, and pauses while hovered or focused. It does not auto-advance
  for reduced-motion users and otherwise advances no faster than every seven
  seconds.
- Mobile navigation is keyboard-operable and closes with Escape or link
  activation. Focus rings remain visible.
- The hero and project-preview artwork is explicitly fictional. Original
  source images remain private until their association, permission and privacy
  review is complete.
- Confirmed project detail pages display interactive OpenStreetMap location
  maps populated from the CV's project coordinates and labeled locations.
  Notes distinguish city/district reference pins from actual project coverage
  or deliverable boundaries. Source-document screenshots remain private until
  their project match and publication permission are approved.
- Verify keyboard use, contrast, data loading, and layouts at 380 px, 768 px
  and 1440 px before the Phase 2 review checkpoint.

## Site-wide dark theme (October 2026)

At the owner's request the whole site now uses a dark "Premium Tech & GIS"
theme. It replaces the light theme above on screen; printing still uses the
light print styles, so the resume prints as before. No page text, link or
image path was changed for it.

- Every page carries `class="theme-dark"` on `<body>` and loads, after the
  shared stylesheets, `assets/css/theme-dark.css`, plus Three.js r128 from
  unpkg (with a Subresource Integrity hash), `assets/js/theme-bg.js` and
  `assets/js/theme-fx.js`. The portfolio page also loads
  `assets/js/portfolio-fx.js`. Removing the class and these files restores the
  light site.
- Background (`theme-bg.js`): a fixed WebGL canvas behind the page with a
  dotted Earth, graticule, atmosphere glow, a ground-station ping at Lahore
  and five satellites on orbits with trails. It turns slowly, leans and shifts
  with the pointer, and drifts as the page scrolls. Without WebGL, or if the
  library does not load, a still CSS backdrop is used instead.
- Colours: page `#0B0F19`, cyan `#00FFFF`, emerald `#00FF66`; headings white,
  running text `#A0B0C0`.
- Glass panels: `rgba(255,255,255,0.03)` background, 16px blur, 1px
  `rgba(0,255,255,0.15)` border, 16px radius. The navigation bar adds a darker
  tint so the menu stays readable over bright maps. On phones the long lists
  of cards use a tinted panel instead of blur, for smoother scrolling.
- Fonts: Space Grotesk for headings and numbers, Plus Jakarta Sans for text.
- Buttons and filters are neon pills with a radar-ping pulse on hover and on
  the active filter. Project cards lift, tilt toward the pointer, glow, and
  show faint contour lines on hover.
- About: radar sweep behind the portrait; skills as floating badges.
  Resume: the timeline is a route that lights up as the page scrolls.
  Contact: the contact panel is styled as an instrument panel. The site has
  no form; styles for form fields (cyan glow on focus) are ready if one is
  added.
- Motion is switched off under `prefers-reduced-motion`, and every page stays
  readable without JavaScript.
