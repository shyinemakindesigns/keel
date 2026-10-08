"""
kit.py: a small builder for hand-authored Lottie (Bodymovin 5.x) JSON.

Every Keel animation is written against this module instead of being
exported from After Effects (no AE / Bodymovin export path exists in the
environment these were made in). It covers exactly what Keel uses:
shape layers, null layers for parenting, animated transforms, paths,
rects, ellipses, fills, strokes, radial gradient shadows, trim paths,
markers, and the motion tokens as named easings.

Conventions
  * 60 fps everywhere.
  * Coordinates are absolute comp pixels. A layer that rotates about a
    pivot uses anchor = position = pivot, so its shapes keep absolute
    coordinates at rest.
  * Colors come from a theme palette (PALETTES), so each animation is
    built twice, light and dark, with identical keyframes.
"""
import json
import math
import os

FPS = 60

# ------------------------------------------------------------------ easing
# cubic-bezier(x1, y1, x2, y2). Names match the motion tokens in tokens.css.
EASES = {
    "settle": (0.2, 0.7, 0.2, 1.0),    # --ease-settle: decelerate into rest
    "enter": (0.22, 1.0, 0.36, 1.0),   # strong deceleration for arrivals
    "lift": (0.4, 0.0, 0.6, 1.0),      # --ease-lift: symmetric
    "swing": (0.45, 0.0, 0.55, 1.0),   # pendulum between extremes
    "exit": (0.4, 0.0, 1.0, 1.0),      # accelerate away
    "linear": (0.0, 0.0, 1.0, 1.0),    # progress-mapped timelines only
}


def _ease(name, dims):
    x1, y1, x2, y2 = EASES[name]
    return {"x": [x1] * dims, "y": [y1] * dims}, {"x": [x2] * dims, "y": [y2] * dims}


def _arr(v):
    return list(v) if isinstance(v, (list, tuple)) else [v]


def static(v):
    return {"a": 0, "k": v}


def keys(frames, ease="settle"):
    """frames: [(t, value), ...] or [(t, value, ease_name), ...].
    The ease on a keyframe governs the segment that starts there.
    'hold' jumps at the next keyframe."""
    dims = len(_arr(frames[0][1]))
    out = []
    for i, f in enumerate(frames):
        t, v = f[0], f[1]
        e = f[2] if len(f) > 2 else ease
        k = {"t": t, "s": _arr(v)}
        if i < len(frames) - 1:
            if e == "hold":
                k["h"] = 1
            else:
                o, inn = _ease(e, dims)
                k["o"], k["i"] = o, inn
                k["e"] = _arr(frames[i + 1][1])
        out.append(k)
    return {"a": 1, "k": out}


def prop(v):
    """Accept a static value or an already-built animated prop."""
    return v if isinstance(v, dict) else static(v)


# ------------------------------------------------------------------ color
def hex_rgba(h, a=1.0):
    h = h.lstrip("#")
    return [round(int(h[i:i + 2], 16) / 255, 4) for i in (0, 2, 4)] + [a]


# ------------------------------------------------------------------ shapes
def path(v, i=None, o=None, closed=True):
    z = [[0, 0] for _ in v]
    return {"ty": "sh", "ks": static({"v": v, "i": i or z, "o": o or z, "c": closed})}


def path_anim(frames, closed=True, ease="settle"):
    """frames: [(t, vertices), ...] straight-segment paths morphing."""
    ks = []
    for n, f in enumerate(frames):
        t, v = f[0], f[1]
        e = f[2] if len(f) > 2 else ease
        z = [[0, 0] for _ in v]
        k = {"t": t, "s": [{"v": v, "i": z, "o": z, "c": closed}]}
        if n < len(frames) - 1:
            o, inn = _ease(e, 1)
            k["o"], k["i"] = o, inn
            nv = frames[n + 1][1]
            k["e"] = [{"v": nv, "i": [[0, 0] for _ in nv], "o": [[0, 0] for _ in nv], "c": closed}]
        ks.append(k)
    return {"ty": "sh", "ks": {"a": 1, "k": ks}}


def rect(size, pos=(0, 0), r=0):
    return {"ty": "rc", "s": prop(_arr(size)), "p": prop(_arr(pos)), "r": prop(r), "d": 1}


def ellipse(size, pos=(0, 0)):
    return {"ty": "el", "s": prop(_arr(size)), "p": prop(_arr(pos)), "d": 1}


