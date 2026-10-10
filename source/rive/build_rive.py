"""Authors Keel's four Rive state machines in code.

    python3 source/rive/build_rive.py

Writes assets/rive/{equilibrium,goal,onboarding,scenario}.riv. Each file has
two artboards, "light" and "dark", with identical geometry, animations and
state machines; only colors differ (Mineral & Ember, from assets/tokens.css
and the illustration palette in source/lottie/kit.py).

The contract is docs/motion-system/rive-spec.md. Where authoring changed the
spec, the spec was updated to match and says why.

Design notes that apply to all four:
  * Exact values come from 1D blend states. Each number input blends between
    two poses keyed at the ends of its range, and every keyed property is
    linear in the input, so the drawing is exact at any value, not an
    approximation. The host eases the input (the keel's spring, the goal's
    0.9s settle) the same way the web implementations already do.
  * Feedback that isn't a value (hasUpdated, contributed, applied) is a short
    one-shot on a separate layer, so it never fights the value.
  * Every timed transition has a twin guarded by reducedMotion that takes 0ms,
    and the one-shots don't play at all when reducedMotion is true.
  * No text is drawn in Rive. Labels live in the DOM.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from rivewriter import Artboard, argb, write  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'assets', 'rive')

# cubic-bezier easing, matching the motion tokens
SETTLE = (0.2, 0.7, 0.2, 1.0)
STANDARD = (0.4, 0.0, 0.2, 1.0)
ENTER = (0.22, 1.0, 0.36, 1.0)
SWING = (0.45, 0.0, 0.55, 1.0)

THEMES = {
    'light': dict(line='#252A28', line2='#555B56', hull='#B94F36', water='#DCD7CC', ballast='#252A28',
                  ember=('#C9664D', '#B94F36', '#8F3C29'), porcelain=('#FFFFFF', '#F1EDE5', '#DDD8CD'),
                  mineral=('#EEEAE2', '#DCD7CC', '#C6C0B3'), basalt=('#4A5450', '#343C39', '#202725'),
                  slate=('#8C928D', '#656B66', '#4C524E'), rule=('#252A28', 0.18)),
    'dark': dict(line='#F4F0E7', line2='#B3B6AE', hull='#E07F60', water='#353E3A', ballast='#9A9E97',
                 ember=('#EA9A80', '#E07F60', '#B9634A'), porcelain=('#F4F0E7', '#D9D4C8', '#B8B3A8'),
                 mineral=('#56605B', '#454F4B', '#36403C'), basalt=('#2C3532', '#1A201E', '#121715'),
                 slate=('#C3C6BF', '#9EA39B', '#7D827B'), rule=('#F4F0E7', 0.16)),
}


def c(hexv, a=1.0):
    return argb(hexv, a)


def cubic_pts(p0, p1, p2, p3, n=8):
    out = []
    for i in range(1, n + 1):
        t = i / n
        mt = 1 - t
        out.append((mt ** 3 * p0[0] + 3 * mt * mt * t * p1[0] + 3 * mt * t * t * p2[0] + t ** 3 * p3[0],
                    mt ** 3 * p0[1] + 3 * mt * mt * t * p1[1] + 3 * mt * t * t * p2[1] + t ** 3 * p3[1]))
    return out


def box(ab, parent, x, y, w, h, depth, colors, name):
    """Oblique box: front face plus top and side faces, like the Lottie kit.
    Returns the node index. Faces are added top, side, front so the front
    face draws over the seams."""
    dx, dy = depth
    top, front, side = colors
    n = ab.node(parent, name=name)
    s = ab.shape(n, name=name + ' front')
    ab.poly(s, [(x, y), (x + w, y), (x + w, y + h), (x, y + h)])
    ab.fill(s, c(front))
    s = ab.shape(n, name=name + ' top')
    ab.poly(s, [(x, y), (x + dx, y + dy), (x + w + dx, y + dy), (x + w, y)])
    ab.fill(s, c(top))
    s = ab.shape(n, name=name + ' side')
    ab.poly(s, [(x + w, y), (x + w + dx, y + dy), (x + w + dx, y + h + dy), (x + w, y + h)])
    ab.fill(s, c(side))
    return n


def reduced_pair(layer, frm, to, conds, red, duration, ease):
    """A transition and its reduced-motion twin. The 0ms twin is listed first
    so it wins when reducedMotion is true."""
    layer.go(frm, to, list(conds) + [('bool', red, True)], duration=0)
    layer.go(frm, to, list(conds) + [('bool', red, False)], duration=duration, ease=ease)


# =================================================================== 1
def equilibrium(theme):
    """Equilibrium Indicator. 680 x 312, the Steady screen's keel at 2x.
    The waterline is payday; the keel's depth is days of room past it."""
    P = THEMES[theme]
    ab = Artboard(theme, 680, 312)
    S = 2
    TOP, ZERO, PER = 38 * S, 40 * S, 7 * S
    KX = 120 * S

    def ky(days):
        return ZERO + days * PER

    # ---- boat (drawn on top; earlier drawables draw over later ones)
    boat = ab.node(0, name='Boat')
    settle = ab.node(boat, name='Settle')          # one-shot bob on hasUpdated
    hull = ab.shape(settle, name='Hull')
    pts = [(70, 16), (170, 16)] + cubic_pts((170, 16), (167.6, 28), (159.5, 40), (147, 40)) + \
        [(93, 40)] + cubic_pts((93, 40), (80.5, 40), (72.4, 28), (70, 16))[:-1]
    ab.poly(hull, [(x * S, y * S) for x, y in pts])
    ab.fill(hull, c(P['hull']))
    bulb = ab.shape(settle, x=KX, y=ky(0.4) + 2, name='Bulb')
    ab.ellipse(bulb, 26 * S, 11 * S)
    ab.fill(bulb, c(P['line']))
    fin = ab.shape(settle, name='Fin')
    _, fv = ab.poly(fin, [(KX - 10, TOP), (KX + 10, TOP), (KX + 6, ky(0.4)), (KX - 6, ky(0.4))])
    ab.fill(fin, c(P['line']))

    # ---- ghost: the depth before a purchase preview, drawn as an outline
    ghost = ab.node(0, name='Ghost', opacity=0)
    gbulb = ab.shape(ghost, x=KX, y=ky(0.4) + 2, name='Ghost bulb')
    ab.ellipse(gbulb, 26 * S, 11 * S)
    ab.stroke(gbulb, c(P['line2']), 2.5)
    gfin = ab.shape(ghost, name='Ghost fin')
    _, gv = ab.poly(gfin, [(KX - 10, TOP), (KX + 10, TOP), (KX + 6, ky(0.4)), (KX - 6, ky(0.4))])
    ab.stroke(gfin, c(P['line2']), 2.5, join=1)

    # ---- waterline, scale, water
    wl = ab.shape(0, name='Waterline')
    ab.poly(wl, [(0, 34 * S), (680, 34 * S)], closed=False)
    ab.stroke(wl, c(P['line']), 3)
    sc = ab.shape(0, name='Scale')
    ab.poly(sc, [(452, ky(0)), (452, ky(14))], closed=False)
    for d in (0, 3, 7, 14):
        ab.poly(sc, [(440, ky(d)), (452, ky(d))], closed=False)
    ab.stroke(sc, c(P['line2']), 2)
    water = ab.shape(0, name='Water')
    ab.rect(water, 680, 244, x=340, y=34 * S + 122)
    ab.fill(water, c(P['water']))

    # ---- animations
    def depth_pose(name, days, fin_v, bulb_s):
        a = ab.animation(name, frames=1)
        a.key(fin_v[2], 'vy', [(0, ky(days))]).key(fin_v[3], 'vy', [(0, ky(days))])
        a.key(bulb_s, 'y', [(0, ky(days) + 2)])
        return a
    d_min = depth_pose('depth-min', 0.4, fv, bulb)
    d_max = depth_pose('depth-max', 14, fv, bulb)
    g_min = depth_pose('ghost-min', 0.4, gv, gbulb)
    g_max = depth_pose('ghost-max', 14, gv, gbulb)
    g_hide = ab.animation('ghost-hidden', frames=1).key(ghost, 'opacity', [(0, 0)])
    g_show = ab.animation('ghost-shown', frames=1).key(ghost, 'opacity', [(0, 1)])
    still = ab.animation('still', frames=1).key(settle, 'y', [(0, 0)])
    # the boat takes the new weight: dips 6px, rises 2px past rest, settles (~900ms)
    bob = ab.animation('settle', frames=54).key(settle, 'y', [(0, 0, ENTER), (12, 6, SETTLE), (30, -2, SETTLE), (54, 0)])
    ready = ab.animation('ready', frames=1).key(boat, 'opacity', [(0, 1)])
    waiting = ab.animation('loading', frames=84, loop='loop').key(boat, 'opacity', [(0, 1, SWING), (42, 0.45, SWING), (84, 1)])
    waiting_still = ab.animation('loading-still', frames=1).key(boat, 'opacity', [(0, 0.5)])

    # ---- state machine
    m = ab.machine('Equilibrium')
    i_val = m.number('steadinessValue', 9)
    i_int = m.boolean('isInteracting')
    i_load = m.boolean('isLoading')
    i_upd = m.trigger('hasUpdated')
    i_red = m.boolean('reducedMotion')
    i_ghost = m.number('ghostValue', 9)

    L = m.layer('Depth')
    s = L.blend1d(i_val, [(d_min, 0.4), (d_max, 14)])
    L.go(L.entry, s)

    L = m.layer('Ghost depth')
    s = L.blend1d(i_ghost, [(g_min, 0.4), (g_max, 14)])
    L.go(L.entry, s)

    L = m.layer('Preview')
    h, sh = L.anim_state(g_hide), L.anim_state(g_show)
    L.go(L.entry, h)
    reduced_pair(L, h, sh, [('bool', i_int, True)], i_red, 200, STANDARD)
    reduced_pair(L, sh, h, [('bool', i_int, False)], i_red, 200, STANDARD)

    L = m.layer('Settle')
    st, b = L.anim_state(still), L.anim_state(bob)
    L.go(L.entry, st)
    L.go(st, b, [('trig', i_upd), ('bool', i_red, False)])
    L.go(b, st, exit_pct=100)

    L = m.layer('Loading')
    r, w, ws = L.anim_state(ready), L.anim_state(waiting), L.anim_state(waiting_still)
    L.go(L.entry, r)
    L.go(r, ws, [('bool', i_load, True), ('bool', i_red, True)])
    L.go(r, w, [('bool', i_load, True), ('bool', i_red, False)], duration=300, ease=STANDARD)
    reduced_pair(L, w, r, [('bool', i_load, False)], i_red, 300, STANDARD)
    L.go(ws, r, [('bool', i_load, False)])
    return ab


