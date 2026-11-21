#!/usr/bin/env python3
"""Fail when Vercel and Docker algorithm implementations drift apart."""

from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
API_DIR = ROOT / "api" / "algorithms"
BACKEND_DIR = ROOT / "backend" / "app" / "algorithms"


def normalize(source: str) -> str:
    return (
        source.replace("from api.models import", "from app.models import")
        .replace("from api.algorithms.", "from app.algorithms.")
    )


def main() -> int:
    api_files = {path.name for path in API_DIR.glob("*.py")}
    backend_files = {path.name for path in BACKEND_DIR.glob("*.py")}

    if api_files != backend_files:
        print("Algorithm module sets differ.")
        print("Only in api:", sorted(api_files - backend_files))
        print("Only in backend:", sorted(backend_files - api_files))
        return 1

    mismatches = []
    for name in sorted(api_files):
        api_source = (API_DIR / name).read_text(encoding="utf-8")
        backend_source = (BACKEND_DIR / name).read_text(encoding="utf-8")
        if normalize(api_source) != normalize(backend_source):
            mismatches.append(name)

    api_models = (ROOT / "api" / "models.py").read_text(encoding="utf-8")
    backend_models = (ROOT / "backend" / "app" / "models.py").read_text(encoding="utf-8")
    if api_models != backend_models:
        mismatches.append("models.py (API contract)")

    if mismatches:
        print("Algorithm source parity check failed:")
        for name in mismatches:
            print(" -", name)
        return 1

    print(f"Algorithm source parity OK: {len(api_files)} modules and shared contracts.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
