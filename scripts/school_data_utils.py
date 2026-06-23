"""Shared helpers for building region school JS data from Excel."""
import json
import re
from pathlib import Path

import pandas as pd

EXCEL = Path(r"c:\Users\Pine\Documents\PINE\PR\Жоба мектер тізімі (1).xlsx")

IMAGES = [
    "assets/optimized/home-fitout-classroom.jpg",
    "assets/optimized/program-fitout-detail.jpg",
]

BADGES = [
    {"kk": "Жоба аясында", "en": "Programme school"},
    {"kk": "Зертхана", "en": "Laboratory"},
    {"kk": "Толық жабдықталған", "en": "Fully equipped"},
]


RUSSIAN_TYPE_WORDS = (
    "основная средняя образовательная",
    "основная средняя",
    "основная общеобразовательная",
    "основная образовательная",
    "основная",
    "средняя образовательная",
    "средняя",
    "опорная",
    "общеобразовательная",
    "образовательная",
    "обшеобразовательная",
)

KK_LEXICON = {
    "ондирис": "Өндіріс",
}

EN_LEXICON = {
    "ondiris": "Production",
    "öndiris": "Production",
    "ондирис": "Production",
}


def _strip_russian_admin_tail(name: str) -> str:
    name = re.sub(r"\s*отдел[а]?\s+(?:#\d+\s*)?образования.*$", "", name, flags=re.I)
    name = re.sub(r"\s*управления\s+образования.*$", "", name, flags=re.I)
    name = re.sub(r"\s+в\s+базе\s+.*$", "", name, flags=re.I)
    name = re.sub(r"\s*\(ресурсный\s+центр\).*$", "", name, flags=re.I)
    return name.strip(" ,-")


def _strip_russian_school_types(name: str) -> str:
    name = re.sub(r"(?i)\bкомплекс\b", " ", name)
    name = re.sub(r"(?i)^комплекс\s+", "", name)
    name = re.sub(r"(?i)\s+комплекс\s+", " ", name)
    name = re.sub(r'(?i)"мектебі', "мектебі", name)
    name = re.sub(r"(?i)^мектебі-ясли-детский\s+сад\s+", "", name)
    name = re.sub(r"(?i)мектебі-ясли-детский\s+сад\s+", "", name)
    name = re.sub(r"(?i)-ясли-детский\s+сад\s*", " ", name)
    name = re.sub(r"(?i)-\s*сад\s+села\s+", " села ", name)
    name = re.sub(r"(?i)\s+с\s+дошкольным\s+мини-центром\b", " ", name)
    name = re.sub(r"(?i)дошкольным\s+мини-центром\b", " ", name)
    name = re.sub(r"(?i)детский\s+сад\s+", "", name)
    name = re.sub(r"(?i)\s+сош\b", "", name)
    name = re.sub(r"(?i)^сош\s+", "", name)
    name = re.sub(r"(?i)\s+им\.\s*", " ", name)
    name = re.sub(r"(?i)^им\.\s*", "", name)
    name = re.sub(r"^[–—-]\s*", "", name)
    name = re.sub(r"(?i)\bсредняяя+\b", " ", name)
    for word in RUSSIAN_TYPE_WORDS:
        name = re.sub(rf"(?i)\b{re.escape(word)}\b", " ", name)
    return re.sub(r"\s+", " ", name).strip(" ,-")


def _fix_russian_place_adjective(name: str) -> str:
    return re.sub(
        r"([A-Za-zА-Яа-яЁёҚқӘәІіҢңҒғҮүҰұӨөҺһ-]+)(?:ская|ский|ское)\b",
        r"\1",
        name,
        flags=re.I,
    )


def _fix_kk_lexicon(name: str) -> str:
    for src, dst in KK_LEXICON.items():
        name = re.sub(src, dst, name, flags=re.I)
    return name


def _fix_en_lexicon(name: str) -> str:
    for src, dst in EN_LEXICON.items():
        name = re.sub(src, dst, name, flags=re.I)
    return name