# =================================================================== 2
def goal(theme):
    """Interactive Savings Goal. 600 x 160. An ink ballast fills a mineral
    well; the ember block rides its leading edge. Complete: the block lowers
    into its seat and a capstone line closes the structure."""
    P = THEMES[theme]
    ab = Artboard(theme, 600, 160)
    X0, W, Y, H = 40, 500, 86, 34

    track = ab.node(0, x=X0, y=Y, name='Rider track')            # x = X0 + W * progress
    seat = ab.node(track, name='Rider seat')                 # completion offset
    lift = ab.node(seat, name='Rider bob')                   # contributed one-shot
    box(ab, lift, -14, -28, 28, 28, (8, -5), P['ember'], 'Rider')

    cap = ab.shape(0, name='Capstone')
    ab.poly(cap, [(X0, Y - 1), (X0 + W, Y - 1)], closed=False)
    cs, _ = ab.stroke(cap, c(P['line']), 2)
    trim = ab.trim(cs, 0, 0)

    fill_s = ab.shape(0, x=X0, y=Y + H / 2, name='Ballast')
    fill_r = ab.rect(fill_s, 0, H, origin=(0, 0.5))
    ab.fill(fill_s, c(P['basalt'][1]))
    box(ab, 0, X0, Y, W, H, (12, -8), P['mineral'], 'Well')

    p0 = ab.animation('progress-0', frames=1).key(track, 'x', [(0, X0)]).key(fill_r, 'pwidth', [(0, 0)])
    p1 = ab.animation('progress-1', frames=1).key(track, 'x', [(0, X0 + W)]).key(fill_r, 'pwidth', [(0, W)])
    open_ = ab.animation('incomplete', frames=1).key(seat, 'x', [(0, 0)]).key(seat, 'y', [(0, 0)]).key(trim, 'trimEnd', [(0, 0)])
    done = ab.animation('complete', frames=60) \
        .key(seat, 'x', [(0, 0, SETTLE), (32, -20)]).key(seat, 'y', [(0, 0, SETTLE), (32, 22)]) \
        .key(trim, 'trimEnd', [(0, 0, 'hold'), (14, 0, SETTLE), (58, 1)])
    done_now = ab.animation('complete-still', frames=1) \
        .key(seat, 'x', [(0, -20)]).key(seat, 'y', [(0, 22)]).key(trim, 'trimEnd', [(0, 1)])
    rest = ab.animation('rest', frames=1).key(lift, 'y', [(0, 0)])
    nudge = ab.animation('contributed', frames=54).key(lift, 'y', [(0, 0, ENTER), (12, 4, SETTLE), (30, -1.5, SETTLE), (54, 0)])

    m = ab.machine('Goal')
    i_p = m.number('progress', 0.38)
    i_done = m.boolean('isComplete')
    i_add = m.trigger('contributed')
    i_red = m.boolean('reducedMotion')

    L = m.layer('Progress')
    L.go(L.entry, L.blend1d(i_p, [(p0, 0), (p1, 1)]))

    L = m.layer('Completion')
    o, d, dn = L.anim_state(open_), L.anim_state(done), L.anim_state(done_now)
    L.go(L.entry, dn, [('bool', i_done, True)])
    L.go(L.entry, o)
    L.go(o, dn, [('bool', i_done, True), ('bool', i_red, True)])
    L.go(o, d, [('bool', i_done, True), ('bool', i_red, False)])
    L.go(d, o, [('bool', i_done, False)], duration=280, ease=STANDARD)
    L.go(dn, o, [('bool', i_done, False)])

    L = m.layer('Contributed')
    r, n = L.anim_state(rest), L.anim_state(nudge)
    L.go(L.entry, r)
    L.go(r, n, [('trig', i_add), ('bool', i_red, False)])
    L.go(n, r, exit_pct=100)
    return ab


