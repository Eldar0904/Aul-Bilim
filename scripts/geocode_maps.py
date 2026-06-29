"""Geocode mapsQuery strings via OpenStreetMap Nominatim (1 req/sec)."""
from __future__ import annotations

import json
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

USER_AGENT = "AulBilim/1.0 (school map preview; contact: admin@aul-bilim.kz)"
CACHE_PATH = Path(__file__).resolve().parents[1] / "assets" / "maps-geocode-cache.json"


def load_cache() -> dict[str, dict]:
    if not CACHE_PATH.exists():
        return {}
    try:
        return json.loads(CACHE_PATH.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return {}


def save_cache(cache: dict[str, dict]) -> None:
    CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
    CACHE_PATH.write_text(json.dumps(cache, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def geocode_query(query: str, cache: dict[str, dict]) -> dict | None:
    key = query.strip()
    if not key:
        return None
    if key in cache:
        return cache[key]

    params = urllib.parse.urlencode(
        {"q": key, "format": "json", "limit": 1, "countrycodes": "kz"}
    )
    url = f"https://nominatim.openstreetmap.org/search?{params}"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except (urllib.error.URLError, json.JSONDecodeError, TimeoutError):
        cache[key] = {"lat": None, "lng": None, "error": "request_failed"}
        return cache[key]

    if not data:
        cache[key] = {"lat": None, "lng": None, "error": "not_found"}
        return cache[key]

    hit = data[0]
    result = {
        "lat": round(float(hit["lat"]), 6),
        "lng": round(float(hit["lon"]), 6),
        "displayName": hit.get("display_name", ""),
    }
    cache[key] = result
    return result


def geocode_schools(schools: list[dict], *, sleep_s: float = 1.05) -> tuple[int, int]:
    cache = load_cache()
    ok = 0
    failed = 0
    seen_queries: set[str] = set()

    for school in schools:
        query = str(school.get("mapsQuery", "")).strip()
        if not query:
            continue
        if query not in seen_queries:
            seen_queries.add(query)
            result = geocode_query(query, cache)
            time.sleep(sleep_s)
        else:
            result = cache.get(query)

        if result and result.get("lat") is not None and result.get("lng") is not None:
            school["lat"] = result["lat"]
            school["lng"] = result["lng"]
            ok += 1
        else:
            failed += 1

    save_cache(cache)
    return ok, failed
