import json
import re
from pathlib import Path

assets = Path(__file__).resolve().parents[1] / "assets"
issues = []
latin_issues = []

for path in sorted(assets.glob("*-schools.js")):
    text = path.read_text(encoding="utf-8")
    for m in re.finditer(r'"kk":\s*"([^"]+)"', text):
        name = m.group(1)
        if re.search(r"[A-Za-z]", name):
            latin_issues.append((path.name, name))
        if re.search(
            r"имени|Основная|Средняя|Опорная|ская|ский|ское|школ|село |села |поселка|станции|образователь|отдел|управлен|комплекс|ресурс|Ондир|ondir|\"мектеб|^ени\s|^\s*мектебі\s*$",
            name,
            re.I,
        ):
            issues.append((path.name, name))

out = Path(__file__).resolve().parent / "kk-name-issues.json"
out.write_text(json.dumps(issues, ensure_ascii=False, indent=2), encoding="utf-8")
latin_out = Path(__file__).resolve().parent / "kk-latin-issues.json"
latin_out.write_text(json.dumps(latin_issues, ensure_ascii=False, indent=2), encoding="utf-8")
print(len(issues), "flagged names ->", out)
print(len(latin_issues), "latin in kk ->", latin_out)
