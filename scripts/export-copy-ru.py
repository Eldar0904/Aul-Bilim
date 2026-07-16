#!/usr/bin/env python3
"""Export all Russian site copy to copy-ru.md (project root)."""
from __future__ import annotations

import json
import re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "uploads" / "copy-registry.js"
OUT = ROOT / "copy-ru.md"
PAGES = ["index.html", "about.html", "programs.html", "school.html"]


class RuSpanParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.entries: list[tuple[str, str]] = []
        self._in_ru = False
        self._key = ""
        self._buf: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag != "span":
            return
        ad = {k: v for k, v in attrs if v is not None}
        if ad.get("lang") == "ru":
            self._in_ru = True
            self._key = ad.get("data-copy", "")
            self._buf = []

    def handle_endtag(self, tag: str) -> None:
        if tag == "span" and self._in_ru:
            text = re.sub(r"\s+", " ", "".join(self._buf)).strip()
            if text:
                self.entries.append((self._key, text))
            self._in_ru = False
            self._key = ""
            self._buf = []

    def handle_data(self, data: str) -> None:
        if self._in_ru:
            self._buf.append(data)


def load_registry() -> list[dict]:
    src = REGISTRY.read_text(encoding="utf-8")
    m = re.search(r"window\.COPY_REGISTRY\s*=\s*(\[.*?\]);", src, re.S)
    if not m:
        raise SystemExit("COPY_REGISTRY not found")
    return json.loads(m.group(1))


def main() -> None:
    reg = load_registry()
    ru_reg = [e for e in reg if e.get("key", "").endswith("-ru")]

    lines = [
        "# Aul Bilim — Russian copy (RU)",
        "",
        "Reference export of all Russian UI strings on the public site.",
        "Regenerate: `python scripts/export-copy-ru.py`",
        "",
        "> Source of truth for editable copy: HTML `lang=\"ru\"` spans + `uploads/copy-registry.js` CMS keys.",
        "",
    ]

    lines.append("## Page titles")
    lines.append("")
    for fname in PAGES:
        html = (ROOT / fname).read_text(encoding="utf-8")
        tm = re.search(r"<title[^>]*data-ru=\"([^\"]+)\"", html)
        if tm:
            lines.append(f"- **{fname}**: {tm[1]}")
    lines.append("")

    by_page: dict[str, list[dict]] = {}
    for e in ru_reg:
        by_page.setdefault(e.get("page", "unknown"), []).append(e)

    order = ["site_shared", "index", "about", "programs", "school"]
    for page in order + sorted(k for k in by_page if k not in order):
        items = by_page.get(page)
        if not items:
            continue
        lines.append(f"## {page}")
        lines.append("")
        by_section: dict[str, list[dict]] = {}
        for e in items:
            by_section.setdefault(e.get("section", "General"), []).append(e)
        for section, sect_items in by_section.items():
            lines.append(f"### {section}")
            lines.append("")
            for e in sect_items:
                label = " ".join((e.get("label") or "").split())
                lines.append(f"- `{e['key']}`: {label}")
            lines.append("")

    lines.append("## HTML-only Russian strings (full text from pages)")
    lines.append("")
    for fname in PAGES:
        parser = RuSpanParser()
        parser.feed((ROOT / fname).read_text(encoding="utf-8"))
        lines.append(f"### {fname}")
        lines.append("")
        seen: set[str] = set()
        for key, text in parser.entries:
            if text in seen:
                continue
            seen.add(text)
            prefix = f"`{key}` — " if key else ""
            lines.append(f"- {prefix}{text}")
        lines.append("")

    lines.append("## Dynamic strings (map.js / school.js)")
    lines.append("")
    map_src = (ROOT / "map.js").read_text(encoding="utf-8")
    for m in re.finditer(r"bi\('([^']*)',\s*'([^']*)'\)", map_src):
        lines.append(f"- `{m.group(2)}`")
    lines.append("")
    for m in re.finditer(r"ru:\s*'([^']+)'", map_src):
        val = m.group(1)
        if len(val) > 20:
            lines.append(f"- {val}")
    lines.append("")

    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {OUT} ({len(ru_reg)} registry keys, {sum(len(v) for v in by_page.values())} total)")


if __name__ == "__main__":
    main()