def fill(color, opacity=100):
    return {"ty": "fl", "c": static(color) if isinstance(color, list) else color, "o": prop(opacity), "r": 1}


def stroke(color, width, opacity=100, cap=2, join=2, dash=None):
    s = {"ty": "st", "c": static(color), "o": prop(opacity), "w": prop(width), "lc": cap, "lj": join, "ml": 4}
    if dash:
        s["d"] = [{"n": "d", "nm": "dash", "v": static(dash[0])}, {"n": "g", "nm": "gap", "v": static(dash[1])},
                  {"n": "o", "nm": "offset", "v": static(0)}]
    return s


def radial_shadow(center, radius, color_hex, alpha):
    """A soft contact shadow: radial gradient from color at `alpha` to transparent.
    Lottie gradient fills carry color stops then opacity stops in one array."""
    r, g, b, _ = hex_rgba(color_hex)
    return {
        "ty": "gf", "t": 2, "o": static(100), "r": 1,
        "s": static(list(center)), "e": static([center[0] + radius, center[1]]),
        "h": static(0), "a": static(0),
        "g": {"p": 3, "k": static([0, r, g, b, 0.55, r, g, b, 1, r, g, b,
                                    0, alpha, 0.55, alpha * 0.45, 1, 0])},
    }


def trim(start=0, end=100, offset=0):
    return {"ty": "tm", "s": prop(start), "e": prop(end), "o": prop(offset), "m": 1}


def tr(p=(0, 0), a=(0, 0), s=(100, 100), r=0, o=100):
    return {"ty": "tr", "p": prop(_arr(p) if not isinstance(p, dict) else p),
            "a": prop(_arr(a) if not isinstance(a, dict) else a),
            "s": prop(_arr(s) if not isinstance(s, dict) else s),
            "r": prop(r), "o": prop(o), "sk": static(0), "sa": static(0)}


def group(items, name="g", transform=None):
    return {"ty": "gr", "nm": name, "it": list(items) + [transform or tr()]}


# ------------------------------------------------------------------ solids
def box(x, y, w, h, depth, faces, r=0, name="box"):
    """An oblique-projected block: front face, top face, right side face.
    depth = (dx, dy) offset of the back edge (dy negative = up).
    faces = (top, front, side) colors. Returns a list of groups, back to front
    in paint order handled by caller (top/side painted after front is fine
    because they don't overlap the front)."""
    dx, dy = depth
    top, front, side = faces
    return [
        group([path([[x, y], [x + w, y], [x + w + dx, y + dy], [x + dx, y + dy]]), fill(top)], name + " top"),
        group([path([[x + w, y], [x + w + dx, y + dy], [x + w + dx, y + h + dy], [x + w, y + h]]), fill(side)], name + " side"),
        group([rect((w, h), (x + w / 2, y + h / 2), r), fill(front)], name + " front"),
    ]


def cylinder(cx, base_y, w, h, faces, name="cyl"):
    """Upright cylinder seen slightly from above: body + top ellipse."""
    top, front, side = faces
    ry = w * 0.16
    # the bottom edge is drawn as a curve by giving the last segment tangents
    body = path(
        [[cx - w / 2, base_y - h], [cx + w / 2, base_y - h], [cx + w / 2, base_y], [cx, base_y + ry], [cx - w / 2, base_y]],
        i=[[0, 0], [0, 0], [0, 0], [w * 0.28, 0], [0, ry * 0.55]],
        o=[[0, 0], [0, 0], [0, ry * 0.55], [-w * 0.28, 0], [0, 0]],
    )
    shade = path([[cx + w * 0.18, base_y - h], [cx + w / 2, base_y - h], [cx + w / 2, base_y], [cx + w * 0.18, base_y + ry * 0.92]])
    return [
        group([ellipse((w, ry * 2), (cx, base_y - h)), fill(top)], name + " top"),
        group([shade, fill(side)], name + " shade"),
        group([body, fill(front)], name + " body"),
    ]