def _clean_school_title(name: str, suffix: str) -> str:
    name = re.sub(r"\s+", " ", name).strip(" ,-")

    m = re.match(r"(?i)^гимназия\s+села\s+(.+)$", name)
    if m:
        return f"{m.group(1).strip()} гимназиясы"[:120]

    m = re.match(
        r"(?i)^(?:комплекс\s+)?(?:мектебі|мектеп|secondary school|basic secondary school|school)[^-]*-\s*(?:ясли-)?детский\s+сад\s+(.+)$",
        name,
    )
    if m:
        core = m.group(1).strip()
        return f"{core} {suffix}"[:120]

    patterns = (
        (r"^(?:мектебі|мектеп|secondary school|basic secondary school|school)\s+села\s+(.+)$", 1),
        (r"^села\s+(.+?)\s+(?:мектебі|мектеп|secondary school|basic secondary school|school)$", 1),
        (r"^села\s+(.+)$", 1),
        (r"^(?:мектебі|мектеп|secondary school|basic secondary school|school)\s+село\s+(.+)$", 1),
        (r"^село\s+(.+?)\s+(?:мектебі|мектеп|secondary school|basic secondary school|school)$", 1),
        (r"^село\s+(.+)$", 1),
        (r"^(?:мектебі|мектеп|secondary school|basic secondary school|school)\s+поселка\s+(.+)$", 1),
        (r"^поселка\s+(.+?)\s+(?:мектебі|мектеп|secondary school|basic secondary school|school)$", 1),
        (r"^поселка\s+(.+)$", 1),
        (r"^(?:мектебі|мектеп|secondary school|basic secondary school|school)\s+станции\s+(.+)$", 1),
        (r"^станции\s+(.+?)\s+(?:мектебі|мектеп|secondary school|basic secondary school|school)$", 1),
        (r"^станции\s+(.+)$", 1),
        (r"^№\s*(\d+)\s+поселка\s+(.+)$", 2, r"\2 №\1"),
        (r"^№\s*(\d+)\s+село\s+(.+)$", 2, r"\2 №\1"),
        (r"^№\s*(\d+)\s+села\s+(.+)$", 2, r"\2 №\1"),
        (r"^№\s*(\d+)\s+(.+?)\s+села\s+(.+)$", None, r"\3 №\1"),
        (r"^мектебі\s+№\s*(\d+)\s+(?:поселка|село|села)\s+(.+)$", None, r"\2 №\1"),
    )

    for item in patterns:
        pat = item[0]
        m = re.match(pat, name, re.I)
        if not m:
            continue
        if len(item) == 3:
            core = m.expand(item[2]).strip()
        elif item[1] is None:
            core = m.expand(item[2]).strip()
        else:
            core = m.group(item[1]).strip()
        if re.search(rf"(?i){re.escape(suffix)}$", core):
            return core[:120]
        return f"{core} {suffix}"[:120]

    if not re.search(rf"(?i){re.escape(suffix)}$", name):
        m = re.match(r"(?i)^(.+?)\s+мектебі\s+(№\s*[\d\s]+)$", name)
        if m:
            return f"{m.group(1).strip()} {m.group(2).strip()} {suffix}"[:120]
        if re.search(r"(?i)гимназия$", name):
            return name[:120]
        return f"{name} {suffix}"[:120]
    return name[:120]


def _strip_russian_settlement_prefix(name: str) -> str:
    name = re.sub(r"(?i)^(?:мектебі\s+)?", "", name).strip()
    m = re.match(
        r"^(?:№\s*(\d+)\s+)?(?:поселка|поселок|село|села|станции)\s+(.+)$",
        name,
        re.I,
    )
    if m:
        num, place = m.group(1), m.group(2).strip()
        return f"{place} №{num}" if num else place
    m = re.match(
        r"^№\s*(\d+)\s+(?:поселка|поселок|село|села|станции)\s+(.+)$",
        name,
        re.I,
    )
    if m:
        return f"{m.group(2).strip()} №{m.group(1)}"
    return name


