import json
import re
import sys
from pathlib import Path


def main() -> None:
    src = Path(sys.argv[1])
    dst = Path(sys.argv[2]) if len(sys.argv) > 2 else src.with_suffix(".extracted.html")
    text = src.read_text(encoding="utf-8")

    m = re.search(r'<script type="__bundler/template">(.*?)</script>', text, re.DOTALL)
    if not m:
        raise SystemExit("No __bundler/template script found")

    template = json.loads(m.group(1))
    if isinstance(template, str):
        inner = template
    elif isinstance(template, list):
        inner = next((x for x in template if isinstance(x, str) and x.lstrip().startswith("<!")), template[0])
    elif isinstance(template, dict):
        inner = template.get("html") or template.get("content") or next(iter(template.values()))
    else:
        raise SystemExit(f"Unexpected template type: {type(template)}")

    if isinstance(inner, str) and "\\u003C" in inner[:200]:
        inner = inner.encode("utf-8").decode("unicode_escape")

    dst.write_text(inner, encoding="utf-8")
    print(f"Wrote {dst} ({len(inner)} chars)")


if __name__ == "__main__":
    main()
