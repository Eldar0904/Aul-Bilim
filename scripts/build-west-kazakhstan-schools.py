"""Generate assets/west-kazakhstan-schools.js from ZKO MKSH + FHB Excel sheets."""
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

OUT = Path(__file__).resolve().parents[1] / "assets" / "west-kazakhstan-schools.js"

DISTRICT_META = {
    "Акжаикский район": {
        "kk": "\u0410\u049b\u0436\u0430\u0439\u044b\u049b \u0430\u0443\u0434\u0430\u043d\u044b",
        "en": "Akzhaik District",
        "slug": "akzhaik",
    },
    "Район Байтерек": {
        "kk": "\u0411\u04d9\u0439\u0442\u0435\u0440\u0435\u043a \u0430\u0443\u0434\u0430\u043d\u044b",
        "en": "Baiterek District",
        "slug": "baiterek",
    },
    "Бокейординский район": {
        "kk": "\u0411\u043e\u043a\u0435\u0439\u043e\u0440\u0434\u044b \u0430\u0443\u0434\u0430\u043d\u044b",
        "en": "Bokeyordy District",
        "slug": "bokeyordy",
    },
    "Бурлинский район": {
        "kk": "\u0411\u04e9\u0440\u043b\u0456 \u0430\u0443\u0434\u0430\u043d\u044b",
        "en": "Burlin District",
        "slug": "burlin",
    },
    "Жангалинский район": {
        "kk": "\u0416\u0430\u04a3\u0493\u0430\u043b\u0430 \u0430\u0443\u0434\u0430\u043d\u044b",
        "en": "Zhangala District",
        "slug": "zhangala",
    },
    "Жанибекский район": {
        "kk": "\u0416\u0430\u043d\u044b\u0431\u0435\u043a \u0430\u0443\u0434\u0430\u043d\u044b",
        "en": "Zhanibek District",
        "slug": "zhanibek",
    },
    "Казталовский район": {
        "kk": "\u049a\u0430\u0437\u0442\u0430\u043b\u043e\u0432 \u0430\u0443\u0434\u0430\u043d\u044b",
        "en": "Kaztalov District",
        "slug": "kaztalov",
    },
    "Каратобинский район": {
        "kk": "\u049a\u0430\u0440\u0430\u0442\u04e9\u0431\u0435 \u0430\u0443\u0434\u0430\u043d\u044b",
        "en": "Karatobe District",
        "slug": "karatobe",
    },
    "Сырымский район": {
        "kk": "\u0421\u044b\u0440\u044b\u043c \u0430\u0443\u0434\u0430\u043d\u044b",
        "en": "Syrym District",
        "slug": "syrym",
    },
    "Таскалинский район": {
        "kk": "\u0422\u0430\u0441\u049b\u0430\u043b\u0430 \u0430\u0443\u0434\u0430\u043d\u044b",
        "en": "Taskala District",
        "slug": "taskala",
    },
    "Чингирлауский район": {
        "kk": "\u0428\u044b\u04a3\u0493\u0456\u0440\u043b\u0430\u0443 \u0430\u0443\u0434\u0430\u043d\u044b",
        "en": "Chingirlay District",
        "slug": "chingirlay",
    },
    "Теректинский район": {
        "kk": "\u0422\u0435\u0440\u0435\u043a\u0442\u0456 \u0430\u0443\u0434\u0430\u043d\u044b",
        "en": "Terekty District",
        "slug": "terekty",
    },
}

DISTRICT_ALIASES = {
    "район бәйтерек": "Район Байтерек",
    "район байтерек": "Район Байтерек",
}


def normalize_district(value: str) -> str:
    key = str(value).strip()
    alias = DISTRICT_ALIASES.get(key.lower())
    return alias or key


def load_zko_sheet(sheet_index: int) -> pd.DataFrame:
    raw = pd.read_excel(EXCEL, sheet_name=sheet_index)
    df = raw.iloc[:, :3].copy()
    df.columns = ["num", "district", "school"]
    director_col = next((c for c in raw.columns if "ФИО Директора" in str(c)), None)
    df["director"] = raw[director_col] if director_col is not None else ""
    df["district"] = df["district"].ffill().map(normalize_district)
    df["school"] = df["school"].astype(str).str.strip()
    df = df[df["school"].notna() & (df["school"] != "") & (df["school"].str.lower() != "nan")]
    return df


def main() -> None:
    df = pd.concat([load_zko_sheet(6), load_zko_sheet(7)], ignore_index=True)

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
        full = str(row["school"]).strip()

        schools.append(
            {
                "id": f"bko-{meta['slug']}-{idx}",
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
        "WEST_KAZAKHSTAN_SCHOOLS",
        payload,
        "West Kazakhstan schools from Жоба мектер тізімі.xlsx (ЗКО МКШ + ЗКО ФХБ)",
    )
    print(
        f"Wrote {len(schools)} schools, {len(districts)} districts -> {OUT}"
    )


if __name__ == "__main__":
    main()