def _normalize_mektebi_suffix(name: str) -> str:
    name = re.sub(r"(?i)^мектебі\s+", "", name)
    name = re.sub(r"(?i)\s+мектебі\s*$", "", name)
    name = re.sub(r"(?i)^secondary school\s+", "", name)
    name = re.sub(r"(?i)\s+secondary school\s*$", "", name)
    return name.strip(" ,-")


def _fix_numbered_school_title(name: str) -> str:
    name = re.sub(
        r"(?i)^мектебі\s+(№\s*[\d\s]+)\s+(.+?)\s+атындағы\s+мектебі\s*$",
        r"\2 атындағы \1",
        name,
    )
    name = re.sub(r"(?i)^мектебі\s+(№\s*[\d\s]+)\s+мектебі\s*$", r"\1", name)
    name = re.sub(r"(?i)^мектебі\s+(№\s*[\d\s]+)\s*$", r"\1", name)
    name = re.sub(r"(?i)^(.+?)\s+мектебі\s+(№\s*[\d\s]+)\s+мектебі\s*$", r"\1 \2", name)
    return re.sub(r"\s+", " ", name).strip(" ,-")


def _polish_kk_title(name: str) -> str:
    name = _strip_russian_admin_tail(name)
    name = re.sub(r'^КГУ\s*["\']?', "", name, flags=re.I).strip()
    name = re.sub(r'^["\']+', "", name).strip()
    name = _normalize_mektebi_suffix(name)
    name = _strip_russian_settlement_prefix(name)
    name = _strip_russian_school_types(name)
    name = _fix_russian_place_adjective(name)
    name = _fix_kk_lexicon(name)
    name = re.sub(r"\s+", " ", name).strip(" ,-")
    name = _fix_numbered_school_title(name)
    return name


def _polish_en_title(name: str) -> str:
    name = _strip_russian_admin_tail(name)
    name = re.sub(r'^KGU\s*["\']?', "", name, flags=re.I).strip()
    name = re.sub(r'^КГУ\s*["\']?', "", name, flags=re.I).strip()
    name = re.sub(r'^["\']+', "", name).strip()
    name = _normalize_mektebi_suffix(name)
    name = _strip_russian_settlement_prefix(name)
    name = _strip_russian_school_types(name)
    name = _fix_russian_place_adjective(name)
    name = _fix_en_lexicon(name)
    name = re.sub(r"\s+", " ", name).strip(" ,-")
    name = _fix_numbered_school_title(name)
    return name


def clean_director(value) -> str:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return ""
    return _clean_director_text(str(value).strip())


def _split_director_address(text: str) -> tuple[str, str]:
    match = re.search(r"(?:Мекенжай|Address)\s*:\s*", text, flags=re.I)
    if match:
        return text[: match.start()].strip(), text[match.end() :].strip()
    return text.strip(), ""


def _clean_director_text(text: str) -> str:
    text = re.sub(r"^(?:Директор(?:ы)?|Director)\s*:\s*", "", text, flags=re.I).strip()
    text = re.sub(r"\s+", " ", text).strip(" .,")
    text = re.sub(
        r"\s*(?:моб\.?\s*тел|тел\.?\s*школы|тел\.?)\s*:?\s*[\d+\-()/\s]{7,}\s*",
        " ",
        text,
        flags=re.I,
    )
    text = re.sub(r"\s*\d[\d\s\-()]{8,}\d?\s*", " ", text).strip(" .,+")
    text = re.sub(r"\s*,\s*ИО директора по учебной части.*$", "", text, flags=re.I)
    text = re.sub(r"\s+", " ", text).strip(" .,")
    return text[:100]


def _clean_address_text(text: str) -> str:
    text = re.sub(r"^(?:Мекенжай|Address)\s*:\s*", "", text, flags=re.I).strip()
    return re.sub(r"\s+", " ", text).strip(" ,")[:200]


