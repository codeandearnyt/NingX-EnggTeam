#!/usr/bin/env python3
"""
NingX-EnggTeam ui-guard — PreToolUse gate on Edit / Write / MultiEdit.

Made by Nitin Sharma.

Reads the Claude Code hook payload from stdin, extracts the content that is
about to land on disk, and blocks it if it violates one of the ten
non-negotiables from AGENTS.md.

Exit 0  -> allow
Exit 2  -> block, with the reason on stderr (Claude Code surfaces it)

Every check is scoped to file types where the rule can actually apply, so a
README edit is never blocked for lacking a prefers-reduced-motion block.
"""

from __future__ import annotations

import json
import os
import re
import sys
from typing import Any

# ---------------------------------------------------------------- file classes

CODE_EXT = {
    ".tsx", ".jsx", ".ts", ".js", ".mjs", ".cjs",
    ".vue", ".svelte", ".astro",
    ".html", ".htm",
    ".css", ".scss", ".sass", ".less",
    ".py", ".rb", ".php", ".go", ".rs",
}

MARKUP_EXT = {".html", ".htm", ".tsx", ".jsx", ".vue", ".svelte", ".astro", ".php"}
STYLE_EXT = {".css", ".scss", ".sass", ".less"}
SCRIPT_EXT = {".tsx", ".jsx", ".ts", ".js", ".mjs", ".cjs", ".vue", ".svelte"}

# Files exempt from the token/hex rule — the token source itself.
TOKEN_FILES = ("tokens.css", "tokens.scss", "tokens.less", "tokens.ts", "tokens.js")

SKIP_DIRS = (
    "node_modules", "dist", "build", ".next", ".nuxt", ".output",
    "vendor", "coverage", ".git", ".cache",
)

# ------------------------------------------------------------------- patterns

BANNED_COPY = re.compile(
    r"\b("
    r"elevate your|unlock your|seamless(ly)? integrat|empower(ing)? your|"
    r"revolutioni[sz]|game[- ]chang|cutting[- ]edge|next[- ]generation|"
    r"state[- ]of[- ]the[- ]art|best[- ]in[- ]class|world[- ]class|"
    r"future of \w+|reimagin(e|ing) (the )?\w+|supercharg|effortless"
    r")\b",
    re.IGNORECASE,
)

PLACEHOLDER = re.compile(
    r"lorem ipsum|"
    r"\bTODO\b|\bFIXME\b|\bXXX\b|"
    r"coming soon|"
    r"Company Name|Your headline here|"
    r"placeholder text",
    re.IGNORECASE,
)

HREF_HASH = re.compile(r"""href\s*=\s*["']#["']""")
TRANSITION_ALL = re.compile(r"transition\s*:\s*all\b", re.IGNORECASE)
OUTLINE_NONE = re.compile(r"outline\s*:\s*(none|0)\b", re.IGNORECASE)
HEX_COLOR = re.compile(r"(?<![\w-])#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})(?![\w-])")

IMG_TAG = re.compile(r"<img\b[^>]*>", re.IGNORECASE)
INPUT_TAG = re.compile(r"<(input|textarea|select)\b[^>]*>", re.IGNORECASE)
DIV_ONCLICK = re.compile(r"<div\b[^>]*\bonclick\s*=", re.IGNORECASE)
ANIMATION = re.compile(r"(@keyframes|animation\s*:|\.animate\(|requestAnimationFrame)", re.IGNORECASE)
REDUCED_MOTION = re.compile(r"prefers-reduced-motion", re.IGNORECASE)
UI_TYPE_COMMENT = re.compile(r"ui-type\s*:\s*(\d{2})", re.IGNORECASE)

DANGEROUS_HTML = re.compile(r"dangerouslySetInnerHTML|\bv-html\s*=|\.innerHTML\s*=")
SANITIZER = re.compile(r"DOMPurify|sanitize|escapeHtml|xss\(", re.IGNORECASE)
EVAL_CALL = re.compile(r"(?<![\w.])eval\s*\(|document\.write\s*\(|new Function\s*\(")

SECRET = re.compile(
    r"(sk_live_[0-9a-zA-Z]{16,}|"
    r"sk-[A-Za-z0-9]{32,}|"
    r"AKIA[0-9A-Z]{16}|"
    r"ghp_[A-Za-z0-9]{30,}|"
    r"github_pat_[A-Za-z0-9_]{30,}|"
    r"xox[baprs]-[A-Za-z0-9-]{10,}|"
    r"-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----)"
)

# --------------------------------------------------------------- file helpers


def is_skipped(path: str) -> bool:
    parts = re.split(r"[\\/]", path.lower())
    return any(part in SKIP_DIRS for part in parts)


def is_token_file(path: str) -> bool:
    name = os.path.basename(path).lower()
    return name in TOKEN_FILES or name.startswith("tokens.")


def ext_of(path: str) -> str:
    return os.path.splitext(path)[1].lower()


# --------------------------------------------------------------- hook payload


def read_payload() -> dict[str, Any]:
    raw = sys.stdin.read()
    if not raw.strip():
        return {}
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return {}
    return data if isinstance(data, dict) else {}


