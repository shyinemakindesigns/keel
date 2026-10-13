"""
60/30/10 check, measured from real screenshots rather than token names.

Every pixel is assigned to the nearest palette role (Harbor & Signal):
  canvas  : Fog White (dark: Abyss)
  surface : Paper, Cloud and the Mist water band (dark: Deep Navy and Night)
  accent  : Signal Lime, Ocean Blue and Harbor Blue
  ink     : type, icons, keel, chart marks, and navy fills
Ink is reported separately because it is content, not a color field; the
60/30/10 split is computed over the three field roles. Limitation: in light
mode the primary button is a navy fill, the same color as type, so it counts
as ink here, not accent; its lime label counts as accent.

usage: python weight_check.py [--dark] shot1.png shot2.png ...   (needs Pillow)
"""
import sys
from PIL import Image

THEMES = {
    "light": {
        "canvas": ["#F4F5FA"],
        "surface": ["#FFFFFF", "#E9EDF5", "#D4EAFF", "#E3E7F0"],
        "accent": ["#F1FF62", "#0192C6", "#004499"],
        "ink": ["#112358", "#4A5573", "#3D4E7A", "#6C7899", "#A3ACC4"],
    },
    "dark": {
        "canvas": ["#0B1530"],
        "surface": ["#112358", "#1A2E66", "#1F3470"],
        "accent": ["#F1FF62", "#3DB8EA"],
        "ink": ["#F4F5FA", "#AEB9D6", "#B9C3DD", "#8391B8", "#56658F"],
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
