/*
  <keel-lottie>: the one Lottie player used everywhere in Keel.

  Vanilla custom element, no build step. The brief's React-style interface
  (<LottieAnimation animationData autoplay loop trigger reducedMotionFallback ariaLabel>)
  maps onto attributes:

    <keel-lottie
      name="equilibrium"          assets/lottie/equilibrium.json (+ -dark.json in dark theme)
      trigger="inview"            inview | load | manual   (default manual)
      loop                        loop while playing (used only for loading)
      poster="end"                frame shown before play and for reduced motion: end | start | <frame>
      label="..."                 accessible name (role="img")
      fallback="assets/fallbacks/equilibrium.svg"  static image shown until the animation is ready,
                                  and kept if JavaScript or the runtime is unavailable
    ></keel-lottie>

  JS API (on the element):
    play() pause() stop() replay() goTo(frame) playSegment(a, b)
    scrubTo(progress 0..1, {from, to, duration})   progress-mapped timelines
    ready (Promise), totalFrames, isPlaying
  Events: keel-ready, keel-complete

  Behavior:
    * The runtime (lottie-web) loads once, on first need.
    * JSON loads only when the element is within 300px of the viewport.
    * Playback pauses while the element is off-screen or the tab is hidden,
      and resumes when it comes back.
    * Reduced motion (OS setting, or data-motion="reduced" on <html>) shows the
      poster frame instead of autoplaying. Explicit user play still plays.
    * Theme changes reload the matching file and hold the current frame.
*/
(function () {
  'use strict';
  if (window.customElements && customElements.get('keel-lottie')) return;

  var BASE = (document.currentScript && document.currentScript.dataset.base) || 'assets/';
  var runtime = null;

  function loadRuntime() {
    if (window.lottie) return Promise.resolve(window.lottie);
    if (runtime) return runtime;
    runtime = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = BASE + 'vendor/lottie.min.js';
      s.onload = function () { resolve(window.lottie); };
      s.onerror = reject;
      document.head.appendChild(s);
    });
    return runtime;
  }

  function prefersReduced() {
    return document.documentElement.getAttribute('data-motion') === 'reduced' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  function isDark() {
    var t = document.documentElement.getAttribute('data-theme');
    return t ? t === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  window.keelMotion = window.keelMotion || {};
  window.keelMotion.reduced = prefersReduced;
  window.keelMotion.isDark = isDark;

  // settle easing for scrubbing (matches --ease-settle)
  function settle(t) {
    // cubic-bezier(0.2, 0.7, 0.2, 1) solved numerically
    var x1 = 0.2, y1 = 0.7, x2 = 0.2, y2 = 1, lo = 0, hi = 1, mid = t;
    for (var i = 0; i < 18; i++) {
      mid = (lo + hi) / 2;
      var u = 1 - mid, x = 3 * u * u * mid * x1 + 3 * u * mid * mid * x2 + mid * mid * mid;
      if (x < t) lo = mid; else hi = mid;
    }
    var v = 1 - mid;
    return 3 * v * v * mid * y1 + 3 * v * mid * mid * y2 + mid * mid * mid;
  }

  var all = new Set();
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { e.target._onView(e.isIntersecting, e.intersectionRatio); });
  }, { rootMargin: '300px 0px', threshold: [0, 0.35] }) : null;

  class KeelLottie extends HTMLElement {
    constructor() {
      super();
      this.anim = null;
      this._ready = null;
      this._wantPlay = false;   // playing intent, survives off-screen pauses
      this._visible = false;
      this._played = false;
      this._scrub = 0;
    }
    connectedCallback() {
      this.setAttribute('role', 'img');
      if (this.hasAttribute('label')) this.setAttribute('aria-label', this.getAttribute('label'));
      if (!this.style.display) this.style.display = 'block';
      this.style.position = this.style.position || 'relative';
      if (this.getAttribute('fallback') && !this.querySelector('img')) {
        var img = document.createElement('img');
        img.src = this.getAttribute('fallback'); img.alt = ''; img.setAttribute('aria-hidden', 'true');
        img.style.cssText = 'display:block;width:100%;height:100%;object-fit:contain';
        this.appendChild(img);
      }
      all.add(this);
      if (io) io.observe(this); else this._onView(true, 1);
    }
    disconnectedCallback() {
      all.delete(this);
      if (io) io.unobserve(this);
      if (this.anim) { this.anim.destroy(); this.anim = null; }
      this._ready = null;
    }
    get ready() { return this._load(); }
    get totalFrames() { return this.anim ? this.anim.totalFrames : 0; }
    get isPlaying() { return !!(this.anim && !this.anim.isPaused); }

    _src() { return BASE + 'lottie/' + this.getAttribute('name') + (isDark() ? '-dark' : '') + '.json'; }
    _poster() {
      var p = this.getAttribute('poster') || 'end';
      if (!this.anim) return 0;
      if (p === 'end') return this.anim.totalFrames - 1;
      if (p === 'start') return 0;
      return Math.min(this.anim.totalFrames - 1, parseFloat(p) || 0);
    }
    _load(holdFrame) {
      if (this._ready) return this._ready;
      var self = this;
      this._ready = loadRuntime().then(function (lottie) {
        return new Promise(function (resolve, reject) {
          var box = document.createElement('div');
          box.style.cssText = 'position:absolute;inset:0';
          box.setAttribute('aria-hidden', 'true');
          self.appendChild(box);
          var a = lottie.loadAnimation({
            container: box, renderer: 'svg', autoplay: false, loop: self.hasAttribute('loop'),
            path: self._src(), rendererSettings: { preserveAspectRatio: self.getAttribute('fit') || 'xMidYMid meet', progressiveLoad: true }
          });
          self.anim = a; self._box = box;
          a.addEventListener('DOMLoaded', function () {
            var img = self.querySelector(':scope > img'); if (img) img.style.visibility = 'hidden';
            a.goToAndStop(holdFrame !== undefined ? holdFrame : self._poster(), true);
            self.dispatchEvent(new CustomEvent('keel-ready'));
            resolve(a);
          });
          a.addEventListener('complete', function () {
            self._wantPlay = false;
            self.dispatchEvent(new CustomEvent('keel-complete'));
          });
          a.addEventListener('data_failed', function () { self._ready = null; reject(new Error('Lottie failed: ' + self._src())); });
        });
      });
      return this._ready;
    }
    _onView(near, ratio) {
      this._visible = near && ratio > 0;
      if (near) this._load();
      var trig = this.getAttribute('trigger');
      if (this._visible && ratio >= 0.35 && !this._played && (trig === 'inview' || trig === 'load')) {
        this._played = true;
        if (!prefersReduced()) this.replay(); else this._load();
      }
      // visibility-aware playback
      if (this.anim) {
        if (!this._visible && !this.anim.isPaused) this.anim.pause();
        else if (this._visible && this._wantPlay && this.anim.isPaused) this.anim.play();
      }
    }
    play() {
      var self = this; this._wantPlay = true;
      return this._load().then(function (a) {
        if (a.currentFrame >= a.totalFrames - 1 && !self.hasAttribute('loop')) a.goToAndStop(0, true);
        if (self._visible || !io) a.play();
      });
    }
    pause() { this._wantPlay = false; if (this.anim) this.anim.pause(); }
    stop() { this._wantPlay = false; var self = this; if (this.anim) this.anim.goToAndStop(self._poster(), true); }
    replay() {
      var self = this; this._wantPlay = true;
      return this._load().then(function (a) { a.goToAndPlay(0, true); if (!self._visible && io) a.pause(); });
    }
    goTo(frame) { this._wantPlay = false; return this._load().then(function (a) { a.goToAndStop(frame, true); }); }
    playSegment(from, to) {
      var self = this; this._wantPlay = true;
      return this._load().then(function (a) {
        if (prefersReduced()) { a.goToAndStop(to, true); self._wantPlay = false; return; }
        a.playSegments([from, to], true);
      });
    }
    /* Progress-mapped timelines: frames [from, to] are linear in the value.
       Eases from the current value to `progress` with the settle curve. */
    scrubTo(progress, opts) {
      opts = opts || {};
      var self = this;
      return this._load().then(function (a) {
        var from = opts.from || 0, to = opts.to === undefined ? a.totalFrames - 1 : opts.to;
        var p = Math.max(0, Math.min(1, progress));
        var start = self._scrub, dur = opts.duration === undefined ? 550 : opts.duration;
        cancelAnimationFrame(self._raf);
        self._wantPlay = false; a.pause();
        if (prefersReduced() || dur === 0) { self._scrub = p; a.goToAndStop(from + (to - from) * p, true); return; }
        var t0 = performance.now();
        return new Promise(function (resolve) {
          (function step(now) {
            var k = Math.min(1, (now - t0) / dur), v = start + (p - start) * settle(k);
            a.goToAndStop(from + (to - from) * v, true);
            if (k < 1) self._raf = requestAnimationFrame(step); else { self._scrub = p; resolve(); }
          })(t0);
        });
      });
    }
    _retheme() {
      if (!this.anim) return;
      var frame = this.anim.currentFrame, playing = this._wantPlay && !this.anim.isPaused;
      this.anim.destroy(); if (this._box) this._box.remove();
      this.anim = null; this._ready = null;
      var self = this;
      this._load(frame).then(function (a) { if (playing) a.play(); });
    }
  }
  customElements.define('keel-lottie', KeelLottie);

  function rethemeAll() { all.forEach(function (el) { el._retheme(); }); }
  document.addEventListener('keel-theme', rethemeAll);
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
    if (!document.documentElement.getAttribute('data-theme')) rethemeAll();
  });
  document.addEventListener('visibilitychange', function () {
    all.forEach(function (el) {
      if (!el.anim) return;
      if (document.hidden) el.anim.pause();
      else if (el._wantPlay && el._visible) el.anim.play();
    });
  });
})();
