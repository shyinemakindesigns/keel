"""
60/30/10 check, measured from real screenshots rather than token names.

Every pixel is assigned to the nearest palette role:
  canvas  : Porcelain Clay (dark: Basalt)
  surface : Mineral Stone family, incl. water and wells (dark: raised and deep basalt)
  accent  : Oxidized Ember and its hover and text variants
  ink     : type, icons, keel, chart marks
Ink is reported separately because it is content, not a color field; the
60/30/10 split is computed over the three field roles.

usage: python weight_check.py [--dark] shot1.png shot2.png ...   (needs Pillow)
"""
import sys
from PIL import Image

THEMES = {
    "light": {
        "canvas": ["#F6F3ED"],
        "surface": ["#E6E2D9", "#DCD7CC", "#DFDBD2"],
        "accent": ["#B94F36", "#A4452F", "#9E412B"],
        "ink": ["#252A28", "#656B66", "#555B56", "#4A504C", "#7A7F79", "#A6A9A2", "#FFFFFF"],
    },
    "dark": {
        "canvas": ["#202725"],
        "surface": ["#2A322F", "#353E3A", "#2F3734"],
        "accent": ["#E07F60", "#E38A6C", "#E68D70"],
        "ink": ["#F4F0E7", "#B3B6AE", "#C9C8BF", "#9A9E97", "#6E746E"],
    },
}
THEME = "dark" if "--dark" in sys.argv else "light"
ROLES = THEMES[THEME]
REF = [(role, tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))) for role, hs in ROLES.items() for h in hs]


def nearest(px):
    best, bd = None, 1e9
    for role, c in REF:
        d = (px[0] - c[0]) ** 2 + (px[1] - c[1]) ** 2 + (px[2] - c[2]) ** 2
        if d < bd:
            best, bd = role, d
    return best


for f in [a for a in sys.argv[1:] if not a.startswith("--")]:
    im = Image.open(f).convert("RGB")
    im = im.resize((im.width // 2, im.height // 2))
    counts = {r: 0 for r in ROLES}
    cache = {}
    for n, px in im.getcolors(im.width * im.height):
        r = cache.get(px) or nearest(px)
        cache[px] = r
        counts[r] += n
    field = counts["canvas"] + counts["surface"] + counts["accent"]
    tot = sum(counts.values())
    print(f"{f.split('/')[-1]:<28} canvas {counts['canvas']/field*100:5.1f}%  surface {counts['surface']/field*100:5.1f}%  accent {counts['accent']/field*100:5.1f}%   (ink/content {counts['ink']/tot*100:4.1f}% of all pixels)")
