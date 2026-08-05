#!/usr/bin/env python3
"""Normalize footer explore/contact keys across all public pages."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGES = ["index.html", "about.html", "programs.html", "school.html", "results.html"]
FOOT_LINK_KEYS = ["fitout", "ustaz", "samruk", "results", "about"]


def fix_footer(text: str) -> str:
    # unify school footer about blurb with global
    text = re.sub(
        r'<p class="foot-tag">.*?</p>',
        '<p class="about"><span lang="kk" data-copy="global-foot-about-kk">Auyl Bilim — Қазақстан Халқына, Білім Инновация және Jelken Foundation қорларының бірлескен қайырымдылық жобасы.</span><span lang="ru" data-copy="global-foot-about-ru">Auyl Bilim — совместный благотворительный проект фондов «Қазақстан Халқына», «Білім Инновация» и Jelken Foundation.</span></p>',
        text,
        count=1,
        flags=re.S,
    )

    m = re.search(
        r'(<div class="foot-grid">.*?<div>\s*<h4>.*?(?:Зерттеу|Explore).*?</h4>)(.*?)(</div>\s*<div>\s*<h4>.*?(?:Байланыс|Contact))',
        text,
        re.S,
    )
    if not m:
        return text
    links_block = m.group(2)
    links = re.findall(r"<a\b[^>]*>.*?</a>", links_block, re.S)
    new_links = []
    for i, link in enumerate(links):
        slug = FOOT_LINK_KEYS[i] if i < len(FOOT_LINK_KEYS) else f"link{i+1}"
        link = re.sub(
            r'<span lang="(kk|ru)"[^>]*>',
            lambda s, slug=slug: f'<span lang="{s.group(1)}" data-copy="global-foot-link-{slug}-{s.group(1)}">',
            link,
        )
        new_links.append(link)
    new_block = links_block
    for old, new in zip(links, new_links):
        new_block = new_block.replace(old, new, 1)
    text = text.replace(m.group(0), m.group(1) + new_block + m.group(3), 1)

    text = re.sub(
        r'(<h4>\s*<span lang="kk" data-copy="global-foot-explore-h-kk">Зерттеу</span>\s*)<span lang="ru"[^>]*>',
        r'\1<span lang="ru" data-copy="global-foot-explore-h-ru">',
        text,
    )
    text = re.sub(
        r'(<h4>\s*<span lang="kk" data-copy="global-foot-contact-h-kk">Байланыс</span>\s*)<span lang="ru"[^>]*>',
        r'\1<span lang="ru" data-copy="global-foot-contact-h-ru">',
        text,
    )
    return text


STALE_KEYS = {
    "global-nav-fitout-kk",
    "global-nav-fitout-ru",
    "global-nav-ustaz-kk",
    "global-nav-ustaz-ru",
    "global-nav-samruk-kk",
    "global-nav-samruk-ru",
}

EXTRA_FIELDS = {
    "index-001-kk": {"label": "Hero — H1 wrapper (қазақша)", "type": "html"},
    "index-002-ru": {"label": "Hero — H1 wrapper (русский)", "type": "html"},
    "index-hero-mark-kk": {"label": "Hero — белгіленген сөз (қазақша)", "type": "text"},
    "index-hero-mark-ru": {"label": "Hero — выделенная фраза (русский)", "type": "text"},
    "index-map-kicker-kk": {"label": "Қамтылған өңірлер", "type": "text"},
    "index-map-kicker-ru": {"label": "Охваченные регионы", "type": "text"},
    "programs-053-kk": {
        "label": "Мұғалімдер мен мектеп басшыларының кәсіби әлеуетін көтеру…",
        "type": "html",
    },
}


def label_for_key(text: str, key: str) -> str:
    simple = re.search(
        rf'data-copy="{re.escape(key)}"[^>]*>([^<]+)</span>',
        text,
    )
    if simple:
        return re.sub(r"\s+", " ", simple.group(1)).strip()
    nested = re.search(
        rf'data-copy="{re.escape(key)}"[^>]*>(.*?)</span>',
        text,
        re.S,
    )
    if nested:
        inner = re.sub(r"<[^>]+>", " ", nested.group(1))
        return re.sub(r"\s+", " ", inner).strip()
    return key


def scan_registry():
    fields = []
    seen = set()

    def add(page, key, label, section, ftype):
        if key in STALE_KEYS:
            return
        if (page, key) in seen:
            return
        seen.add((page, key))
        extra = EXTRA_FIELDS.get(key, {})
        fields.append({
            "page": page,
            "key": key,
            "selector": f'[data-copy="{key}"]',
            "label": extra.get("label", label)[:90],
            "section": section,
            "type": extra.get("type", ftype),
        })

    for name in PAGES:
        text = (ROOT / name).read_text(encoding="utf-8")
        page = name
        keys = []
        for m in re.finditer(r'data-copy="([^"]+)"', text):
            keys.append(m.group(1))
        for key in dict.fromkeys(keys):
            label = label_for_key(text, key)
            page_id = "site_shared" if key.startswith("global-") else page
            section = "Content"
            if key.startswith("global-nav-"):
                section = "Navigation"
            elif key.startswith("global-foot-") or key == "global-foot-brand":
                section = "Footer"
            elif key.startswith("global-skip-"):
                section = "Accessibility"
            elif "-stat-" in key:
                section = "Statistics"
            ftype = "textarea" if len(label) > 80 else "text"
            add(page_id, key, label or key, section, ftype)
        for m in re.finditer(r'<div class="n" data-copy="([^"]+)">([^<]+)</div>', text):
            key, val = m.group(1), m.group(2).strip()
            page_id = "site_shared" if key.startswith("global-") else page
            add(page_id, key, f"Stat: {val}", "Statistics", "text")
        for m in re.finditer(r'<h3 class="foot-brand-title" data-copy="([^"]+)">([^<]*)</h3>', text):
            add("site_shared", m.group(1), m.group(2).strip(), "Footer", "text")

    return fields


def main():
    for name in PAGES:
        p = ROOT / name
        if p.exists():
            p.write_text(fix_footer(p.read_text(encoding="utf-8")), encoding="utf-8")

    fields = scan_registry()
    out = ROOT / "uploads" / "copy-registry.js"
    out.write_text(
        "/** Auto-generated — run scripts/fix-global-copy-keys.py after HTML edits. */\n"
        "(function () {\n  'use strict';\n  window.COPY_REGISTRY = "
        + json.dumps(fields, ensure_ascii=False, indent=2)
        + ";\n})();\n",
        encoding="utf-8",
    )
    print(f"Fixed footer keys, {len(fields)} registry fields")


if __name__ == "__main__":
    main()
