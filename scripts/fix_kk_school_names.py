"""Fix Kazakh school card titles: nominative + атындағы, gymnasium order, reversed titles."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
sys.path.insert(0, str(Path(__file__).resolve().parent))

from school_data_utils import _polish_en_title, _polish_kk_title  # noqa: E402

# Person / title phrases that were stored in Russian genitive.
GENITIVE_PERSON_FIXES: dict[str, str] = {
    "академика Т.Б. Даркамбаева": "Т.Б. Даркамбаев",
    "Омара Шипина": "Омар Шипин",
    "Ыбырая Алтынсарина": "Ыбырай Алтынсарин",
    'Ыбырая Алтынсарина"': "Ыбырай Алтынсарин",
    "Сапара Ергалиева": "Сапар Ерғалиев",
    "Жакыпа Акбаева": "Жакып Акбаев",
    "Габидена Мустафина": "Габиден Мустафин",
    "Прокофия Корниенко": "Прокофий Корниенко",
    "Касыма Аманжолова": "Касым Аманжолов",
    "Касыма Кайсенова": "Касым Кайсенов",
    "Бауыржана Момышулы": "Бауыржан Момышұлы",
    "Мукагали Макатаева": "Мұқағали Мақатаев",
    'Мукагали Макатаева"': "Мұқағали Мақатаев",
    "Алимхана Ермекова": "Алимхан Ермеков",
    "Нуркена Абдирова": "Нуркен Абдиров",
    "Алибека Буркитбаева": "Алибек Буркитбаев",
    "Кажыкена Смайылова": "Кажыкен Смайылов",
    "Евнея Букетова": "Евней Букетов",
    "Санжара Асфендиярова": "Санжар Асфендияров",
    "Д.А.Конаева": "Д.А. Конбаев",
    "Хусаина Бижанова": "Хусайн Бижанов",
    "М.Макатаева": "М. Мақатаев",
    "М.Бейсебаева": "М. Бейсебаев",
    "М.Ауезова": "М. Әуезов",
    "М. Ауезова": "М. Әуезов",
    "Ауэзова": "Әуезов",
    "Нурлыбека Баймуратова": "Нұрлыбек Баймұратов",
    "Абдоллы Жумагалиева": "Абдолла Жумагалиев",
    "АБДОЛЛЫ КАРСАКБАЕВА": "Абдолла Карсакбаев",
    "И.Алтынсарина": "И. Алтынсарин",
    "Ш.Уалиханова": "Ш. Уәлиханов",
    "Шокана Уалиханова": "Шоқан Уәлиханов",
    "Жанша Досмухамедова": "Жанша Досмухамедов",
    "Хамзы Есенжанова": "Хамзы Есенжанов",
    "Жангельдина": "Жангелдин",
    "Мухита": "Мұхит",
    "Аая": "Абая",
    "академика Е.А.Букетова": "Е.А. Букетов",
    "Е.А.Букетова": "Е.А. Букетов",
}

FULL_TITLE_FIXES: dict[str, str] = {
    "мектебі атындағы Кеңес мектебі": "Кеңес мектебі",
    "мектебі атындағы Ақтау мектебі": "Ақтау мектебі",
    "мектебі атындағы Ардақ мектебі": "Ардақ мектебі",
    "Гимназия атындағы Шелек мектебі": "Шелек гимназиясы",
    "гимназия №38 мектебі": "№38 гимназиясы",
    "гимназия № 17 мектебі": "№17 гимназиясы",
    "гимназия Шокана Уалиханова атындағы мектебі": "Шоқан Уәлиханов атындағы гимназия",
    "мектебі-гимназия №45 государственного учреждения мектебі": "№45 мектеп-гимназиясы",
    "государственного учреждения мектебі": "Мемлекеттік мектеп",
}


def _apply_person_fixes(name: str) -> str:
    for src, dst in sorted(GENITIVE_PERSON_FIXES.items(), key=lambda item: -len(item[0])):
        name = name.replace(src, dst)
    return name


def fix_kk_school_card_name(name: str) -> str:
    name = name.replace('\\"', "").strip()
    if name in FULL_TITLE_FIXES:
        return FULL_TITLE_FIXES[name]

    name = _apply_person_fixes(name)
    name = re.sub(
        r"^мектебі атындағы (.+?) мектебі$",
        r"\1 мектебі",
        name,
        flags=re.I,
    )
    name = re.sub(
        r"^Гимназия атындағы (.+?) мектебі$",
        r"\1 гимназиясы",
        name,
        flags=re.I,
    )
    name = re.sub(
        r"^гимназия №\s*(\d+)\s+мектебі$",
        r"№\1 гимназиясы",
        name,
        flags=re.I,
    )
    name = re.sub(
        r"^гимназия (.+?) атындағы мектебі$",
        r"\1 атындағы гимназия",
        name,
        flags=re.I,
    )
    name = re.sub(
        r"^мектебі-гимназия №\s*(\d+)\s+государственного учреждения мектебі$",
        r"№\1 мектеп-гимназиясы",
        name,
        flags=re.I,
    )
    name = re.sub(
        r"^(\d+)\s+Ы\. Алтынсарина атындағы мектебі$",
        r"№\1 Ы. Алтынсарин атындағы мектебі",
        name,
    )
    name = re.sub(
        r"^Нуркен Абдиров №\s*(\d+)\s+атындағы мектебі$",
        r"№\1 Нуркен Абдиров атындағы мектебі",
        name,
    )
    name = re.sub(
        r"^Касым Кайсенов атындағы №4 мектебі$",
        "№4 Касым Кайсенов атындағы мектебі",
        name,
    )
    name = re.sub(
        r"^Д\.А\. Конбаев атындағы №1 мектебі$",
        "№1 Д.А. Конбаев атындағы мектебі",
        name,
    )
    name = re.sub(
        r"^Абая атындағы №3 мектебі$",
        "№3 Абая атындағы мектебі",
        name,
    )
    name = _polish_kk_title(name)
    if name.lower() in {"мектебі", "мектеп", "гимназия", ""}:
        return FULL_TITLE_FIXES.get(name, name)
    if not re.search(r"(?i)мектебі|гимназия", name):
        name = f"{name} мектебі"
    return name[:120]


def fix_en_school_card_name(kk: str, en: str) -> str:
    en = en.replace('\\"', "").strip()
    if re.search(r'(?i)государственного|гимназия Шокана|имени|средняя', en):
        en = kk
    en = _apply_person_fixes(en)
    if re.search(r"(?i)атындағы", kk):
        person = re.sub(r"\s+атындағы.*$", "", kk, flags=re.I).strip()
        person = _apply_person_fixes(person)
        if re.search(r"(?i)гимназия", kk):
            num = re.search(r"№\s*(\d+)", kk)
            if num:
                return f"No. {num.group(1).strip()} Gymnasium"
            return f"{person} Gymnasium"
        num = re.search(r"^№\s*([\d\s]+)\s+(.+)$", person)
        if num:
            return f"No. {num.group(1).strip()} {num.group(2).strip()} Secondary School"
        if person and person != kk:
            return f"{person} Secondary School"
    en = _polish_en_title(en)
    if not en:
        en = kk
    en = re.sub(r"\s+Secondary School(?:\s+Secondary School)+", " Secondary School", en, flags=re.I)
    if not re.search(r"(?i)secondary school|gymnasium", en):
        if re.search(r"(?i)гимназия", kk):
            num = re.search(r"№\s*(\d+)", kk)
            if num:
                en = f"No. {num.group(1)} Gymnasium"
            else:
                en = re.sub(r"\s+атындағы\s+гимназия$", " Gymnasium", kk, flags=re.I)
        else:
            en = f"{en} Secondary School" if en else "Secondary School"
    return en[:120]


SCHOOL_TITLE_RE = re.compile(
    r'("districtKey": "[^"]+",\s*)'
    r'"kk": "([^"]+)",\s*'
    r'"en": "([^"]+)"',
    re.MULTILINE,
)


def patch_school_file(path: Path) -> list[dict]:
    text = path.read_text(encoding="utf-8")
    changes: list[dict] = []

    def replace_school(match: re.Match[str]) -> str:
        prefix, kk_old, en_old = match.group(1), match.group(2), match.group(3)
        kk_new = fix_kk_school_card_name(kk_old)
        en_new = fix_en_school_card_name(kk_new, en_old)
        if kk_new != kk_old:
            changes.append({"field": "kk", "old": kk_old, "new": kk_new})
        if en_new != en_old:
            changes.append({"field": "en", "old": en_old, "new": en_new})
        return f'{prefix}"kk": "{kk_new}",\n      "en": "{en_new}"'

    new_text = SCHOOL_TITLE_RE.sub(replace_school, text)

    if new_text != text:
        path.write_text(new_text, encoding="utf-8")

    return changes


def main() -> None:
    report: dict[str, list] = {}
    total = 0
    for path in sorted(ASSETS.glob("*-schools.js")):
        file_changes = patch_school_file(path)
        if file_changes:
            report[path.name] = file_changes
            total += len(file_changes)

    out = Path(__file__).resolve().parent / "kk-name-fix-report.json"
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Updated {total} fields across {len(report)} files -> {out}")


if __name__ == "__main__":
    main()