def extract(payload: dict[str, Any]) -> tuple[str, str]:
    """Return (path, content) from a Claude Code PreToolUse payload."""
    tool_input = payload.get("tool_input") or {}
    if not isinstance(tool_input, dict):
        return "", ""

    path = (
        tool_input.get("file_path")
        or tool_input.get("path")
        or tool_input.get("filePath")
        or ""
    )
    if not isinstance(path, str):
        path = ""

    # Write uses `content`. Edit uses old_string/new_string; MultiEdit uses edits[].
    if isinstance(tool_input.get("content"), str):
        return path, tool_input["content"]

    if isinstance(tool_input.get("new_string"), str):
        return path, tool_input["new_string"]

    edits = tool_input.get("edits")
    if isinstance(edits, list):
        joined = "\n".join(
            e.get("new_string", "")
            for e in edits
            if isinstance(e, dict) and isinstance(e.get("new_string"), str)
        )
        return path, joined

    return path, ""


# -------------------------------------------------------------------- checks


class Violation:
    def __init__(self, code: str, message: str, hint: str) -> None:
        self.code = code
        self.message = message
        self.hint = hint

    def render(self) -> str:
        return f"  [{self.code}] {self.message}\n        fix: {self.hint}"


def check_ui_type(content: str) -> list[Violation]:
    """Rule R2 — at most two ui-type declarations per file."""
    found = UI_TYPE_COMMENT.findall(content)
    if len(found) > 2:
        return [
            Violation(
                "UI-01",
                f"{len(found)} ui-type declarations in one file ({', '.join(found)}). "
                "Two is the maximum: one structural, one surface.",
                "Delete the extras. Three types on one page is mush — pick a "
                "structural type and at most one surface type. See DESIGN-LAW.md.",
            )
        ]
    return []


def check_hex(path: str, content: str) -> list[Violation]:
    """Rule R4 — no hex literals outside the token file."""
    if is_token_file(path):
        return []
    hits: list[str] = []
    for line in content.splitlines():
        stripped = line.strip()
        # skip comments and svg fill/stroke attributes in inline svg
        if stripped.startswith(("//", "/*", "*", "<!--", "#")):
            continue
        for match in HEX_COLOR.finditer(line):
            value = match.group(0)
            # allow 3/4/6/8 hex only — already constrained by the regex.
            # ignore url fragments and anchors like #main
            after = line[match.end():match.end() + 1]
            if after and after.isalpha():
                continue
            hits.append(value)
    if not hits:
        return []
    sample = ", ".join(sorted(set(hits))[:6])
    return [
        Violation(
            "UI-04",
            f"hex color literal(s) in a component: {sample}",
            "Move the value into tokens.css as a named token and reference it "
            "with var(--token). Hex is allowed only in the token layer.",
        )
    ]


def check_transition(content: str) -> list[Violation]:
    if not TRANSITION_ALL.search(content):
        return []
    return [
        Violation(
            "PERF-01",
            "`transition: all` animates layout properties and janks the page.",
            "Name the properties: `transition: transform 140ms, opacity 140ms`.",
        )
    ]


def check_outline(content: str) -> list[Violation]:
    if not OUTLINE_NONE.search(content):
        return []
    # a replacement is any :focus / :focus-visible / box-shadow / outline rule nearby
    if re.search(r":focus(-visible)?\s*\{[^}]*?(box-shadow|outline\s*:\s*[^n])", content, re.IGNORECASE | re.DOTALL):
        return []
    return [
        Violation(
            "A11Y-02",
            "`outline: none` with no replacement focus style.",
            "Add `:focus-visible { outline: 2px solid var(--focus-ring); "
            "outline-offset: 2px; }` or remove the outline rule.",
        )
    ]


def check_img_alt(content: str) -> list[Violation]:
    bad = [tag for tag in IMG_TAG.findall(content) if not re.search(r"\balt\s*=", tag, re.IGNORECASE)]
    if not bad:
        return []
    return [
        Violation(
            "A11Y-07",
            f"{len(bad)} <img> without an alt attribute.",
            'Decorative images get alt="" — informative images get a description '
            "of what they convey. Never alt=\"image\".",
        )
    ]


def check_input_label(content: str) -> list[Violation]:
    bad: list[str] = []
    for tag in INPUT_TAG.findall(content):
        if re.search(r"\baria-label(ledby)?\s*=", tag, re.IGNORECASE):
            continue
        if re.search(r'\btype\s*=\s*["\'](hidden|submit|button|reset)["\']', tag, re.IGNORECASE):
            continue
        if re.search(r"\bid\s*=", tag, re.IGNORECASE) and re.search(
            r"<label\b[^>]*\bfor\s*=", content, re.IGNORECASE
        ):
            continue
        if re.search(r"<label\b[^>]*>[\s\S]{0,200}?" + re.escape(tag[:40]), content):
            continue
        bad.append(tag[:60])
    if not bad:
        return []
    return [
        Violation(
            "A11Y-05",
            f"{len(bad)} form control(s) with no associated label.",
            "Add <label for=\"id\">, or aria-label on the control. A placeholder "
            "is not a label.",
        )
    ]


