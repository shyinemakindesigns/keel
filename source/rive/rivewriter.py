"""A minimal writer for Rive runtime files (.riv, format 7).

Keel's four state machines are authored in code with this, the same way the
Lottie files are authored as JSON (source/lottie/kit.py). It writes only the
object types Keel uses: artboards, nodes, shapes (rectangle, ellipse, points
path), fills, strokes, trim paths, cubic interpolators, linear animations,
and state machines with number/bool/trigger inputs, animation states,
1D blend states and transitions with conditions.

Type and property keys come from the Rive runtime's generated headers
(rive-app/rive-runtime, include/rive/generated/*_base.hpp). The binary layout:
"RIVE", varuint major, minor, file id, an empty property table of contents,
then a flat list of objects. Each object is a varuint type key followed by
(varuint property key, value) pairs and a 0 terminator. Values: varuint for
uint and ids, float32 for doubles, uint32 ARGB for colors, one byte for bools,
length-prefixed UTF-8 for strings. Inside an artboard, parentId and every
other component reference is the index in that artboard's object list
(artboard = 0). Animation ids and state ids are indices within their own
lists. Every file this writes is checked by loading it in the Rive web
runtime (source/rive/rive-check.html).
"""
import struct

# ---------------------------------------------------------------- keys
T = dict(Backboard=23, Artboard=1, Node=2, Shape=3, Ellipse=4, Rectangle=7,
         PointsPath=16, StraightVertex=5, Fill=20, Stroke=24, SolidColor=18,
         TrimPath=47, CubicEase=28, LinearAnimation=31, KeyedObject=25,
         KeyedProperty=26, KeyFrameDouble=30, KeyFrameColor=37,
         StateMachine=53, SMNumber=56, SMBool=59, SMTrigger=58, SMLayer=57,
         AnyState=62, EntryState=63, ExitState=64, AnimationState=61,
         StateTransition=65, CondNumber=70, CondBool=71, CondTrigger=68,
         BlendState1D=76, BlendAnimation1D=75)

# property name -> (key, field type)
P = dict(
    name=(4, 's'), parentId=(5, 'u'),
    width=(7, 'd'), height=(8, 'd'), clip=(196, 'b'),
    originX=(11, 'd'), originY=(12, 'd'),
    x=(13, 'd'), y=(14, 'd'), rotation=(15, 'd'), scaleX=(16, 'd'), scaleY=(17, 'd'),
    opacity=(18, 'd'),
    pwidth=(20, 'd'), pheight=(21, 'd'), poriginX=(123, 'd'), poriginY=(124, 'd'),
    cornerRadiusTL=(31, 'd'), cornerRadiusTR=(161, 'd'), cornerRadiusBL=(162, 'd'),
    cornerRadiusBR=(163, 'd'), linkCornerRadius=(164, 'b'),
    vx=(24, 'd'), vy=(25, 'd'), radius=(26, 'd'), isClosed=(32, 'b'),
    fillRule=(40, 'u'), isVisible=(41, 'b'),
    thickness=(47, 'd'), cap=(48, 'u'), join=(49, 'u'),
    colorValue=(37, 'c'),
    trimStart=(114, 'd'), trimEnd=(115, 'd'), trimOffset=(116, 'd'), trimMode=(117, 'u'),
    x1=(63, 'd'), y1=(64, 'd'), x2=(65, 'd'), y2=(66, 'd'),
    animName=(55, 's'), fps=(56, 'u'), duration=(57, 'u'), speed=(58, 'd'), loopValue=(59, 'u'),
    objectId=(51, 'u'), propertyKey=(53, 'u'),
    frame=(67, 'u'), interpolationType=(68, 'u'), interpolatorId=(69, 'u'),
    kfValue=(70, 'd'), kfColor=(88, 'c'),
    smName=(138, 's'), numValue=(140, 'd'), boolValue=(141, 'b'),
    animationId=(149, 'u'), stateToId=(151, 'u'), flags=(152, 'u'),
    tDuration=(158, 'u'), exitTime=(160, 'u'),
    tInterpType=(349, 'u'), tInterpId=(350, 'u'),
    inputId=(155, 'u'), opValue=(156, 'u'), condValue=(157, 'd'),
    blendAnimId=(165, 'u'), blendValue=(166, 'd'), blendInputId=(167, 'u'),
)