def _localize_acting_prefix_kk(name: str) -> str:
    name = re.sub(r"(?i)^(?:и\.\s*o\.|и/o|и\\o\\.)\s*", "а.о. ", name)
    name = re.sub(r"(?i)^и\.о\.(?=\S)", "а.о. ", name)
    name = re.sub(r"(?i)^и\.o\.(?=\S)", "а.о. ", name)
    name = re.sub(r"(?i)^и\.?\s*о\.?\s*", "а.о. ", name)
    name = re.sub(r"(?i)^и\.?\s*o\.?\s*", "а.о. ", name)
    name = re.sub(r"(?i)\bИ\.?\s*O\.?\s+директора\b", "а.о. директоры", name)
    name = re.sub(r"(?i)\bИО директора\b", "а.о. директоры", name)
    return re.sub(r"\s+", " ", name).strip()


def _localize_acting_prefix_en(name: str) -> str:
    name = re.sub(r"(?i)^(?:и\.?\s*o\.?|и/o|и\\o\\.|и\.?\s*о\.?|а\.?\s*o\.?)\s*", "Acting ", name)
    name = re.sub(r"(?i)^и\.o\.(?=\S)", "Acting ", name)
    name = re.sub(r"(?i)^и\.о\.(?=\S)", "Acting ", name)
    name = re.sub(r"(?i)\b(?:И\.?\s*O\.?|ИО)\s+директора\b", "Acting director", name)
    name = re.sub(r"(?i)\bа\.?\s*o\.?\s+директоры\b", "Acting director", name)
    return re.sub(r"\s+", " ", name).strip()


def _localize_patronymic_kk(name: str) -> str:
    name = re.sub(r"\bкызы\b", "қызы", name, flags=re.I)
    parts = name.split()
    if len(parts) < 3:
        return name
    patronymic = parts[-1]
    lowered = patronymic.casefold()
    if lowered.endswith(("овна", "евна")):
        parts[-1] = f"{patronymic[:-4]}қызы"
    elif lowered.endswith("ич"):
        parts[-1] = f"{patronymic[:-2]}ұлы"
    return " ".join(parts)


def localize_director_kk(name: str) -> str:
    name = _localize_acting_prefix_kk(name)
    return _localize_patronymic_kk(name)


def localize_director_en(name: str) -> str:
    return _localize_acting_prefix_en(name)


_ADDRESS_KK_RULES: tuple[tuple[str, str], ...] = (
    (r"Карагандинская область", "Қарағанды облысы"),
    (r"Карагандинск(?:ая|ий)\s+обл\.?", "Қарағанды обл."),
    (r"Кызылординск(?:ая|ий)\s+область", "Қызылорда облысы"),
    (r"Кызылординск(?:ая|ий)\s+обл\.?", "Қызылорда обл."),
    (r"Костанайская область", "Қостанай облысы"),
    (r"Акмолинская область", "Ақмола облысы"),
    (r"Западно[- ]Казахстанская область", "Батыс Қазақстан облысы"),
    (r"Область\s+Абая", "Абай облысы"),
    (r"Абай\s+область", "Абай облысы"),
    (r"область\s+Абай", "Абай облысы"),
    (r"обл\.?\s+Абай", "Абай обл."),
    (r"\bРК\b", "ҚР"),
    (r"сельский округ", "ауылдық округ"),
    (r"город", "қала"),
    (r"\bг\.\s*", "қ. "),
    (r"поселок", "елдімекен"),
    (r"Поселок", "елдімекен"),
    (r"пос\.\s*", "ел. "),
    (r"п\.\s*", "ел. "),
    (r"село", "ауылы"),
    (r"Село", "ауылы"),
    (r"\bс\.\s*", "ау. "),
    (r"Район", "ауданы"),
    (r"район", "ауданы"),
    (r"улица", "көшesi"),
    (r"улитца", "көшesi"),
    (r"ул\.\s*", "көш. "),
    (r"проспект", "даңғылы"),
    (r"пр\.\s*", "даң. "),
    (r"пр-\s*", "даң. "),
    (r"станци(?:я|и)\s*", "стан. "),
    (r"\bст\.\s*", "стан. "),
    (r"строение", "құр."),
    (r"стр\.\s*", "құр. "),
    (r"құрылыс", "құр."),
    (r"здание", "ғим."),
    (r"\bд\.\s*", "үй "),
    (r"дом", "үй"),
    (r"корпус", "корп."),
    (r"микрорайон", "мкр."),
    (r"\bмкр\.?\s*", "мкр. "),
    (r"квартал", "кв."),
    (r"индекс", "инд."),
    (r"инд\.\s*", "инд. "),
)