# =================================================================== 3
def onboarding(theme):
    """Onboarding Equilibrium. 640 x 300. One balance object that gains a
    piece with each onboarding step. Steps are poses; moving between them is
    a 1s blend with the settle curve, so going back undoes exactly what going
    forward added."""
    P = THEMES[theme]
    ab = Artboard(theme, 640, 300)
    root = ab.node(0, y=-40, name='Root')
    PX, PY = 300, 266

    beam = ab.node(root, x=PX, y=PY, name='Beam pivot')
    ember = ab.node(beam, y=-100, opacity=0, name='Ember')
    e = ab.shape(ember, x=304 - PX, y=223 - PY, name='Ember sphere')
    ab.ellipse(e, 44, 44)
    ab.fill(e, c(P['ember'][1]))
    bills = []
    for n in range(3):
        b = ab.node(beam, y=-60, opacity=0, name='Bill %d' % n)
        box(ab, b, 420 - n * 4 - PX, 228 - n * 22 - PY, 70 - n * 8, 20, (12, -8), P['porcelain'], 'Bill %d' % n)
        bills.append(b)
    mass = ab.node(beam, y=-70, opacity=0, name='Mass')
    box(ab, mass, 140 - PX, 184 - PY, 62, 64, (14, -9), P['basalt'], 'Mass')
    box(ab, beam, 90 - PX, 248 - PY, 420, 16, (14, -9), P['slate'], 'Beam')

    piv = ab.shape(root, name='Pivot')
    import math
    ab.poly(piv, [(300 + 32 * math.cos(math.pi * (1 - i / 16)), 296 - 32 * math.sin(math.pi * (1 - i / 16))) for i in range(17)])
    ab.fill(piv, c(P['basalt'][1]))
    box(ab, root, 204, 296, 192, 40, (20, -12), P['mineral'], 'Plinth')

    post = ab.node(root, x=600, y=336, opacity=0, name='Payday post')
    ps = ab.shape(post, name='Post')
    ab.poly(ps, [(0, 0), (0, -36)], closed=False)
    ab.stroke(ps, c(P['line']), 2)
    pen = ab.shape(post, name='Pennant')
    ab.poly(pen, [(0, -36), (18, -30), (0, -24)])
    ab.fill(pen, c(P['ember'][1]))
    shore = ab.shape(root, name='Shore')
    ab.poly(shore, [(480, 336), (600, 336)], closed=False)
    ss, _ = ab.stroke(shore, c(P['line']), 1.5)
    shore_trim = ab.trim(ss, 0, 0)
    ground = ab.shape(root, name='Ground')
    ab.poly(ground, [(40, 336), (480, 336)], closed=False)
    ab.stroke(ground, c(P['line']), 1.5)

    deg = math.pi / 180

    def pose(name, rot, mass_in, bills_in, payday_in, ember_in):
        a = ab.animation(name, frames=1)
        a.key(beam, 'rotation', [(0, rot * deg)])
        a.key(mass, 'y', [(0, 0 if mass_in else -70)]).key(mass, 'opacity', [(0, 1 if mass_in else 0)])
        for b in bills:
            a.key(b, 'y', [(0, 0 if bills_in else -60)]).key(b, 'opacity', [(0, 1 if bills_in else 0)])
        a.key(shore_trim, 'trimEnd', [(0, 1 if payday_in else 0)])
        a.key(post, 'opacity', [(0, 1 if payday_in else 0)]).key(post, 'scaleY', [(0, 1 if payday_in else 0.01)])
        a.key(ember, 'y', [(0, 0 if ember_in else -100)]).key(ember, 'opacity', [(0, 1 if ember_in else 0)])
        return a

    poses = [pose('accounts', -7, True, False, False, False),
             pose('bills', 2.5, True, True, False, False),
             pose('payday', 0, True, True, True, False),
             pose('ready', 0, True, True, True, True)]

    m = ab.machine('Onboarding')
    i_step = m.number('step', 0)
    i_dir = m.number('direction', 1)   # accepted for the spec's interface; blends make reverse exact without it
    i_red = m.boolean('reducedMotion')
    L = m.layer('Steps')
    st = [L.anim_state(p) for p in poses]
    for k, s in enumerate(st):
        L.go(L.entry, s, [('num', i_step, 'eq', k)])
    for a, sa in enumerate(st):
        for b, sb in enumerate(st):
            if a != b:
                reduced_pair(L, sa, sb, [('num', i_step, 'eq', b)], i_red, 1000, SETTLE)
    _ = i_dir
    return ab


