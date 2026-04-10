#!/usr/bin/env python3
"""Generate compact context docs from the full docs tree.

This keeps source markdown untouched while producing lightweight companion files in
`docs/compact/` for low-token context loading.
"""

from __future__ import annotations

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent
SOURCE_DIRS = [
    ROOT / "content",
    ROOT / "design",
    ROOT / "economy",
    ROOT / "engine",
    ROOT / "ui",
]
SOURCE_FILES = [ROOT / "roadmap.md", ROOT / "status.md"]
OUT_ROOT = ROOT / "compact"

HEADING_RE = re.compile(r"^(#{1,6})\s+(.+?)\s*$")
BULLET_RE = re.compile(r"^\s*[-*+]\s+(.+?)\s*$")
NUMBERED_RE = re.compile(r"^\s*\d+[.)]\s+(.+?)\s*$")


def compact_lines(lines: list[str]) -> list[str]:
    title = "Untitled"
    for line in lines:
        m = HEADING_RE.match(line)
        if m and len(m.group(1)) == 1:
            title = m.group(2).strip()
            break

    sections: list[tuple[int, str, list[str], str | None]] = []
    current: tuple[int, str, list[str], str | None] | None = None

    for raw in lines:
        line = raw.rstrip("\n")

        heading = HEADING_RE.match(line)
        if heading and len(heading.group(1)) >= 2:
            if current:
                sections.append(current)
            level = len(heading.group(1))
            text = heading.group(2).strip()
            current = (level, text, [], None)
            continue

        if current is None:
            continue

        level, text, bullets, summary = current

        if not line.strip() or line.strip() == "---" or line.strip().startswith("|"):
            current = (level, text, bullets, summary)
            continue

        b = BULLET_RE.match(line) or NUMBERED_RE.match(line)
        if b:
            cleaned = re.sub(r"\s+", " ", b.group(1).strip())
            if cleaned and len(bullets) < 4:
                bullets.append(cleaned)
            current = (level, text, bullets, summary)
            continue

        if summary is None and not line.lstrip().startswith(("`", ">", "#")):
            cleaned = re.sub(r"\s+", " ", line.strip())
            if cleaned:
                current = (level, text, bullets, cleaned)
            continue

        current = (level, text, bullets, summary)

    if current:
        sections.append(current)

    out: list[str] = []
    out.append(f"# {title} (Compact Context)")
    out.append("")
    out.append("> Auto-generated from the canonical source file. Edit the source markdown, then regenerate compact docs.")
    out.append("")
    out.append("## Quick Map")

    if not sections:
        out.append("- No sections detected.")
    else:
        for level, text, _, _ in sections:
            indent = "  " * max(level - 2, 0)
            out.append(f"{indent}- {text}")

    out.append("")
    out.append("## Key Points")

    if not sections:
        out.append("- No key points extracted.")
    else:
        for _, text, bullets, summary in sections:
            out.append(f"### {text}")
            if bullets:
                for item in bullets:
                    out.append(f"- {item}")
            elif summary:
                out.append(f"- {summary}")
            else:
                out.append("- (No concise bullet/summary found; use grep in source file for details.)")
            out.append("")

    return out


def source_files() -> list[Path]:
    files = [p for p in SOURCE_FILES if p.exists()]
    for directory in SOURCE_DIRS:
        if directory.exists():
            files.extend(sorted(directory.glob("*.md")))
    return sorted(files)


def write_compact(src: Path) -> None:
    rel = src.relative_to(ROOT)
    out = OUT_ROOT / rel
    out.parent.mkdir(parents=True, exist_ok=True)

    lines = src.read_text(encoding="utf-8").splitlines()
    compact = compact_lines(lines)

    header = [
        "<!-- AUTO-GENERATED FILE: DO NOT EDIT DIRECTLY -->",
        f"<!-- Source: docs/{rel.as_posix()} -->",
        "",
    ]

    out.write_text("\n".join(header + compact).rstrip() + "\n", encoding="utf-8")


def write_index(files: list[Path]) -> None:
    index = OUT_ROOT / "README.md"
    index.parent.mkdir(parents=True, exist_ok=True)

    lines = [
        "# Compact Docs",
        "",
        "Use files in this folder as the default low-token context.",
        "If more detail is needed, jump to the mapped source file and grep specific sections.",
        "",
        "## Workflow",
        "",
        "1. Read `docs/compact/**` first.",
        "2. If a detail is missing, run grep on the source file shown in each compact doc header.",
        "3. Update canonical docs under `docs/` only.",
        "4. Regenerate compact files with: `python3 docs/build_compact_docs.py`.",
        "",
        "## File Map",
        "",
    ]

    for src in files:
        rel = src.relative_to(ROOT)
        compact_rel = Path("docs/compact") / rel
        lines.append(f"- `docs/{rel.as_posix()}` → `{compact_rel.as_posix()}`")

    lines.append("")
    index.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    files = source_files()
    for src in files:
        write_compact(src)
    write_index(files)
    print(f"Generated {len(files)} compact docs in {OUT_ROOT}")


if __name__ == "__main__":
    main()
