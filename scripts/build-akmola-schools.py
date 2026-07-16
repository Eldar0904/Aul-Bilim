"""Generate assets/akmola-schools.js from Excel sheet."""
from pathlib import Path

from school_data_utils import build_region_payload, write_region_js

OUT = Path(__file__).resolve().parents[1] / "assets" / "akmola-schools.js"

SCHOOL_IMAGES = {
    "akmola-astrakhan-1": "assets/optimized/ondiris/ondiris-building.png",
}

SCHOOL_MEDIA = {
    "akmola-astrakhan-1": {
        "gallery": [
            "assets/optimized/ondiris/ondiris-building.png",
            "assets/optimized/ondiris/ondiris-classroom-1.png",
            "assets/optimized/ondiris/ondiris-classroom-2.png",
            "assets/optimized/ondiris/ondiris-classroom-3.png",
            "assets/optimized/ondiris/ondiris-classroom-4.png",
            "assets/optimized/ondiris/ondiris-plaque.png",
        ],
        "youtube": "Kn1wxXwTf7I",
    },
}

DISTRICT_LABELS = [
    {"kk": "Астрахан ауданы", "ru": 'Astrakhanский район', "slug": "astrakhan"},
    {"kk": "Шортанды ауданы", "ru": 'Shortandyский район', "slug": "shortandy"},
    {"kk": "Аршалы ауданы", "ru": 'Arshalyский район', "slug": "arshaly"},
    {"kk": "Бурабай ауданы", "ru": 'Burabayский район', "slug": "burabay"},
    {"kk": "Ақкөл ауданы", "ru": 'Akkolский район', "slug": "akkol"},
    {"kk": "Есіл ауданы", "ru": 'Esilский район', "slug": "esil"},
    {"kk": "Жақсын ауданы", "ru": 'Zhaksyский район', "slug": "zhaksy"},
    {"kk": "Жарқайын ауданы", "ru": 'Zharkainский район', "slug": "zharkain"},
    {"kk": "Сандықтау ауданы", "ru": 'Sandyktauский район', "slug": "sandyktau"},
    {"kk": "Атбасар ауданы", "ru": 'Atbasarский район', "slug": "atbasar"},
    {"kk": "Степногор қ.", "ru": 'г. Степногорск', "slug": "stepnogorsk"},
    {"kk": "Ақмола ауданы", "ru": 'Tselinogradский район', "slug": "tselinograd"},
    {"kk": "Егиндыкөл ауданы", "ru": 'Egindykolский район', "slug": "egindykol"},
    {"kk": "Коргалжын ауданы", "ru": 'Korgalzhynский район', "slug": "korgalzhyn"},
    {"kk": "Ерейментау ауданы", "ru": 'Ereymentauский район', "slug": "ereymentau"},
    {"kk": "Біржан Сал ауданы", "ru": 'Birjan Salский район', "slug": "birjan-sal"},
    {"kk": "Бұланды ауданы", "ru": 'Bulandyский район', "slug": "bulandy"},
    {"kk": "Зеренді ауданы", "ru": 'Zerendiский район', "slug": "zerendi"},
]


def main() -> None:
    payload = build_region_payload(1, DISTRICT_LABELS, "akmola")
    for school in payload["schools"]:
        image = SCHOOL_IMAGES.get(school["id"])
        if image:
            school["image"] = image
        media = SCHOOL_MEDIA.get(school["id"])
        if media:
            if media.get("gallery"):
                school["gallery"] = media["gallery"]
            if media.get("youtube"):
                school["youtube"] = media["youtube"]
    write_region_js(OUT, "AKMOLA_SCHOOLS", payload, "Akmola schools from Жоба мектер тізімі.xlsx")
    print(
        f"Wrote {len(payload['schools'])} schools, "
        f"{len(payload['districts'])} districts -> {OUT}"
    )


if __name__ == "__main__":
    main()