# ------------------------------------------------------------------ layers
class Anim:
    def __init__(self, name, w, h, op):
        self.name, self.w, self.h, self.op = name, w, h, op
        self.layers = []   # top-most first, like After Effects
        self.markers = []
        self._ind = 0

    def _next(self):
        self._ind += 1
        return self._ind

    def null(self, name, p=(0, 0), a=(0, 0), r=0, s=(100, 100), o=100, parent=None):
        ind = self._next()
        L = {"ddd": 0, "ind": ind, "ty": 3, "nm": name, "sr": 1,
             "ks": {"o": prop(o), "r": prop(r), "p": prop(_arr(p) if not isinstance(p, dict) else p),
                    "a": prop(_arr(a)), "s": prop(_arr(s) if not isinstance(s, dict) else s)},
             "ao": 0, "ip": 0, "op": self.op, "st": 0, "bm": 0}
        if parent:
            L["parent"] = parent
        self.layers.append(L)
        return ind

    def shape(self, name, shapes, p=(0, 0), a=(0, 0), r=0, s=(100, 100), o=100, parent=None, ip=0, op=None):
        ind = self._next()
        L = {"ddd": 0, "ind": ind, "ty": 4, "nm": name, "sr": 1,
             "ks": {"o": prop(o), "r": prop(r), "p": prop(_arr(p) if not isinstance(p, dict) else p),
                    "a": prop(_arr(a)), "s": prop(_arr(s) if not isinstance(s, dict) else s)},
             "ao": 0, "shapes": shapes, "ip": ip, "op": op or self.op, "st": 0, "bm": 0}
        if parent:
            L["parent"] = parent
        self.layers.append(L)
        return ind

    def marker(self, name, t, dur=0):
        self.markers.append({"tm": t, "cm": name, "dr": dur})

    def json(self):
        d = {"v": "5.12.2", "fr": FPS, "ip": 0, "op": self.op, "w": self.w, "h": self.h,
             "nm": self.name, "ddd": 0, "assets": [], "layers": self.layers}
        if self.markers:
            d["markers"] = self.markers
        return d


def write(anim_by_theme, out_dir, base):
    """anim_by_theme: {'light': Anim, 'dark': Anim}. Writes base.json and base-dark.json."""
    os.makedirs(out_dir, exist_ok=True)
    sizes = {}
    for theme, a in anim_by_theme.items():
        fn = base + (".json" if theme == "light" else "-dark.json")
        with open(os.path.join(out_dir, fn), "w") as f:
            json.dump(a.json(), f, separators=(",", ":"))
        sizes[fn] = os.path.getsize(os.path.join(out_dir, fn))
    return sizes


# ------------------------------------------------------------------ palettes
# Materials are three tones each (top light, front, side shade): the
# "3D-inspired" look is oblique projection plus flat shading, no gradients
# except soft contact shadows. Every tone is a step of a Mineral & Ember color.
PALETTES = {
    "light": {
        "bg": "#F6F3ED",
        "line": "#252A28",
        "line2": "#656B66",
        "ember": ("#C9664D", "#B94F36", "#8F3C29"),
        "porcelain": ("#FFFFFF", "#F1EDE5", "#DDD8CD"),
        "mineral": ("#EEEAE2", "#DCD7CC", "#C6C0B3"),
        "basalt": ("#4A5450", "#343C39", "#202725"),
        "slate": ("#8C928D", "#656B66", "#4C524E"),
        "shadow": "#252A28",
        "shadow_a": 0.16,
        "water": "#E6E2D9",
        "positive": "#2E6A4E",
    },
    "dark": {
        "bg": "#202725",
        "line": "#F4F0E7",
        "line2": "#B3B6AE",
        "ember": ("#EA9A80", "#E07F60", "#B9634A"),
        "porcelain": ("#F4F0E7", "#D9D4C8", "#B8B3A8"),
        "mineral": ("#56605B", "#454F4B", "#36403C"),
        "basalt": ("#2C3532", "#1A201E", "#121715"),
        "slate": ("#C3C6BF", "#9EA39B", "#7D827B"),
        "shadow": "#000000",
        "shadow_a": 0.42,
        "water": "#2A322F",
        "positive": "#7FC4A0",
    },
}


def rgb_palette(theme):
    """Same palette with colors converted to Lottie rgba lists."""
    P = {}
    for k, v in PALETTES[theme].items():
        if isinstance(v, tuple):
            P[k] = tuple(hex_rgba(c) for c in v)
        elif isinstance(v, str):
            P[k] = hex_rgba(v)
        else:
            P[k] = v
    P["shadow_hex"] = PALETTES[theme]["shadow"]
    return P


def deg(a):
    return a


def lerp(a, b, t):
    return a + (b - a) * t
