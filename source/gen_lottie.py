"""
Keel: hand-authored Lottie (Bodymovin) animation.

Writes ../assets/lottie/keel-settle.json (light) and keel-settle-dark.json (dark)

There is no After Effects + Bodymovin export path in the environment this was
built in, so the file is keyframed directly against the Lottie schema. This
script is the source of truth for the JSON; edit here and re-run, never edit
the JSON by hand.

The scene: a small boat on a waterline, drawn as a cutaway so the keel and
its ballast bulb are visible below the water. The boat starts heeled over,
rocks with decaying amplitude, and settles level, then holds. It plays once
and stays still on its last frame, because the point of the illustration is
the stillness at the end, not the rocking.

Palette: exactly three colors per theme, all from the Mineral & Ember tokens.
  light: Volcanic Ink #252A28, Oxidized Ember #B94F36, deep Mineral #DCD7CC
  dark:  Chalk #F4F0E7, lifted Ember #E07F60, deep Basalt #353E3A
Lottie colors are baked into the file, so each theme gets its own JSON with
identical keyframes and timing; the page swaps files when the theme changes.
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(HERE, "..", "assets", "lottie")
THEMES = {
    "keel-settle.json":      ("#252A28", "#B94F36", "#DCD7CC"),
    "keel-settle-dark.json": ("#F4F0E7", "#E07F60", "#353E3A"),
}

W, H = 480, 320
FPS = 60
END = 300          # 5s total; motion is finished by ~3.6s, the rest is held stillness
PIVOT = (240, 198) # rotation pivot sits just above the waterline, roughly the
                   # center of buoyancy, so the hull swings and the keel
                   # swings opposite, like a real righting moment


def rgb(hexstr):
    h = hexstr.lstrip("#")
    return [round(int(h[i:i + 2], 16) / 255, 4) for i in (0, 2, 4)] + [1]



# Pendulum-like ease: slow out of each extreme, slow into the next.
SWING_OUT = {"x": [0.45], "y": [0]}
SWING_IN = {"x": [0.55], "y": [1]}


def static(v):
    return {"a": 0, "k": v}


def animated(frames, dims):
    """frames: list of (t, value). value is a number or list. Every segment
    uses the swing ease. Each keyframe carries both s and e so older
    lottie-web builds interpolate correctly."""
    ks = []
    for i, (t, v) in enumerate(frames):
        val = v if isinstance(v, list) else [v]
        k = {"t": t, "s": val}
        if i < len(frames) - 1:
            nv = frames[i + 1][1]
            k["e"] = nv if isinstance(nv, list) else [nv]
            k["o"] = {"x": SWING_OUT["x"] * dims, "y": SWING_OUT["y"] * dims}
            k["i"] = {"x": SWING_IN["x"] * dims, "y": SWING_IN["y"] * dims}
        ks.append(k)
    return {"a": 1, "k": ks}


def tr(p=(0, 0), a=(0, 0), s=(100, 100), r=0, o=100):
    return {
        "ty": "tr",
        "p": p if isinstance(p, dict) else static(list(p)),
        "a": a if isinstance(a, dict) else static(list(a)),
        "s": s if isinstance(s, dict) else static(list(s)),
        "r": r if isinstance(r, dict) else static(r),
        "o": o if isinstance(o, dict) else static(o),
        "sk": static(0),
        "sa": static(0),
    }


def path(v, i=None, o=None, closed=True):
    z = [[0, 0] for _ in v]
    return {"ty": "sh", "ks": static({"v": v, "i": i or z, "o": o or z, "c": closed})}


def ellipse(center, size):
    return {"ty": "el", "p": static(list(center)), "s": static(list(size)), "d": 1}


def fill(c, opacity=100):
    return {"ty": "fl", "c": static(c), "o": static(opacity), "r": 1}


def stroke(c, w, opacity=100):
    if isinstance(opacity, dict):
        o = opacity
    else:
        o = static(opacity)
    return {"ty": "st", "c": static(c), "o": o, "w": static(w), "lc": 2, "lj": 2}


def trim(start, end):
    return {
        "ty": "tm",
        "s": start if isinstance(start, dict) else static(start),
        "e": end if isinstance(end, dict) else static(end),
        "o": static(0),
        "m": 1,
    }


def group(name, items):
    return {"ty": "gr", "nm": name, "it": items + [tr()]}


def layer(name, ind, shapes, ks=None):
    return {
        "ddd": 0, "ind": ind, "ty": 4, "nm": name, "sr": 1,
        "ks": ks or {
            "o": static(100), "r": static(0), "p": static([0, 0, 0]),
            "a": static([0, 0, 0]), "s": static([100, 100, 100]),
        },
        "ao": 0, "shapes": shapes, "ip": 0, "op": END, "st": 0, "bm": 0,
    }


# ---------------------------------------------------------------- the motion
# Heel angle (degrees) at each extreme. Each swing loses ~38% of its
# amplitude and takes slightly less time, which is what damping looks like.
ROCK = [(0, -9.0), (44, 5.6), (84, -3.4), (120, 2.0), (152, -1.1),
        (180, 0.5), (204, -0.15), (222, 0)]
# A small vertical bob, in phase with the roll, decaying to rest.
BOB = [(0, 5), (44, -2.5), (84, 1.6), (120, -0.9), (152, 0.5), (180, 0)]


def bob_kfs():
    return [(t, [PIVOT[0], PIVOT[1] + dy, 0]) for t, dy in BOB]


def build(INK, ACCENT, STONE):
    boat_ks = {
        "o": static(100),
        "r": animated(ROCK, 1),
        "p": animated(bob_kfs(), 3),
        "a": static([PIVOT[0], PIVOT[1], 0]),
        "s": static([125, 125, 100]),
    }

    hull = group("Hull", [
        path(
            v=[[178, 181], [302, 181], [272, 207], [208, 207]],
            i=[[2, 12], [0, 0], [12, 0], [0, 0]],
            o=[[0, 0], [-2, 12], [0, 0], [-12, 0]],
        ),
        fill(ACCENT),
    ])

    keel_fin = group("Keel fin", [
        path(v=[[233, 205], [247, 205], [244, 240], [236, 240]]),
        fill(INK),
    ])

    ballast = group("Ballast bulb", [ellipse((240, 244), (30, 13)), fill(INK)])

    mast = group("Mast", [
        path(v=[[240, 186], [240, 98]], closed=False),
        stroke(INK, 3),
    ])

    sail = group("Sail", [
        path(v=[[247, 106], [247, 177], [298, 177]]),
        fill(STONE),
        stroke(INK, 2.5),
    ])

    pennant = group("Pennant", [
        path(v=[[241, 99], [258, 103.5], [241, 108]]),
        fill(ACCENT),
    ])

    # Shapes later in the list render underneath earlier ones.
    boat = layer("Boat", 2, [pennant, sail, mast, hull, keel_fin, ballast], boat_ks)

    # ---------------------------------------------------------------- the water
    waterline = layer("Waterline", 1, [group("Line", [
        path(v=[[0, 198], [480, 198]], closed=False),
        stroke(INK, 2),
    ])])


    def ripple(name, ind, y, x0, x1, t0):
        """A short stroke that draws outward and fades as the boat pushes water.
        Later ripples are shorter and fainter."""
        draw = animated([(t0, 0), (t0 + 36, 100)], 1)
        fade = animated([(t0 + 10, 0), (t0 + 24, 55), (t0 + 64, 0)], 1)
        return layer(name, ind, [group(name, [
            path(v=[[x0, y], [x1, y]], closed=False),
            trim(0, draw),
            stroke(INK, 2, fade),
        ])])


    ripples = [
        ripple("Ripple L1", 3, 212, 196, 132, 2),
        ripple("Ripple R1", 4, 212, 284, 348, 2),
        ripple("Ripple L2", 5, 224, 204, 160, 46),
        ripple("Ripple R2", 6, 224, 276, 320, 46),
        ripple("Ripple L3", 7, 212, 200, 176, 90),
        ripple("Ripple R3", 8, 212, 280, 304, 90),
    ]

    water = layer("Water", 20, [group("Water body", [
        path(v=[[0, 198], [480, 198], [480, 320], [0, 320]]),
        fill(STONE),
    ])])

    # Lottie draws layer[0] on top. The boat sits in front of the waterline so
    # the line passes behind the hull instead of slicing through it.
    anim = {
        "v": "5.12.2", "fr": FPS, "ip": 0, "op": END, "w": W, "h": H,
        "nm": "keel-settle", "ddd": 0, "assets": [],
        "layers": [boat, waterline] + ripples + [water],
    }

    return anim


os.makedirs(OUT_DIR, exist_ok=True)
for name, (ink, accent, stone) in THEMES.items():
    anim = build(rgb(ink), rgb(accent), rgb(stone))
    out = os.path.join(OUT_DIR, name)
    with open(out, "w") as f:
        json.dump(anim, f, separators=(",", ":"))
    print("wrote", os.path.normpath(out), os.path.getsize(out), "bytes")
