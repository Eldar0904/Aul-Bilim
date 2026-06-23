"""Shared helpers for building region school JS data from Excel."""
import json
import re
from pathlib import Path

import pandas as pd

EXCEL = Path(r"c:\Users\Pine\Documents\PINE\PR\Жоба мектер тізімі (1).xlsx")

IMAGES = [
    "assets/optimized/home-fitout-classroom.jpg",
    "assets/optimized/program-fitout-detail.jpg",
]

BADGES = [
    {"kk": "Жоба аясында", "en": "Programme school"},
    {"kk": "Зертхана", "en": "Laboratory"},
    {"kk": "Толық жабдықталған", "en": "Fully equipped"},
]


def _clean_school_title(name: str, suffix: str) -> str:
    m = re.match(r"(?:мектебі|Secondary School|Basic Secondary School|School)\s+села\s+(.+)$", name, re.I)
    if m:
        return f"{m.group(1).strip()} {suffix}"[:120]
    m = re.match(r"^села\s+(.+?)\s+(?:мектебі|Secondary School|Basic Secondary School|School)$", name, re.I)
    if m:
        return f"{m.group(1).strip()} {suffix}"[:120]
    return name[:120]


def clean_director(value) -> str:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return ""
    text = re.sub(r"\s+", " ", str(value).strip())
    text = re.sub(r"\s*\d[\d\s]{8,}\d?\s*$", "", text).strip(" ,")
    return text[:100]


def _extract_quoted_name(full: str) -> str:
    text = str(full).strip().strip('"').strip("'")
    if "«" in text:
        tail = text.rsplit("«", 1)[-1].split("»")[0].strip()
        if tail:
            return tail
    m = re.search(r'"([^"]{2,120})"', text)
    if m:
        return m.group(1).strip()
    return text


def _strip_trailing_school_noise(name: str) -> str:
    name = re.sub(r"\s+с\s+государственным\s+языком\s+обучения.*$", "", name, flags=re.I)
    name = re.sub(r"\s+города\s+.+$", "", name, flags=re.I)
    name = re.sub(r"\s+[A-Za-zА-Яа-яЁёҚқӘәІіҢңҒғҮүҰұӨөҺһ-]+ского\s+районного.*$", "", name, flags=re.I)
    name = re.sub(r"\s+села\s+.+$", "", name, flags=re.I)
    return name.strip(" ,-")


def _fix_imeni_kk(name: str) -> str:
    name = name.strip()
    m = re.match(r"^имени\s+(.+?)(?:\s+мектебі)?$", name, re.I)
    if m:
        person = _strip_trailing_school_noise(m.group(1))
        return f"{person} атындағы мектебі"
    m = re.match(r"^мектебі\s+имени\s+(.+)$", name, re.I)
    if m:
        person = _strip_trailing_school_noise(m.group(1))
        return f"{person} атындағы мектебі"
    m = re.match(r"^(.+?)\s+имени\s+(.+?)(?:\s+мектебі)?$", name, re.I)
    if m:
        prefix = re.sub(r"^мектебі\s+", "", m.group(1).strip(), flags=re.I).strip()
        person = _strip_trailing_school_noise(m.group(2))
        if not prefix or prefix.lower() in {"мектебі", "средняя", "основная", "ош", "сош"}:
            return f"{person} атындағы мектебі"
        return f"{prefix} {person} атындағы мектебі"
    return name


def _fix_imeni_en(name: str) -> str:
    name = name.strip()
    school_suffix = "Basic Secondary School" if re.search(r"basic|основная", name, re.I) else "Secondary School"
    m = re.match(r"^имени\s+(.+?)(?:\s+(?:Secondary School|Basic Secondary School|School|мектебі))?$", name, re.I)
    if m:
        person = _strip_trailing_school_noise(m.group(1))
        return f"{person} {school_suffix}"
    m = re.match(r"^(?:Secondary School|Basic Secondary School|School|мектебі)\s+имени\s+(.+)$", name, re.I)
    if m:
        person = _strip_trailing_school_noise(m.group(1))
        return f"{person} {school_suffix}"
    m = re.match(r"^(.+?)\s+имени\s+(.+?)(?:\s+(?:Secondary School|Basic Secondary School|School|мектебі))?$", name, re.I)
    if m:
        prefix = re.sub(r"^(?:Secondary School|Basic Secondary School|School|мектебі)\s+", "", m.group(1).strip(), flags=re.I).strip()
        person = _strip_trailing_school_noise(m.group(2))
        if not prefix or re.match(r"^(Secondary School|Basic Secondary School|School|мектебі)$", prefix, re.I):
            return f"{person} {school_suffix}"
        return f"{prefix} {person} {school_suffix}"
    return name


def _looks_like_boilerplate(name: str) -> bool:
    return bool(
        re.search(
            r"білім бөлімінің|басқармасының|отдела образования|управления образования",
            name,
            re.I,
        )
    ) and not re.search(r"№\s*\d", name)


def _fallback_school_title(full: str) -> str | None:
    m = re.search(
        r"№\s*\d+\s*[^«»\"]{0,100}?(?:мектеб|мектеп|орта|школа|лицей|гимназ)",
        full,
        re.I,
    )
    if m:
        return m.group(0).strip()
    m = re.search(r"№\s*\d+", full)
    if m:
        return f"{m.group(0).strip()} мектебі"
    return None


def _normalize_extracted_name(name: str) -> str:
    return re.sub(r'^["\']+|["\']+$', "", name.strip()).strip()


