/* ===========================================================================
   hero.js — gravity hero, no dependencies.

   Characters fall in from above the viewport, collide with the real glyph
   boxes of the headline, and settle into a pile on the words. Drag them.

   Contains a small purpose-built solver (circles vs. axis-aligned boxes and
   each other, impulse based, sub-stepped, mass-weighted). It means the
   signature element of the page never waits on a CDN.
   =========================================================================== */
(function () {
  "use strict";

  var stage = document.getElementById("stage");
  var hero = document.getElementById("hero");
  if (!stage || !hero) return;

  var COUNT = 12;
  var R = 31;                    // base radius; each body scales off this
  var GUT = 20;                  // matches the layout gutter — nothing rests on the frame edge
  var G = 2100;                  // px / s²
  var REST = 0.32;               // floor and walls: a little give, well short of the letters
  var REST_GLYPH = 0.42;         // the letters are springy — characters ricochet off the title
  var REST_PAIR = 0.52;          // characters bounce off each other, scaled by both bodies
  var SOFT_V = 210;              // floor: below this impact speed, contact goes inelastic
  var SOFT_G = 90;               // letters keep bouncing until they are barely moving
  var SOFT_P = 70;               // pairs: resting contact must not bounce or a pile never sleeps
  var MU_GLYPH = 0.38;           // low friction on the letters, so they skid off rather than stick
  var KICK = 260;                // impact speed above which a letter throws a character sideways
  var CALM_V = 26;               // linear speed under which a body counts as calm
  var CALM_W = 0.9;              // angular speed under which a body counts as calm
  var WAKE_V = 12;               // relative speed that revives a sleeping body
  var HELD_GRIP = 1.5;           // a dragged body is heavy but NOT infinite — an infinite
                                 // grip transfers the same impulse whatever it hits, which
                                 // makes every collision feel identical regardless of weight
  var MU = 0.86;                 // friction
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- original character artwork -------------------------------------- */
  var PALETTE = [
    { body: "#4f46e5", face: "#ffffff" },
    { body: "#0d7a63", face: "#ffffff" },
    { body: "#e0973f", face: "#241a08" },
    { body: "#5b6152", face: "#f5f4ec" },
    { body: "#e5605f", face: "#ffffff" },
    { body: "#8a7ff0", face: "#1a1636" },
    { body: "#5fc2a6", face: "#0c2a22" }
  ];

  // Each character has a weight, a bounciness and a size, and the three agree
  // with each other: the big stone is heavy and dead, the little antenna blob
  // is light and springy. Mass is what makes a collision legible — you can see
  // why the small one went flying and the heavy one barely moved.
  //   rs = radius scale, m = mass, e = restitution multiplier
  var PROFILE = [
    { rs: 1.00, m: 1.00, e: 1.00 },  // round fellow — the baseline
    { rs: 1.08, m: 1.55, e: 0.72 },  // cyclops squircle — blocky, solid
    { rs: 0.82, m: 0.55, e: 1.30 },  // antenna blob — light, pings around
    { rs: 1.02, m: 1.20, e: 0.88 },  // capsule with visor
    { rs: 1.20, m: 2.20, e: 0.52 },  // sleepy stone — the heavyweight
    { rs: 0.88, m: 0.72, e: 1.18 }   // stacked eyes — light
  ];

  // Drawn on a 52×52 canvas, centred on 26,26.
  var SHAPES = [
    function (c) { // two eyes, small mouth
      return '<circle cx="26" cy="26" r="24" fill="' + c.body + '"/>' +
        '<circle cx="18.5" cy="23" r="4.4" fill="' + c.face + '"/>' +
        '<circle cx="33.5" cy="23" r="4.4" fill="' + c.body + '" stroke="' + c.face + '" stroke-width="2"/>' +
        '<path d="M19 34c3.2 3.4 10.8 3.4 14 0" stroke="' + c.face + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
    },
    function (c) { // cyclops squircle
      return '<rect x="3" y="3" width="46" height="46" rx="17" fill="' + c.body + '"/>' +
        '<circle cx="26" cy="25" r="10" fill="' + c.face + '"/>' +
        '<circle cx="28.5" cy="26.5" r="4.6" fill="' + c.body + '"/>';
    },
    function (c) { // antenna blob
      return '<path d="M26 4c12 0 22 9.6 22 21.5S38 50 26 50 4 37.4 4 25.5 14 4 26 4Z" fill="' + c.body + '"/>' +
        '<rect x="24.6" y="0" width="2.8" height="9" rx="1.4" fill="' + c.body + '"/>' +
        '<circle cx="26" cy="2.6" r="3.4" fill="' + c.body + '"/>' +
        '<rect x="15" y="21" width="6" height="11" rx="3" fill="' + c.face + '"/>' +
        '<rect x="31" y="21" width="6" height="11" rx="3" fill="' + c.face + '"/>';
    },
    function (c) { // capsule with visor
      return '<rect x="6" y="2" width="40" height="48" rx="20" fill="' + c.body + '"/>' +
        '<rect x="12" y="19" width="28" height="13" rx="6.5" fill="' + c.face + '"/>' +
        '<circle cx="20" cy="25.5" r="2.6" fill="' + c.body + '"/>' +
        '<circle cx="32" cy="25.5" r="2.6" fill="' + c.body + '"/>';
    },
    function (c) { // sleepy stone
      return '<path d="M25 3c11 0 24 7 24 20s-9 26-24 26S2 38 2 25 14 3 25 3Z" fill="' + c.body + '"/>' +
        '<path d="M14 26c2.6-3.4 7.4-3.4 10 0" stroke="' + c.face + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
        '<path d="M29 26c2.6-3.4 7.4-3.4 10 0" stroke="' + c.face + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
        '<circle cx="26" cy="37" r="3.2" fill="' + c.face + '" opacity=".85"/>';
    },
    function (c) { // stacked eyes
      return '<circle cx="26" cy="26" r="24" fill="' + c.body + '"/>' +
        '<circle cx="26" cy="18" r="5" fill="' + c.face + '"/>' +
        '<circle cx="26" cy="31" r="7" fill="' + c.face + '" opacity=".55"/>';
    }
  ];

  function makeEl(i, size) {
    var c = PALETTE[i % PALETTE.length];
    var el = document.createElement("div");
    el.className = "chr";
    el.setAttribute("aria-hidden", "true");
    el.style.width = size + "px";
    el.style.height = size + "px";
    el.innerHTML =
      '<svg viewBox="0 0 52 52" width="' + size + '" height="' + size + '" xmlns="http://www.w3.org/2000/svg">' +
      SHAPES[i % SHAPES.length](c) + "</svg>";
    return el;
  }

  /* --- state ------------------------------------------------------------ */
  var bodies = [];  // {x,y,vx,vy,a,av,r,m,invM,e,el,held,sleep,touch,calm}
  var boxes = [];   // {l,t,r,b,bounce} glyph terrain + floor + walls
  var W = 0, H = 0;

  // characters and walls both scale with the viewport, so a 320px screen
  // gets fewer, smaller characters instead of a jammed pile
  function sizeFor(w) {
    if (w < 420) return { count: 6,  size: 40 };
    if (w < 620) return { count: 8,  size: 48 };
    if (w < 900) return { count: 10, size: 56 };
    return { count: 12, size: 62 };
  }

  function applySize(size) { R = size / 2; }

  // Resize each body and its element in place, keeping the mass profile intact.
  function resizeBodies() {
    for (var i = 0; i < bodies.length; i++) {
      var p = bodies[i];
      var size = Math.round(R * 2 * PROFILE[i % PROFILE.length].rs);
      p.r = size / 2;
      p.el.style.width = size + "px";
      p.el.style.height = size + "px";
      var svg = p.el.firstChild;
      if (svg && svg.setAttribute) { svg.setAttribute("width", size); svg.setAttribute("height", size); }
    }
  }

  function measure() {
    W = hero.clientWidth;
    H = hero.clientHeight;
    var hr = hero.getBoundingClientRect();
    var inner = hero.querySelector(".hero__in");
    GUT = inner ? parseFloat(getComputedStyle(inner).paddingLeft) || 20 : 20;
    boxes = [];

    // floor and side walls run flush to the viewport, not inset by the layout
    // gutter — the characters need the full width and the true floor to fall to,
    // which matters most on mobile where an inset floor left no room to land.
    boxes.push({ l: -400, t: H, r: W + 400, b: H + 400 });
    boxes.push({ l: -400, t: -4000, r: 0, b: H + 400 });
    boxes.push({ l: W, t: -4000, r: W + 400, b: H + 400 });

    // one box per headline glyph — the terrain they land on
    var gl = hero.querySelectorAll(".gl");
    for (var i = 0; i < gl.length; i++) {
      var r = gl[i].getBoundingClientRect();
      if (r.width < 2 || r.height < 6) continue;
      // clamp to the ink, not the full line box
      var top = r.top - hr.top + r.height * 0.30;
      var bot = r.top - hr.top + r.height * 0.86;
      // a wider inset leaves real gaps between letters, so more characters
      // catch a corner and get thrown sideways instead of landing flat
      var inset = r.width * 0.12;
      boxes.push({ l: r.left - hr.left + inset, t: top, r: r.right - hr.left - inset, b: bot, bounce: 1 });
    }

    // the ⌘K pill is a real object too — it sits above the headline, so
    // without this the characters fall straight through and bury it. A solid,
    // low-bounce shelf: they land on top and it stays readable.
    var pill = hero.querySelector("#copyCtx");
    if (pill) {
      var pr = pill.getBoundingClientRect();
      if (pr.width > 2 && pr.height > 2) {
        boxes.push({
          l: pr.left - hr.left,
          t: pr.top - hr.top,
          r: pr.right - hr.left,
          b: pr.bottom - hr.top
        });
      }
    }
  }

  function seed(reset) {
    var h1 = hero.querySelector("h1");
    // The spawn band is centred on the hero, not anchored left — the headline
    // is centred now, so an off-centre band piles everything into one corner.
    var usable = W - GUT * 2 - R * 2;
    var span = h1 ? Math.min(h1.getBoundingClientRect().width * 1.1, usable) : usable;
    var pad = (W - span) / 2;
    for (var i = 0; i < COUNT; i++) {
      var prof = PROFILE[i % PROFILE.length];
      var x = pad + span * ((i + 0.5) / COUNT) + (Math.random() - 0.5) * Math.min(24, span * 0.06);
      var y = -R - 120 - i * 130 - Math.random() * 260;
      if (reset) {
        bodies[i].x = x; bodies[i].y = y;
        bodies[i].vx = 0; bodies[i].vy = 0; bodies[i].av = 0;
        wake(bodies[i]);
      } else {
        var size = Math.round(R * 2 * prof.rs);
        var el = makeEl(i, size);
        stage.appendChild(el);
        bodies.push({
          x: x, y: y, vx: 0, vy: 0, a: (Math.random() - 0.5) * 0.8, av: 0,
          r: size / 2, m: prof.m, invM: 1 / prof.m, e: prof.e,
          el: el, held: false, sleep: false, touch: false, calm: 0
        });
      }
    }
  }

  /* --- solver ----------------------------------------------------------- */
  function collideBox(p, box) {
    var cx = p.x < box.l ? box.l : (p.x > box.r ? box.r : p.x);
    var cy = p.y < box.t ? box.t : (p.y > box.b ? box.b : p.y);
    var dx = p.x - cx, dy = p.y - cy;
    var d2 = dx * dx + dy * dy;
    if (d2 > p.r * p.r) return;

    var d = Math.sqrt(d2), nx, ny;
    if (d > 0.0001) { nx = dx / d; ny = dy / d; }
    else {
      // centre inside the box: push out along the shallowest axis
      var toL = p.x - box.l, toR = box.r - p.x, toT = p.y - box.t, toB = box.b - p.y;
      var m = Math.min(toL, toR, toT, toB);
      nx = m === toL ? -1 : m === toR ? 1 : 0;
      ny = m === toT ? -1 : m === toB ? 1 : 0;
      d = 0;
    }
    var pen = p.r - d;
    p.x += nx * pen; p.y += ny * pen;

    p.touch = true;
    // Letters are springy, the floor is not — so characters ricochet off the
    // title and only calm down once they reach the ground. A heavy character
    // bounces less than a light one off the same surface.
    var glyph = box.bounce === 1;
    var rest = (glyph ? REST_GLYPH : REST) * p.e;
    var soft = glyph ? SOFT_G : SOFT_V;
    var mu = glyph ? MU_GLYPH : MU;

    var vn = p.vx * nx + p.vy * ny;
    if (vn < 0) {
      // A slow contact is a settle, not a knock: restitution fades to zero as
      // the impact speed drops, so the last few pixels of a fall are silent.
      var e = vn < -soft ? rest : rest * (-vn / soft);
      var j = -(1 + e) * vn;
      p.vx += nx * j; p.vy += ny * j;
      // tangential friction + a little roll
      var tx = -ny, ty = nx;
      var vt = p.vx * tx + p.vy * ty;
      var maxF = mu * j;
      var dv = Math.abs(vt) < maxF ? -vt : -Math.sign(vt) * maxF;
      p.vx += tx * dv; p.vy += ty * dv;
      if (Math.abs(vt) > 8) p.av += (vt + dv) * 0.0016;   // roll only while sliding

      // A hard hit on a letter throws the character off to one side and sets it
      // spinning. Without this they bounce straight back up, re-land in the
      // same spot, and the result reads as a row of stickers, not a scatter.
      // A heavy character resists the kick.
      if (glyph && -vn > KICK) {
        var kick = (-vn - KICK) * 0.30 * p.invM;
        p.vx += (Math.random() < 0.5 ? -1 : 1) * kick * (0.5 + Math.random() * 0.8);
        p.av += (Math.random() - 0.5) * 2.4 * p.invM;
      }
    }
  }

  function wake(p) { p.sleep = false; p.calm = 0; }

  // Mass-weighted collision. A held body counts as immovable, so dragging one
  // into the pile shoves the others with the full weight of the drag — and the
  // faster the drag, the harder the shove.
  function collidePair(a, b) {
    if (a.sleep && b.sleep) return;
    var dx = b.x - a.x, dy = b.y - a.y;
    var d2 = dx * dx + dy * dy;
    var min = a.r + b.r;
    if (d2 > min * min || d2 < 0.0001) return;

    var d = Math.sqrt(d2);
    var nx = dx / d, ny = dy / d;
    var rvn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;

    // Wake FIRST. A sleeping body and a held body are both immovable, so if
    // this ran after the mass check the pair would resolve to nothing and a
    // dragged character would pass through a sleeping pile without touching it.
    if (a.held || b.held || -rvn > WAKE_V) { wake(a); wake(b); }

    // A held body keeps pointer authority because its position is rewritten
    // every pointermove, so giving it finite mass here costs nothing and lets
    // the mass ratio decide how much the thing it hits actually moves.
    var invA = a.sleep ? 0 : (a.held ? a.invM / HELD_GRIP : a.invM);
    var invB = b.sleep ? 0 : (b.held ? b.invM / HELD_GRIP : b.invM);
    var inv = invA + invB;
    if (inv === 0) return;              // two immovables: nothing to resolve

    // separate along the normal, the lighter body giving way more
    var pen = min - d;
    var shareA = a.held ? 0 : invA / inv;
    var shareB = b.held ? 0 : invB / inv;
    var norm = shareA + shareB;
    if (norm > 0) {                    // push the whole overlap out of the free bodies
      shareA /= norm; shareB /= norm;
      a.x -= nx * pen * shareA; a.y -= ny * pen * shareA;
      b.x += nx * pen * shareB; b.y += ny * pen * shareB;
    }

    if (rvn > 0) return;

    a.touch = true; b.touch = true;

    // Bounciness is the softer of the two — a light springy character off a
    // dead heavy one behaves like the heavy one. Faded at low speed so a
    // resting pile cannot re-ignite itself.
    var pe = REST_PAIR * Math.min(a.e, b.e);
    var e = -rvn > SOFT_P ? pe : pe * (-rvn / SOFT_P);

    var j = -(1 + e) * rvn / inv;
    if (!a.held) { a.vx -= nx * j * invA; a.vy -= ny * j * invA; }
    if (!b.held) { b.vx += nx * j * invB; b.vy += ny * j * invB; }

    if (-rvn > 20) {                 // a real knock, not resting-contact shove
      var spin = j * 0.0012;
      a.av -= spin * invA; b.av += spin * invB;
    }
  }

  function step(dt) {
    // Adaptive sub-stepping. A body moving 80px in a frame will tunnel clean
    // through a 25px-radius neighbour if the solver only samples three times,
    // and a fast drag is exactly that case — which made collisions land or miss
    // at random and inverted the mass response.
    var i, p, minR = 1e9, maxv = 0, d;
    for (i = 0; i < bodies.length; i++) {
      p = bodies[i];
      if (p.r < minR) minR = p.r;
      if (p.held) {
        d = Math.sqrt((p.tx - p.x) * (p.tx - p.x) + (p.ty - p.y) * (p.ty - p.y)) / Math.max(dt, 1e-4);
        if (d > maxv) maxv = d;
      } else if (!p.sleep) {
        d = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (d > maxv) maxv = d;
      }
    }
    var SUB = Math.max(3, Math.min(14, Math.ceil(maxv * dt / (0.45 * minR))));
    var h = dt / SUB;

    // a dragged body is swept along its path rather than teleported
    for (i = 0; i < bodies.length; i++) {
      p = bodies[i];
      if (p.held) { p.sx = (p.tx - p.x) / SUB; p.sy = (p.ty - p.y) / SUB; }
    }

    for (var s = 0; s < SUB; s++) {
      for (i = 0; i < bodies.length; i++) {
        p = bodies[i];
        if (p.held) { p.x += p.sx; p.y += p.sy; p.touch = false; continue; }
        if (p.sleep) continue;
        p.vy += G * h;
        p.vx *= 0.9985; p.vy *= 0.9985;
        p.x += p.vx * h; p.y += p.vy * h;
        p.a += p.av * h; p.av *= 0.985;
        p.touch = false;
      }
      for (var it = 0; it < 2; it++) {
        for (i = 0; i < bodies.length; i++) {
          if (bodies[i].held || bodies[i].sleep) continue;
          if (bodies[i].y < -600) continue;         // still falling in
          for (var k = 0; k < boxes.length; k++) collideBox(bodies[i], boxes[k]);
        }
        for (i = 0; i < bodies.length; i++)
          for (var j2 = i + 1; j2 < bodies.length; j2++) collidePair(bodies[i], bodies[j2]);
      }
    }
    settle();
  }

  // Additive settling pass. Once a body is in contact and moving slowly, its
  // spin is eased down over roughly half a second rather than being cut, so it
  // rotates to a stop instead of freezing mid-turn. Below a floor threshold the
  // residual motion is zeroed, and after a while the body sleeps outright.
  function settle() {
    for (var i = 0; i < bodies.length; i++) {
      var p = bodies[i];
      if (p.held) { p.calm = 0; p.sleep = false; continue; }
      if (p.sleep) continue;

      var sp = Math.abs(p.vx) + Math.abs(p.vy);

      // Invariant: a body in contact that has stopped translating must not keep
      // spinning. The calm gate below ignores anything spinning faster than
      // CALM_W, which occasionally left one character rotating on the spot
      // forever, so brake the spin here regardless of how fast it is.
      if ((p.touch || sp < 6) && sp <= CALM_V) {
        p.av *= 0.90;
        if (Math.abs(p.av) < 0.05) p.av = 0;
      }

      // Decay the counter instead of zeroing it: a body resting in a wedge can
      // drop contact for a single frame, and a hard reset meant it never
      // reached the sleep threshold and crept for ever.
      var calmEnough = (p.touch || sp < 6) && sp <= CALM_V && Math.abs(p.av) <= CALM_W;
      if (!calmEnough) { p.calm = sp > CALM_V * 2 ? 0 : Math.max(0, (p.calm || 0) - 4); continue; }

      p.calm = (p.calm || 0) + 1;
      var k = p.calm > 30 ? 1 : p.calm / 30;   // ease in over ~0.5s at 60fps
      p.av *= 1 - 0.17 * k;
      p.vx *= 1 - 0.20 * k;
      p.vy *= 1 - 0.08 * k;

      if (p.calm > 30) {
        if (Math.abs(p.av) < 0.05) p.av = 0;
        if (sp < 3) { p.vx = 0; if (p.vy > 0) p.vy = 0; }
      }
      // Fully asleep: frozen, and no longer shoved by overlap correction.
      if (p.calm > 60 && p.touch) { p.av = 0; p.vx = 0; p.vy = 0; p.sleep = true; }
    }
  }

  function draw() {
    for (var i = 0; i < bodies.length; i++) {
      var p = bodies[i];
      p.el.style.transform =
        "translate(" + (p.x - p.r).toFixed(2) + "px," + (p.y - p.r).toFixed(2) + "px) rotate(" + p.a.toFixed(3) + "rad)";
    }
  }

  /* --- loop ------------------------------------------------------------- */
  var last = 0, running = false;
  function frame(t) {
    if (!running) return;
    var dt = last ? Math.min((t - last) / 1000, 1 / 30) : 1 / 60;
    last = t;
    step(dt);
    draw();
    requestAnimationFrame(frame);
  }
  function play() { if (!running) { running = true; last = 0; requestAnimationFrame(frame); } }
  function pause() { running = false; }

  /* --- drag ------------------------------------------------------------- */
  function pt(e) {
    var r = hero.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  var held = null, lastPt = null;
  stage.addEventListener("pointerdown", function (e) {
    var q = pt(e);
    for (var i = bodies.length - 1; i >= 0; i--) {
      var p = bodies[i];
      if ((q.x - p.x) * (q.x - p.x) + (q.y - p.y) * (q.y - p.y) < p.r * p.r) {
        held = p; p.held = true; wake(p); lastPt = q;
        p.tx = p.x; p.ty = p.y;
        stage.setPointerCapture(e.pointerId);
        e.preventDefault();
        play();
        return;
      }
    }
  });
  stage.addEventListener("pointermove", function (e) {
    if (!held) return;
    var q = pt(e);
    held.tx = q.x; held.ty = q.y;          // swept to, not teleported to
    held.vx = (q.x - lastPt.x) * 30;
    held.vy = (q.y - lastPt.y) * 30;
    lastPt = q;
  });
  function release() {
    if (held) { held.x = held.tx; held.y = held.ty; held.held = false; held = null; }
  }
  stage.addEventListener("pointerup", release);
  stage.addEventListener("pointercancel", release);

  /* --- boot ------------------------------------------------------------- */
  function start() {
    var s0 = sizeFor(hero.clientWidth);
    COUNT = s0.count;
    applySize(s0.size);
    measure();
    if (reduced) {
      // resting arrangement, no motion
      seed(false);
      for (var i = 0; i < bodies.length; i++) {
        var p = bodies[i];
        p.x = p.r + (W - p.r * 2) * (i / (COUNT - 1));
        p.y = H - p.r - (i % 3) * (p.r * 1.7);
        p.el.style.cursor = "default";
      }
      draw();
      return;
    }
    seed(false);
    play();
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { setTimeout(start, 40); });
    setTimeout(function () { if (!bodies.length) start(); }, 1200); // safety net
  } else {
    window.addEventListener("load", start);
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) {
      if (reduced) return;
      en[0].isIntersecting ? play() : pause();
    }, { threshold: 0 }).observe(hero);
  }

  var rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      var next = sizeFor(hero.clientWidth);
      if (next.size !== R * 2) { applySize(next.size); resizeBodies(); }
      measure();
      for (var i = 0; i < bodies.length; i++) {
        var p = bodies[i];
        wake(p);
        if (p.x > W - p.r) p.x = W - p.r;
        if (p.x < p.r) p.x = p.r;
        if (p.y > H + 200) { p.y = -p.r - 100 - i * 60; p.vy = 0; }
      }
    }, 200);
  });

  var redrop = document.getElementById("redrop");
  if (redrop) redrop.addEventListener("click", function () {
    if (!bodies.length) return;
    measure(); seed(true); play();
  });
})();