_ADDRESS_EN_RULES: tuple[tuple[str, str], ...] = (
    (r"Карагандинская область", "Karaganda Region"),
    (r"Карагандинск(?:ая|ий)\s+обл\.?", "Karaganda Region"),
    (r"Кызылординск(?:ая|ий)\s+область", "Kyzylorda Region"),
    (r"Кызылординск(?:ая|ий)\s+обл\.?", "Kyzylorda Region"),
    (r"Костанайская область", "Kostanay Region"),
    (r"Акмолинская область", "Akmola Region"),
    (r"Западно[- ]Казахстанская область", "West Kazakhstan Region"),
    (r"Область\s+Абая", "Abai Region"),
    (r"Абай\s+область", "Abai Region"),
    (r"область\s+Абай", "Abai Region"),
    (r"\bРК\b", "KZ"),
    (r"сельский округ", "rural district"),
    (r"город", "city"),
    (r"\bг\.\s*", ""),
    (r"поселок", "settlement"),
    (r"пос\.\s*", "settl. "),
    (r"п\.\s*", "settl. "),
    (r"село", "village"),
    (r"\bс\.\s*", "v. "),
    (r"район", "district"),
    (r"улица", "Street"),
    (r"улитца", "Street"),
    (r"ул\.\s*", "St. "),
    (r"проспект", "Avenue"),
    (r"пр\.\s*", "Ave. "),
    (r"станци(?:я|и)\s*", "stn. "),
    (r"\bст\.\s*", "stn. "),
    (r"строение", "Bldg."),
    (r"стр\.\s*", "Bldg. "),
    (r"здание", "Bldg."),
    (r"дом", "No."),
    (r"\bд\.\s*", "No. "),
    (r"корпус", "Bldg."),
    (r"микрорайон", "microdistrict"),
    (r"\bмкр\.?\s*", "microdist. "),
    (r"квартал", "block"),
)


def localize_address_kk(address: str) -> str:
    text = _clean_address_text(address)
    for pattern, repl in _ADDRESS_KK_RULES:
        text = re.sub(pattern, repl, text, flags=re.I)
    text = _fix_russian_place_adjective(text)
    return re.sub(r"\s+", " ", text).strip(" ,")


def localize_address_en(address: str) -> str:
    text = _clean_address_text(address)
    for pattern, repl in _ADDRESS_EN_RULES:
        text = re.sub(pattern, repl, text, flags=re.I)
    return re.sub(r"\s+", " ", text).strip(" ,")


def build_school_desc(director: str = "", address: str = "") -> dict[str, str]:
    director_text = "" if director is None else str(director).strip()
    address_text = "" if address is None else str(address).strip()
    if director_text.lower() == "nan":
        director_text = ""
    if address_text.lower() == "nan":
        address_text = ""

    extra_address = ""
    if director_text:
        director_text, extra_address = _split_director_address(director_text)
        director_text = _clean_director_text(director_text)
    if not address_text and extra_address:
        address_text = extra_address
    address_text = _clean_address_text(address_text)

    parts_kk: list[str] = []
    parts_en: list[str] = []
    if director_text:
        parts_kk.append(f"Директоры: {localize_director_kk(director_text)}")
        parts_en.append(f"Director: {localize_director_en(director_text)}")
    if address_text:
        parts_kk.append(f"Мекенжай: {localize_address_kk(address_text)}")
        parts_en.append(f"Address: {localize_address_en(address_text)}")

    if not parts_kk:
        return {
            "kk": "Aul Bilim жобасы аясындағы мектеп.",
            "en": "School supported under the Aul Bilim programme.",
        }
    return {"kk": " ".join(parts_kk), "en": " ".join(parts_en)}


