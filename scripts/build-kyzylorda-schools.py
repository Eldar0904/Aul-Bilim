"""Generate assets/kyzylorda-schools.js from Excel sheets КЗО ФХБ + КЗО МКШ."""
from pathlib import Path

import pandas as pd

from school_data_utils import (
    BADGES,
    EXCEL,
    IMAGES,
    build_school_desc,
    clean_director,
    short_name,
    short_name_en,
    write_region_js,
)

OUT = Path(__file__).resolve().parents[1] / "assets" / "kyzylorda-schools.js"
SHEET_FHB = 4
SHEET_MKSH = 5

DISTRICT_META = {
    "Аральский район": {
        "kk": "\u0410\u0440\u0430\u043b \u0430\u0443\u0434\u0430\u043d\u044b",
        "en": "Aral District",
        "slug": "aral",
    },
    "Казалинский район": {
        "kk": "\u049a\u0430\u0437\u0430\u043b\u044b \u0430\u0443\u0434\u0430\u043d\u044b",
        "en": "Kazaly District",
        "slug": "kazaly",
    },
    "Кармакшинский район": {
        "kk": "\u049a\u0430\u0440\u043c\u0430\u049b\u0448\u044b \u0430\u0443\u0434\u0430\u043d\u044b",
        "en": "Karmakshy District",
        "slug": "karmakshy",
    },
    "Жалагашский район": {
        "kk": "\u0416\u0430\u043b\u0430\u0493\u0430\u0441 \u0430\u0443\u0434\u0430\u043d\u044b",
        "en": "Zhalagash District",
        "slug": "zhalagash",
    },
    "Сырдарьинский район": {
        "kk": "\u0421\u044b\u0440\u0434\u0430\u0440\u0438\u044f \u0430\u0443\u0434\u0430\u043d\u044b",
        "en": "Syrdarya District",
        "slug": "syrdarya",
    },
    "Шиелийский район": {
        "kk": "\u0428\u0438\u0435\u043b\u0456 \u0430\u0443\u0434\u0430\u043d\u044b",
        "en": "Shieli District",
        "slug": "shieli",
    },
    "Жанакорганский район": {
        "kk": "\u0416\u0430\u04a3\u0430\u049b\u043e\u0440\u0493\u0430\u043d \u0430\u0443\u0434\u0430\u043d\u044b",
        "en": "Zhanakorgan District",
        "slug": "zhanakorgan",
    },
}

DISTRICT_ALIASES = {
    "казалинский": "Казалинский район",
    "шиелийский": "Шиелийский район",
}


def normalize_district(value: str) -> str:
    key = str(value).strip()
    alias = DISTRICT_ALIASES.get(key.lower())
    return alias or key


def load_kzo_sheet(sheet_index: int) -> pd.DataFrame:
    df = pd.read_excel(EXCEL, sheet_name=sheet_index)
    df = df.iloc[:, :8].copy()
    df.columns = [
        "num",
        "district",
        "school",
        "director",
        "contact",
        "phone",
        "address",
        "email",
    ]
    df["district"] = (
        df["district"].astype(str).replace({"nan": pd.NA, "": pd.NA}).ffill().map(normalize_district)
    )
    df["school"] = df["school"].astype(str).str.replace(r"\s+", " ", regex=True).str.strip()
    df["address"] = df["address"].astype(str).str.replace(r"\s+", " ", regex=True).str.strip()
    df = df.dropna(subset=["school"])
    df = df[df["school"].str.lower() != "nan"]
    return df


def main() -> None:
    df = pd.concat([load_kzo_sheet(SHEET_FHB), load_kzo_sheet(SHEET_MKSH)], ignore_index=True)

    district_order: list[str] = []
    district_counts: dict[str, int] = {}
    schools = []

    for _, row in df.iterrows():
        dist_key = row["district"]
        if dist_key not in DISTRICT_META:
            raise KeyError(f"Unknown district: {dist_key!r}")

        if dist_key not in district_counts:
            district_order.append(dist_key)
            district_counts[dist_key] = 0
        district_counts[dist_key] += 1
        idx = district_counts[dist_key]
        meta = DISTRICT_META[dist_key]

        director = clean_director(row["director"])
        address = str(row["address"]).strip()
        if address.lower() == "nan":
            address = ""
        full = str(row["school"]).strip()

        schools.append(
            {
                "id": f"kzo-{meta['slug']}-{idx}",
                "districtKey": dist_key,
                "kk": short_name(full),
                "en": short_name_en(full),
                "location": {"kk": meta["kk"], "en": meta["en"]},
                "badge": BADGES[len(schools) % len(BADGES)],
                "desc": build_school_desc(director=director, address=address),
                "image": IMAGES[len(schools) % len(IMAGES)],
            }
        )

    districts = [
        {
            "key": key,
            "kk": DISTRICT_META[key]["kk"],
            "en": DISTRICT_META[key]["en"],
            "slug": DISTRICT_META[key]["slug"],
            "n": district_counts[key],
        }
        for key in district_order
    ]

    payload = {"districts": districts, "schools": schools}
    write_region_js(
        OUT,
        "KYZYLORDA_SCHOOLS",
        payload,
        "Kyzylorda Region schools from Жоба мектер тізімі (1).xlsx (КЗО ФХБ + КЗО МКШ)",
    )
    print(f"Wrote {len(schools)} schools, {len(districts)} districts -> {OUT}")


if __name__ == "__main__":
    main()
