#!/usr/bin/env python3
"""
NingX-EnggTeam session brief — SessionStart hook.

Made by Nitin Sharma.

Prints the team roster and the 24-type index so the first turn of every
session already knows who exists and what can be built. Reads nothing from
the network, writes nothing to disk, exits 0 always.
"""

from __future__ import annotations

import sys

ROSTER = [
    ("web-architect", "routes, rendering strategy, UI type per page"),
    ("frontend-lead", "components, state, four list states"),
    ("backend-lead", "endpoints, validation, authorization, migrations"),
    ("ui-ux-director", "palette, type pairing, composition, anti-slop verdict"),
    ("design-system-engineer", "three-layer tokens, component library, dark mode"),
    ("motion-engineer", "durations, easings, scroll motion, reduced-motion path"),
    ("webgl-engineer", "WebGL/WebGPU, shaders, Three.js, XR, fallbacks"),
    ("accessibility-lead", "WCAG 2.2 AA, contrast, keyboard, focus"),
    ("performance-engineer", "LCP, CLS, INP, bundle budget"),
    ("qa-lead", "width ladder, four states, keyboard pass, verdict"),
    ("code-reviewer", "correctness, security, data integrity, craft"),
    ("seo-engineer", "semantics, metadata, structured data, crawlability"),
]

TYPES = [
    ("01", "terminal-cli", "ycombinator.com"),
    ("02", "wireframe", "balsamiq.com"),
    ("03", "brutalist-html", "berkshirehathaway.com"),
    ("04", "pure-flat", "mailchimp.com"),
    ("05", "swiss-grid", "aesop.com"),
    ("06", "editorial-typographic", "bloomberg.com"),
    ("07", "line-art-handdrawn", "notion.so"),
    ("08", "neobrutalism", "gumroad.com"),
    ("09", "card-masonry", "pinterest.com"),
    ("10", "bento-grid", "linear.app"),
    ("11", "material-elevated", "google.com"),
    ("12", "layered-dark", "vercel.com"),
    ("13", "aurora-mesh-gradient", "stripe.com"),
    ("14", "glassmorphism", "apple.com"),
    ("15", "neumorphism", "neumorphism.io"),
    ("16", "retro-y2k", "poolsuite.net"),
    ("17", "claymorphism", "pitch.com"),
    ("18", "skeuomorphism", "teenage.engineering"),
    ("19", "isometric", "icograms.com"),
    ("20", "parallax", "firewatchgame.com"),
    ("21", "scrollytelling-kinetic", "pudding.cool"),
    ("22", "embedded-3d", "spline.design"),
    ("23", "webgl-shader", "lusion.co"),
    ("24", "spatial-webxr", "bruno-simon.com"),
]


def main() -> int:
    out = [
        "",
        "NINGX-ENGGTEAM — bench is loaded.",
        "Made by Nitin Sharma",
        "",
        "TEAM",
    ]
    width = max(len(name) for name, _ in ROSTER)
    for name, job in ROSTER:
        out.append(f"  {name.ljust(width)}  {job}")

    out += ["", "UI TYPES — one structural per page, at most one surface"]
    for num, slug, ref in TYPES:
        out.append(f"  {num}  {slug.ljust(24)}  {ref}")

    out += [
        "",
        "BEFORE ANY BUILD",
        "  Name the UI type in a file comment. Two types maximum.",
        "  Palette: one accent, named by role, contrast measured.",
        "  Type: two families, four-step scale, body 15-18px, measure <= 75ch.",
        "  Space: 4px scale, section padding >= 64px.",
        "",
        "BEFORE SAYING DONE",
        "  anti-slop-review -> PASS",
        "  width ladder 320 / 768 / 1440 / 2560",
        "  keyboard pass, reduced-motion pass",
        "  numbers reported, not adjectives",
        "",
    ]
    sys.stdout.write("\n".join(out))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:
        sys.stderr.write(f"session-brief: {exc}\n")
        sys.exit(0)
