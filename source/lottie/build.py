"""
Builds every Keel Lottie animation in both themes.

    python3 source/lottie/build.py            # all
    python3 source/lottie/build.py equilibrium line

Output: assets/lottie/<name>.json and <name>-dark.json
Each builder takes a palette P (see kit.rgb_palette) and returns a kit.Anim.
The registry at the bottom is the single list of animations; the motion
gallery and docs describe them in assets/js/motion-registry.js.
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from kit import (Anim, keys, static, path, path_anim, rect, ellipse, fill, stroke,  # noqa: E402
                 radial_shadow, trim, tr, group, box, cylinder, write, rgb_palette, hex_rgba)

OUT = os.path.join(HERE, "..", "..", "assets", "lottie")


def shadow(P, cx, cy, w, h, alpha_scale=1.0, name="shadow"):
    """Soft contact shadow: a circular radial gradient squashed into an ellipse."""
    r = w / 2
    return group([ellipse((w, w), (cx, cy)), radial_shadow((cx, cy), r, P["shadow_hex"], P["shadow_a"] * alpha_scale)],
                 name, tr(p=(cx, cy), a=(cx, cy), s=(100, 100 * h / w)))


def sphere(P, cx, cy, r, name="sphere"):
    top, front, side = P["ember"]
    return [
        group([ellipse((r * 0.62, r * 0.42), (cx - r * 0.34, cy - r * 0.42)), fill(top, 85)], name + " light"),
        group([ellipse((r * 1.86, r * 1.86), (cx - r * 0.07, cy - r * 0.07)), fill(front)], name + " front"),
        group([ellipse((r * 2, r * 2), (cx, cy)), fill(side)], name + " shade"),
    ]


def half_disc(cx, base_y, r):
    k = 0.5523 * r
    return path([[cx - r, base_y], [cx, base_y - r], [cx + r, base_y]],
                i=[[0, 0], [-k, 0], [0, -k]], o=[[0, -k], [k, 0], [0, 0]], closed=True)


# =================================================================== 01
def equilibrium(P):
    """01 Hero Equilibrium. A balance object starts off level, the beam
    rocks with decaying swings while the right-hand mass slides to its
    balanced place, then the ember sphere lowers onto the pivot and the
    whole thing holds still. 4s, plays once, holds the last frame."""
    A = Anim("equilibrium", 640, 360, 240)
    root = A.null("Root", p=(0, -44))
    PIV = (331, 266)

    beam = A.null("Beam pivot", p=PIV, a=PIV, parent=root,
                  r=keys([(0, -6.5, "swing"), (48, 3.0, "swing"), (88, -1.3, "swing"), (122, 0.45, "swing"), (150, 0)]))

    # ember focal, lowered last onto the point of balance
    A.shape("Ember", sphere(P, 335, 223, 25), parent=beam,
            p=keys([(0, [0, -110], "hold"), (96, [0, -110], "settle"), (156, [0, 0])]),
            o=keys([(0, 0, "hold"), (96, 0, "settle"), (116, 100)]))
    A.shape("Ember contact", [shadow(P, 335, 248, 58, 11, 1.2)], parent=beam,
            o=keys([(0, 0, "hold"), (118, 0, "settle"), (156, 100)]),
            s=keys([(0, [40, 40], "hold"), (118, [40, 40], "settle"), (156, [100, 100])]),
            a=(335, 248), p=(335, 248))

    # right mass slides into its balanced position as the beam responds
    A.shape("Porcelain mass", cylinder(474, 248, 90, 56, P["porcelain"], "cyl"), parent=beam,
            p=keys([(0, [22, 0], "settle"), (110, [0, 0])]))
    A.shape("Porcelain contact", [shadow(P, 480, 249, 112, 13)], parent=beam,
            p=keys([(0, [22, 0], "settle"), (110, [0, 0])]))

    A.shape("Basalt mass", box(150, 182, 66, 66, (16, -10), P["basalt"], name="cube"), parent=beam)
    A.shape("Basalt contact", [shadow(P, 190, 249, 100, 13)], parent=beam)

    A.shape("Beam", box(105, 248, 452, 18, (16, -10), P["slate"], name="beam"), parent=beam)

    # fixed base: a basalt pivot (the keel, upside down), plinth, ground
    top, front, side = P["basalt"]
    A.shape("Pivot", [
        group([ellipse((18, 7), (321, 276)), fill(top)], "pivot light"),
        group([half_disc(331, 300, 34), fill(front)], "pivot"),
    ], parent=root)
    A.shape("Pivot contact", [shadow(P, 331, 300, 90, 12, 1.2)], parent=root)
    A.shape("Plinth", box(226, 300, 210, 44, (22, -14), P["mineral"], name="plinth"), parent=root)
    A.shape("Ground line", [group([path([[32, 344], [608, 344]], closed=False), stroke(P["line"], 1.5)])], parent=root)
    A.shape("Ground shadow", [shadow(P, 340, 346, 360, 26, 1.0)], parent=root)
    return A


REGISTRY = {
    "equilibrium": equilibrium,
}


def main(names):
    for name in names or REGISTRY:
        fn = REGISTRY[name]
        sizes = write({"light": fn(rgb_palette("light")), "dark": fn(rgb_palette("dark"))}, OUT, name)
        print(name, ", ".join(f"{k} {v / 1024:.1f} KB" for k, v in sizes.items()))


if __name__ == "__main__":
    main(sys.argv[1:])
