#!/usr/bin/env python3
"""Update build-*-schools.py scripts for kk/ru language switch."""
import re
from pathlib import Path

from school_data_utils import district_label_ru

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = sorted((ROOT / "scripts").glob("build-*-schools.py"))


def ru_value(en_text: str) -> str:
    return district_label_ru(en_text)


def migrate(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    original = text

    text = text.replace("short_name_en", "short_name_ru")
    text = text.replace('"en": short_name_ru(full)', '"ru": short_name_ru(full)')
    text = text.replace(
        '"location": {"kk": meta["kk"], "en": meta["en"]}',
        '"location": {"kk": meta["kk"], "ru": meta["ru"]}',
    )
    text = text.replace(
        '"en": DISTRICT_META[key]["en"]',
        '"ru": DISTRICT_META[key]["ru"]',
    )

    def repl_district_meta(m: re.Match) -> str:
        val = m.group(1)
        return f'"ru": {repr(ru_value(val))}'

    text = re.sub(r'"en": "([^"]+)"', repl_district_meta, text)

    if text != original:
        path.write_text(text, encoding="utf-8")
        print(f"updated {path.name}")
    else:
        print(f"skipped {path.name}")


def main() -> None:
    for path in SCRIPTS:
        migrate(path)
    print("done")


if __name__ == "__main__":
    main()
