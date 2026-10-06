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
| `--slate` | `#2F3E50` | Navigation, hero and footer |
| `--slate-deep` | `#222E3C` | Copyright strip and image overlays |
| `--white` | `#FFFFFF` | Main content bands |
| `--mist` | `#F4F6F9` | Alternate bands and text on dark bands |
| `--plum` | `#9C1F6B` | Accent on light bands |
| `--rose` | `#EBD3E0` | Accent on dark bands |
| `--peach` | `#EAAC8B` | Small highlights and carousel counter |
| `--text` | `#2B3440` | Body copy |
| `--text-muted` | `#5B6878` | Captions and supporting information |

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
