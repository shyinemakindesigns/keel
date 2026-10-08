"""
Rewrites hardcoded hex fills/strokes on SVG elements into token classes
(see the utility classes at the end of assets/tokens.css), so artwork follows
the theme. Used once for the Mineral & Ember migration; kept for reference.

usage: python3 source/svg_tokens.py file.html [file.html ...]
"""
import re
import sys

FILL = {"#241A13": "f-ink", "#E2603D": "f-hull", "#DED3C3": "f-water", "#5C4D41": "f-ink2s",
        "#EAE1D4": "f-surface", "#F6F1EA": "f-canvas", "#A3381A": "f-accent-ink", "#6A5B4E": "f-ink2s"}
STROKE = {"#241A13": "s-ink", "#5C4D41": "s-ink2s", "#A3381A": "s-accent-ink", "#E2603D": "s-hull", "#6A5B4E": "s-ink2s"}
TAG = re.compile(r"<(path|rect|ellipse|circle|text|g|line|polyline|polygon)\b([^<>]*?)(/?)>", re.S)


def fix(m):
    name, attrs, close = m.group(1), m.group(2), m.group(3)
    classes = []
    for attr, table in (("fill", FILL), ("stroke", STROKE)):
        a = re.search(r'\s%s="(#[0-9A-Fa-f]{6})"' % attr, attrs)
        if a and a.group(1).upper() in table:
            classes.append(table[a.group(1).upper()])
            attrs = attrs.replace(a.group(0), "")
    if not classes:
        return m.group(0)
    c = re.search(r'\sclass="([^"]*)"', attrs)
    if c:
        attrs = attrs.replace(c.group(0), ' class="%s %s"' % (c.group(1), " ".join(classes)))
    else:
        attrs = ' class="%s"' % " ".join(classes) + attrs
    return "<%s%s%s>" % (name, attrs, close)


for f in sys.argv[1:]:
    s = open(f).read()
    n = TAG.sub(fix, s)
    open(f, "w").write(n)
    print(f, "updated" if n != s else "unchanged")
