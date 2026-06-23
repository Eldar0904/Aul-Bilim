"""Generate assets/almaty-schools.js from 50 школ Реквизиты.xlsx."""
from pathlib import Path

import pandas as pd

from school_data_utils import (
    BADGES,
    IMAGES,
    build_school_desc,
    clean_director,
    short_name,
    short_name_en,
    write_region_js,
)

EXCEL = Path(r"c:\Users\Pine\Documents\PINE\PR\50 школ Реквизиты.xlsx")
OUT = Path(__file__).resolve().parents[1] / "assets" / "almaty-schools.js"

DISTRICT_META = {
    "г. Конаев": {
        "kk": "Қонаев қ.",
        "en": "Konaev city",
        "slug": "konaev",
    },
    "Енбекшиказахский": {
        "kk": "Еңбекшіқазақ ауданы",
        "en": "Enbekshikazakh District",
        "slug": "enbekshikazakh",
    },
    "Жамбылский": {
        "kk": "Жамбыл ауданы",
        "en": "Zhambyl District",
        "slug": "zhambyl",
    },
    "Илийский": {
        "kk": "Іле ауданы",
        "en": "Ile District",
        "slug": "ile",
    },
    "Карасайский": {
        "kk": "Қарасай ауданы",
        "en": "Karasai District",
        "slug": "karasai",
    },
    "Талгарский": {
        "kk": "Талғар ауданы",
        "en": "Talgar District",
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
                "en": short_name_en(full),
                "location": {"kk": meta["kk"], "en": meta["en"]},
                "badge": BADGES[len(schools) % len(BADGES)],
                "desc": build_school_desc(director=director),
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
        "ALMATY_SCHOOLS",
        payload,
        "Almaty Region schools from 50 школ Реквизиты.xlsx",
    )
    print(f"Wrote {len(schools)} schools, {len(districts)} districts -> {OUT}")


if __name__ == "__main__":
    main()
