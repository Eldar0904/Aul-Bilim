"""Comprehensive audit of regional school card data."""
from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
OUT = Path(__file__).resolve().parent / "school-audit-report.json"

CYRILLIC = re.compile(r"[А-Яа-яЁёӘәІіҢңҒғҮүҰұҚқӨөҺһ]")
LATIN = re.compile(r"[A-Za-z]")


def load_region(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    payload = text.split("=", 1)[1].strip().rstrip(";")
    return json.loads(payload)


def audit_school(file: str, school: dict, district_keys: set[str]) -> list[dict]:
    issues: list[dict] = []
    sid = school.get("id", "?")
    kk = (school.get("kk") or "").strip()
    en = (school.get("en") or "").strip()
    image = (school.get("image") or "").strip()

    def add(code: str, severity: str, detail: str) -> None:
        issues.append(
            {
                "file": file,
                "id": sid,
                "kk": kk,
                "en": en,
                "code": code,
                "severity": severity,
                "detail": detail,
            }
        )

    if not kk:
        add("missing_kk", "error", "Missing Kazakh title")
    if not en:
        add("missing_en", "error", "Missing English title")

    if kk:
        if re.search(r"мектебі атындағы", kk, re.I):
            add("kk_reversed_title", "error", "Reversed title: мектебі атындағы …")
        if re.search(r"^гимназия |^Гимназия атындағы", kk, re.I):
            add("kk_gymnasium_prefix", "error", "Gymnasium word should follow the name, not precede it")
        if re.search(r"академика|государственного|учреждения|имени |средняя |основная ", kk, re.I):
            add("kk_russian_boilerplate", "error", "Russian boilerplate left in Kazakh title")
        if '\\"' in kk or kk.count('"') % 2 == 1:
            add("kk_quote", "error", "Stray or unbalanced quotes in Kazakh title")
        if re.search(
            r"\b(Омара|Ыбырая|Габидена|Прокофия|Касыма|Бауыржана|Мукагали|Алимхана|"
            r"Нуркена|Алибека|Кажыкена|Санжара|Хусаина|Нурлыбека|Сапара|Евнея|Абдоллы|Шокана)\b",
            kk,
            re.I,
        ):
            add("kk_male_genitive", "warn", "Russian male genitive form in named school title")
        if re.search(r"атындағы.*атындағы", kk, re.I):
            add("kk_double_atyndy", "error", "Duplicate атындағы")
        if re.search(r"(мектебі){2,}|(мектеп){2,}", kk, re.I):
            add("kk_duplicate_suffix", "warn", "Repeated мектебі/мектеп suffix")
        if re.search(r"мектеп-лицейі мектебі|мектеп-гимназиясы мектебі", kk, re.I):
            add("kk_redundant_suffix", "warn", "Redundant мектебі after compound school type")
        if len(kk) > 80:
            add("kk_long_title", "info", f"Long Kazakh title ({len(kk)} chars) may wrap awkwardly on cards")

    if en:
        if en.count("Secondary School") > 1 or en.count("Gymnasium") > 1:
            add("en_duplicate_suffix", "warn", "Duplicated English school-type suffix")
        if re.search(r"государственного|гимназия Шокана|имени |средняя |основная ", en, re.I):
            add("en_russian_boilerplate", "warn", "Russian boilerplate in English title")
        if en.strip() in {"Secondary School", "Basic Secondary School", "School", "Gymnasium"}:
            add("en_empty_title", "error", "English title is only a generic school word")
        if CYRILLIC.search(en) and not en.startswith("Director"):
            if LATIN.search(en):
                add("en_mixed_script", "info", "English title mixes Latin and Cyrillic")
            else:
                add("en_not_translated", "info", "English title is still fully Cyrillic transliteration")
        if '\\' in en or en.count('"') % 2 == 1:
            add("en_quote", "error", "Broken escaping or quotes in English title")

    dkey = school.get("districtKey")
    if dkey and district_keys and dkey not in district_keys:
        add("district_key_mismatch", "warn", f"districtKey {dkey!r} not in region districts list")

    if image:
        local = image.lstrip("/")
        if local.startswith("assets/") and not (ROOT / local).exists():
            add("missing_image_file", "error", f"Image file not found: {image}")
    else:
        add("no_default_image", "info", "No default image field")

    desc = school.get("desc") or {}
    for lang in ("kk", "en"):
        text = (desc.get(lang) or "").strip()
        if text and not text.lower().startswith(("директор", "director")):
            add(f"desc_no_director_{lang}", "info", f"{lang} description may not start with director line")

    return issues


def main() -> None:
    all_issues: list[dict] = []
    by_code: dict[str, list[dict]] = defaultdict(list)
    totals = Counter()
    ids_seen: dict[str, str] = {}
    duplicate_ids: list[dict] = []
    region_stats: dict[str, dict] = {}

    for path in sorted(ASSETS.glob("*-schools.js")):
        data = load_region(path)
        schools = data.get("schools") or []
        district_keys = {d.get("key") for d in (data.get("districts") or []) if d.get("key")}
        totals["schools"] += len(schools)
        totals["files"] += 1
        region_stats[path.name] = {
            "schools": len(schools),
            "districts": len(district_keys),
            "named_schools": sum(1 for s in schools if "атындағы" in (s.get("kk") or "")),
            "gymnasiums": sum(1 for s in schools if "гимназия" in (s.get("kk") or "").lower()),
        }

        for school in schools:
            sid = school.get("id", "")
            if sid in ids_seen:
                duplicate_ids.append({"id": sid, "first": ids_seen[sid], "second": path.name})
            else:
                ids_seen[sid] = path.name

            for issue in audit_school(path.name, school, district_keys):
                all_issues.append(issue)
                by_code[issue["code"]].append(issue)

    summary = {
        "totals": dict(totals),
        "region_stats": region_stats,
        "issue_counts": {code: len(items) for code, items in sorted(by_code.items())},
        "duplicate_ids": duplicate_ids,
        "errors": [i for i in all_issues if i["severity"] == "error"],
        "warnings": [i for i in all_issues if i["severity"] == "warn"],
        "info": [i for i in all_issues if i["severity"] == "info"],
    }

    OUT.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Audited {totals['schools']} schools in {totals['files']} files")
    print(f"Errors: {len(summary['errors'])}  Warnings: {len(summary['warnings'])}  Info: {len(summary['info'])}")
    if summary["issue_counts"]:
        print("Issue breakdown:")
        for code, count in summary["issue_counts"].items():
            print(f"  {code}: {count}")
    if duplicate_ids:
        print(f"Duplicate IDs: {len(duplicate_ids)}")
    print(f"Report -> {OUT}")


if __name__ == "__main__":
    main()
