"""
WCAG 2.1 / 2.2 AA contrast audit for every text, control and border pairing
Keel uses, in both themes of the Harbor & Signal palette, including the glass
buttons (their translucent fill is composited over each surface before measuring).

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
        "canvas": "#F4F5FA", "surface": "#FFFFFF", "surface-2": "#E9EDF5", "water": "#D4EAFF",
        "ink": "#112358", "ink-2": "#4A5573", "ink-2-on-surface": "#4A5573",
        "accent": "#112358", "accent-hover": "#1E3576", "accent-pressed": "#0A1638",
        "on-accent": "#F1FF62", "accent-ink": "#004499", "focus": "#004499",
        "hull": "#F1FF62", "hull-edge": "#112358", "highlight": "#0192C6",
        "positive": "#0B7350", "negative": "#B42342", "warning": "#8A5600", "info": "#0A6A99",
        "disabled-bg": "#E9EDF5", "disabled-ink": "#4A5573",
        "line-rgb": "#112358", "control-a": 0.62, "hairline-a": 0.10, "rule-a": 0.14,
        "data": ["#112358", "#3D4E7A", "#6C7899", "#A3ACC4", "#CDD3E2"],
        "glass-primary": ("#112358", 0.86, "#F1FF62"), "glass-secondary": ("#FFFFFF", 0.62, "#112358"),
        "glass-edge": ("#112358", 0.58),
    },
    "dark": {
        "canvas": "#0B1530", "surface": "#112358", "surface-2": "#1A2E66", "water": "#1A2E66",
        "ink": "#F4F5FA", "ink-2": "#AEB9D6", "ink-2-on-surface": "#AEB9D6",
        "accent": "#F1FF62", "accent-hover": "#F5FF8C", "accent-pressed": "#E3F24A",
        "on-accent": "#112358", "accent-ink": "#F1FF62", "focus": "#F1FF62",
        "hull": "#F1FF62", "hull-edge": "#F1FF62", "highlight": "#3DB8EA",
        "positive": "#5ED3A0", "negative": "#FF8FA3", "warning": "#FFC857", "info": "#7CC8F2",
        "disabled-bg": "#1A2E66", "disabled-ink": "#AEB9D6",
        "line-rgb": "#F4F5FA", "control-a": 0.50, "hairline-a": 0.10, "rule-a": 0.14,
        "data": ["#F4F5FA", "#B9C3DD", "#8391B8", "#56658F", "#34457A"],
        "glass-primary": ("#F1FF62", 0.92, "#112358"), "glass-secondary": ("#F4F5FA", 0.10, "#F4F5FA"),
        "glass-edge": ("#F4F5FA", 0.50),
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
    check(name, "text", "Ink", T["ink"], "surface-2", S2, 4.5, "Text in wells")
    check(name, "text", "Ink", T["ink"], "water", T["water"], 4.5, "Chart labels in the water band")
    check(name, "text", "Secondary", T["ink-2"], "canvas", C, 4.5, "Supporting copy, metadata")
    check(name, "text", "Secondary on surface", T["ink-2-on-surface"], "surface", S, 4.5, "Metadata in rows and panels")
    check(name, "text", "Secondary on surface", T["ink-2-on-surface"], "surface-2", S2, 4.5, "Metadata in wells")
    check(name, "text", "Secondary", T["ink-2"], "water", T["water"], 4.5, "Depth ticks in the water band")
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
    check(name, "control", "Focus ring", T["focus"], "canvas", C, 3.0, "Keyboard focus")
    check(name, "control", "Focus ring", T["focus"], "surface", S, 3.0, "Keyboard focus on panels")
    check(name, "control", "Switch thumb on", T["on-accent"], "accent", T["accent"], 3.0, "Switch, on state")
    check(name, "control", "Keel (chart mark)", T["ink"], "water", T["water"], 3.0, "The reading: keel depth")
    check(name, "control", "Hull edge (chart mark)", T["hull-edge"], "canvas", C, 3.0, "The reading: lime hull, outlined on light")
    check(name, "control", "Data highlight", T["highlight"], "canvas", C, 3.0, "Selected series: the plan line, the chosen category")
    check(name, "control", "Data highlight", T["highlight"], "surface", S, 3.0, "Selected series on cards")
    check(name, "control", "Data 1", T["data"][0], "canvas", C, 3.0, "Largest category share")
    check(name, "control", "Data 3", T["data"][2], "canvas", C, 3.0, "Mid category share")
    # glass buttons: the translucent fill composited over each surface, then the label measured on that
    gp, gs, ge = T["glass-primary"], T["glass-secondary"], T["glass-edge"]
    for bg_name, bg in (("canvas", C), ("surface", S), ("surface-2", S2)):
        check(name, "text", "Glass primary label", gp[2], "glass on " + bg_name, over(gp[0], gp[1], bg), 4.5, "Primary button, translucent")
        check(name, "text", "Glass secondary label", gs[2], "glass on " + bg_name, over(gs[0], gs[1], bg), 4.5, "Secondary button, translucent")
        check(name, "control", "Glass secondary edge", over(ge[0], ge[1], bg), bg_name, bg, 3.0, "Secondary button boundary")
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
