"""Generate assets/abay-schools.js from Excel sheet Абай МКШ."""
from pathlib import Path

import pandas as pd

from school_data_utils import (
    BADGES,
    EXCEL,
    IMAGES,
    clean_director,
    short_name,
    short_name_en,
    write_region_js,
)

OUT = Path(__file__).resolve().parents[1] / "assets" / "abay-schools.js"
SHEET_INDEX = 3

DISTRICT_META = {
    "Абайский": {
        "kk": "\u0410\u0431\u0430\u0439 \u0430\u0443\u0434\u0430\u043d\u044b",
        "en": "Abai District",
        "slug": "abai-district",
    },
    "Ақсуат": {
        "kk": "\u0410\u049b\u0441\u0443\u0430\u0442 \u0430\u0443\u0434\u0430\u043d\u044b",
        "en": "Aqsuat District",
        "slug": "aqsuat",
    },
    "Аягозский": {
        "kk": "\u0410\u044f\u0433\u04e9\u0437 \u0430\u0443\u0434\u0430\u043d\u044b",
        "en": "Ayagoz District",
        "slug": "ayagoz",
    },
    "Бескарагайский": {
        "kk": "\u0411\u0435\u0441\u049b\u0430\u0440\u0430\u0493\u0430\u0439 \u0430\u0443\u0434\u0430\u043d\u044b",
        "en": "Beskaragai District",
        "slug": "beskaragai",
    },
    "Бородулихинский": {
        "kk": "\u0411\u043e\u0440\u043e\u0434\u0443\u043b\u0438\u0445 \u0430\u0443\u0434\u0430\u043d\u044b",
        "en": "Borodulikha District",
        "slug": "borodulikha",
    },
    "Жарминский": {
        "kk": "\u0416\u0430\u0440\u043c\u0430 \u0430\u0443\u0434\u0430\u043d\u044b",
        "en": "Zharma District",
        "slug": "zharma",
    },
    "Жаңасемей": {
        "kk": "\u0416\u0430\u04a3\u0430\u0441\u0435\u043c\u0435\u0439 \u0430\u0443\u0434\u0430\u043d\u044b",
        "en": "Zhanasemey District",
        "slug": "zhana-semey",
    },
    "Кокпектинский": {
        "kk": "\u041a\u04e9\u043a\u043f\u0435\u043a\u0442\u0456 \u0430\u0443\u0434\u0430\u043d\u044b",
        "en": "Kokpekti District",
        "slug": "kokpekti",
    },
    "Мақаншы": {
        "kk": "\u041c\u0430\u049b\u0430\u043d\u0448\u044b \u0430\u0443\u0434\u0430\u043d\u044b",
        "en": "Makanshy District",
        "slug": "makanshy",
    },
    "Урджарский": {
        "kk": "\u04e8\u0440\u0436\u0430\u0440 \u0430\u0443\u0434\u0430\u043d\u044b",
        "en": "Urzhar District",
        "slug": "urzhar",
    },
    "г. Курчатов": {
        "kk": "\u041a\u04e9\u0440\u0448\u0430\u0442\u043e\u0432 \u049b.",
        "en": "Kurchatov city",
        "slug": "kurchatov",
    },
}

DISTRICT_ALIASES = {
    "бескарагайский район": "Бескарагайский",
}


def normalize_district(value: str) -> str:
    key = str(value).strip()
    alias = DISTRICT_ALIASES.get(key.lower())
    return alias or key


def load_abay_rows() -> pd.DataFrame:
    df = pd.read_excel(EXCEL, sheet_name=SHEET_INDEX)
    df.columns = [
        "num",
        "district",
        "school",
        "zoom",
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
    df = load_abay_rows()

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

        desc_kk = []
        desc_en = []
        if director:
            desc_kk.append(f"Директор: {director}")
            desc_en.append(f"Director: {director}")
        if address:
            desc_kk.append(f"Мекенжай: {address}")
            desc_en.append(f"Address: {address}")
        if not desc_kk:
            desc_kk.append("Aul Bilim жобасы аясындағы мектеп.")
            desc_en.append("School supported under the Aul Bilim programme.")

        schools.append(
            {
                "id": f"abay-{meta['slug']}-{idx}",
                "districtKey": dist_key,
                "kk": short_name(full),
                "en": short_name_en(full),
                "location": {"kk": meta["kk"], "en": meta["en"]},
                "badge": BADGES[len(schools) % len(BADGES)],
                "desc": {"kk": " ".join(desc_kk), "en": " ".join(desc_en)},
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
        "ABAY_SCHOOLS",
        payload,
        "Abay Region schools from Жоба мектер тізімі.xlsx",
    )
    print(f"Wrote {len(schools)} schools, {len(districts)} districts -> {OUT}")


if __name__ == "__main__":
    main()
