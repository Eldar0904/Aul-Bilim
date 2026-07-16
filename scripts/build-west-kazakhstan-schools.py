"""Generate assets/west-kazakhstan-schools.js from ZKO MKSH + FHB Excel sheets."""
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

OUT = Path(__file__).resolve().parents[1] / "assets" / "west-kazakhstan-schools.js"

DISTRICT_META = {
    "Акжаикский район": {
        "kk": "\u0410\u049b\u0436\u0430\u0439\u044b\u049b \u0430\u0443\u0434\u0430\u043d\u044b",
        "ru": 'Akzhaikский район',
        "slug": "akzhaik",
    },
    "Район Байтерек": {
        "kk": "\u0411\u04d9\u0439\u0442\u0435\u0440\u0435\u043a \u0430\u0443\u0434\u0430\u043d\u044b",
        "ru": 'Baiterekский район',
        "slug": "baiterek",
    },
    "Бокейординский район": {
        "kk": "\u0411\u043e\u043a\u0435\u0439\u043e\u0440\u0434\u044b \u0430\u0443\u0434\u0430\u043d\u044b",
        "ru": 'Bokeyordyский район',
        "slug": "bokeyordy",
    },
    "Бурлинский район": {
        "kk": "\u0411\u04e9\u0440\u043b\u0456 \u0430\u0443\u0434\u0430\u043d\u044b",
        "ru": 'Burlinский район',
        "slug": "burlin",
    },
    "Жангалинский район": {
        "kk": "\u0416\u0430\u04a3\u0493\u0430\u043b\u0430 \u0430\u0443\u0434\u0430\u043d\u044b",
        "ru": 'Zhangalaский район',
        "slug": "zhangala",
    },
    "Жанибекский район": {
        "kk": "\u0416\u0430\u043d\u044b\u0431\u0435\u043a \u0430\u0443\u0434\u0430\u043d\u044b",
        "ru": 'Zhanibekский район',
        "slug": "zhanibek",
    },
    "Казталовский район": {
        "kk": "\u049a\u0430\u0437\u0442\u0430\u043b\u043e\u0432 \u0430\u0443\u0434\u0430\u043d\u044b",
        "ru": 'Kaztalovский район',
        "slug": "kaztalov",
    },
    "Каратобинский район": {
        "kk": "\u049a\u0430\u0440\u0430\u0442\u04e9\u0431\u0435 \u0430\u0443\u0434\u0430\u043d\u044b",
        "ru": 'Karatobeский район',
        "slug": "karatobe",
    },
    "Сырымский район": {
        "kk": "\u0421\u044b\u0440\u044b\u043c \u0430\u0443\u0434\u0430\u043d\u044b",
        "ru": 'Syrymский район',
        "slug": "syrym",
    },
    "Таскалинский район": {
        "kk": "\u0422\u0430\u0441\u049b\u0430\u043b\u0430 \u0430\u0443\u0434\u0430\u043d\u044b",
        "ru": 'Taskalaский район',
        "slug": "taskala",
    },
    "Чингирлауский район": {
        "kk": "\u0428\u044b\u04a3\u0493\u0456\u0440\u043b\u0430\u0443 \u0430\u0443\u0434\u0430\u043d\u044b",
        "ru": 'Chingirlayский район',
        "slug": "chingirlay",
    },
    "Теректинский район": {
        "kk": "\u0422\u0435\u0440\u0435\u043a\u0442\u0456 \u0430\u0443\u0434\u0430\u043d\u044b",
        "ru": 'Terektyский район',
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
        "WEST_KAZAKHSTAN_SCHOOLS",
        payload,
        "West Kazakhstan schools from Жоба мектер тізімі.xlsx (ЗКО МКШ + ЗКО ФХБ)",
    )
    print(
        f"Wrote {len(schools)} schools, {len(districts)} districts -> {OUT}"
    )


if __name__ == "__main__":
    main()
