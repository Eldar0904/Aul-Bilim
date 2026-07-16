#!/usr/bin/env python3
"""Tag hero copy fields in uploads/copy-registry.js and add any missing hero keys."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "uploads" / "copy-registry.js"

HERO_META = {
    # index.html — home hero
    "index-001-kk": {"section": "Hero", "type": "html", "label": "Hero — H1 wrapper (қазақша)"},
    "index-002-ru": {"section": "Hero", "type": "html", "label": "Hero — H1 wrapper (русский)"},
    "index-hero-mark-kk": {"section": "Hero", "label": "Hero — белгіленген сөз (қазақша)"},
    "index-hero-mark-ru": {"section": "Hero", "label": "Hero — выделенная фраза (русский)"},
    "index-hero-sub-kk": {"section": "Hero"},
    "index-hero-sub-ru": {"section": "Hero"},
    "index-009-kk": {"section": "Hero", "label": "Hero — lead paragraph 1 (қазақша)"},
    "index-010-ru": {"section": "Hero", "label": "Hero — lead paragraph 1 (русский)"},
    "index-011-kk": {"section": "Hero", "label": "Hero — lead paragraph 2 (қазақша)"},
    "index-012-ru": {"section": "Hero", "label": "Hero — lead paragraph 2 (русский)"},
    # about.html — mission header
    "about-007-kk": {"section": "Hero", "label": "Mission title (қазақша)"},
    "about-008-ru": {"section": "Hero", "label": "Mission title (русский)"},
    "about-009-kk": {"section": "Hero"},
    "about-010-ru": {"section": "Hero"},
    "about-011-kk": {"section": "Hero"},
    "about-012-ru": {"section": "Hero"},
    "about-013-kk": {"section": "Hero"},
    "about-014-ru": {"section": "Hero"},
    "about-015-kk": {"section": "Hero"},
    "about-016-ru": {"section": "Hero"},
    # programs.html — program heroes
    "programs-025-kk": {
        "section": "Hero",
        "heroGroup": "fitout",
        "type": "html",
        "label": "Hero — title (қазақша)",
        "page": "programs.html",
        "selector": '[data-copy="programs-025-kk"]',
    },
    "programs-026-ru": {
        "section": "Hero",
        "heroGroup": "fitout",
        "type": "html",
        "label": "Hero — title (русский)",
        "page": "programs.html",
        "selector": '[data-copy="programs-026-ru"]',
    },
    "programs-027-kk": {"section": "Hero", "heroGroup": "fitout"},
    "programs-028-ru": {"section": "Hero", "heroGroup": "fitout"},
    "programs-047-kk": {
        "section": "Hero",
        "heroGroup": "ustaz",
        "type": "html",
        "label": "Hero — title (қазақша)",
        "page": "programs.html",
        "selector": '[data-copy="programs-047-kk"]',
    },
    "programs-048-ru": {
        "section": "Hero",
        "heroGroup": "ustaz",
        "type": "html",
        "label": "Hero — title (русский)",
        "page": "programs.html",
        "selector": '[data-copy="programs-048-ru"]',
    },
    "programs-049-kk": {"section": "Hero", "heroGroup": "ustaz"},
    "programs-050-ru": {"section": "Hero", "heroGroup": "ustaz"},
    "programs-091-kk": {"section": "Hero", "heroGroup": "samruk", "type": "html"},
    "programs-092-ru": {"section": "Hero", "heroGroup": "samruk", "type": "html"},
    "programs-093-kk": {"section": "Hero", "heroGroup": "samruk"},
    "programs-094-ru": {"section": "Hero", "heroGroup": "samruk"},
}

HTML_DEFAULTS = {
    "programs-025-kk": "Инновациялық кабинеттер құру",
    "programs-026-ru": "Создание инновационных кабинетов",
    "programs-047-kk": "Оқыту курстары",
    "programs-048-ru": "Курсы обучения",
    "programs-091-kk": "Тәлімгерлік",
    "programs-092-ru": "Наставничество",
}

STALE_KEYS = {
    "global-nav-fitout-kk",
    "global-nav-fitout-ru",
    "global-nav-ustaz-kk",
    "global-nav-ustaz-ru",
    "global-nav-samruk-kk",
    "global-nav-samruk-ru",
}


def load_registry():
    text = REGISTRY.read_text(encoding="utf-8")
    m = re.search(r"window\.COPY_REGISTRY\s*=\s*(\[.*\])\s*;", text, re.S)
    if not m:
        raise SystemExit("Could not parse copy-registry.js")
    return json.loads(m.group(1)), text


def main():
    fields, _ = load_registry()
    fields = [f for f in fields if f["key"] not in STALE_KEYS]
    by_key = {f["key"]: f for f in fields}

    for key, meta in HERO_META.items():
        if key in by_key:
            entry = by_key[key]
            for k, v in meta.items():
                if k in ("page", "selector"):
                    continue
                entry[k] = v
        else:
            page = meta.get("page", "index.html" if key.startswith("index-") else "programs.html")
            fields.append({
                "page": page,
                "key": key,
                "selector": meta.get("selector", f'[data-copy="{key}"]'),
                "label": meta.get("label", key),
                "section": meta["section"],
                "type": meta.get("type", "text"),
                **({"heroGroup": meta["heroGroup"]} if "heroGroup" in meta else {}),
            })
            by_key[key] = fields[-1]

    lines = [
        "/** Auto-generated — run scripts/fix-global-copy-keys.py after HTML edits. */",
        "(function () {",
        "  'use strict';",
        "  window.COPY_REGISTRY = " + json.dumps(fields, ensure_ascii=False, indent=2) + ";",
        "})();",
        "",
    ]
    REGISTRY.write_text("\n".join(lines), encoding="utf-8")
    hero_count = sum(1 for f in fields if f.get("section") == "Hero")
    print(f"Tagged {hero_count} hero fields in {REGISTRY}")


if __name__ == "__main__":
    main()
