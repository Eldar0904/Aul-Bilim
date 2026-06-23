"""Generate assets/kostanay-schools.js from Excel sheet."""
from pathlib import Path

from school_data_utils import build_region_payload, write_region_js

OUT = Path(__file__).resolve().parents[1] / "assets" / "kostanay-schools.js"

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


def main() -> None:
    payload = build_region_payload(2, DISTRICT_LABELS, "kostanay")
    write_region_js(
        OUT,
        "KOSTANAY_SCHOOLS",
        payload,
        "Kostanay schools from Жоба мектер тізімі (1).xlsx",
    )
    print(f"Wrote {len(payload['schools'])} schools, {len(payload['districts'])} districts -> {OUT}")


if __name__ == "__main__":
    main()
