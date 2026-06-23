import json
from pathlib import Path

import pandas as pd

path = r"c:\Users\Pine\Documents\PINE\PR\Жоба мектер тізімі.xlsx"
df = pd.read_excel(path, sheet_name=3)
df.columns = ["num", "district", "school", "zoom", "director", "contact", "phone", "address", "email"]
df["district"] = df["district"].astype(str).replace({"nan": pd.NA, "": pd.NA}).ffill().str.strip()
df["school"] = df["school"].astype(str).str.replace(r"\s+", " ", regex=True).str.strip()
df = df.dropna(subset=["school"])
df = df[df["school"].str.lower() != "nan"]
info = {
    "total": len(df),
    "districts": list(df["district"].unique()),
    "counts": {d: int((df["district"] == d).sum()) for d in df["district"].unique()},
}
Path(__file__).resolve().parent.joinpath("abay-preview.json").write_text(
    json.dumps(info, ensure_ascii=False, indent=2), encoding="utf-8"
)
print(info["total"], len(info["districts"]))
