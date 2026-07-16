#!/usr/bin/env python3
"""One-time migration: KK/EN -> KK/RU across public HTML and school data."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGES = ["index.html", "about.html", "programs.html", "school.html"]

# Russian text keyed by data-copy key (with -ru suffix)
RU_COPY: dict[str, str] = {
    "global-skip-ru": "Перейти к основному содержанию",
    "global-nav-home-ru": "Главная",
    "global-nav-services-ru": "Направления",
    "global-nav-fitout-ru": "Модернизация школ",
    "global-nav-ustaz-ru": "Курсы обучения",
    "global-nav-samruk-ru": "Наставничество",
    "global-nav-regions-ru": "Охваченные регионы",
    "global-nav-about-ru": "О нас",
    "global-foot-about-ru": "Auyl Bilim — совместный благотворительный проект фондов «Қазақстан Халқына», «Білім Инновация» и Jelken Foundation.",
    "global-foot-explore-h-ru": "Разделы",
    "global-foot-contact-h-ru": "Контакты",
    "global-foot-address-ru": "Астана, Казахстан",
    "global-foot-tagline-ru": "Auyl Bilim — общественный проект",
    "global-foot-link-fitout-ru": "Модернизация школ",
    "global-foot-link-ustaz-ru": "Курсы обучения",
    "global-foot-link-samruk-ru": "Наставничество",
    "global-foot-link-about-ru": "О нас",
    "index-hero-mark-ru": "парус образования",
    "index-hero-sub-ru": "Современная школа для каждого ребёнка",
    "index-010-ru": "Чтобы обеспечить качественное образование в каждом уголке страны, мы полностью оснащаем школы современной мебелью, лабораториями естественных наук и цифровыми технологиями.",
    "index-012-ru": "Повышаем квалификацию педагогов и оказываем постоянную наставническую поддержку.",
    "index-014-ru": "регионов",
    "index-016-ru": "школ",
    "index-018-ru": "оснащённых классов",
    "index-020-ru": "обученных педагогов",
    "index-022-ru": "Образовательные инициативы",
    "index-024-ru": "Наши услуги",
    "index-026-ru": "Создаём современную образовательную среду для детей и педагогов в каждом уголке Казахстана.",
    "index-028-ru": "Создание инновационных кабинетов",
    "index-030-ru": "Во время урока ребёнку нужна свобода движения и удобная посадка. Наша современная мебель соответствует эргономическим стандартам — защищает здоровье учеников и помогает полностью сосредоточиться на занятии.",
    "index-032-ru": "Курсы обучения · USTAZ",
    "index-034-ru": "Развивая потенциал педагогов, мы выводим качество образования на новый уровень.",
    "index-036-ru": "Наставничество · Samruk Umiti",
    "index-038-ru": "Мы устанавливаем тесную связь с опытными специалистами и вместе идём по пути профессионального роста.",
    "index-044-ru": "Нажмите на выделенный регион",
    "index-046-ru": 'Цикл <span class="hl">изменений</span>',
    "index-048-ru": "Современная среда",
    "index-050-ru": "Квалифицированные педагоги",
    "index-052-ru": "Активные ученики",
    "index-054-ru": "Каждый шаг укрепляет следующий",
    "about-008-ru": "Наша миссия",
    "about-010-ru": "Равные возможности",
    "about-012-ru": "Сократить разрыв в качестве образования между сельскими и городскими школами и дать детям из сёл равные шансы на современное образование.",
    "about-014-ru": "Устойчивая экосистема",
    "about-016-ru": "Формируем устойчивую образовательную экосистему, обновляя школьную инфраструктуру и повышая профессионализм педагогов.",
    "about-018-ru": "Модель партнёрства",
    "about-020-ru": "Каждый партнёр выполняет свою специализированную роль, обеспечивая полную поддержку сельских школ.",
    "about-022-ru": "Главный партнёр",
    "about-024-ru": "(НФ «ҚАЗАҚСТАН ХАЛҚЫНА»)",
    "about-026-ru": "Финансирование",
    "about-028-ru": "Направление",
    "about-030-ru": "Подробнее",
    "about-032-ru": "Роль:",
    "about-034-ru": "Главный спонсор проекта.",
    "about-036-ru": "Вклад:",
    "about-038-ru": "Выделяет благотворительные средства на оснащение сельских школ современными кабинетами естественно-математических, цифровых и универсальных направлений.",
    "about-040-ru": "Академический партнёр",
    "about-042-ru": "(НИФ «БІЛІМ-ИННОВАЦИЯ»)",
    "about-044-ru": "Методология",
    "about-046-ru": "Подготовка кадров",
    "about-048-ru": "Подробнее",
    "about-050-ru": "Роль:",
    "about-052-ru": "Академический партнёр.",
    "about-054-ru": "Вклад:",
    "about-056-ru": "Организует курсы повышения квалификации педагогов, проводит диагностику знаний и оказывает постоянную наставническую поддержку в течение учебного года.",
    "about-058-ru": "Оператор проекта",
    "about-060-ru": "(НФ «JELKEN FOUNDATION»)",
    "about-062-ru": "Координация",
    "about-064-ru": "Мониторинг",
    "about-066-ru": "Отчётность",
    "about-068-ru": "Подробнее",
    "about-070-ru": "Роль:",
    "about-072-ru": "Главный оператор проекта.",
    "about-074-ru": "Вклад:",
    "about-076-ru": "Координирует все этапы проекта, проводит инвентаризацию в школах и контролирует закупку и качественную поставку оборудования.",
    "about-078-ru": "Местные органы",
    "about-080-ru": "Административная поддержка",
    "about-082-ru": "Подготовка помещений",
    "about-084-ru": "Подробнее",
    "about-086-ru": "Роль:",
    "about-088-ru": "Инфраструктурный партнёр.",
    "about-090-ru": "Вклад:",
    "about-092-ru": "Проводит ремонт учебных кабинетов, обеспечивает скорость интернета, финансирует и организует онлайн-занятия и курсы повышения квалификации.",
    "programs-008-ru": "Образовательные инициативы",
    "programs-010-ru": "Наши услуги",
    "programs-012-ru": "Создаём современную образовательную среду для детей и педагогов в каждом уголке Казахстана.",
    "programs-014-ru": "Создание инновационных кабинетов",
    "programs-016-ru": "Во время урока ребёнку нужна свобода движения и удобная посадка. Наша современная мебель соответствует эргономическим стандартам — защищает здоровье учеников и помогает полностью сосредоточиться на занятии.",
    "programs-018-ru": "Курсы обучения · USTAZ",
    "programs-020-ru": "Развивая потенциал педагогов, мы выводим качество образования на новый уровень.",
    "programs-022-ru": "Наставничество · Samruk Umiti",
    "programs-024-ru": "Мы устанавливаем тесную связь с опытными специалистами и вместе идём по пути профессионального роста.",
    "programs-026-ru": "Создание инновационных кабинетов",
    "programs-028-ru": "Во время урока ребёнку нужна свобода движения и удобная посадка. Наша современная мебель соответствует эргономическим стандартам — защищает здоровье учеников и помогает полностью сосредоточиться на занятии.",
    "programs-034-ru": "Оснащение охватывает три направления",
    "programs-036-ru": "Мебель для классов",
    "programs-038-ru": "Во время урока ребёнку нужна свобода движения и удобная посадка. Наша современная мебель соответствует эргономическим стандартам — защищает здоровье учеников и помогает полностью сосредоточиться на занятии.",
    "programs-040-ru": "Лаборатории",
    "programs-042-ru": "Превращаем теорию в практику. Оснащаем кабинеты естественных наук современным лабораторным оборудованием. Ученики проводят научные эксперименты своими руками — а не просто заучивают сухие формулы.",
    "programs-044-ru": "Цифровое оборудование",
    "programs-046-ru": "Эпоха классных досок прошла. С помощью интерактивных панелей, ноутбуков и STEM-наборов мы создаём в школах полноценную цифровую экосистему — это даёт педагогам возможность проводить увлекательные уроки, а ученикам — быстрее усваивать информацию.",
    "programs-048-ru": "Курсы обучения",
    "programs-050-ru": "Развивая потенциал педагогов, мы выводим качество образования на новый уровень.",
    "programs-052-ru": "Курсы повышения квалификации педагогов",
    "programs-054-ru": "Комплексные программы обучения направлены на развитие профессионального потенциала педагогов и руководителей школ, а также на внедрение современных образовательных технологий.",
    "programs-056-ru": "Программа 01",
    "programs-058-ru": "Предметные и методические компетенции",
    "programs-060-ru": "Углубляет предметные знания педагогов и развивает навыки использования современных учебных инструментов в классе.",
    "programs-062-ru": "Предметные знания",
    "programs-064-ru": "Совершенствование методики преподавания физики, химии, биологии, математики, информатики, географии и английского языка.",
    "programs-066-ru": "Современная педагогика",
    "programs-068-ru": "Освоение инновационных педагогических подходов на основе принципов обучения XXI века.",
    "programs-070-ru": "Цифровая компетентность",
    "programs-072-ru": "Эффективное использование искусственного интеллекта и нейросетей в образовании, развитие медиа- и информационной грамотности.",
    "programs-074-ru": "Программа 02",
    "programs-076-ru": "Воспитание и школьная культура",
    "programs-078-ru": "Для специалистов, отвечающих за формирование человеческих ценностей через систематизированный воспитательный процесс в школе.",
    "programs-080-ru": "Ценностно-ориентированное образование",
    "programs-082-ru": "Внедрение единой воспитательной стратегии на основе концепции «Честный гражданин» в школах.",
    "programs-084-ru": "Программа для классных руководителей",
    "programs-086-ru": "Выстраивание эффективных отношений с учениками и родителями, повышение качества воспитательных часов.",
    "programs-088-ru": "Менеджмент в образовании",
    "programs-090-ru": "Развитие управленческих и лидерских способностей руководства школ, эффективная организация воспитательной работы.",
    "programs-092-ru": "Наставничество",
    "programs-094-ru": "Мы устанавливаем тесную связь с опытными специалистами и вместе идём по пути профессионального роста.",
    "programs-096-ru": "Наставничество",
    "programs-098-ru": "После курсов педагоги получают постоянную методическую и техническую поддержку от экспертов «Білім-Инновация» в течение учебного года, чтобы эффективно применять полученные знания на практике.",
    "programs-100-ru": "Программа наставничества",
    "programs-102-ru": "Круглогодичная непрерывная поддержка",
    "programs-104-ru": "После курсов эксперты «Білім-Инновация» посещают школы напрямую и оказывают педагогам постоянную методическую и техническую поддержку.",
    "programs-106-ru": "направления поддержки",
    "programs-108-ru": "Наблюдение за уроками и обратная связь",
    "programs-110-ru": "Наставники посещают школы, контролируют ход лабораторных работ и дают педагогам индивидуальную обратную связь.",
    "programs-112-ru": "Техническая помощь",
    "programs-114-ru": "Практическая помощь во внедрении датчиков PASCO, программ SPARKvue и Capstone, а также интерактивных платформ в уроки.",
    "programs-116-ru": "Мастер-классы",
    "programs-118-ru": "Специальные мастер-классы (очно и онлайн) в каникулярное время для углубления практических навыков педагогов.",
    "programs-120-ru": "Систематизация воспитательной работы",
    "programs-122-ru": "Постоянные консультации для руководства школ по планированию воспитательной работы в рамках программы «Честный гражданин».",
    "school-008-ru": "К списку школ",
    "school-010-ru": "Школа не найдена",
    "school-012-ru": "Ссылка недействительна или данные о школе отсутствуют.",
    "school-014-ru": "Вернуться к карте",
}

TITLE_RU = {
    "data-kk": None,
    "index.html": ("Aul Bilim — Ауыл — білім желкені", "Aul Bilim — Ауыл — парус образования"),
    "about.html": ("Біз туралы — Aul Bilim", "О нас — Aul Bilim"),
    "programs.html": ("Бағдарламалар — Aul Bilim", "Программы — Aul Bilim"),
    "school.html": ("Мектеп — Aul Bilim", "Школа — Aul Bilim"),
}

INLINE_RU = {
    "Direction 01": "Направление 01",
    "Direction 02": "Направление 02",
    "Direction 03": "Направление 03",
    "Qazaqstan Halqyina": "Қазақстан халқына",
    "Bilim-Innovation": "Білім-Инновация",
    "Local education departments": "Местные управления образования",
    "Previous image": "Предыдущее изображение",
    "Next image": "Следующее изображение",
}

PROGRAM_TITLES = {
    "data-title-en": {
        "Building innovative classrooms — Aul Bilim": "Создание инновационных кабинетов — Aul Bilim",
        "Teacher Training — Aul Bilim": "Курсы обучения — Aul Bilim",
        "Mentorship — Aul Bilim": "Наставничество — Aul Bilim",
    }
}

HERO_H1_RU = (
    '<span class="hero-h1-line">Ауыл — <span class="mark" data-copy="index-hero-mark-ru">'
    'парус образования<svg viewBox="0 0 300 18" preserveAspectRatio="none" fill="none">'
    '<path d="M3 13C60 5 150 4 297 11" stroke="var(--accent-soft)" stroke-width="6" stroke-linecap="round"/></svg></span></span>'
    '<span class="hero-h1-sub" data-copy="index-hero-sub-ru">Современная школа для каждого ребёнка</span>'
)


def migrate_html(path: Path) -> None:
    text = path.read_text(encoding="utf-8")

    text = text.replace('lang="en"', 'lang="ru"')
    text = text.replace("data-en=", "data-ru=")
    text = text.replace('data-set="en"', 'data-set="ru"')
    text = text.replace(">ENG<", ">РУС<")

    text = re.sub(r'data-copy="([^"]+)-en"', r'data-copy="\1-ru"', text)

    for key, ru in RU_COPY.items():
        pattern = rf'(<span lang="ru" data-copy="{re.escape(key)}">)(.*?)(</span>)'
        text = re.sub(pattern, lambda m, ru=ru: m.group(1) + ru + m.group(3), text, flags=re.DOTALL)

    for en, ru in INLINE_RU.items():
        text = text.replace(f'<span lang="ru">{en}</span>', f'<span lang="ru">{ru}</span>')

    if path.name == "index.html":
        text = re.sub(
            r'<span lang="ru" data-copy="index-002-en">.*?</span>',
            f'<span lang="ru" data-copy="index-002-ru">{HERO_H1_RU}</span>',
            text,
            count=1,
            flags=re.DOTALL,
        )
        text = text.replace('data-copy="index-002-en"', 'data-copy="index-002-ru"')

    if path.name in TITLE_RU:
        kk, ru = TITLE_RU[path.name]
        text = re.sub(
            rf'<title data-kk="[^"]*" data-ru="[^"]*">[^<]*</title>',
            f'<title data-kk="{kk}" data-ru="{ru}">{kk}</title>',
            text,
            count=1,
        )

    for old, new in PROGRAM_TITLES.get("data-title-en", {}).items():
        text = text.replace(f'data-title-en="{old}"', f'data-title-ru="{new}"')

    path.write_text(text, encoding="utf-8")
    print(f"migrated {path.name}")


DISTRICT_EN_RU = [
    (r"^(.+) city$", r"г. \1"),
    (r"^(.+) District$", r"\1ский район"),
    (r"^No\. (\d+) Gymnasium$", r"Гимназия №\1"),
    (r"^№(\d+) Secondary School$", r"Средняя школа №\1"),
    (r"^Programme school$", r"Программная школа"),
    (r"^Laboratory$", r"Лаборатория"),
    (r"^Address: (.+)$", r"Адрес: \1"),
    (r"^Secondary School$", r"Средняя школа"),
    (r"^Gymnasium$", r"Гимназия"),
]

CYRILLIC_MAP = {
    "Karaganda": "Караганда", "Abai": "Абай", "Saran": "Сарань", "Karkaraly": "Каркаралы",
    "Temirtau": "Темиртау", "Shakhtinsk": "Шахтинск", "Kostanay": "Костанай",
    "Akmola": "Акмола", "Aktobe": "Актобе", "Almaty": "Алматы", "Atyrau": "Атырау",
}


def en_to_ru_string(s: str) -> str:
    if not s or not isinstance(s, str):
        return s
    for pat, repl in DISTRICT_EN_RU:
        m = re.match(pat, s.strip())
        if m:
            out = re.sub(pat, repl, s.strip())
            for lat, cyr in CYRILLIC_MAP.items():
                out = out.replace(lat, cyr)
            return out
    out = s
    for lat, cyr in CYRILLIC_MAP.items():
        out = out.replace(lat, cyr)
    out = out.replace("Secondary School", "средняя школа")
    out = out.replace("Gymnasium", "гимназия")
    out = out.replace("School", "школа")
    out = out.replace("District", "район")
    out = out.replace("city", "г.")
    return out


def migrate_school_file(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    text = text.replace('"en":', '"ru":')

    def repl_val(m: re.Match) -> str:
        val = m.group(1)
        return '"ru": ' + json.dumps(en_to_ru_string(val), ensure_ascii=False)

    text = re.sub(r'"ru": "([^"\\]*(?:\\.[^"\\]*)*)"', repl_val, text)
    path.write_text(text, encoding="utf-8")
    print(f"migrated {path.name}")


def migrate_copy_registry() -> None:
    path = ROOT / "uploads" / "copy-registry.js"
    text = path.read_text(encoding="utf-8")
    text = text.replace("-en", "-ru")
    text = text.replace("(English)", "(русский)")
    text = text.replace("English)", "русский)")
    for key, ru in RU_COPY.items():
        old_key = key.replace("-ru", "-en")
        # update label in registry for known keys - match key then label on next lines
        pattern = rf'("key": "{re.escape(key)}",\s*"selector":[^,]+,\s*"label": )"[^"]*"'
        if re.search(pattern, text):
            short = ru[:90].replace('"', '\\"')
            text = re.sub(pattern, rf'\1"{short}"', text, count=1)
    path.write_text(text, encoding="utf-8")
    print("migrated copy-registry.js")


def main() -> None:
    for name in PAGES:
        migrate_html(ROOT / name)

    for path in sorted((ROOT / "assets").glob("*-schools.js")):
        migrate_school_file(path)

    migrate_copy_registry()
    print("done")


if __name__ == "__main__":
    main()