# animatable property keys, for KeyedProperty
K = dict(x=13, y=14, rotation=15, scaleX=16, scaleY=17, opacity=18,
         pwidth=20, pheight=21, vx=24, vy=25, color=37,
         trimStart=114, trimEnd=115)

OP = dict(eq=0, ne=1, le=2, ge=3, lt=4, gt=5)
LOOP = dict(oneShot=0, loop=1, pingPong=2)

# StateTransitionFlags
F_EXIT_TIME = 1 << 2
F_EXIT_PCT = 1 << 3


def varuint(n):
    out = bytearray()
    while True:
        b = n & 0x7F
        n >>= 7
        if n:
            out.append(b | 0x80)
        else:
            out.append(b)
            return bytes(out)


def argb(hex_color, alpha=1.0):
    h = hex_color.lstrip('#')
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    return (round(alpha * 255) << 24) | (r << 16) | (g << 8) | b


def encode(type_name, props):
    out = bytearray(varuint(T[type_name]))
    for name, value in props:
        if value is None:
            continue
        key, ft = P[name]
        out += varuint(key)
        if ft == 'u':
            out += varuint(int(value))
        elif ft == 'd':
            out += struct.pack('<f', float(value))
        elif ft == 'c':
            out += struct.pack('<I', value)
        elif ft == 'b':
            out += bytes([1 if value else 0])
        elif ft == 's':
            s = value.encode('utf-8')
            out += varuint(len(s)) + s
    out += varuint(0)
    return bytes(out)


# ---------------------------------------------------------------- artboard
class Artboard:
    """Components are appended in order; the returned index is what other
    components (and keyed objects) use to refer to them. In the Rive runtime
    earlier drawables draw on top, so add foreground shapes first."""

    def __init__(self, name, width, height):
        self.name, self.width, self.height = name, width, height
        self.objs = []          # (type, props)
        self.anims = []         # Animation
        self.machines = []      # StateMachine
        self.interp = {}        # (x1,y1,x2,y2) -> index

    def _add(self, t, props):
        self.objs.append((t, props))
        return len(self.objs)   # artboard itself is index 0

    def node(self, parent=0, x=0, y=0, name=None, opacity=None):
        return self._add('Node', [('name', name), ('parentId', parent), ('x', x), ('y', y), ('opacity', opacity)])

    def shape(self, parent=0, x=0, y=0, name=None, opacity=None):
        return self._add('Shape', [('name', name), ('parentId', parent), ('x', x), ('y', y), ('opacity', opacity)])

    def rect(self, shape, w, h, r=0, x=0, y=0, origin=(0.5, 0.5), name=None):
        return self._add('Rectangle', [('name', name), ('parentId', shape), ('x', x), ('y', y),
                                       ('pwidth', w), ('pheight', h),
                                       ('poriginX', origin[0]), ('poriginY', origin[1]),
                                       ('linkCornerRadius', True), ('cornerRadiusTL', r)])

    def ellipse(self, shape, w, h, x=0, y=0, name=None):
        return self._add('Ellipse', [('name', name), ('parentId', shape), ('x', x), ('y', y),
                                     ('pwidth', w), ('pheight', h)])

    def poly(self, shape, pts, closed=True, name=None):
        """Straight-edged path; returns (path index, [vertex indices])."""
        p = self._add('PointsPath', [('name', name), ('parentId', shape), ('isClosed', closed)])
        vs = [self._add('StraightVertex', [('parentId', p), ('vx', x), ('vy', y)]) for x, y in pts]
        return p, vs

    def fill(self, shape, color):
        f = self._add('Fill', [('parentId', shape)])
        c = self._add('SolidColor', [('parentId', f), ('colorValue', color)])
        return f, c

    def stroke(self, shape, color, width, cap=0, join=0):
        s = self._add('Stroke', [('parentId', shape), ('thickness', width), ('cap', cap), ('join', join)])
        c = self._add('SolidColor', [('parentId', s), ('colorValue', color)])
        return s, c

    def trim(self, stroke, start=0, end=1, mode=1):
        return self._add('TrimPath', [('parentId', stroke), ('trimStart', start), ('trimEnd', end), ('trimMode', mode)])

    def ease(self, curve):
        curve = tuple(curve)
        if curve not in self.interp:
            self.interp[curve] = self._add('CubicEase', [('x1', curve[0]), ('y1', curve[1]), ('x2', curve[2]), ('y2', curve[3])])
        return self.interp[curve]

    def animation(self, name, frames=60, loop='oneShot', fps=60):
        a = Animation(self, name, frames, loop, fps)
        self.anims.append(a)
        return a

    def anim_index(self, a):
        return self.anims.index(a)

    def machine(self, name):
        m = StateMachine(self, name)
        self.machines.append(m)
        return m

    def encode(self):
        # resolve interpolators before writing (keyframes may add some)
        for a in self.anims:
            a.resolve()
        for m in self.machines:
            m.resolve()
        out = bytearray(encode('Artboard', [('name', self.name), ('width', self.width), ('height', self.height),
                                           ('clip', True), ('originX', 0), ('originY', 0)]))
        for t, props in self.objs:
            out += encode(t, props)
        for a in self.anims:
            out += a.encode()
        for m in self.machines:
            out += m.encode()
        return bytes(out)


