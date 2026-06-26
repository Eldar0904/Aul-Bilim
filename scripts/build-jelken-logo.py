"""Regenerate Jelken logo PNG fallbacks from reference asset."""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = Path(
    r"C:\Users\Pine\.cursor\projects\c-Users-Pine-Documents-Claude-Projects-B2B-Proects-Aul-Bilim"
    r"\assets\c__Users_Pine_AppData_Roaming_Cursor_User_workspaceStorage_9858c4971398f74b21184760093c57b7"
    r"_images_JF_________-________-efd83631-0192-4476-bea0-8e95c46a7d38.png"
)
OUT = ROOT / "img" / "coop"


def main() -> None:
    img = Image.open(SRC).convert("RGBA")
    w, h = img.size
    bot = img.crop((0, h // 2, w, h))
    arr = np.array(bot)
    mask = np.any(arr[:, :, :3] > 30, axis=2)
    ys, xs = np.where(mask)
    trim = bot.crop((int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1))

    tarr = np.array(trim)
    black = (tarr[:, :, 0] < 20) & (tarr[:, :, 1] < 20) & (tarr[:, :, 2] < 20)
    tarr[black, 3] = 0
    hi = Image.fromarray(tarr).resize((512, int(512 * trim.height / trim.width)), Image.LANCZOS)

    OUT.mkdir(parents=True, exist_ok=True)
    hi.save(OUT / "logo-jf.png")
    hi.save(OUT / "logo-jelken-mark.png")
    print(f"Wrote PNG fallbacks to {OUT} ({hi.size[0]}x{hi.size[1]})")


if __name__ == "__main__":
    main()