def _extract_quoted_name(full: str) -> str:
    text = str(full).strip().strip('"').strip("'")
    if "«" in text:
        tail = text.rsplit("«", 1)[-1].split("»")[0].strip()
        if tail:
            return tail
    m = re.search(r'"([^"]{2,120})"', text)
    if m:
        return m.group(1).strip()
    m = re.search(r'["\u201c]([^"\u201d]{2,120})$', text)
    if m:
        return m.group(1).strip()
    return text


def _strip_trailing_school_noise(name: str) -> str:
    name = re.sub(r"\s+с\s+государственным\s+языком\s+обучения.*$", "", name, flags=re.I)
    name = re.sub(r"\s+города\s+.+$", "", name, flags=re.I)
    name = re.sub(r"\s+[A-Za-zА-Яа-яЁёҚқӘәІіҢңҒғҮүҰұӨөҺһ-]+ского\s+районного.*$", "", name, flags=re.I)
    name = re.sub(r"\s+села\s+.+$", "", name, flags=re.I)
    return name.strip(" ,-")


def _fix_imeni_kk(name: str) -> str:
    name = name.strip()
    m = re.search(r"№\s*([\d\s]+)\s+имени\s+(.+?)(?:\s+мектебі)?$", name, re.I)
    if m:
        person = _strip_trailing_school_noise(m.group(2))
        num = re.sub(r"\s+", "", m.group(1).strip())
        return f"{person} атындағы №{num} мектебі"
    m = re.match(r"^ени\s+([A-Za-zА-Яа-яЁёҚқӘәІіҢңҒғҮүҰұӨөҺһ])\s*,\s*(.+?)(?:\s+атындағы\s+мектебі)?$", name, re.I)
    if m:
        person = f"{m.group(1).strip()}. {m.group(2).strip()}"
        person = _strip_trailing_school_noise(person)
        return f"{person} атындағы мектебі"
    m = re.match(r"^имени\s+([A-Za-zА-Яа-яЁёҚқӘәІіҢңҒғҮүҰұӨөҺһ])\s*,\s*(.+?)(?:\s+мектебі)?$", name, re.I)
    if m:
        person = f"{m.group(1).strip()}. {m.group(2).strip()}"
        person = _strip_trailing_school_noise(person)
        return f"{person} атындағы мектебі"
    m = re.match(r"^ени\s+(.+?)(?:\s+атындағы\s+мектебі)?$", name, re.I)
    if m:
        person = _strip_trailing_school_noise(m.group(1))
        return f"{person} атындағы мектебі"
    m = re.match(r"^им\.?\s*(.+?)(?:\s+мектебі)?$", name, re.I)
    if m:
        person = _strip_trailing_school_noise(m.group(1))
        return f"{person} атындағы мектебі"
    m = re.match(r"^имени\s+(.+?)(?:\s+мектебі)?$", name, re.I)
    if m:
        person = _strip_trailing_school_noise(m.group(1))
        return f"{person} атындағы мектебі"
    m = re.match(r"^мектебі\s+имени\s+(.+)$", name, re.I)
    if m:
        person = _strip_trailing_school_noise(m.group(1))
        return f"{person} атындағы мектебі"
    m = re.match(r"^(.+?)\s+имени\s+(.+?)(?:\s+мектебі)?$", name, re.I)
    if m:
        prefix = re.sub(r"^мектебі\s+", "", m.group(1).strip(), flags=re.I).strip()
        person = _strip_trailing_school_noise(m.group(2))
        if (
            not prefix
            or prefix.lower() in {"мектебі", "средняя", "основная", "ош", "сош"}
            or re.search(r"№\s*\d|школа|мектебі|образователь", prefix, re.I)
        ):
            return f"{person} атындағы мектебі"
        return f"{prefix} {person} атындағы мектебі"
    return name