# ---------------------------------------------------------------- animation
class Animation:
    def __init__(self, ab, name, frames, loop, fps):
        self.ab, self.name, self.frames, self.loop, self.fps = ab, name, frames, loop, fps
        self.tracks = {}   # obj -> {prop: [(frame, value, ease)]}

    def key(self, obj, prop, frames):
        """frames: [(frame, value)] or [(frame, value, ease)] where ease is a
        cubic tuple, 'linear' or 'hold'. The ease on a keyframe governs the
        segment that ends at it (Rive semantics: the interpolator of the
        earlier keyframe shapes the curve to the next)."""
        self.tracks.setdefault(obj, {})[prop] = frames
        return self

    def resolve(self):
        self._ids = {}
        for obj, props in self.tracks.items():
            for prop, kfs in props.items():
                for f in kfs:
                    e = f[2] if len(f) > 2 else 'linear'
                    if isinstance(e, tuple):
                        self.ab.ease(e)

    def encode(self):
        out = bytearray(encode('LinearAnimation', [('animName', self.name), ('fps', self.fps),
                                                   ('duration', self.frames), ('loopValue', LOOP[self.loop])]))
        for obj, props in self.tracks.items():
            out += encode('KeyedObject', [('objectId', obj)])
            for prop, kfs in props.items():
                out += encode('KeyedProperty', [('propertyKey', K[prop])])
                for f in kfs:
                    frame, value = f[0], f[1]
                    e = f[2] if len(f) > 2 else 'linear'
                    if e == 'hold':
                        it, iid = 0, None
                    elif e == 'linear':
                        it, iid = 1, None
                    else:
                        it, iid = 2, self.ab.interp[tuple(e)]
                    if prop == 'color':
                        out += encode('KeyFrameColor', [('frame', frame), ('interpolationType', it),
                                                        ('interpolatorId', iid), ('kfColor', value)])
                    else:
                        out += encode('KeyFrameDouble', [('frame', frame), ('interpolationType', it),
                                                         ('interpolatorId', iid), ('kfValue', value)])
        return bytes(out)


