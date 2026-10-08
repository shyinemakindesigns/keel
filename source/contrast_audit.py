"""
WCAG 2.1 / 2.2 AA contrast audit for every text, control and border pairing
Keel uses, in both themes of the Mineral & Ember palette.

Run:  python3 source/contrast_audit.py
Writes source/contrast_audit.json (the case study's audit table is built from it)
and prints a table.

Thresholds:
  1.4.3  text      4.5:1 normal, 3:1 large (>= 24px, or >= 18.66px bold)
  1.4.11 non-text  3:1 for boundaries that identify a control, focus indicators,
                   and chart marks needed to understand the data
Decorative hairlines on raised surfaces are listed and marked "exempt": the
surface fill already separates the card, so the line doesn't identify it.
"""
import json
import os

THEMES = {
    "light": {
        "canvas": "#F6F3ED", "surface": "#E6E2D9", "surface-2": "#DCD7CC",
        "ink": "#252A28", "ink-2": "#656B66", "ink-2-on-surface": "#555B56",
        "accent": "#B94F36", "accent-hover": "#A4452F", "accent-pressed": "#8F3C29",
        "on-accent": "#FFFFFF", "accent-ink": "#9E412B",
        "positive": "#2E6A4E", "negative": "#9B2C3A", "warning": "#7D5300", "info": "#3B5A72",
        "disabled-bg": "#DCD7CC", "disabled-ink": "#555B56",
        "line-rgb": "#252A28", "control-a": 0.58, "hairline-a": 0.12, "rule-a": 0.18,
        "data": ["#252A28", "#4A504C", "#7A7F79", "#A6A9A2", "#C9C8BF"],
    },
    "dark": {
        "canvas": "#202725", "surface": "#2A322F", "surface-2": "#353E3A",
        "ink": "#F4F0E7", "ink-2": "#B3B6AE", "ink-2-on-surface": "#B3B6AE",
        "accent": "#E07F60", "accent-hover": "#E68D70", "accent-pressed": "#D9714F",
        "on-accent": "#202725", "accent-ink": "#E38A6C",
        "positive": "#7FC4A0", "negative": "#F09AA3", "warning": "#E2B45C", "info": "#9DBCD6",
        "disabled-bg": "#353E3A", "disabled-ink": "#B3B6AE",
        "line-rgb": "#F4F0E7", "control-a": 0.50, "hairline-a": 0.12, "rule-a": 0.16,
        "data": ["#F4F0E7", "#C9C8BF", "#9A9E97", "#6E746E", "#4D5550"],
    },
}


def lum(h):
    h = h.lstrip("#")
    out = []
    for i in (0, 2, 4):
        c = int(h[i:i + 2], 16) / 255
        out.append(c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4)
    r, g, b = out
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def ratio(a, b):
    la, lb = sorted([lum(a), lum(b)], reverse=True)
    return (la + 0.05) / (lb + 0.05)


def over(fg, alpha, bg):
    f = [int(fg[i:i + 2], 16) for i in (1, 3, 5)]
    b = [int(bg[i:i + 2], 16) for i in (1, 3, 5)]
    return "#" + "".join("%02X" % round(f[i] * alpha + b[i] * (1 - alpha)) for i in range(3))


rows = []


def check(theme, kind, fg_name, fg, bg_name, bg, need, use, exempt=False):
    r = ratio(fg, bg)
    rows.append({"theme": theme, "kind": kind, "fg": fg_name, "fgHex": fg, "bg": bg_name, "bgHex": bg,
                 "ratio": round(r, 2), "need": need, "pass": True if exempt else r >= need,
                 "exempt": exempt, "use": use})


