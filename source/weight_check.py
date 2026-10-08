"""
60/30/10 check, measured from real screenshots rather than token names.

Every pixel is assigned to the nearest palette role:
  canvas  : #F6F1EA
  surface : #EAE1D4, #DED3C3, #E3DACD (the stone family, incl. water and wells)
  accent  : #E2603D, #E66B4A (hover), #A3381A (text-safe accent)
  ink     : everything darker (type, icons, keel, chart marks)
Ink is reported separately because it is content, not a color field; the
60/30/10 split is computed over the three field roles.

usage: python weight_check.py shot1.png shot2.png ...   (needs Pillow)
"""
import sys
from PIL import Image

ROLES = {
    "canvas": ["#F6F1EA"],
    "surface": ["#EAE1D4", "#DED3C3", "#E3DACD"],
    "accent": ["#E2603D", "#E66B4A", "#A3381A"],
    "ink": ["#241A13", "#5C4D41", "#6A5B4E", "#8E7E70", "#B5A797"],
}
REF = [(role, tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))) for role, hs in ROLES.items() for h in hs]


def nearest(px):
    best, bd = None, 1e9
    for role, c in REF:
        d = (px[0] - c[0]) ** 2 + (px[1] - c[1]) ** 2 + (px[2] - c[2]) ** 2
        if d < bd:
            best, bd = role, d
    return best


for f in sys.argv[1:]:
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