def _fix_imeni_en(name: str) -> str:
    name = name.strip()
    school_suffix = "Basic Secondary School" if re.search(r"basic|основная", name, re.I) else "Secondary School"
    m = re.match(r"^имени\s+(.+?)(?:\s+(?:Secondary School|Basic Secondary School|School|мектебі))?$", name, re.I)
    if m:
        person = _strip_trailing_school_noise(m.group(1))
        return f"{person} {school_suffix}"
    m = re.match(r"^(?:Secondary School|Basic Secondary School|School|мектебі)\s+имени\s+(.+)$", name, re.I)
    if m:
        person = _strip_trailing_school_noise(m.group(1))
        return f"{person} {school_suffix}"
    m = re.match(r"^(.+?)\s+имени\s+(.+?)(?:\s+(?:Secondary School|Basic Secondary School|School|мектебі))?$", name, re.I)
    if m:
        prefix = re.sub(r"^(?:Secondary School|Basic Secondary School|School|мектебі)\s+", "", m.group(1).strip(), flags=re.I).strip()
        person = _strip_trailing_school_noise(m.group(2))
        if not prefix or re.match(r"^(Secondary School|Basic Secondary School|School|мектебі)$", prefix, re.I):
            return f"{person} {school_suffix}"
        return f"{prefix} {person} {school_suffix}"
    return name


def _looks_like_boilerplate(name: str) -> bool:
    return bool(
        re.search(
            r"білім бөлімінің|басқармасының|отдела образования|управления образования",
            name,
            re.I,
        )
    ) and not re.search(r"№\s*\d", name)


def _fallback_school_title(full: str) -> str | None:
    m = re.search(
        r"№\s*\d+\s*[^«»\"]{0,100}?(?:мектеб|мектеп|орта|школа|лицей|гимназ)",
        full,
        re.I,
    )
    if m:
        return m.group(0).strip()
    m = re.search(r"№\s*\d+", full)
    if m:
        return f"{m.group(0).strip()} мектебі"
    return None


def _normalize_extracted_name(name: str) -> str:
    return re.sub(r'^["\']+|["\']+$', "", name.strip()).strip()


def short_name(full: str) -> str:
    name = _normalize_extracted_name(_extract_quoted_name(full))
    if _looks_like_boilerplate(name):
        fallback = _fallback_school_title(full)
        if fallback:
            name = fallback
    name = re.sub(r"\s*отдела образования.*$", "", name, flags=re.I).strip()
    name = _strip_russian_admin_tail(name)
    name = re.sub(r"^КГУ\s*", "", name, flags=re.I).strip()
    name = re.sub(r"^Коммунальное государственное учреждение\s*", "", name, flags=re.I).strip()
    name = re.sub(r"^ОСШ\s+", "", name, flags=re.I).strip()
    name = re.sub(r"^Сош\s+", "", name, flags=re.I).strip()
    name = re.sub(r"(?i)\s+с\s+дошкольным\s+мини-центром\b", "", name).strip()
    name = re.sub(r"(?i)\bсредняяя+\b", " ", name)
    name = re.sub(r"(?i)^казахская\s+", "", name).strip()
    for pattern, repl in (
        (r"орта мектебі", "мектебі"),
        (r"орта мектеб", "мектебі"),
        (r"средняя школа", "мектебі"),
        (r"основная школа", "мектебі"),
        (r"основная общеобразовательная школа", "мектебі"),
        (r"общеобразовательная школа", "мектебі"),
        (r"основная средняя школа", "мектебі"),
        (r"школа-гимназия", "гимназия"),
        (r"школа", "мектебі"),
    ):
        name = re.sub(pattern, repl, name, flags=re.I)
    m = re.match(r"^мектебі\s+(.+)$", name, flags=re.I)
    if m and not re.search(r"мектебі$", m.group(1), re.I):
        name = f"{m.group(1).strip()} мектебі"
    name = _fix_imeni_kk(name)
    name = _polish_kk_title(name)
    name = _normalize_extracted_name(name)
    return _clean_school_title(name.strip(), "мектебі")


def _title_case_en(name: str) -> str:
    if re.match(r"^[a-z]", name):
        return name[0].upper() + name[1:]
    return name