def short_name(full: str) -> str:
    name = _normalize_extracted_name(_extract_quoted_name(full))
    if _looks_like_boilerplate(name):
        fallback = _fallback_school_title(full)
        if fallback:
            name = fallback
    name = re.sub(r"\s*отдела образования.*$", "", name, flags=re.I).strip()
    name = re.sub(r"^КГУ\s*", "", name, flags=re.I).strip()
    name = re.sub(r"^Коммунальное государственное учреждение\s*", "", name, flags=re.I).strip()
    name = re.sub(r"^ОСШ\s+", "", name, flags=re.I).strip()
    name = re.sub(r"^Сош\s+", "", name, flags=re.I).strip()
    for pattern, repl in (
        (r"орта мектебі", "мектебі"),
        (r"орта мектеб", "мектебі"),
        (r"средняя школа", "мектебі"),
        (r"основная школа", "мектебі"),
        (r"основная общеобразовательная школа", "мектебі"),
        (r"общеобразовательная школа", "мектебі"),
        (r"основная средняя школа", "мектебі"),
        (r"школа-гимназия", "гимназия"),
        (r"школа", "мектебі"),
    ):
        name = re.sub(pattern, repl, name, flags=re.I)
    m = re.match(r"^мектебі\s+(.+)$", name, flags=re.I)
    if m:
        name = f"{m.group(1).strip()} мектебі"
    name = _fix_imeni_kk(name)
    name = _normalize_extracted_name(name)
    return _clean_school_title(name.strip(), "мектебі")


def _title_case_en(name: str) -> str:
    if re.match(r"^[a-z]", name):
        return name[0].upper() + name[1:]
    return name


def short_name_en(full: str) -> str:
    name = _normalize_extracted_name(_extract_quoted_name(full))
    if _looks_like_boilerplate(name):
        fallback = _fallback_school_title(full)
        if fallback:
            name = fallback
    name = re.sub(r"\s*отдела образования.*$", "", name, flags=re.I).strip()
    name = re.sub(r"^KGU\s*[\"']?", "", name, flags=re.I).strip()
    name = re.sub(r"^КГУ\s*[\"']?", "", name, flags=re.I).strip()
    name = re.sub(r"^ОСШ\s+", "", name, flags=re.I).strip()
    for pattern, repl in (
        (r"орта мектебі", "Secondary School"),
        (r"орта мектеб", "Secondary School"),
        (r"средняя школа", "Secondary School"),
        (r"основная общеобразовательная школа", "Basic Secondary School"),
        (r"общеобразовательная школа", "Secondary School"),
        (r"основная средняя школа", "Basic Secondary School"),
        (r"школа-гимназия", "School-Gymnasium"),
        (r"школа", "School"),
    ):
        name = re.sub(pattern, repl, name, flags=re.I)
    m = re.match(r"^Secondary School\s+(.+)$", name, flags=re.I)
    if m:
        name = f"{m.group(1).strip()} Secondary School"
    name = _fix_imeni_en(name)
    name = re.sub(r"\s+атындағы\s+(?:Secondary School|Basic Secondary School)$", r" Secondary School", name, flags=re.I)
    m = re.search(r"^(.+?)\s+атындағы\s+(?:Secondary School|Basic Secondary School)?$", name, re.I)
    if m:
        name = f"{m.group(1).strip()} Secondary School"
    name = _normalize_extracted_name(name)
    return _title_case_en(_clean_school_title(name.strip(), "Secondary School"))


def build_region_payload(
    sheet_index: int,
    district_labels: list[dict],
    id_prefix: str,
) -> dict:
    df = pd.read_excel(EXCEL, sheet_name=sheet_index)
    df.columns = ["num", "district", "school", "director", "contact"]
    df["district"] = df["district"].ffill().str.strip()
    df = df.dropna(subset=["school"])

    excel_districts = list(df["district"].unique())
    if len(excel_districts) != len(district_labels):
        raise ValueError(
            f"Expected {len(district_labels)} districts, got {len(excel_districts)}: {excel_districts}"
        )

    district_meta = {
        key: {**label, "key": key}
        for key, label in zip(excel_districts, district_labels)
    }

    schools = []
    district_order: list[str] = []
    district_counts: dict[str, int] = {}

    for _, row in df.iterrows():
        dist_key = row["district"]
        if dist_key not in district_counts:
            district_order.append(dist_key)
            district_counts[dist_key] = 0
        district_counts[dist_key] += 1
        idx = district_counts[dist_key]
        meta = district_meta[dist_key]

        director = clean_director(row.get("director", ""))
        full = str(row["school"]).strip()

        schools.append(
            {
                "id": f"{id_prefix}-{meta['slug']}-{idx}",
                "districtKey": dist_key,
                "kk": short_name(full),
                "en": short_name_en(full),
                "location": {"kk": meta["kk"], "en": meta["en"]},
                "badge": BADGES[len(schools) % len(BADGES)],
                "desc": {
                    "kk": (
                        f"Директор: {director}"
                        if director
                        else "Aul Bilim жобасы аясындағы мектеп."
                    ),
                    "en": (
                        f"Director: {director}"
                        if director
                        else "School supported under the Aul Bilim programme."
                    ),
                },
                "image": IMAGES[len(schools) % len(IMAGES)],
            }
        )

    districts = [
        {
            "key": key,
            "kk": district_meta[key]["kk"],
            "en": district_meta[key]["en"],
            "slug": district_meta[key]["slug"],
            "n": district_counts[key],
        }
        for key in district_order
    ]

    return {"districts": districts, "schools": schools}


def write_region_js(out: Path, global_name: str, payload: dict, comment: str) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(
        f"/* Auto-generated — {comment} */\n"
        f"window.{global_name} = "
        + json.dumps(payload, ensure_ascii=False, indent=2)
        + ";\n",
        encoding="utf-8",
    )
