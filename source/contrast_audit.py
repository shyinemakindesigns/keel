"""
WCAG 2.1 contrast audit for every text/background and border pairing Keel uses.

Run:  python3 source/contrast_audit.py
Writes source/contrast_audit.json (read by the case study page) and prints a table.

Thresholds:
  1.4.3  text            4.5:1 normal, 3:1 large (>= 24px, or >= 18.66px bold)
  1.4.11 non-text        3:1 for boundaries needed to identify a control, and focus indicators
Decorative hairlines on raised surfaces are listed too, marked "exempt": the
surface fill already separates the card from the canvas, so the line is not
what identifies the component.
"""
import json
import os

T = {
    "canvas": "#F6F1EA", "surface": "#EAE1D4", "surface-2": "#DED3C3",
    "ink": "#241A13", "ink-2": "#5C4D41", "ink-3": "#6A5B4E",
    "accent": "#E2603D", "accent-ink": "#A3381A",
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


def over(rgb_hex, alpha, bg_hex):
    f = [int(rgb_hex[i:i + 2], 16) for i in (1, 3, 5)]
    b = [int(bg_hex[i:i + 2], 16) for i in (1, 3, 5)]
    return "#" + "".join("%02X" % round(f[i] * alpha + b[i] * (1 - alpha)) for i in range(3))


INK = T["ink"]
rows = []


def check(kind, fg, bg, need, use, exempt=False):
    fgh = T.get(fg, fg)
    bgh = T.get(bg, bg)
    r = ratio(fgh, bgh)
    rows.append({
        "kind": kind, "fg": fg, "bg": bg, "ratio": round(r, 2), "need": need,
        "pass": True if exempt else r >= need, "exempt": exempt, "use": use,
    })


# Text
for bg in ("canvas", "surface"):
    check("text", "ink", bg, 4.5, "Body, headings, amounts")
    check("text", "ink-2", bg, 4.5, "Secondary copy")
    check("text", "ink-3", bg, 4.5, "Captions, metadata")
    check("text", "accent-ink", bg, 4.5, "Links, text buttons")
check("text", "ink", "surface-2", 4.5, "Chart labels in the water band")
check("text", "ink-2", "surface-2", 4.5, "Depth ticks in the water band")
check("text", "ink", "accent", 4.5, "Label on primary buttons and selected chips")

# Non-text: controls and focus
for bg in ("canvas", "surface"):
    check("control", over(INK, 0.58, T[bg]), bg, 3.0, "Input, chip and switch boundary (ink at 58%) on " + bg)
check("control", "accent", "canvas", 3.0, "Primary button fill against canvas")
check("control", "accent-ink", "canvas", 3.0, "Focus ring")
check("control", "ink-2", "canvas", 3.0, "Switch thumb, off state")
check("control", "ink", "accent", 3.0, "Switch thumb, on state")

# Decorative hairlines (documented, exempt)
for a, name in ((0.12, "hairline 12%"), (0.18, "row rule 18%")):
    check("decorative", over(INK, a, T["surface"]), "canvas", 3.0, name + ": edge of a stone card on canvas", exempt=True)

if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(here, "contrast_audit.json"), "w") as f:
        json.dump(rows, f, indent=1)
    fails = [r for r in rows if not r["pass"]]
    for r in rows:
        flag = "exempt" if r["exempt"] else ("PASS" if r["pass"] else "FAIL")
        print(f"{r['kind']:<11}{r['fg']:<12}on {r['bg']:<10}{r['ratio']:>6.2f}:1  need {r['need']}  {flag:<7}{r['use']}")
    print(f"\n{len(rows)} pairings, {len(fails)} failing")