def short_name_en(full: str) -> str:
    name = _normalize_extracted_name(_extract_quoted_name(full))
    if _looks_like_boilerplate(name):
        fallback = _fallback_school_title(full)
        if fallback:
            name = fallback
    name = re.sub(r"\s*отдела образования.*$", "", name, flags=re.I).strip()
    name = re.sub(r"^KGU\s*[\"']?", "", name, flags=re.I).strip()
    name = re.sub(r"^КГУ\s*[\"']?", "", name, flags=re.I).strip()
    name = re.sub(r"^ОСШ\s+", "", name, flags=re.I).strip()
    for pattern, repl in (
        (r"орта мектебі", "Secondary School"),
        (r"орта мектеб", "Secondary School"),
        (r"средняя школа", "Secondary School"),
        (r"основная общеобразовательная школа", "Basic Secondary School"),
        (r"общеобразовательная школа", "Secondary School"),
        (r"основная средняя школа", "Basic Secondary School"),
        (r"школа-гимназия", "School-Gymnasium"),
        (r"школа", "School"),
    ):
        name = re.sub(pattern, repl, name, flags=re.I)
    m = re.match(r"^Secondary School\s+(.+)$", name, flags=re.I)
    if m:
        name = f"{m.group(1).strip()} Secondary School"
    name = _fix_imeni_en(name)
    name = _polish_en_title(name)
    name = re.sub(r"\s+атындағы\s+(?:Secondary School|Basic Secondary School)$", r" Secondary School", name, flags=re.I)
    m = re.search(r"^(.+?)\s+атындағы\s+(?:Secondary School|Basic Secondary School)?$", name, re.I)
    if m:
        name = f"{m.group(1).strip()} Secondary School"
    name = _normalize_extracted_name(name)
    return _title_case_en(_clean_school_title(name.strip(), "Secondary School"))


def build_region_payload(
    sheet_index: int,
    district_labels: list[dict],
    id_prefix: str,
) -> dict:
    df = pd.read_excel(EXCEL, sheet_name=sheet_index)
    df.columns = ["num", "district", "school", "director", "contact"]
    df["district"] = df["district"].ffill().str.strip()
    df = df.dropna(subset=["school"])

    excel_districts = list(df["district"].unique())
    if len(excel_districts) != len(district_labels):
        raise ValueError(
            f"Expected {len(district_labels)} districts, got {len(excel_districts)}: {excel_districts}"
        )

    district_meta = {
        key: {**label, "key": key}
        for key, label in zip(excel_districts, district_labels)
    }

    schools = []
    district_order: list[str] = []
    district_counts: dict[str, int] = {}

    for _, row in df.iterrows():
        dist_key = row["district"]
        if dist_key not in district_counts:
            district_order.append(dist_key)
            district_counts[dist_key] = 0
        district_counts[dist_key] += 1
        idx = district_counts[dist_key]
        meta = district_meta[dist_key]

        director = clean_director(row.get("director", ""))
        full = str(row["school"]).strip()

        schools.append(
            {
                "id": f"{id_prefix}-{meta['slug']}-{idx}",
                "districtKey": dist_key,
                "kk": short_name(full),
                "en": short_name_en(full),
                "location": {"kk": meta["kk"], "en": meta["en"]},
                "badge": BADGES[len(schools) % len(BADGES)],
                "desc": build_school_desc(director=director),
                "image": IMAGES[len(schools) % len(IMAGES)],
            }
        )

    districts = [
        {
            "key": key,
            "kk": district_meta[key]["kk"],
            "en": district_meta[key]["en"],
            "slug": district_meta[key]["slug"],
            "n": district_counts[key],
        }
        for key in district_order
    ]

    return {"districts": districts, "schools": schools}


def write_region_js(out: Path, global_name: str, payload: dict, comment: str) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(
        f"/* Auto-generated — {comment} */\n"
        f"window.{global_name} = "
        + json.dumps(payload, ensure_ascii=False, indent=2)
        + ";\n",
        encoding="utf-8",
    )
