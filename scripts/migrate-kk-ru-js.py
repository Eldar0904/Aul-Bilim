#!/usr/bin/env python3
"""Migrate JS files from en to ru language field."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]

REGION_RU = {
    "West Kazakhstan Region": "Западно-Казахстанская область",
    "Kostanay Region": "Костанайская область",
    "Akmola Region": "Акмолинская область",
    "Karaganda Region": "Карагандинская область",
    "Abay Region": "Абайская область",
    "Kyzylorda Region": "Кызылординская область",
    "Turkistan Region": "Туркестанская область",
    "Jambyl Region": "Жамбылская область",
    "Almaty Region": "Алматинская область",
}

DESC_RU = {
    "Under our programme, schools across West Kazakhstan Region have received modern equipment and fully fitted laboratories, and teacher training is underway to raise professional skills.":
        "В рамках нашей программы школы Западно-Казахстанской области получили современное оборудование и полностью оснащённые лаборатории, а также проходят обучение педагоги.",
    "Under our programme, schools across Kostanay Region have received modern equipment; physics, chemistry and biology laboratories have been fully fitted out, and teacher training is underway to raise professional skills.":
        "В рамках нашей программы школы Костанайской области получили современное оборудование; физические, химические и биологические лаборатории полностью оснащены, а педагоги проходят обучение.",
    "Under our programme, schools across Akmola Region have received modern equipment and fully fitted laboratories, and teacher training is underway to raise professional skills.":
        "В рамках нашей программы школы Акмолинской области получили современное оборудование и полностью оснащённые лаборатории, а педагоги проходят обучение.",
    "Under our programme, schools across Karaganda Region have received modern equipment and fully fitted laboratories, and teacher training is underway to raise professional skills.":
        "В рамках нашей программы школы Карагандинской области получили современное оборудование и полностью оснащённые лаборатории, а педагоги проходят обучение.",
    "Under our programme, schools across Abay Region have received modern equipment and fully fitted laboratories, and teacher training is underway to raise professional skills.":
        "В рамках нашей программы школы Абайской области получили современное оборудование и полностью оснащённые лаборатории, а педагоги проходят обучение.",
    "Under our programme, schools across Kyzylorda Region have received modern equipment and fully fitted laboratories, and teacher training is underway to raise professional skills.":
        "В рамках нашей программы школы Кызылординской области получили современное оборудование и полностью оснащённые лаборатории, а педагоги проходят обучение.",
    "Under our programme, schools across Almaty Region have received modern equipment and fully fitted laboratories, and teacher training is underway to raise professional skills.":
        "В рамках нашей программы школы Алматинской области получили современное оборудование и полностью оснащённые лаборатории, а педагоги проходят обучение.",
    "We work with district schools across this region — modern equipment, laboratories, and teacher training.":
        "Мы работаем со школами районов в этом регионе — современное оборудование, лаборатории и обучение педагогов.",
}

MAP_LABEL_RU = {
    "Abay": "Абай",
    "Akmola": "Акмолинская",
    "Aktobe": "Актюбинская",
    "Almaty": "Алматинская",
    "Atyrau": "Атырауская",
    "West KZ": "ЗКО",
    "Jambyl": "Жамбылская",
    "Jetisu": "Жетісу",
    "Karaganda": "Карагандинская",
    "Kostanay": "Костанайская",
    "Kyzylorda": "Кызылординская",
    "Mangystau": "Мангистауская",
    "Pavlodar": "Павлодарская",
    "North KZ": "СКО",
    "Turkestan": "Туркестанская",
    "Ulytau": "Ұлытау",
    "East KZ": "ВКО",
}

BI_REPLACEMENTS = [
    ("bi('Картаны көру', 'Go to map')", "bi('Картаны көру', 'К карте')"),
    ("bi('Басты бетке', 'Go to home page')", "bi('Басты бетке', 'На главную')"),
    ("bi('Жаңғыртылған мектептер', 'Renovated schools')", "bi('Жаңғыртылған мектептер', 'Модернизированные школы')"),
    ("bi('Ешқандай мектеп табылмады', 'No schools match your search')", "bi('Ешқандай мектеп табылмады', 'По вашему запросу школы не найдены')"),
    ("bi('Мектептер тізімі жақында қосылады', 'School list coming soon')", "bi('Мектептер тізімі жақында қосылады', 'Список школ скоро будет добавлен')"),
    ("bi('мектеп', 'schools')", "bi('мектеп', 'школ')"),
    ("bi('кабинет', 'classrooms')", "bi('кабинет', 'кабинетов')"),
    ("bi('оқытылған ұстаз', 'teachers trained')", "bi('оқытылған ұстаз', 'обученных педагогов')"),
    ("bi('мұғалім', 'teachers')", "bi('мұғалім', 'педагогов')"),
    ("bi('Мектептерді көру', 'View schools')", "bi('Мектептерді көру', 'Смотреть школы')"),
    ("bi('Жүктелуде…', 'Loading…')", "bi('Жүктелуде…', 'Загрузка…')"),
    ("pickLang('мектеп', 'schools')", "pickLang('мектеп', 'школ')"),
    ("pickLang(visible + ' / ' + totalSchools + ' мектеп', visible + ' / ' + totalSchools + ' schools')",
     "pickLang(visible + ' / ' + totalSchools + ' мектеп', visible + ' / ' + totalSchools + ' школ')"),
]


def migrate_map_js(text: str) -> str:
    for en, ru in REGION_RU.items():
        text = text.replace(f"en: '{en}'", f"ru: '{ru}'")
    for en, ru in DESC_RU.items():
        text = text.replace(f"en: '{en}'", f"ru: '{ru}'")
    for en, ru in MAP_LABEL_RU.items():
        text = text.replace(f"en: '{en}'", f"ru: '{ru}'")

    text = text.replace("function bi(kk, en)", "function bi(kk, ru)")
    text = text.replace("function pickLang(kk, en)", "function pickLang(kk, ru)")
    text = text.replace("'=== 'en'", "'=== 'ru'")
    text = text.replace("=== 'en' ?", "=== 'ru' ?")
    text = text.replace('<span lang="en">', '<span lang="ru">')
    text = text.replace("return { kk: d.kk, en: d.en", "return { kk: d.kk, ru: d.ru")
    text = text.replace("groups.push({ key: d.key, slug: d.slug, kk: d.kk, en: d.en", "groups.push({ key: d.key, slug: d.slug, kk: d.kk, ru: d.ru")
    text = text.replace("label.kk || label.en", "label.kk || label.ru")
    text = text.replace("item.label[lang] || item.label.kk", "item.label[lang] || item.label.kk")

    text = re.sub(r"\bs\.en\b", "s.ru", text)
    text = re.sub(r"\br\.en\b", "r.ru", text)
    text = re.sub(r"\bd\.en\b", "d.ru", text)
    text = re.sub(r"\bg\.en\b", "g.ru", text)
    text = re.sub(r"desc\.en", "desc.ru", text)
    text = re.sub(r"cardDesc\.en", "cardDesc.ru", text)
    text = re.sub(r"location\.en", "location.ru", text)
    text = re.sub(r"district\.en", "district.ru", text)
    text = re.sub(r"override\.desc\.en", "override.desc.ru", text)
    text = re.sub(r"override\.cardDesc\.en", "override.cardDesc.ru", text)

    text = text.replace(
        '<span lang="ru"><span class="hl">Supported</span> schools</span>',
        '<span lang="ru"><span class="hl">Поддерживаемые</span> школы</span>',
    )

    for old, new in BI_REPLACEMENTS:
        text = text.replace(old, new)
    return text


def migrate_school_js(text: str) -> str:
    for en, ru in REGION_RU.items():
        text = text.replace(f"en: '{en}'", f"ru: '{ru}'")
    text = text.replace("function bi(kk, en)", "function bi(kk, ru)")
    text = text.replace("=== 'en' ?", "=== 'ru' ?")
    text = text.replace('<span lang="en">Video coming soon</span>', '<span lang="ru">Видео скоро появится</span>')
    text = text.replace("school.en", "school.ru")
    text = text.replace("desc.en", "desc.ru")
    text = text.replace("override.desc.en", "override.desc.ru")
    text = text.replace("data-en", "data-ru")
    text = text.replace("bi('мұғалім', 'teachers')", "bi('мұғалім', 'педагогов')")
    return text


def migrate_admin_schools(text: str) -> str:
    text = text.replace("region.en", "region.ru")
    text = text.replace("regionEn: region.en", "regionRu: region.ru")
    text = text.replace("regionEn:", "regionRu:")
    text = text.replace("school.en", "school.ru")
    text = text.replace("entry.en", "entry.ru")
    text = text.replace("desc.en", "desc.ru")
    text = text.replace("cardDesc.en", "cardDesc.ru")
    text = text.replace("lang === 'en'", "lang === 'ru'")
    text = text.replace("school-field-desc-en", "school-field-desc-ru")
    text = text.replace("school-field-card-desc-en", "school-field-card-desc-ru")
    text = text.replace("en: f.desc.en", "ru: f.desc.ru")
    text = text.replace("en: entry.en", "ru: entry.ru")
    text = text.replace("en: f.cardDesc.en", "ru: f.cardDesc.ru")
    text = text.replace("merged.cardDesc = { kk: f.cardDesc.kk, en: f.cardDesc.en }", "merged.cardDesc = { kk: f.cardDesc.kk, ru: f.cardDesc.ru }")
    text = text.replace("s.en +", "s.ru +")
    text = text.replace("(base.desc && base.desc.en)", "(base.desc && base.desc.ru)")
    return text


def migrate_copy_bindings(text: str) -> str:
    text = text.replace("-en'", "-ru'")
    text = text.replace('lang=en', 'lang=ru')
    return text


def main():
    files = {
        ROOT / "map.js": migrate_map_js,
        ROOT / "school.js": migrate_school_js,
        ROOT / "admin-schools.js": migrate_admin_schools,
        ROOT / "uploads" / "copy-bindings.js": migrate_copy_bindings,
    }
    for path, fn in files.items():
        path.write_text(fn(path.read_text(encoding="utf-8")), encoding="utf-8")
        print(f"migrated {path.name}")

    # admin-regions.js
    ar = ROOT / "admin-regions.js"
    t = ar.read_text(encoding="utf-8")
    t = t.replace("region.en", "region.ru")
    t = t.replace("region-stat-name-en", "region-stat-name-ru")
    t = t.replace("admin-lang-en", "admin-lang-ru")
    ar.write_text(t, encoding="utf-8")
    print("migrated admin-regions.js")


if __name__ == "__main__":
    main()