def check_div_onclick(content: str) -> list[Violation]:
    if not DIV_ONCLICK.search(content):
        return []
    return [
        Violation(
            "A11Y-03",
            "<div onclick> is not keyboard reachable and announces nothing.",
            "Use <button type=\"button\">. If it navigates, use <a href>.",
        )
    ]


def check_reduced_motion(content: str) -> list[Violation]:
    if not ANIMATION.search(content):
        return []
    if REDUCED_MOTION.search(content):
        return []
    return [
        Violation(
            "A11Y-08",
            "animation present with no prefers-reduced-motion path in this file.",
            "Add `@media (prefers-reduced-motion: reduce) { *,*::before,*::after "
            "{ animation-duration:.01ms !important; transition-duration:.01ms "
            "!important; } }` and check the media query in any JS animation.",
        )
    ]


def check_copy(content: str) -> list[Violation]:
    hits = sorted({m.group(0).lower() for m in BANNED_COPY.finditer(content)})
    if not hits:
        return []
    return [
        Violation(
            "SLOP-01",
            f"banned marketing copy: {', '.join(hits[:5])}",
            "Replace with a specific: a number, a duration, a concrete action, "
            "or a named user. See rules/anti-slop.md for the swap table.",
        )
    ]


def check_placeholder(content: str) -> list[Violation]:
    hits = sorted({m.group(0).lower() for m in PLACEHOLDER.finditer(content)})
    if not hits:
        return []
    return [
        Violation(
            "SLOP-02",
            f"placeholder content left in the file: {', '.join(hits[:5])}",
            "Fill it in or delete it. There is no 'later'.",
        )
    ]


def check_href_hash(content: str) -> list[Violation]:
    n = len(HREF_HASH.findall(content))
    if n == 0:
        return []
    return [
        Violation(
            "SLOP-03",
            f"{n} href=\"#\" link(s).",
            "Point at a real route, or use <button> if it performs an action.",
        )
    ]


def check_dangerous_html(content: str) -> list[Violation]:
    if not DANGEROUS_HTML.search(content):
        return []
    if SANITIZER.search(content):
        return []
    return [
        Violation(
            "SEC-02",
            "unsafe HTML rendering with no sanitizer.",
            "Wrap the value in DOMPurify.sanitize(...), or render it as text. "
            "Never inject a user string into innerHTML / v-html / dangerouslySetInnerHTML.",
        )
    ]


def check_eval(content: str) -> list[Violation]:
    if not EVAL_CALL.search(content):
        return []
    return [
        Violation(
            "SEC-03",
            "eval / new Function / document.write in a source file.",
            "Parse the data instead of executing it. If this is genuinely "
            "required, it belongs in a sandboxed worker with a written reason.",
        )
    ]


def check_secrets(content: str) -> list[Violation]:
    m = SECRET.search(content)
    if not m:
        return []
    kind = m.group(1)[:8] if m.group(1) else "credential"
    return [
        Violation(
            "SEC-06",
            f"hardcoded credential pattern ({kind}…).",
            "Read it from env at runtime and validate at boot. Rotate the key "
            "if it was ever real. Never commit a secret.",
        )
    ]


# --------------------------------------------------------------------- driver


def run_checks(path: str, content: str) -> list[Violation]:
    if not content:
        return []
    if is_skipped(path):
        return []

    ext = ext_of(path)
    out: list[Violation] = []

    # universal — placeholders and secrets are wrong in any shipped source file
    if ext in CODE_EXT:
        out += check_placeholder(content)
        out += check_secrets(content)

    if ext in MARKUP_EXT or ext in STYLE_EXT:
        out += check_copy(content)
        out += check_href_hash(content)

    if ext in MARKUP_EXT:
        out += check_img_alt(content)
        out += check_input_label(content)
        out += check_div_onclick(content)
        out += check_ui_type(content)

    if ext in STYLE_EXT:
        out += check_transition(content)
        out += check_outline(content)
        out += check_hex(path, content)
        out += check_reduced_motion(content)

    if ext in SCRIPT_EXT:
        out += check_dangerous_html(content)
        out += check_eval(content)
        out += check_reduced_motion(content)

    return out


def main() -> int:
    payload = read_payload()
    if not payload:
        return 0

    path, content = extract(payload)
    if not content:
        return 0

    violations = run_checks(path, content)
    if not violations:
        return 0

    name = os.path.basename(path) or "the file"
    lines = [
        "",
        f"NINGX-ENGGTEAM UI-GUARD — blocked write to {name}",
        f"{len(violations)} violation(s) of the non-negotiables:",
        "",
    ]
    lines += [v.render() for v in violations]
    lines += [
        "",
        "These are not style opinions. They are the ten non-negotiables from",
        "AGENTS.md. Fix them and write again.",
        "",
    ]
    sys.stderr.write("\n".join(lines))
    return 2


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:  # never break a session on a guard bug
        sys.stderr.write(f"ui-guard: internal error, allowing write: {exc}\n")
        sys.exit(0)
