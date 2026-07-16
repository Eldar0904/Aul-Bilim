"""Generate assets/almaty-schools.js from 50 школ Реквизиты.xlsx."""
from pathlib import Path

import pandas as pd

from school_data_utils import (
    BADGES,
    IMAGES,
    build_school_desc,
    clean_director,
    short_name,
    normalize_district_ru,
    short_name_ru,
    write_region_js,
)

EXCEL = Path(r"c:\Users\Pine\Documents\PINE\PR\50 школ Реквизиты.xlsx")
OUT = Path(__file__).resolve().parents[1] / "assets" / "almaty-schools.js"

DISTRICT_META = {
    "г. Конаев": {
        "kk": "Қонаев қ.",
        "ru": 'г. Конаев',
        "slug": "konaev",
    },
    "Енбекшиказахский": {
        "kk": "Еңбекшіқазақ ауданы",
        "ru": 'Enbekshikazakhский район',
        "slug": "enbekshikazakh",
    },
    "Жамбылский": {
        "kk": "Жамбыл ауданы",
        "ru": 'Жамбылский район',
        "slug": "zhambyl",
    },
    "Илийский": {
        "kk": "Іле ауданы",
        "ru": 'Ileский район',
        "slug": "ile",
    },
    "Карасайский": {
        "kk": "Қарасай ауданы",
        "ru": 'Karasaiский район',
        "slug": "karasai",
    },
    "Талгарский": {
        "kk": "Талғар ауданы",
        "ru": 'Talgarский район',
        "slug": "talgar",
    },
}


def load_rows() -> pd.DataFrame:
    df = pd.read_excel(EXCEL, sheet_name=0, header=1)
    df.columns = ["num", "district", "school", "director", "phone", "requisites", "note"]
    df["district"] = df["district"].astype(str).str.strip()
    df["school"] = df["school"].astype(str).str.replace(r"\s+", " ", regex=True).str.strip()
    df = df.dropna(subset=["school"])
    df = df[df["school"].str.lower() != "nan"]
    return df


def main() -> None:
    df = load_rows()

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

        full = str(row["school"]).strip()
        director = clean_director(row.get("director", ""))

        schools.append(
            {
                "id": f"almaty-{meta['slug']}-{idx}",
                "districtKey": dist_key,
                "kk": short_name(full),
                "ru": short_name_ru(full),
                "location": {"kk": meta["kk"], "ru": normalize_district_ru(dist_key)},
                "badge": BADGES[len(schools) % len(BADGES)],
                "desc": build_school_desc(director=director),
                "image": IMAGES[len(schools) % len(IMAGES)],
            }
        )

    districts = [
        {
            "key": key,
            "kk": DISTRICT_META[key]["kk"],
            "ru": normalize_district_ru(key),
            "slug": DISTRICT_META[key]["slug"],
            "n": district_counts[key],
        }
        for key in district_order
    ]

    payload = {"districts": districts, "schools": schools}
    write_region_js(
        OUT,
        "ALMATY_SCHOOLS",
        payload,
        "Almaty Region schools from 50 школ Реквизиты.xlsx",
    )
    print(f"Wrote {len(schools)} schools, {len(districts)} districts -> {OUT}")


if __name__ == "__main__":
    main()
