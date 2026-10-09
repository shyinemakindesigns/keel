"""
Recolors a CC BY community Rive file into Keel's Mineral & Ember palette.

Original: "Toggle switch" by ashishb, Rive Community, published 23 June 2022,
https://rive.app/community/files/2795-5761-toggle-switch
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/).
Changes made (as the license asks us to indicate): colors only. The glossy
gradients are flattened to single Keel colors, the dark artboard background is
made transparent, and a light and a dark variant are written. Geometry,
animations ("On", "Off") and the state machine ("Switch", trigger "Pressed")
are untouched.

How the offsets were found: every color in a .riv is a uint32 ARGB written
right after its property key (37 solid color, 38 gradient stop, 88 color
keyframe). Each candidate below was confirmed by recoloring it and rendering
(see the commit that added this file). The script refuses to write if any
offset doesn't hold the expected original value.

    python3 source/rive/recolor_toggle.py
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'original', '2795-5761-toggle-switch.riv')
OUT = os.path.join(HERE, '..', '..', 'assets', 'rive')

# offset of the property key byte -> (original ARGB, role)
SLOTS = {
    230: (0xFF0B3951, 'knob gradient stop 1'),
    239: (0xFF1FADDD, 'knob gradient stop 2'),
    253: (0xFF1993BC, 'knob outline'),
    322: (0xFFACACAC, 'track gradient top (static, off)'),
    331: (0xFFFFFFFF, 'track outline (static, off)'),
    340: (0xFF424242, 'artboard background'),
    # "Off" animation: on value -> off value
    604: (0xFF101010, 'track outline, off anim start'), 615: (0xFFFFFFFF, 'track outline, off anim end'),
    634: (0xFF131313, 'track top, off anim start'),     645: (0xFFACACAC, 'track top, off anim end'),
    664: (0xFF2B2B2B, 'track bottom, off anim start'),  675: (0xFFFFFFFF, 'track bottom, off anim end'),
    # "On" animation: off value -> on value
    862: (0xFFFFFFFF, 'track outline, on anim start'),  873: (0xFF101010, 'track outline, on anim end'),
    892: (0xFFACACAC, 'track top, on anim start'),      903: (0xFF131313, 'track top, on anim end'),
    922: (0xFFFFFFFF, 'track bottom, on anim start'),   933: (0xFF2B2B2B, 'track bottom, on anim end'),
}

THEMES = {
    'keel-toggle.riv': {
        'knob': 0xFFFFFFFF, 'knob_line': 0xFF656B66,
        'off_fill': 0xFFE6E2D9, 'off_line': 0xFF7A7F79,   # control boundary, 3.69:1 on canvas
        'on_fill': 0xFFB94F36, 'on_line': 0xFF8F3C29,     # white knob on ember: 4.96:1
        'bg': 0x00F6F3ED,
    },
    'keel-toggle-dark.riv': {
        'knob': 0xFFF4F0E7, 'knob_line': 0xFF202725,
        'off_fill': 0xFF2A322F, 'off_line': 0xFF8A8C86,
        'on_fill': 0xFFE07F60, 'on_line': 0xFFB9634A,
        'bg': 0x00202725,
    },
}


def plan(t):
    return {
        230: t['knob'], 239: t['knob'], 253: t['knob_line'],
        322: t['off_fill'], 331: t['off_line'], 340: t['bg'],
        604: t['on_line'], 615: t['off_line'], 634: t['on_fill'], 645: t['off_fill'], 664: t['on_fill'], 675: t['off_fill'],
        862: t['off_line'], 873: t['on_line'], 892: t['off_fill'], 903: t['on_fill'], 922: t['off_fill'], 933: t['on_fill'],
    }


def main():
    src = open(SRC, 'rb').read()
    assert src[:4] == b'RIVE'
    for off, (orig, role) in SLOTS.items():
        got = int.from_bytes(src[off + 1:off + 5], 'little')
        assert got == orig, 'offset %d (%s): expected %08X, found %08X' % (off, role, orig, got)
    os.makedirs(OUT, exist_ok=True)
    for name, t in THEMES.items():
        b = bytearray(src)
        for off, argb in plan(t).items():
            b[off + 1:off + 5] = argb.to_bytes(4, 'little')
        open(os.path.join(OUT, name), 'wb').write(b)
        print('wrote', name, len(b), 'bytes')


if __name__ == '__main__':
    main()
