"""Extract images from private DOCX source files and build a local contact sheet."""

from __future__ import annotations

import html
import posixpath
import re
import struct
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree


PROJECT_ROOT = Path(__file__).resolve().parent.parent
SOURCE_DIR = PROJECT_ROOT / "source-docs"
RAW_DIR = PROJECT_ROOT / "assets" / "img" / "raw"
INVENTORY_PATH = RAW_DIR / "inventory.html"
MINIMUM_LONG_SIDE = 200
WORD_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
CITATION_ONLY_DOCUMENTS = {
    "cv - sami ullah khan.docx",
    "sami ullah khan portfolio.docx",
}
PREVIEW_FORMATS = {".bmp", ".gif", ".jpeg", ".jpg", ".png", ".svg", ".webp"}


def _jpeg_dimensions(data: bytes) -> tuple[int, int] | None:
    index = 2
    while index < len(data):
        if data[index] != 0xFF:
            index += 1
            continue
        while index < len(data) and data[index] == 0xFF:
            index += 1
        if index >= len(data):
            break
        marker = data[index]
        index += 1
        if marker in (0xD8, 0xD9) or 0xD0 <= marker <= 0xD7:
            continue
        if index + 2 > len(data):
            break
        segment_length = int.from_bytes(data[index : index + 2], "big")
        if segment_length < 2 or index + segment_length > len(data):
            break
        if marker in {
            0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7,
            0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF,
        }:
            if segment_length < 7:
                break
            height, width = struct.unpack_from(">HH", data, index + 3)
            return width, height
        index += segment_length
    return None


def _svg_pixel_value(value: str) -> int | None:
    match = re.fullmatch(r"\s*(\d+(?:\.\d+)?)\s*(?:px)?\s*", value)
    return round(float(match.group(1))) if match else None


def _svg_dimensions(data: bytes) -> tuple[int, int] | None:
    try:
        root = ElementTree.fromstring(data)
    except ElementTree.ParseError:
        return None
    width = _svg_pixel_value(root.attrib.get("width", ""))
    height = _svg_pixel_value(root.attrib.get("height", ""))
    if width and height:
        return width, height
    view_box = re.split(r"[,\s]+", root.attrib.get("viewBox", "").strip())
    if len(view_box) == 4:
        try:
            return round(float(view_box[2])), round(float(view_box[3]))
        except ValueError:
            return None
    return None


def image_dimensions(data: bytes, suffix: str) -> tuple[int, int] | None:
    suffix = suffix.lower()
    if suffix == ".png" and data[:8] == b"\x89PNG\r\n\x1a\n" and len(data) >= 24:
        return struct.unpack_from(">II", data, 16)
    if suffix == ".gif" and data[:3] == b"GIF" and len(data) >= 10:
        return struct.unpack_from("<HH", data, 6)
    if suffix == ".bmp" and data[:2] == b"BM" and len(data) >= 26:
        width, height = struct.unpack_from("<ii", data, 18)
        return abs(width), abs(height)
    if suffix in {".jpg", ".jpeg"} and data[:2] == b"\xff\xd8":
        return _jpeg_dimensions(data)
    if suffix == ".webp" and data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        chunk = data[12:16]
        if chunk == b"VP8X" and len(data) >= 30:
            return (
                int.from_bytes(data[24:27], "little") + 1,
                int.from_bytes(data[27:30], "little") + 1,
            )
        if chunk == b"VP8L" and len(data) >= 25 and data[20] == 0x2F:
            bits = int.from_bytes(data[21:25], "little")
            return (bits & 0x3FFF) + 1, ((bits >> 14) & 0x3FFF) + 1
    if suffix == ".svg":
        return _svg_dimensions(data)
    return None


def _short_context(text: str) -> str:
    text = " ".join(text.split())
    return text if len(text) <= 220 else text[:217].rstrip() + "..."


def _natural_key(value: str) -> list[int | str]:
    return [
        int(part) if part.isdigit() else part.casefold()
        for part in re.split(r"(\d+)", value)
    ]


def document_image_contexts(archive: zipfile.ZipFile) -> dict[str, list[str]]:
    relationships = ElementTree.fromstring(
        archive.read("word/_rels/document.xml.rels")
    )
    media_by_relationship = {
        relationship.attrib["Id"]: posixpath.basename(
            posixpath.normpath(
                posixpath.join("word", relationship.attrib["Target"].replace("\\", "/"))
            )
        )
        for relationship in relationships
        if relationship.attrib.get("Type", "").endswith("/image")
        and relationship.attrib.get("TargetMode") != "External"
    }
    document = ElementTree.fromstring(archive.read("word/document.xml"))
    paragraphs: list[dict[str, str | list[str]]] = []
    current_heading = ""

    for paragraph in document.iter(f"{{{WORD_NS}}}p"):
        text = "".join(
            node.text or "" for node in paragraph.iter(f"{{{WORD_NS}}}t")
        )
        style_node = paragraph.find(
            f"./{{{WORD_NS}}}pPr/{{{WORD_NS}}}pStyle"
        )
        style = style_node.attrib.get(f"{{{WORD_NS}}}val", "") if style_node is not None else ""
        if text.strip() and (
            style.lower().startswith(("heading", "title", "subtitle"))
            or style.lower() in {"h1", "h2", "h3", "h4"}
        ):
            current_heading = text
        relationship_ids = []
        for node in paragraph.iter():
            relationship_id = node.attrib.get(f"{{{REL_NS}}}embed") or node.attrib.get(
                f"{{{REL_NS}}}id"
            )
            if relationship_id in media_by_relationship:
                relationship_ids.append(media_by_relationship[relationship_id])
        paragraphs.append(
            {
                "text": text,
                "heading": current_heading,
                "images": relationship_ids,
            }
        )

    contexts: dict[str, list[str]] = {}
    for index, paragraph in enumerate(paragraphs):
        images = paragraph["images"]
        if not isinstance(images, list):
            continue
        context_parts = []
        heading = str(paragraph["heading"])
        if heading:
            context_parts.append(f"Section: {_short_context(heading)}")
        for offset, label in ((-1, "Before"), (0, "Text"), (1, "After")):
            position = index + offset
            if position < 0 or position >= len(paragraphs):
                continue
            adjacent_text = str(paragraphs[position]["text"])
            if adjacent_text.strip() and adjacent_text.strip() != heading.strip():
                context_parts.append(
                    f"{label}: {_short_context(adjacent_text)}"
                )
        context = " | ".join(context_parts) or "No nearby text or heading"
        for filename in images:
            contexts.setdefault(filename, [])
            if context not in contexts[filename]:
                contexts[filename].append(context)
    return contexts


