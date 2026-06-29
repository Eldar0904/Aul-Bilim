"""Generate assets/akmola-schools.js from Excel sheet."""
import argparse
from pathlib import Path

from geocode_maps import geocode_schools
from school_data_utils import build_maps_query, build_region_payload, write_region_js

OUT = Path(__file__).resolve().parents[1] / "assets" / "akmola-schools.js"
REGION_EN = "Akmola Region"

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
    {"kk": "Астрахан ауданы", "en": "Astrakhan District", "slug": "astrakhan"},
    {"kk": "Шортанды ауданы", "en": "Shortandy District", "slug": "shortandy"},
    {"kk": "Аршалы ауданы", "en": "Arshaly District", "slug": "arshaly"},
    {"kk": "Бурабай ауданы", "en": "Burabay District", "slug": "burabay"},
    {"kk": "Ақкөл ауданы", "en": "Akkol District", "slug": "akkol"},
    {"kk": "Есіл ауданы", "en": "Esil District", "slug": "esil"},
    {"kk": "Жаксын ауданы", "en": "Zhaksy District", "slug": "zhaksy"},
    {"kk": "Жаркаин ауданы", "en": "Zharkain District", "slug": "zharkain"},
    {"kk": "Сандықтау ауданы", "en": "Sandyktau District", "slug": "sandyktau"},
    {"kk": "Атбасар ауданы", "en": "Atbasar District", "slug": "atbasar"},
    {"kk": "Степногорск қ.", "en": "Stepnogorsk city", "slug": "stepnogorsk"},
    {"kk": "Целиноград ауданы", "en": "Tselinograd District", "slug": "tselinograd"},
    {"kk": "Егиндыкөл ауданы", "en": "Egindykol District", "slug": "egindykol"},
    {"kk": "Коргалжын ауданы", "en": "Korgalzhyn District", "slug": "korgalzhyn"},
    {"kk": "Ерейmentau ауданы", "en": "Ereymentau District", "slug": "ereymentau"},
    {"kk": "Биржан Сal ауданы", "en": "Birjan Sal District", "slug": "birjan-sal"},
    {"kk": "Бұланды ауданы", "en": "Bulandy District", "slug": "bulandy"},
    {"kk": "Зеренді ауданы", "en": "Zerendi District", "slug": "zerendi"},
]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--geocode",
        action="store_true",
        help="Fetch lat/lng from Nominatim for each mapsQuery (slow; cached)",
    )
    args = parser.parse_args()

    payload = build_region_payload(1, DISTRICT_LABELS, "akmola")
    for school in payload["schools"]:
        school["mapsQuery"] = build_maps_query(
            REGION_EN,
            school["location"]["en"],
            school.get("desc"),
        )
        image = SCHOOL_IMAGES.get(school["id"])
        if image:
            school["image"] = image
        media = SCHOOL_MEDIA.get(school["id"])
        if media:
            if media.get("gallery"):
                school["gallery"] = media["gallery"]
            if media.get("youtube"):
                school["youtube"] = media["youtube"]

    if args.geocode:
        ok, failed = geocode_schools(payload["schools"])
        print(f"Geocoded: {ok} ok, {failed} without coordinates")

    write_region_js(OUT, "AKMOLA_SCHOOLS", payload, "Akmola schools from Жоба мектер тізімі.xlsx")
    print(
        f"Wrote {len(payload['schools'])} schools, "
        f"{len(payload['districts'])} districts -> {OUT}"
    )


if __name__ == "__main__":
    main()