for name, T in THEMES.items():
    C, S, S2 = T["canvas"], T["surface"], T["surface-2"]
    # text
    check(name, "text", "Ink", T["ink"], "canvas", C, 4.5, "Headings, body, balances")
    check(name, "text", "Ink", T["ink"], "surface", S, 4.5, "Text on panels and rows")
    check(name, "text", "Ink", T["ink"], "surface-2", S2, 4.5, "Chart labels in the water band")
    check(name, "text", "Secondary", T["ink-2"], "canvas", C, 4.5, "Supporting copy, metadata")
    check(name, "text", "Secondary on surface", T["ink-2-on-surface"], "surface", S, 4.5, "Metadata in rows and panels")
    check(name, "text", "Secondary on surface", T["ink-2-on-surface"], "surface-2", S2, 4.5, "Depth ticks in the water band")
    check(name, "text", "Accent text", T["accent-ink"], "canvas", C, 4.5, "Links, text-button underline color")
    check(name, "text", "Accent text", T["accent-ink"], "surface", S, 4.5, "Links on panels")
    check(name, "text", "Label", T["on-accent"], "accent", T["accent"], 4.5, "Primary button, selected chip")
    check(name, "text", "Label", T["on-accent"], "accent hover", T["accent-hover"], 4.5, "Primary button, hover")
    check(name, "text", "Label", T["on-accent"], "accent pressed", T["accent-pressed"], 4.5, "Primary button, pressed")
    check(name, "text", "Disabled label", T["disabled-ink"], "disabled", T["disabled-bg"], 4.5, "Disabled buttons stay readable")
    for s in ("positive", "negative", "warning", "info"):
        check(name, "text", s.capitalize(), T[s], "canvas", C, 4.5, s.capitalize() + " status text")
        check(name, "text", s.capitalize(), T[s], "surface", S, 4.5, s.capitalize() + " status text on panels")
    # non-text
    check(name, "control", "Control border", over(T["line-rgb"], T["control-a"], C), "canvas", C, 3.0, "Inputs, chips, switches")
    check(name, "control", "Control border", over(T["line-rgb"], T["control-a"], S), "surface", S, 3.0, "Inputs on panels")
    check(name, "control", "Accent fill", T["accent"], "canvas", C, 3.0, "Primary button and active tab marker")
    check(name, "control", "Focus ring", T["accent-ink"], "canvas", C, 3.0, "Keyboard focus")
    check(name, "control", "Focus ring", T["accent-ink"], "surface", S, 3.0, "Keyboard focus on panels")
    check(name, "control", "Switch thumb on", T["on-accent"], "accent", T["accent"], 3.0, "Switch, on state")
    check(name, "control", "Keel (chart mark)", T["ink"], "surface-2", S2, 3.0, "The reading: keel depth")
    check(name, "control", "Hull (chart mark)", T["accent"], "canvas", C, 3.0, "The reading: hull on the waterline")
    check(name, "control", "Data 1", T["data"][0], "canvas", C, 3.0, "Largest category share")
    check(name, "control", "Data 3", T["data"][2], "canvas", C, 3.0, "Mid category share")
    # decorative
    check(name, "decorative", "Hairline", over(T["line-rgb"], T["hairline-a"], S), "canvas", C, 3.0, "Card edges (fill already separates)", exempt=True)
    check(name, "decorative", "Row rule", over(T["line-rgb"], T["rule-a"], S), "surface", S, 3.0, "Row dividers inside lists", exempt=True)
    check(name, "decorative", "Data 4", T["data"][3], "canvas", C, 3.0, "Small category share; same text equivalent as Data 5", exempt=True)
    check(name, "decorative", "Data 5", T["data"][4], "canvas", C, 3.0, "Smallest category share; labeled with name and percent in a chip", exempt=True)

if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(here, "contrast_audit.json"), "w") as f:
        json.dump(rows, f, indent=1)
    fails = [r for r in rows if not r["pass"]]
    for r in rows:
        flag = "exempt" if r["exempt"] else ("PASS" if r["pass"] else "FAIL")
        print(f"{r['theme']:<6}{r['kind']:<11}{r['fg']:<22}on {r['bg']:<15}{r['ratio']:>6.2f}:1  need {r['need']:<4} {flag:<7}{r['use']}")
    print(f"\n{len(rows)} pairings, {len(fails)} failing")
