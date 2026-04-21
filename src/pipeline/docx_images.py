"""
docx_images.py

Image extraction from paragraphs and structured-document tags (SDT).

The pipeline produces image records that carry a positional doc_index
matching the block doc_index used in the main ingest loop. That
alignment is essential: parse.py matches images to their surrounding
paragraph by this index, and any drift (say, indexing only over
doc.paragraphs while blocks also count tables and SDTs) produces
images that appear next to the wrong text.

Two sources are covered here:
  * _extract_images_from_paragraph - the common case, images
    embedded inside a <w:p> via <w:drawing> / <w:pict>.
  * _extract_images_from_sdt - cover-page and template content
    that Word wraps in a Structured Document Tag.

The record shape is identical across sources so parse.py can treat
them uniformly.
"""

from __future__ import annotations

import re
from typing import List

from lxml import etree

from .docx_common import W_NS


def _extract_images_from_paragraph(p_element, doc_index: int) -> List[dict]:
    """
    Find images embedded in a paragraph element and return positional
    records, one per embedded image.

    Each record carries:
      - doc_index: same counter the block loop uses, so parse.py can
        match an image to the paragraph it appears in.
      - run_index: position within the paragraph's runs, useful when
        deciding whether the image sits before or after text.
      - rel_id: the relationship id (rId...) pointing to the image
        file in the docx zip; parse.py uses it to read the bytes.
      - width_emu / height_emu: display size in Word's EMU units
        (English Metric Units), read from <wp:extent>. parse.py
        converts to pixels for the <img> tag.

    Runs without <w:drawing>, <w:pict>, or any r:embed attribute are
    skipped fast; serializing XML per run is not free.
    """
    images: List[dict] = []

    try:
        runs = p_element.findall(f"{W_NS}r")
        for run_idx, r in enumerate(runs):
            try:
                run_xml_bytes = etree.tostring(r)
                run_xml = run_xml_bytes.decode("utf-8") if isinstance(run_xml_bytes, bytes) else run_xml_bytes
            except Exception:
                run_xml = ""

            if not run_xml:
                continue

            if "<w:drawing" not in run_xml and "<w:pict" not in run_xml and "r:embed=" not in run_xml:
                continue

            embeds = re.findall(r'r:embed="(rId\d+)"', run_xml)
            if not embeds:
                continue

            w_emu, h_emu = 0, 0
            extents = re.findall(r'<wp:extent\s+cx="(\d+)"\s+cy="(\d+)"', run_xml)
            if extents:
                w_emu, h_emu = int(extents[0][0]), int(extents[0][1])

            for rel_id in embeds:
                images.append({
                    "doc_index": doc_index,
                    "run_index": run_idx,
                    "rel_id": rel_id,
                    "width_emu": w_emu,
                    "height_emu": h_emu,
                    "source": "paragraph",
                })
    except Exception:
        pass

    return images


def _extract_images_from_sdt(sdt_element, doc_index: int) -> List[dict]:
    """
    Find images inside an SDT (Structured Document Tag). Word uses
    SDTs for cover-page content, content-control placeholders, and
    some template-driven regions.

    Records use the same doc_index as the block loop, so parse.py
    sees consistent indexing regardless of source.
    """
    images: List[dict] = []

    try:
        blips = sdt_element.xpath(
            ".//a:blip",
            namespaces={"a": "http://schemas.openxmlformats.org/drawingml/2006/main"},
        )
        for blip in blips:
            embed_id = blip.get(
                "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed"
            )
            if not embed_id:
                continue

            images.append({
                "doc_index": doc_index,
                "run_index": 0,
                "rel_id": embed_id,
                "width_emu": 0,
                "height_emu": 0,
                "source": "sdt",
            })
    except Exception:
        pass

    return images