"""Generate assets/kostanay-schools.js from Excel sheet."""
import json
import re
from pathlib import Path

import pandas as pd

EXCEL = Path(r"c:\Users\Pine\Documents\PINE\PR\Жоба мектер тізімі.xlsx")
OUT = Path(__file__).resolve().parents[1] / "assets" / "kostanay-schools.js"

# Excel district row labels -> display names (order matches sheet)
DISTRICT_LABELS = [
    {"kk": "Алтынсарин ауданы", "en": "Altynsarin District", "slug": "altynsarin"},
    {"kk": "Амангелді ауданы", "en": "Amangeldy District", "slug": "amangeldy"},
    {"kk": "Әулиекөл ауданы", "en": "Auliekol District", "slug": "auliekol"},
    {"kk": "Денисов ауданы", "en": "Denisov District", "slug": "denisov"},
    {"kk": "Жангелдин ауданы", "en": "Zhangeldy District", "slug": "zhangeldy"},
    {"kk": "Жітікara ауданы", "en": "Zhitikara District", "slug": "zhitikara"},
    {"kk": "Камысты ауданы", "en": "Kamysty District", "slug": "kamysty"},
    {"kk": "Қараbалыq ауданы", "en": "Qarabalyq District", "slug": "qarabalyq"},
    {"kk": "Қарасу ауданы", "en": "Qarasu District", "slug": "qarasu"},
    {"kk": "Қостанай ауданы", "en": "Kostanay District", "slug": "kostanay-district"},
    {"kk": "Меңдіқara ауданы", "en": "Mendykara District", "slug": "mendykara"},
    {"kk": "Наурызым ауданы", "en": "Nauryzym District", "slug": "nauryzym"},
    {"kk": "Б. Майлин ауданы", "en": "B. Mailin District", "slug": "mailin"},
    {"kk": "Сariesköl ауданы", "en": "Sarykol District", "slug": "sarykol"},
    {"kk": "Ұзынköл ауданы", "en": "Uzunkol District", "slug": "uzunkol"},
    {"kk": "Федорov ауданы", "en": "Fedorov District", "slug": "fedorov"},
    {"kk": "Рудный қ.", "en": "Rudny city", "slug": "rudny"},
    {"kk": "Арқалық қ.", "en": "Arkalyk city", "slug": "arkalyk"},
]

IMAGES = [
    "assets/optimized/home-fitout-classroom.jpg",
    "assets/optimized/program-fitout-detail.jpg",
]

BADGES = [
    {"kk": "Жоба аясында", "en": "Programme school"},
    {"kk": "Зертхана", "en": "Laboratory"},
    {"kk": "Толық жабдықталған", "en": "Fully equipped"},
]


def short_name(full: str) -> str:
    m = re.search(r"[«\"]([^»\"]+)[»\"]", full)
    name = m.group(1).strip() if m else full.strip()
    name = re.sub(r"\s*отдела образования.*$", "", name, flags=re.I).strip()
    name = re.sub(r"^КГУ\s*", "", name, flags=re.I).strip()
    for pattern, repl in (
        (r"общеобразовательная школа", "мектебі"),
        (r"основная средняя школа", "мектебі"),
        (r"средняя школа", "мектебі"),
        (r"школа-гимназия", "гимназия"),
        (r"школа", "мектебі"),
    ):
        name = re.sub(pattern, repl, name, flags=re.I)
    return name[:120]


def short_name_en(full: str) -> str:
    m = re.search(r"[«\"]([^»\"]+)[»\"]", full)
    name = m.group(1).strip() if m else full.strip()
    name = re.sub(r"\s*отдела образования.*$", "", name, flags=re.I).strip()
    name = re.sub(r"^KGU\s*", "", name, flags=re.I).strip()
    for pattern, repl in (
        (r"общеобразовательная школа", "Secondary School"),
        (r"основная средняя школа", "Basic Secondary School"),
        (r"средняя школа", "Secondary School"),
        (r"школа-гимназия", "School-Gymnasium"),
        (r"школа", "School"),
    ):
        name = re.sub(pattern, repl, name, flags=re.I)
    return name[:120]


def main() -> None:
    df = pd.read_excel(EXCEL, sheet_name=2)
    df.columns = ["num", "district", "school", "director", "contact"]
    df["district"] = df["district"].ffill().str.strip()
    df = df.dropna(subset=["school"])

    excel_districts = list(df["district"].unique())
    if len(excel_districts) != len(DISTRICT_LABELS):
        raise ValueError(
            f"Expected {len(DISTRICT_LABELS)} districts, got {len(excel_districts)}: {excel_districts}"
        )

    district_meta = {
        key: {**label, "key": key}
        for key, label in zip(excel_districts, DISTRICT_LABELS)
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

        director = str(row["director"]).strip() if pd.notna(row["director"]) else ""
        full = str(row["school"]).strip()

        schools.append(
            {
                "id": f"kostanay-{meta['slug']}-{idx}",
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

    payload = {"districts": districts, "schools": schools}
    OUT.write_text(
        "/* Auto-generated — Kostanay schools from Жоба мектер тізімі.xlsx */\n"
        "window.KOSTANAY_SCHOOLS = "
        + json.dumps(payload, ensure_ascii=False, indent=2)
        + ";\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(schools)} schools, {len(districts)} districts -> {OUT}")


if __name__ == "__main__":
    main()
