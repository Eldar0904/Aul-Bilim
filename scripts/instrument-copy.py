#!/usr/bin/env python3
"""Add data-copy attributes to public HTML and generate uploads/copy-registry.js."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGES = ["index.html", "about.html", "programs.html", "school.html", "results.html"]

NAV_KEYS = ["home", "services", "regions", "results", "about"]
FOOT_LINK_KEYS = ["fitout", "ustaz", "samruk", "results", "about"]

SKIP_TAGS = re.compile(r"<(script|style|svg|noscript)\b", re.I)
SPAN_LANG = re.compile(
    r'<span\s+lang="(kk|ru)"([^>]*)>(.*?)</span>',
    re.S | re.I,
)


def strip_tags(s: str) -> str:
    return re.sub(r"<[^>]+>", "", s).replace("&amp;", "&").strip()


def has_nested_lang(inner: str) -> bool:
    return bool(re.search(r'<span\s+lang="(kk|ru)"', inner, re.I))


def in_region(text: str, pos: int, start_pat: str, end_pat: str) -> bool:
    start = text.rfind(start_pat, 0, pos)
    if start < 0:
        return False
    end = text.find(end_pat, start)
    return end < 0 or pos < end


def nav_key_for(text: str, pos: int, lang: str) -> str | None:
    if not in_region(text, pos, "<nav", "</nav>"):
        return None
    chunk = text[pos : pos + 400]
    for i, slug in enumerate(NAV_KEYS, 1):
        if f'nav-links' in text[max(0, pos - 200) : pos + 50]:
            # count which <a> we're in within nav-links
            nav_start = text.rfind('<div class="nav-links">', 0, pos)
            if nav_start < 0:
                return None
            nav_end = text.find("</div>", nav_start)
            segment = text[nav_start:pos]
            link_idx = segment.count("<a ")
            if 1 <= link_idx <= len(NAV_KEYS):
                return f"global-nav-{NAV_KEYS[link_idx - 1]}-{lang}"
    return None


def footer_key_for(text: str, pos: int, lang: str, inner: str) -> str | None:
    if not in_region(text, pos, "<footer", "</footer>"):
        return None
    before = text[max(0, pos - 600) : pos]
    plain = strip_tags(inner)[:40]

    if "skip-link" in before or "skip-link" in text[max(0, pos - 80) : pos]:
        return f"global-skip-{lang}"

    if "<h4>" in before and "foot-grid" in before:
        if "Зерттеу" in plain or "Explore" in plain:
            return None
        if "Байланыс" in plain or "Contact" in plain:
            return None

    if 'class="about"' in before or "foot-brand" in before:
        if len(plain) > 30:
            return f"global-foot-about-{lang}"

    if "<h4>" in before:
        h4_chunk = before[before.rfind("<h4>") :]
        if "Зерттеу" in h4_chunk or "Explore" in h4_chunk:
            foot_start = before.rfind('<div class="foot-grid">')
            col = text[foot_start:pos]
            if col.count("<div>") >= 2:
                link_seg = text[max(0, pos - 300) : pos]
                a_count = link_seg.count("<a ")
                if 1 <= a_count <= len(FOOT_LINK_KEYS):
                    return f"global-foot-link-{FOOT_LINK_KEYS[a_count - 1]}-{lang}"
        if "Байланыс" in h4_chunk or "Contact" in h4_chunk:
            if "Астана" in plain or "Astana" in plain:
                return f"global-foot-address-{lang}"

    if "foot-bottom" in before:
        if "қоғамдық" in plain or "community" in plain:
            return f"global-foot-tagline-{lang}"
        return None

    if "<h4>" in before:
        h4_inner = re.search(r"<h4>.*?</h4>", before, re.S)
        if h4_inner:
            h4t = strip_tags(h4_inner.group(0))
            if h4t in ("Зерттеу", "Explore"):
                return f"global-foot-explore-h-{lang}"
            if h4t in ("Байланыс", "Contact"):
                return f"global-foot-contact-h-{lang}"

    return None


def instrument_file(path: Path):
    text = path.read_text(encoding="utf-8")
    page = path.name
    page_slug = page.replace(".html", "").replace("-", "_")
    seq = 0
    fields = []
    seen_keys = set()

    def register(key, label, section, field_type="text"):
        page_id = "site_shared" if key.startswith("global-") else page
        dedup = (page_id, key)
        if dedup in seen_keys:
            return key
        seen_keys.add(dedup)
        fields.append({
            "page": page_id,
            "key": key,
            "selector": f'[data-copy="{key}"]',
            "label": label[:90],
            "section": section,
            "type": "textarea" if field_type == "textarea" or len(label) > 70 else "text",
        })
        return key

    def repl(m):
        nonlocal seq, text
        lang = m.group(1).lower()
        attrs = m.group(2)
        inner = m.group(3)
        pos = m.start()

        if "data-copy=" in attrs:
            existing = re.search(r'data-copy="([^"]+)"', attrs)
            if existing:
                existing_key = existing.group(1)
                existing_plain = re.sub(r"\s+", " ", strip_tags(inner)).strip()
                if existing_plain:
                    if existing_key.startswith("global-nav-"):
                        existing_section = "Navigation"
                    elif existing_key.startswith("global-"):
                        existing_section = "Footer"
                    else:
                        existing_section = "Content"
                    register(existing_key, existing_plain, existing_section, "textarea" if len(existing_plain) > 80 else "text")
            return m.group(0)
        if has_nested_lang(inner):
            return m.group(0)
        if SKIP_TAGS.search(text[max(0, pos - 100) : pos]):
            return m.group(0)
        if 'class="lang-switch"' in text[max(0, pos - 200) : pos]:
            return m.group(0)
        if 'class="crumbs"' in text[max(0, pos - 120) : pos]:
            return m.group(0)

        plain = re.sub(r"\s+", " ", strip_tags(inner)).strip()
        if not plain:
            return m.group(0)

        key = nav_key_for(text, pos, lang)
        section = "Navigation"
        if not key:
            key = footer_key_for(text, pos, lang, inner)
            section = "Footer"
        if not key and in_region(text, pos, 'class="skip-link"', "</a>"):
            key = f"global-skip-{lang}"
            section = "Accessibility"
        if not key:
            seq += 1
            key = f"{page_slug}-{seq:03d}-{lang}"
            section = "Content"

        ftype = "textarea" if len(plain) > 80 or "<" in inner else "text"
        register(key, plain, section, ftype)
        return f'<span lang="{lang}" data-copy="{key}"{attrs}>{inner}</span>'

    # stat numbers
    def repl_n(m):
        if "data-copy=" in m.group(0):
            return m.group(0)
        seq_n = len([f for f in fields if f["key"].endswith("-n")]) + 1
        val = m.group(1).strip()
        key = register(f"{page_slug}-stat-{seq_n:02d}-n", f"Stat: {val}", "Statistics", "text")
        return f'<div class="n" data-copy="{key}">{val}</div>'

    text = re.sub(r'<div class="n">([^<]+)</div>', repl_n, text)

    # big stat numbers
    def repl_big(m):
        if "data-copy=" in m.group(0):
            return m.group(0)
        seq_b = len([f for f in fields if "-big-" in f["key"]]) + 1
        val = m.group(1).strip()
        key = register(f"{page_slug}-big-{seq_b:02d}", f"Big stat: {val}", "Statistics", "text")
        return f'<div class="big" data-copy="{key}">{val}</div>'

    text = re.sub(r'<div class="big">([^<]+)</div>', repl_big, text)

    # foot brand title
    text = re.sub(
        r'<h3 class="foot-brand-title">([^<]+)</h3>',
        lambda m: f'<h3 class="foot-brand-title" data-copy="global-foot-brand">{m.group(1)}</h3>',
        text,
    )
    if "global-foot-brand" not in seen_keys:
        register("global-foot-brand", "Auyl Bilim", "Footer", "text")

    # multiple passes for nested spans (innermost first)
    for _ in range(8):
        new_text = SPAN_LANG.sub(repl, text)
        if new_text == text:
            break
        text = new_text

    path.write_text(text, encoding="utf-8")
    return fields


def main():
    all_fields = []
    global_seen = set()
    for name in PAGES:
        p = ROOT / name
        if p.exists():
            for f in instrument_file(p):
                gk = (f["page"], f["key"])
                if gk not in global_seen:
                    global_seen.add(gk)
                    all_fields.append(f)

    lines = [
        "/** Auto-generated — re-run scripts/instrument-copy.py after HTML edits. */",
        "(function () {",
        "  'use strict';",
        "  window.COPY_REGISTRY = " + json.dumps(all_fields, ensure_ascii=False, indent=2) + ";",
        "})();",
        "",
    ]
    out = ROOT / "uploads" / "copy-registry.js"
    out.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {len(all_fields)} fields to {out}")


if __name__ == "__main__":
    main()