def _render_inventory(
    records: list[dict[str, str]], skipped: list[dict[str, str]], no_documents: bool
) -> str:
    if no_documents:
        body = (
            "<p>No DOCX files were found in <code>source-docs/</code>. "
            "Add the source documents locally and run this script again.</p>"
        )
    elif not records:
        body = "<p>No images at least 200 pixels on their long side were found.</p>"
    else:
        cards = []
        for record in records:
            path = html.escape(record["path"], quote=True)
            filename = html.escape(record["filename"], quote=True)
            cards.append(
                '<figure class="image">'
                f'<a href="{path}"><img src="{path}" alt="Extracted image {filename}" '
                'loading="lazy"></a>'
                f'<figcaption><strong>{filename}</strong><br>'
                f'{html.escape(record["size"])}<br>'
                f'Source: {html.escape(record["source"])}<br>'
                f'Context: {html.escape(record["context"])}</figcaption>'
                "</figure>"
            )
        body = '<div class="grid">' + "\n".join(cards) + "</div>"
    skipped_html = ""
    if skipped:
        rows = "".join(
            "<li>"
            f'{html.escape(item["filename"])} — {html.escape(item["source"])}'
            f' ({html.escape(item["reason"])})'
            "</li>"
            for item in skipped
        )
        skipped_html = (
            "<details><summary>Images not shown</summary><ul>"
            + rows
            + "</ul></details>"
        )
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Private source image inventory</title>
<style>
body {{ max-width: 1200px; margin: 2rem auto; padding: 0 1rem; font: 16px/1.5 system-ui, sans-serif; color: #172b36; }}
.grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }}
.image {{ margin: 0; padding: .75rem; border: 1px solid #bbc8ca; background: #f6f8f5; }}
.image img {{ display: block; width: 100%; height: 180px; object-fit: contain; background: white; }}
figcaption {{ overflow-wrap: anywhere; margin-top: .5rem; font-size: .9rem; }}
</style>
</head>
<body>
<h1>Private source image inventory</h1>
<p>Local review only. Confirm project association and permission before publishing any image. Documents used only to cross-check co-authored citations are excluded.</p>
{body}
{skipped_html}
</body>
</html>
"""


def main() -> int:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    source_documents = sorted(SOURCE_DIR.glob("*.docx")) if SOURCE_DIR.is_dir() else []
    docx_files = [
        path
        for path in source_documents
        if path.name.lower() not in CITATION_ONLY_DOCUMENTS
    ]
    records: list[dict[str, str]] = []
    skipped: list[dict[str, str]] = []

    for docx_path in docx_files:
        output_dir = RAW_DIR / docx_path.stem
        output_dir.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(docx_path) as archive:
            contexts = document_image_contexts(archive)
            media_files = sorted(
                (
                    name
                    for name in archive.namelist()
                    if name.startswith("word/media/") and not name.endswith("/")
                ),
                key=lambda name: _natural_key(Path(name).name),
            )
            for media_name in media_files:
                data = archive.read(media_name)
                filename = Path(media_name).name
                dimensions = image_dimensions(data, Path(filename).suffix)
                if dimensions is not None and max(dimensions) < MINIMUM_LONG_SIDE:
                    skipped.append(
                        {
                            "filename": filename,
                            "source": docx_path.name,
                            "reason": (
                                f"smaller than {MINIMUM_LONG_SIDE}px "
                                f"({dimensions[0]} x {dimensions[1]}px)"
                            ),
                        }
                    )
                    continue
                destination = output_dir / filename
                destination.write_bytes(data)
                relative_path = destination.relative_to(RAW_DIR).as_posix()
                size_text = (
                    f"{dimensions[0]} x {dimensions[1]} px"
                    if dimensions is not None
                    else "Pixel size unavailable (format not recognised)"
                )
                records.append(
                    {
                        "filename": filename,
                        "path": relative_path,
                        "size": size_text,
                        "source": docx_path.name,
                        "context": " / ".join(contexts.get(filename, [])),
                    }
                )

    INVENTORY_PATH.write_text(
        _render_inventory(records, skipped, no_documents=not docx_files),
        encoding="utf-8",
    )
    if not source_documents:
        print(
            f"No DOCX files found in {SOURCE_DIR}. "
            f"Created an empty inventory at {INVENTORY_PATH}.",
            file=sys.stderr,
        )
        return 0
    print(
        f"Inventoried {len(records)} images; skipped {len(skipped)} small images. "
        f"Excluded {len(source_documents) - len(docx_files)} citation-only documents. "
        f"Contact sheet: {INVENTORY_PATH}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