# ---------------------------------------------------------------- state machine
class StateMachine:
    def __init__(self, ab, name):
        self.ab, self.name = ab, name
        self.inputs = []   # (type, name, value)
        self.layers = []

    def number(self, name, value=0.0):
        self.inputs.append(('SMNumber', name, value))
        return len(self.inputs) - 1

    def boolean(self, name, value=False):
        self.inputs.append(('SMBool', name, value))
        return len(self.inputs) - 1

    def trigger(self, name):
        self.inputs.append(('SMTrigger', name, None))
        return len(self.inputs) - 1

    def layer(self, name):
        l = Layer(self.ab, name)
        self.layers.append(l)
        return l

    def resolve(self):
        for l in self.layers:
            for s in l.states:
                for t in s['transitions']:
                    if t.get('ease'):
                        self.ab.ease(t['ease'])

    def encode(self):
        out = bytearray(encode('StateMachine', [('animName', self.name)]))
        for t, n, v in self.inputs:
            props = [('smName', n)]
            if t == 'SMNumber':
                props.append(('numValue', v))
            elif t == 'SMBool':
                props.append(('boolValue', v))
            out += encode(t, props)
        for l in self.layers:
            out += l.encode()
        return bytes(out)


class Layer:
    """States are indexed in insertion order. Any, Entry and Exit are created
    first (0, 1, 2)."""

    def __init__(self, ab, name):
        self.ab, self.name = ab, name
        self.states = []
        self.any = self._state('AnyState')
        self.entry = self._state('EntryState')
        self.exit = self._state('ExitState')

    def _state(self, t, **kw):
        self.states.append(dict(type=t, transitions=[], **kw))
        return len(self.states) - 1

    def anim_state(self, anim):
        return self._state('AnimationState', anim=anim)

    def blend1d(self, input_id, pairs):
        """pairs: [(animation, value)]."""
        return self._state('BlendState1D', input=input_id, pairs=pairs)

    def go(self, frm, to, conds=(), duration=0, ease=None, exit_pct=None):
        """conds: [('num', input, op, value) | ('bool', input, True/False) | ('trig', input)]"""
        self.states[frm]['transitions'].append(dict(to=to, conds=list(conds), duration=duration,
                                                    ease=tuple(ease) if ease else None, exit_pct=exit_pct))

    def encode(self):
        out = bytearray(encode('SMLayer', [('smName', self.name)]))
        for s in self.states:
            if s['type'] == 'AnimationState':
                out += encode('AnimationState', [('animationId', self.ab.anim_index(s['anim']))])
            elif s['type'] == 'BlendState1D':
                out += encode('BlendState1D', [('blendInputId', s['input'])])
                for a, v in s['pairs']:
                    out += encode('BlendAnimation1D', [('blendAnimId', self.ab.anim_index(a)), ('blendValue', v)])
            else:
                out += encode(s['type'], [])
            for t in s['transitions']:
                flags = 0
                props = [('stateToId', t['to'])]
                if t['exit_pct'] is not None:
                    flags |= F_EXIT_TIME | F_EXIT_PCT
                    props.append(('exitTime', t['exit_pct']))
                props.append(('flags', flags))
                if t['duration']:
                    props.append(('tDuration', t['duration']))
                if t['ease']:
                    props += [('tInterpType', 2), ('tInterpId', self.ab.interp[t['ease']])]
                out += encode('StateTransition', props)
                for c in t['conds']:
                    if c[0] == 'num':
                        out += encode('CondNumber', [('inputId', c[1]), ('opValue', OP[c[2]]), ('condValue', c[3])])
                    elif c[0] == 'bool':
                        out += encode('CondBool', [('inputId', c[1]), ('opValue', 0 if c[2] else 1)])
                    elif c[0] == 'trig':
                        out += encode('CondTrigger', [('inputId', c[1])])
        return bytes(out)


def write(path, artboards, file_id=0):
    out = bytearray(b'RIVE')
    out += varuint(7) + varuint(0) + varuint(file_id)
    out += varuint(0)                      # empty property table of contents
    out += encode('Backboard', [])
    for ab in artboards:
        out += ab.encode()
    with open(path, 'wb') as f:
        f.write(out)
    return len(out)
