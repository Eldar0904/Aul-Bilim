import json
import re
from pathlib import Path

FLAG = re.compile(
    r"имени|Основная|Средняя|Опорная|ская|ский|ское|[^а-яәіңғүұқөһА-ЯӘІҢҒҮҰҚӨҺ\s\d№\.\-\"«»]|школ|село |села |поселка|станции|образователь|отдел|управлен|комплекс|ресурс|Ондир|им\.|им |СОШ|детский",
    re.I,
)

issues = []
for path in sorted(Path("assets").glob("*-schools.js")):
    data = json.loads(path.read_text(encoding="utf-8").split("=", 1)[1].rstrip(";\n"))
    for s in data.get("schools", []):
        name = s.get("kk", "")
        if FLAG.search(name):
            issues.append({"file": path.name, "kk": name, "en": s.get("en", "")})

Path("scripts/kk-title-issues.json").write_text(
    json.dumps(issues, ensure_ascii=False, indent=2), encoding="utf-8"
)
print(len(issues), "school title issues")
