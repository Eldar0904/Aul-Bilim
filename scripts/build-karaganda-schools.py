"""Generate assets/karaganda-schools.js from Excel sheet Караганда 86."""
from pathlib import Path

import pandas as pd

from school_data_utils import (
    BADGES,
    EXCEL,
    IMAGES,
    build_school_desc,
    clean_director,
    short_name,
    normalize_district_ru,
    short_name_ru,
    write_region_js,
)

OUT = Path(__file__).resolve().parents[1] / "assets" / "karaganda-schools.js"
SHEET_INDEX = 0

DISTRICT_META = {
    "Караганда": {
        "kk": "\u049a\u0430\u0440\u0430\u0433\u0430\u043d\u0434\u044b \u049b.",
        "ru": 'г. Караганда',
        "slug": "karaganda-city",
    },
    "Абай": {
        "kk": "\u0410\u0431\u0430\u0439 \u0430\u0443\u0434\u0430\u043d\u044b",
        "ru": 'Абайский район',
        "slug": "abai",
    },
    "Сарань": {
        "kk": "Саран қ.",
        "ru": 'г. Сарань',
        "slug": "saran",
    },
    "Каркаралинск": {
        "kk": "\u049a\u0430\u0440\u043a\u0430\u0440\u0430\u043b\u044b \u049b.",
        "ru": 'г. Каркаралы',
        "slug": "karkaraly",
    },
    "Темиртау": {
        "kk": "\u0422\u0435\u043c\u0456\u0440\u0442\u0430\u0443 \u049b.",
        "ru": 'г. Темиртау',
        "slug": "temirtau",
    },
    "Шахтинск": {
        "kk": "Шахтин қ.",
        "ru": 'г. Шахтинск',
        "slug": "shakhtinsk",
    },
}


def load_karaganda_rows() -> pd.DataFrame:
    df = pd.read_excel(EXCEL, sheet_name=SHEET_INDEX, header=None)
    df.columns = ["num", "sub", "district", "school", "address"] + [
        f"c{i}" for i in range(5, len(df.columns))
    ]
    df["district"] = (
        df["district"].astype(str).replace({"": pd.NA, "nan": pd.NA}).ffill().str.strip()
    )
    df["school"] = df["school"].astype(str).str.replace(r"\s+", " ", regex=True).str.strip()
    df["address"] = df["address"].astype(str).str.replace(r"\s+", " ", regex=True).str.strip()
    df = df[df["num"].astype(str).str.match(r"^\d+$", na=False)]
    df = df[df["school"].notna() & (df["school"] != "") & (df["school"].str.lower() != "nan")]
    return df


def main() -> None:
    df = load_karaganda_rows()

    district_order: list[str] = []
    district_counts: dict[str, int] = {}
    schools = []

    for _, row in df.iterrows():
        dist_key = row["district"]
        if dist_key not in DISTRICT_META:
            raise KeyError(f"Unknown district/city: {dist_key!r}")

        if dist_key not in district_counts:
            district_order.append(dist_key)
            district_counts[dist_key] = 0
        district_counts[dist_key] += 1
        idx = district_counts[dist_key]
        meta = DISTRICT_META[dist_key]

        full = str(row["school"]).strip()
        address = str(row["address"]).strip()
        if address.lower() == "nan":
            address = ""

        schools.append(
            {
                "id": f"karaganda-{meta['slug']}-{idx}",
                "districtKey": dist_key,
                "kk": short_name(full),
                "ru": short_name_ru(full),
                "location": {"kk": meta["kk"], "ru": normalize_district_ru(dist_key)},
                "badge": BADGES[len(schools) % len(BADGES)],
                "desc": build_school_desc(address=address),
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
        "KARAGANDA_SCHOOLS",
        payload,
        "Karaganda schools from Жоба мектер тізімі.xlsx",
    )
    print(f"Wrote {len(schools)} schools, {len(districts)} areas -> {OUT}")


if __name__ == "__main__":
    main()
