/* ===========================================================================
   rings.js — WebGL2 coaxial ring-tunnel. No dependencies.

   Flat extruded annuli (washers) stacked along Z, receding into depth. The
   group tilts toward the cursor with a per-axis spring, so you can rotate it
   until the holes line up and look straight down the tunnel.

   "White ceramic technical drawing": glossy near-white rings, hairline ink
   outlines on the silhouettes (inverted hull), a fine wireframe overlay,
   strong perspective. Procedural geometry, hand-rolled 4x4 matrices, GLSL.
   =========================================================================== */
(function () {
  "use strict";

  var DEFAULTS = {
    count: 4, spacing: 1.5, outerR: 1, innerRatio: 0.55, height: 0.24,
    falloff: 0.7, baseTiltX: 0.56, baseTiltY: -0.5, rangeX: 0.9, rangeY: 1.12,
    stiffness: 90, damping: 16, idle: 0.05, autoRotate: false, autoSpeed: 0.16,
    camDist: 10, fov: 41, material: "ceramic", baseColor: "#f2f4f8",
    metal: 0.05, specStr: 0.7, specPow: 70, toon: 0, fresStr: 0.21,
    fresColor: "#c5c4bf", outline: true, outlineWidth: 0.002,
    outlineColor: "#111a2b", wire: true, fog: 0.002, bgTop: "#ffffff",
    bgBottom: "#ededed", vignette: 0.22, beacon: false, beaconColor: "#ffcf87",
    beaconInt: 1, beaconSize: 0.15,
    // integration-only: when false the canvas clears transparent (no opaque
    // gradient), so the band composits onto whatever page background is behind
    // it and reads correctly in both light and dark themes.
    bgOpaque: true,
    // wire colour/alpha default to the fresnel colour (per spec); overridable
    // so the integrated band can use a mid grey that reads on both grounds.
    wireColor: null, wireAlpha: 0.5,
    lightDir: [0.35, 0.66, 0.55]
  };

  /* --- small helpers ---------------------------------------------------- */
  function hex(h) {
    h = (h || "#000").replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }

  /* --- 4x4 matrices (column-major, WebGL order) ------------------------- */
  function mul(a, b) {
    var o = new Float32Array(16);
    for (var c = 0; c < 4; c++)
      for (var r = 0; r < 4; r++)
        o[c * 4 + r] =
          a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] +
          a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    return o;
  }
  function perspective(fovy, aspect, near, far) {
    var f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
    return new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, 2 * far * near * nf, 0
    ]);
  }
  function translation(x, y, z) {
    return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);
  }
  function scaling(s) {
    return new Float32Array([s, 0, 0, 0, 0, s, 0, 0, 0, 0, s, 0, 0, 0, 0, 1]);
  }
  function rotX(a) {
    var c = Math.cos(a), s = Math.sin(a);
    return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]);
  }
  function rotY(a) {
    var c = Math.cos(a), s = Math.sin(a);
    return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]);
  }

  /* --- geometry: one extruded annulus ----------------------------------- */
  // Four sub-surfaces (outer wall, inner wall, front cap, back cap) built as
  // quad strips, with winding auto-corrected so every triangle faces outward
  // (CCW when seen from outside) — that keeps back-face culling and the
  // inverted-hull outline honest regardless of how the strip was authored.
  function annulus(outerR, innerR, height, seg) {
    var pos = [], nrm = [], h2 = height / 2, i, a, ca, sa;
    function push(x, y, z, nx, ny, nz) {
      pos.push(x, y, z); nrm.push(nx, ny, nz);
    }
    // vertex index bookkeeping per surface
    function strip(radiusA, radiusB, zA, zB, nzMode, inward) {
      // returns array of quad corner index-tuples; builds 2 verts per segment
      var base = pos.length / 3, idx = [];
      for (i = 0; i <= seg; i++) {
        a = (i / seg) * Math.PI * 2; ca = Math.cos(a); sa = Math.sin(a);
        var nx, ny, nz;
        if (nzMode !== 0) { nx = 0; ny = 0; nz = nzMode; }
        else { var sgn = inward ? -1 : 1; nx = ca * sgn; ny = sa * sgn; nz = 0; }
        push(ca * radiusA, sa * radiusA, zA, nx, ny, nz);
        push(ca * radiusB, sa * radiusB, zB, nx, ny, nz);
      }
      for (i = 0; i < seg; i++) {
        var p0 = base + i * 2, p1 = p0 + 1, p2 = p0 + 2, p3 = p0 + 3;
        idx.push([p0, p1, p2], [p2, p1, p3]);
      }
      return idx;
    }
    var tris = [];
    // outer wall: radius outerR, from +h2 to -h2, radial-out normal
    tris = tris.concat(strip(outerR, outerR, h2, -h2, 0, false));
    // inner wall: radius innerR, radial-in normal
    tris = tris.concat(strip(innerR, innerR, h2, -h2, 0, true));
    // front cap (z = +h2): outer -> inner, +Z normal
    tris = tris.concat(strip(outerR, innerR, h2, h2, 1, false));
    // back cap (z = -h2): outer -> inner, -Z normal
    tris = tris.concat(strip(outerR, innerR, -h2, -h2, -1, false));

    // auto-correct winding to CCW-outward, and collect deduped edges for wire
    var indices = [], edgeSet = {}, lines = [];
    function edge(x, y) {
      var k = x < y ? x + "_" + y : y + "_" + x;
      if (!edgeSet[k]) { edgeSet[k] = 1; lines.push(x, y); }
    }
    for (i = 0; i < tris.length; i++) {
      var t = tris[i], i0 = t[0], i1 = t[1], i2 = t[2];
      var ax = pos[i0 * 3], ay = pos[i0 * 3 + 1], az = pos[i0 * 3 + 2];
      var e1x = pos[i1 * 3] - ax, e1y = pos[i1 * 3 + 1] - ay, e1z = pos[i1 * 3 + 2] - az;
      var e2x = pos[i2 * 3] - ax, e2y = pos[i2 * 3 + 1] - ay, e2z = pos[i2 * 3 + 2] - az;
      // face normal = e1 x e2
      var fnx = e1y * e2z - e1z * e2y, fny = e1z * e2x - e1x * e2z, fnz = e1x * e2y - e1y * e2x;
      var nx = nrm[i0 * 3], ny = nrm[i0 * 3 + 1], nz = nrm[i0 * 3 + 2];
      if (fnx * nx + fny * ny + fnz * nz < 0) { var tmp = i1; i1 = i2; i2 = tmp; }
      indices.push(i0, i1, i2);
      edge(i0, i1); edge(i1, i2); edge(i2, i0);
    }
    return {
      pos: new Float32Array(pos),
      nrm: new Float32Array(nrm),
      idx: new Uint16Array(indices),
      line: new Uint16Array(lines)
    };
  }

  /* --- shaders ---------------------------------------------------------- */
  var VERT = [
    "#version 300 es",
    "in vec3 aPos; in vec3 aNormal;",
    "uniform mat4 uMVP; uniform mat4 uModel;",
    "out vec3 vN; out vec3 vW;",
    "void main(){",
    "  vec4 wp = uModel * vec4(aPos,1.0);",
    "  vW = wp.xyz;",
    "  vN = mat3(uModel) * aNormal;",
    "  gl_Position = uMVP * vec4(aPos,1.0);",
    "}"
  ].join("\n");

  var FRAG = [
    "#version 300 es",
    "precision highp float;",
    "in vec3 vN; in vec3 vW;",
    "uniform vec3 uCam,uBgTop,uBgBottom,uBase,uFres,uLight;",
    "uniform float uMetal,uSpecStr,uSpecPow,uFresStr,uToon,uFog;",
    "out vec4 frag;",
    "vec3 envSample(vec3 r){",
    "  float t = r.y*0.5+0.5;",
    "  vec3 grad = mix(uBgBottom,uBgTop,t);",
    "  float horizon = smoothstep(0.10,0.0,abs(r.y));", // bright band near horizon
    "  return grad + horizon*0.22;",
    "}",
    "void main(){",
    "  vec3 N = normalize(vN);",
    "  if(!gl_FrontFacing) N = -N;",
    "  vec3 V = normalize(uCam - vW);",
    "  vec3 L = normalize(uLight);",
    "  float hemi = N.y*0.5+0.5;",
    "  vec3 ambient = mix(uBgBottom,uBgTop,hemi);",
    "  float diff = max(dot(N,L),0.0);",
    "  if(uToon>0.5){ diff = (floor(diff*uToon)+0.5)/uToon; }",
    "  vec3 col = uBase * ambient * (0.42 + 0.62*diff);",
    "  vec3 H = normalize(L+V);",
    "  float spec = pow(max(dot(N,H),0.0),uSpecPow)*uSpecStr;",
    "  col += vec3(spec);",
    "  float fres = pow(1.0-max(dot(N,V),0.0),2.6)*uFresStr;",
    "  col += uFres*fres;",
    "  vec3 refl = reflect(-V,N);",
    "  col = mix(col, envSample(refl), uMetal);",
    "  float dist = length(uCam - vW);",
    "  float fogF = 1.0 - exp(-uFog*dist*dist);",
    "  col = mix(col, uBgBottom, clamp(fogF,0.0,1.0));",
    "  frag = vec4(col,1.0);",
    "}"
  ].join("\n");

  var VERT_OUT = [
    "#version 300 es",
    "in vec3 aPos; in vec3 aNormal;",
    "uniform mat4 uMVP; uniform float uExtrude;",
    "void main(){ gl_Position = uMVP * vec4(aPos + aNormal*uExtrude, 1.0); }"
  ].join("\n");

  var FRAG_SOLID = [
    "#version 300 es",
    "precision highp float;",
    "uniform vec3 uColor; uniform float uAlpha;",
    "out vec4 frag;",
    "void main(){ frag = vec4(uColor, uAlpha); }"
  ].join("\n");

  // background: fullscreen triangle, vertical gradient + centre glow + vignette
  var VERT_BG = [
    "#version 300 es",
    "const vec2 P[3] = vec2[3](vec2(-1.0,-1.0),vec2(3.0,-1.0),vec2(-1.0,3.0));",
    "out vec2 vUv;",
    "void main(){ vec2 p = P[gl_VertexID]; vUv = p*0.5+0.5; gl_Position = vec4(p,0.0,1.0); }"
  ].join("\n");

  var FRAG_BG = [
    "#version 300 es",
    "precision highp float;",
    "in vec2 vUv;",
    "uniform vec3 uTop,uBottom; uniform float uVignette,uGlow,uOpaque,uAspect;",
    "out vec4 frag;",
    "void main(){",
    "  vec2 c = vUv - 0.5; c.x *= uAspect;",
    "  float d = length(c);",
    "  float glow = smoothstep(0.72,0.0,d) * uGlow;",
    "  float vig = 1.0 - uVignette*smoothstep(0.35,0.95,d);",
    "  if(uOpaque > 0.5){",
    "    vec3 col = mix(uBottom,uTop,vUv.y);",
    "    col += glow;",
    "    col *= vig;",
    "    frag = vec4(col,1.0);",
    "  } else {",
    // transparent band: only a soft additive centre glow, alpha-composited
    "    frag = vec4(vec3(1.0), glow*0.85);",
    "  }",
    "}"
  ].join("\n");

  function compile(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
      throw new Error("shader: " + gl.getShaderInfoLog(s) + "\n" + src);
    return s;
  }
  function program(gl, vs, fs) {
    var p = gl.createProgram();
    gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vs));
    gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
    // pin the attribute slots so a single VAO works for every program
    gl.bindAttribLocation(p, 0, "aPos");
    gl.bindAttribLocation(p, 1, "aNormal");
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS))
      throw new Error("link: " + gl.getProgramInfoLog(p));
    return p;
  }
  function uni(gl, p) {
    var n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS), u = {};
    for (var i = 0; i < n; i++) {
      var info = gl.getActiveUniform(p, i);
      u[info.name] = gl.getUniformLocation(p, info.name);
    }
    return u;
  }

  /* --- mount ------------------------------------------------------------ */
  function mount(canvas, cfg) {
    cfg = Object.assign({}, DEFAULTS, cfg || {});
    var gl = canvas.getContext("webgl2", {
      antialias: true, alpha: !cfg.bgOpaque,
      premultipliedAlpha: true, depth: true
    });
    if (!gl) { canvas.setAttribute("data-nogl", "1"); return null; }

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // programs
    var pFill, pOut, pWire, pBg;
    try {
      pFill = program(gl, VERT, FRAG);
      pOut = program(gl, VERT_OUT, FRAG_SOLID);
      pWire = program(gl, VERT, FRAG_SOLID);
      pBg = program(gl, VERT_BG, FRAG_BG);
    } catch (e) {
      if (window.console) console.error(e);
      canvas.setAttribute("data-nogl", "1");
      return null;
    }
    var uFill = uni(gl, pFill), uOut = uni(gl, pOut),
      uWire = uni(gl, pWire), uBg = uni(gl, pBg);

    // geometry -> buffers
    var g = annulus(cfg.outerR, cfg.outerR * cfg.innerRatio, cfg.height, 150);
    var vboP = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboP);
    gl.bufferData(gl.ARRAY_BUFFER, g.pos, gl.STATIC_DRAW);
    var vboN = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboN);
    gl.bufferData(gl.ARRAY_BUFFER, g.nrm, gl.STATIC_DRAW);
    var ebo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, g.idx, gl.STATIC_DRAW);
    var lbo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lbo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, g.line, gl.STATIC_DRAW);

    // Every program declares the attributes in the same order, so aPos and
    // aNormal land at locations 0 and 1 across all of them. One VAO therefore
    // serves every pass; only the program and the element buffer change. (Three
    // separate per-program VAOs silently sourced no vertex data — this is the
    // robust version.)
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, vboP);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, vboN);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    // colours
    var cBase = hex(cfg.baseColor), cFres = hex(cfg.fresColor),
      cOut = hex(cfg.outlineColor), cTop = hex(cfg.bgTop), cBot = hex(cfg.bgBottom);
    var cWire = hex(cfg.wireColor || cfg.fresColor);
    var light = cfg.lightDir;

    // per-ring transforms
    var N = cfg.count;
    var zPos = [], scale = [];
    for (var i = 0; i < N; i++) {
      zPos.push((i - (N - 1) / 2) * cfg.spacing);
      scale.push(Math.pow(cfg.falloff, (N - 1) - i));
    }

    /* --- physics state -------------------------------------------------- */
    var rx = cfg.baseTiltX, ry = cfg.baseTiltY, vrx = 0, vry = 0;
    var pX = 0, pY = 0, spin = 0;
    var lastMove = (typeof performance !== "undefined" ? performance.now() : Date.now());

    function onMove(e) {
      var r = canvas.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return;
      pX = ((e.clientX - r.left) / r.width) * 2 - 1;
      pY = ((e.clientY - r.top) / r.height) * 2 - 1;
      pX = Math.max(-1, Math.min(1, pX));
      pY = Math.max(-1, Math.min(1, pY));
      lastMove = (typeof performance !== "undefined" ? performance.now() : Date.now());
    }
    window.addEventListener("pointermove", onMove, { passive: true });

    /* --- sizing --------------------------------------------------------- */
    var W = 1, H = 1, proj = perspective(cfg.fov * Math.PI / 180, 1, 0.1, 100);
    function resize() {
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      var cw = canvas.clientWidth || 1, chh = canvas.clientHeight || 1;
      var w = Math.max(1, Math.round(cw * dpr)), h = Math.max(1, Math.round(chh * dpr));
      if (w !== canvas.width || h !== canvas.height) {
        canvas.width = w; canvas.height = h;
      }
      W = w; H = h;
      proj = perspective(cfg.fov * Math.PI / 180, W / H, 0.1, 100);
    }
    resize();
    window.addEventListener("resize", resize);

    /* --- draw ----------------------------------------------------------- */
    var view = translation(0, 0, -cfg.camDist);
    var camPos = [0, 0, cfg.camDist];

    function frame(model, mvp) {
      gl.viewport(0, 0, W, H);

      // alignment: bloom the glow as the holes line up with the view axis
      var align = Math.max(0, Math.min(1, 1 - (Math.abs(rx) + Math.abs(ry - spin)) / 0.5));

      // background --------------------------------------------------------
      gl.disable(gl.DEPTH_TEST);
      gl.depthMask(false);
      if (cfg.bgOpaque) {
        gl.disable(gl.BLEND);
        gl.clearColor(cBot[0], cBot[1], cBot[2], 1);
      } else {
        gl.clearColor(0, 0, 0, 0);
      }
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      gl.useProgram(pBg);
      if (!cfg.bgOpaque) { gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE); }
      gl.uniform3fv(uBg.uTop, cTop); gl.uniform3fv(uBg.uBottom, cBot);
      gl.uniform1f(uBg.uVignette, cfg.vignette);
      gl.uniform1f(uBg.uGlow, (0.05 + 0.22 * align) * (cfg.bgOpaque ? 1 : 1));
      gl.uniform1f(uBg.uOpaque, cfg.bgOpaque ? 1 : 0);
      gl.uniform1f(uBg.uAspect, W / H);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.disable(gl.BLEND);

      // rings — fill (cull back) -----------------------------------------
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LESS);
      gl.depthMask(true);
      gl.enable(gl.CULL_FACE);
      gl.frontFace(gl.CCW);

      gl.useProgram(pFill);
      gl.uniform3fv(uFill.uCam, camPos);
      gl.uniform3fv(uFill.uBgTop, cTop);
      gl.uniform3fv(uFill.uBgBottom, cBot);
      gl.uniform3fv(uFill.uBase, cBase);
      gl.uniform3fv(uFill.uFres, cFres);
      gl.uniform3fv(uFill.uLight, light);
      gl.uniform1f(uFill.uMetal, cfg.metal);
      gl.uniform1f(uFill.uSpecStr, cfg.specStr);
      gl.uniform1f(uFill.uSpecPow, cfg.specPow);
      gl.uniform1f(uFill.uFresStr, cfg.fresStr);
      gl.uniform1f(uFill.uToon, cfg.toon);
      gl.uniform1f(uFill.uFog, cfg.fog);
      gl.cullFace(gl.BACK);
      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
      for (i = 0; i < N; i++) {
        var m = model(i);
        gl.uniformMatrix4fv(uFill.uModel, false, m);
        gl.uniformMatrix4fv(uFill.uMVP, false, mvp(m));
        gl.drawElements(gl.TRIANGLES, g.idx.length, gl.UNSIGNED_SHORT, 0);
      }

      // ink outline — inverted hull: draw the back faces, pushed out along the
      // normal, flat in ink. The extrude is divided by the ring's own scale so
      // every ring gets the same world-space silhouette width.
      if (cfg.outline) {
        gl.useProgram(pOut);
        gl.uniform3fv(uOut.uColor, cOut);
        gl.uniform1f(uOut.uAlpha, 1);
        gl.cullFace(gl.FRONT);
        gl.bindVertexArray(vao);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
        for (i = 0; i < N; i++) {
          var mo = model(i);
          gl.uniformMatrix4fv(uOut.uMVP, false, mvp(mo));
          gl.uniform1f(uOut.uExtrude, cfg.outlineWidth / scale[i]);
          gl.drawElements(gl.TRIANGLES, g.idx.length, gl.UNSIGNED_SHORT, 0);
        }
        gl.cullFace(gl.BACK);
      }

      // wireframe overlay --------------------------------------------------
      if (cfg.wire) {
        gl.disable(gl.CULL_FACE);
        gl.depthFunc(gl.LEQUAL);
        gl.useProgram(pWire);
        gl.uniform3fv(uWire.uColor, cWire);
        gl.uniform1f(uWire.uAlpha, cfg.wireAlpha);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.bindVertexArray(vao);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lbo);
        for (i = 0; i < N; i++) {
          var mw = model(i);
          gl.uniformMatrix4fv(uWire.uModel, false, mw);
          gl.uniformMatrix4fv(uWire.uMVP, false, mvp(mw));
          gl.drawElements(gl.LINES, g.line.length, gl.UNSIGNED_SHORT, 0);
        }
        gl.disable(gl.BLEND);
        gl.depthFunc(gl.LESS);
        gl.enable(gl.CULL_FACE);
      }
      gl.bindVertexArray(null);
    }

    /* --- loop ----------------------------------------------------------- */
    var running = false, raf = 0, last = 0;
    function tick(t) {
      if (!running) return;
      var now = t || 0;
      var dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
      last = now;

      // spring targets from the pointer
      var tRX = cfg.baseTiltX - pY * cfg.rangeX;
      var tRY = cfg.baseTiltY + pX * cfg.rangeY;

      // idle drift once the pointer has been still (~1.6s); off under reduced motion
      if (!reduce) {
        var idleFor = now - lastMove;
        if (idleFor > 1600) {
          var s = (now / 1000);
          tRX += Math.sin(s * 0.6) * cfg.idle;
          tRY += Math.cos(s * 0.45) * cfg.idle;
        }
        if (cfg.autoRotate) spin += cfg.autoSpeed * dt;
      }

      var k = cfg.stiffness, c = cfg.damping;
      vrx += ((tRX - rx) * k - vrx * c) * dt; rx += vrx * dt;
      vry += ((tRY + spin - ry) * k - vry * c) * dt; ry += vry * dt;

      resize();
      var groupRot = mul(rotX(rx), rotY(ry));
      function model(i) { return mul(mul(groupRot, translation(0, 0, zPos[i])), scaling(scale[i])); }
      function mvp(m) { return mul(proj, mul(view, m)); }
      frame(model, mvp);

      raf = requestAnimationFrame(tick);
    }
    function play() { if (!running) { running = true; last = 0; raf = requestAnimationFrame(tick); } }
    function pause() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }

    // pause when the tab is hidden, and when the band scrolls out of view
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) pause(); else if (visible) play();
    });
    var visible = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        visible = en[0].isIntersecting;
        if (visible && !document.hidden) play(); else pause();
      }, { threshold: 0 }).observe(canvas);
    } else {
      play();
    }
    play();

    return { play: play, pause: pause };
  }

  window.Rings = { mount: mount, DEFAULTS: DEFAULTS };

  // auto-mount: #rings canvas, config from window.__RINGS_CFG
  function boot() {
    var c = document.getElementById("rings");
    if (c && c.getContext) mount(c, window.__RINGS_CFG || {});
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
