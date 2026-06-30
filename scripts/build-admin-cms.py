#!/usr/bin/env python3
"""Assemble admin.html from Claude CMS design extract + Firebase auth shell."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
DESIGN = ROOT / "_extracted-admin-design.html"
OUT = ROOT / "admin.html"
CMS_JS = ROOT / "admin-cms.js"

HEAD = """<!DOCTYPE html>
<html lang="kk">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Әкімші — Aul Bilim CMS</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="steppe.css?v=43" />
<script src="uploads/firebase-config.js"></script>
<script src="uploads/auth.js"></script>
<script src="uploads/content-schema.js"></script>
<script src="uploads/db.js"></script>
<link rel="stylesheet" href="admin.css?v=1" />
</head>
"""

GATE = """
<div id="gate">
  <div class="gate-card">
    <div class="gate-logo"><span class="sun" aria-hidden="true"></span><span class="logo-name">Aul<span class="logo-mark">Bilim</span></span></div>
    <p class="gate-sub">Мазмұнды басқару жүйесі</p>
    <input type="email" id="email-input" placeholder="Email" autocomplete="username" />
    <input type="password" id="pw-input" placeholder="Құпия сөз" autocomplete="current-password" />
    <button class="btn" id="pw-btn">Кіру</button>
    <p class="gate-err" id="pw-err">Кіру мүмкін болмады. Firebase конфигурациясын және тіркелгіні тексеріңіз.</p>
    <p class="gate-hint">Firebase Auth арқылы қорғалған әкімші кіруі.</p>
  </div>
</div>
"""

TAIL = """
<div id="toast"></div>
<script src="admin-cms.js?v=1"></script>
<script src="uploads/school-registry.js"></script>
<script src="assets/kostanay-schools.js?v=3"></script>
<script src="assets/akmola-schools.js?v=7"></script>
<script src="assets/west-kazakhstan-schools.js?v=3"></script>
<script src="assets/karaganda-schools.js?v=3"></script>
<script src="assets/abay-schools.js?v=3"></script>
<script src="assets/kyzylorda-schools.js?v=3"></script>
<script src="assets/almaty-schools.js?v=3"></script>
<script src="admin-schools.js"></script>
</body>
</html>
"""


def extract_between(text: str, start: str, end: str) -> str:
    i = text.index(start)
    j = text.index(end, i)
    return text[i:j]


def fix_stat_labels(html: str) -> str:
    """Split single stat-N-l into bilingual stat-N-l-kk / stat-N-l-en."""
    def repl(m):
        n = m.group(1)
        rest = m.group(2)
        return (
            f'<input class="sl" type="text" data-page="index.html" data-key="stat-{n}-l-kk"{rest}>'
            f'<input class="sl sl-en" type="text" data-page="index.html" data-key="stat-{n}-l-en"{rest}>'
        )
    return re.sub(
        r'<input class="sl" type="text" data-page="index\.html" data-key="stat-(\d+)-l"([^>]*)>',
        repl,
        html,
    )


def main() -> None:
    text = DESIGN.read_text(encoding="utf-8")

    css = extract_between(text, "/* ══════════════════════════════════════════════════════\n   ADMIN SHELL", "#toast.err { background: #c0392b; }")
    css = ":root {\n  --primary:#1B4F8A; --primary-dark:#143A6E; --primary-light:#2D6AB4;\n  --accent:#F2A413; --accent-deep:#E8820A; --accent-soft:#FFD27A;\n  --cream:#FBF5E9; --cream-deep:#F4E8D2;\n  --ink:#21232E; --body:#4A4A5E; --line:rgba(0,0,0,0.08);\n  --fh:'Raleway',sans-serif; --fb:'Inter',sans-serif;\n}\n" + css
    css += "\n.stat-cell input.sl-en { margin-top: 4px; font-size: 10.5px; opacity: 0.85; }\n"
    css += "@media (max-width:1100px){.prog-cards,.story-grid{grid-template-columns:1fr 1fr;}.car-grid{grid-template-columns:repeat(3,1fr);}.stat-editor{grid-template-columns:1fr 1fr;}}\n"
    css += "@media (max-width:700px){.tf-pair,.se-row2{grid-template-columns:1fr;}.prog-cards,.story-grid,.team-grid,.car-grid{grid-template-columns:1fr;}.stat-editor{grid-template-columns:1fr;}}\n"
    (ROOT / "admin.css").write_text(css + "\n", encoding="utf-8")

    app = extract_between(text, '<div id="app">', '</div><!-- #app -->')
    app = fix_stat_labels(app)

    OUT.write_text(HEAD + "<body>\n" + GATE + "\n" + app + "\n</div><!-- #app -->\n" + TAIL, encoding="utf-8")
    print(f"Wrote {OUT} and admin.css")


if __name__ == "__main__":
    main()
