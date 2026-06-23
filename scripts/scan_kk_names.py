import json
import re
from pathlib import Path

assets = Path("assets")
issues = []
for path in sorted(assets.glob("*-schools.js")):
    text = path.read_text(encoding="utf-8")
    for m in re.finditer(r'"kk":\s*"([^"]+)"', text):
        name = m.group(1)
        if re.search(
            r"имени|Основная|Средняя|Опорная|ская|ский|ское|школ|село |села |поселка|станции|образователь|отдел|управлен|комплекс|ресурс|Ондир|ondir|\"мектеб|СОШ|им\.|им ",
            name,
            re.I,
        ):
            issues.append((path.name, name))

out = Path("scripts/kk-name-issues.json")
out.write_text(json.dumps(issues, ensure_ascii=False, indent=2), encoding="utf-8")
print(len(issues), "flagged names ->", out)
