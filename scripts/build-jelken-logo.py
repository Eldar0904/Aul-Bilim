"""Install Jelken logo assets from official Illustrator export."""
from __future__ import annotations

import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = Path(r"C:\Users\Pine\Documents\Aul-Bilim\Aul-Bilim")
OUT = ROOT / "img" / "coop"

WAVE = (
    "M415.26,688.18s-41.85,31.76-113.59,24.54c-66.64-6.71-114.76-7.96-161.76,31.17"
    ".56,1.92.25.89.24,1.05,100.08-55.41,195.36,51.15,327.57-4.3l-52.46-52.46Z"
)
SAIL = (
    "M300.06,689.92c84.35-104.27,13.11-152.7,13.11-152.7l-185.14-47.98c-.46-.12-.68.53-.25.73,"
    "100.86,45.32,90.96,154.6,10.06,251.14.3.22.77.74.77.74,67.45-67.56,161.45-51.93,161.45-51.93Z"
)


def find_source_svg() -> Path:
    matches = list(SOURCE_DIR.glob("JF_*.svg"))
    if not matches:
        raise FileNotFoundError(f"No JF_*.svg found in {SOURCE_DIR}")
    return matches[0]


def bbox(paths: list[str]) -> tuple[float, float, float, float]:
    from svg.path import parse_path

    pts: list[tuple[float, float]] = []
    for path_d in paths:
        parsed = parse_path(path_d)
        for t in (i / 200 for i in range(201)):
            pt = parsed.point(t)
            pts.append((pt.real, pt.imag))

    xs = [x for x, _ in pts]
    ys = [y for _, y in pts]
    pad = 2.0
    min_x, min_y = min(xs) - pad, min(ys) - pad
    max_x, max_y = max(xs) + pad, max(ys) + pad
    return min_x, min_y, max_x - min_x, max_y - min_y


def build_svg() -> str:
    min_x, min_y, width, height = bbox([WAVE, SAIL])
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width:.2f} {height:.2f}" '
        f'fill="none" aria-hidden="true">\n'
        f'  <g transform="translate({-min_x:.2f} {-min_y:.2f})">\n'
        f'    <path fill="#00123F" d="{WAVE}"/>\n'
        f'    <path fill="#0074FF" d="{SAIL}"/>\n'
        f"  </g>\n"
        f"</svg>\n"
    )


def write_png(svg: str) -> None:
    try:
        import cairosvg

        png = cairosvg.svg2png(bytestring=svg.encode(), output_width=512)
        (OUT / "logo-jf.png").write_bytes(png)
        (OUT / "logo-jelken-mark.png").write_bytes(png)
    except Exception:
        pass


def main() -> None:
    source = find_source_svg()
    OUT.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, OUT / "jelken-source.svg")

    svg = build_svg()
    (OUT / "jelken-logo.svg").write_text(svg, encoding="utf-8")
    write_png(svg)
    print("Installed logo from official JF source SVG")


if __name__ == "__main__":
    main()
