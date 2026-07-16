"""Generate assets/kostanay-schools.js from Excel sheet."""
from pathlib import Path

from school_data_utils import build_region_payload, write_region_js

OUT = Path(__file__).resolve().parents[1] / "assets" / "kostanay-schools.js"

DISTRICT_LABELS = [
    {"kk": "Алтынсарин ауданы", "ru": 'Altynsarinский район', "slug": "altynsarin"},
    {"kk": "Амангелді ауданы", "ru": 'Amangeldyский район', "slug": "amangeldy"},
    {"kk": "Әулиекөл ауданы", "ru": 'Auliekolский район', "slug": "auliekol"},
    {"kk": "Денисов ауданы", "ru": 'Denisovский район', "slug": "denisov"},
    {"kk": "Жангелдин ауданы", "ru": 'Zhangeldyский район', "slug": "zhangeldy"},
    {"kk": "Жітіқара ауданы", "ru": 'Zhitikaraский район', "slug": "zhitikara"},
    {"kk": "Камысты ауданы", "ru": 'Kamystyский район', "slug": "kamysty"},
    {"kk": "Қарабалық ауданы", "ru": 'Qarabalyqский район', "slug": "qarabalyq"},
    {"kk": "Қарасу ауданы", "ru": 'Qarasuский район', "slug": "qarasu"},
    {"kk": "Қостанай ауданы", "ru": 'Костанайский район', "slug": "kostanay-district"},
    {"kk": "Меңдіқара ауданы", "ru": 'Mendykaraский район', "slug": "mendykara"},
    {"kk": "Наурызым ауданы", "ru": 'Nauryzymский район', "slug": "nauryzym"},
    {"kk": "Б. Майлин ауданы", "ru": 'B. Mailinский район', "slug": "mailin"},
    {"kk": "Сарыкөл ауданы", "ru": 'Sarykolский район', "slug": "sarykol"},
    {"kk": "Ұзынкөл ауданы", "ru": 'Uzunkolский район', "slug": "uzunkol"},
    {"kk": "Фёдоров ауданы", "ru": 'Fedorovский район', "slug": "fedorov"},
    {"kk": "Рудный қ.", "ru": 'г. Рудный', "slug": "rudny"},
    {"kk": "Арқалық қ.", "ru": 'г. Аркалык', "slug": "arkalyk"},
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