# =================================================================== 4
def scenario(theme):
    """Scenario Visualization. 680 x 420, the Plan screen's step chart at 2x,
    with the sample plan: $380 saved, $50 a paycheck, 13 paychecks every two
    weeks from Oct 16 (TODAY is Oct 8). Every step of the "with the change"
    line is saved + (50 + extra) * k, linear in extra, so a blend between
    extra = 0 and extra = 300 draws every value exactly. The axis is fixed at
    $0 to $6,000 so values stay comparable while the slider moves."""
    P = THEMES[theme]
    ab = Artboard(theme, 680, 420)
    S = 2
    X0, X1, YT, YB = 44 * S, 300 * S, 18 * S, 168 * S
    SAVED, PER, N, TOPV = 380, 50, 13, 6000
    offs = [0] + [8 + 14 * k for k in range(N)]
    span = offs[-1]

    def x(o):
        return X0 + o / span * (X1 - X0)

    def y(v):
        return YB - v / TOPV * (YB - YT)

    def series(extra):
        return [SAVED] + [SAVED + (PER + extra) * (k + 1) for k in range(N)]

    def step_pts(vals):
        pts = [(x(offs[0]), y(vals[0]))]
        for i in range(1, len(vals)):
            pts.append((x(offs[i]), y(vals[i - 1])))
            pts.append((x(offs[i]), y(vals[i])))
        pts.append((X1, y(vals[-1])))
        return pts

    dot_n = ab.node(0, x=X1, y=y(series(0)[-1]), name='End')
    pop = ab.node(dot_n, name='End pop')
    dot = ab.shape(pop, name='End dot')
    ab.ellipse(dot, 18, 18)
    ab.fill(dot, c(P['hull']))

    wl = ab.shape(0, name='With the change')
    _, wv = ab.poly(wl, step_pts(series(0)), closed=False)
    ab.stroke(wl, c(P['hull']), 6, cap=1, join=1)
    cl = ab.shape(0, name='Current plan')
    ab.poly(cl, step_pts(series(0)), closed=False)
    ab.stroke(cl, c(P['line2']), 3, join=1)

    base = ab.shape(0, name='Baseline')
    ab.poly(base, [(X0, YB), (X1, YB)], closed=False)
    ab.stroke(base, c(P['line']), 3)
    grid = ab.shape(0, name='Grid')
    for v in range(2000, TOPV + 1, 2000):
        ab.poly(grid, [(X0, y(v)), (X1, y(v))], closed=False)
    ab.stroke(grid, c(*P['rule']), 2)

    def extra_pose(name, extra):
        a = ab.animation(name, frames=1)
        pts = step_pts(series(extra))
        for vi, (_, py) in zip(wv, pts):
            a.key(vi, 'vy', [(0, py)])
        a.key(dot_n, 'y', [(0, y(series(extra)[-1]))])
        return a
    e0, e300 = extra_pose('extra-0', 0), extra_pose('extra-300', 300)
    rest = ab.animation('rest', frames=1).key(pop, 'scaleX', [(0, 1)]).key(pop, 'scaleY', [(0, 1)])
    applied = ab.animation('applied', frames=54) \
        .key(pop, 'scaleX', [(0, 1, ENTER), (14, 1.45, SETTLE), (54, 1)]) \
        .key(pop, 'scaleY', [(0, 1, ENTER), (14, 1.45, SETTLE), (54, 1)])

    m = ab.machine('Scenario')
    i_x = m.number('extraPerPaycheck', 0)
    i_ap = m.trigger('applied')
    i_red = m.boolean('reducedMotion')
    L = m.layer('Plan')
    L.go(L.entry, L.blend1d(i_x, [(e0, 0), (e300, 300)]))
    L = m.layer('Applied')
    r, a = L.anim_state(rest), L.anim_state(applied)
    L.go(L.entry, r)
    L.go(r, a, [('trig', i_ap), ('bool', i_red, False)])
    L.go(a, r, exit_pct=100)
    return ab


def main():
    os.makedirs(OUT, exist_ok=True)
    for name, fn in [('equilibrium', equilibrium), ('goal', goal), ('onboarding', onboarding), ('scenario', scenario)]:
        n = write(os.path.join(OUT, name + '.riv'), [fn('light'), fn('dark')])
        print('%-12s %6d bytes' % (name, n))


if __name__ == '__main__':
    main()
