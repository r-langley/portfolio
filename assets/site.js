/* site.js — nav, theme, view toggle, archive groups. No dependencies. */
(function () {
  "use strict";

  /* theme -------------------------------------------------------------- */
  var KEY = "rl-theme";
  try {
    var saved = localStorage.getItem(KEY);
    if (saved) document.documentElement.setAttribute("data-theme", saved);
  } catch (e) {}

  var tbtn = document.getElementById("themebtn");
  if (tbtn) {
    tbtn.addEventListener("click", function () {
      var cur = document.documentElement.getAttribute("data-theme");
      var isDark =
        cur === "dark" ||
        (!cur && window.matchMedia("(prefers-color-scheme: dark)").matches);
      var next = isDark ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
    });
  }

  /* sticky nav border --------------------------------------------------- */
  var nav = document.querySelector(".nav");
  if (nav) {
    var onScroll = function () {
      nav.setAttribute("data-stuck", window.scrollY > 8 ? "true" : "false");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* mobile menu --------------------------------------------------------- */
  var burger = document.getElementById("burger");
  var links = document.getElementById("navlinks");
  if (burger && links) {
    burger.addEventListener("click", function () {
      links.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", links.classList.contains("is-open"));
    });
  }

  /* grid / table view toggle -------------------------------------------- */
  var work = document.getElementById("work");
  if (work) {
    var btns = work.querySelectorAll("[data-view]");
    Array.prototype.forEach.call(btns, function (b) {
      b.addEventListener("click", function () {
        var v = b.getAttribute("data-view");
        work.classList.toggle("is-table", v === "table");
        Array.prototype.forEach.call(btns, function (o) {
          o.setAttribute("aria-pressed", o === b ? "true" : "false");
        });
      });
    });
  }

  /* archive accordion --------------------------------------------------- */
  Array.prototype.forEach.call(
    document.querySelectorAll(".arch__hd"),
    function (hd) {
      hd.addEventListener("click", function () {
        var g = hd.closest(".arch__grp");
        var open = g.getAttribute("data-open") === "true";
        g.setAttribute("data-open", open ? "false" : "true");
        hd.setAttribute("aria-expanded", open ? "false" : "true");
      });
    }
  );


  /* cta blob — eyes follow the cursor, blink now and then ---------------- */
  (function () {
    var blob = document.getElementById("ctaBlob");
    var pupils = document.getElementById("ctaPupils");
    var eyes = document.getElementById("ctaEyes");
    if (!blob || !pupils) return;

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var MAX = 4.2;                 // max pupil travel, in SVG units
    var tx = 0, ty = 0, cx = 0, cy = 0, queued = false;

    function centre() {
      var r = blob.getBoundingClientRect();
      cx = r.left + r.width / 2;
      cy = r.top + r.height / 2;
    }

    function apply() {
      queued = false;
      // gaze toward the pointer, clamped to a small radius so the eyes never
      // pop out of their whites; SVG units, so it scales with the blob size
      var dx = tx - cx, dy = ty - cy;
      var d = Math.sqrt(dx * dx + dy * dy) || 1;
      var m = Math.min(MAX, d / 22);
      pupils.setAttribute("transform",
        "translate(" + (dx / d * m).toFixed(2) + " " + (dy / d * m + 1.4).toFixed(2) + ")");
    }

    centre();
    window.addEventListener("scroll", centre, { passive: true });
    window.addEventListener("resize", centre);
    window.addEventListener("pointermove", function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!queued) { queued = true; requestAnimationFrame(apply); }
    }, { passive: true });

    // blink: a quick squash, at a natural irregular cadence
    if (!reduce && eyes) {
      var blink = function () {
        blob.classList.add("is-blink");
        setTimeout(function () { blob.classList.remove("is-blink"); }, 110);
        setTimeout(blink, 2600 + Math.random() * 3800);
      };
      setTimeout(blink, 1200 + Math.random() * 2000);
    }
  })();


  /* cmd/ctrl-K copies the resume + context markdown ---------------------- */
  (function () {
    var mac = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
    // the modifier keycap reads ⌘ on Apple, Ctrl elsewhere
    var mods = document.querySelectorAll("[data-kmod]");
    for (var i = 0; i < mods.length; i++) mods[i].textContent = mac ? "\u2318" : "Ctrl";

    var toast = document.getElementById("copyToast");
    var btn = document.getElementById("copyCtx");
    var toastT = null;

    function flash() {
      if (!toast) return;
      toast.classList.add("is-on");
      clearTimeout(toastT);
      toastT = setTimeout(function () { toast.classList.remove("is-on"); }, 2600);
    }

    function copy() {
      var md = window.__RESUME_MD || "";
      if (!md) return;
      var done = function () {
        flash();
        if (btn) {
          btn.classList.add("is-copied");
          setTimeout(function () { btn.classList.remove("is-copied"); }, 1600);
        }
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(md).then(done, fallback);
      } else { fallback(); }
      function fallback() {
        try {
          var ta = document.createElement("textarea");
          ta.value = md; ta.setAttribute("readonly", "");
          ta.style.position = "fixed"; ta.style.top = "-9999px";
          document.body.appendChild(ta); ta.select();
          document.execCommand("copy"); document.body.removeChild(ta);
          done();
        } catch (e) {}
      }
    }

    if (btn) btn.addEventListener("click", copy);
    window.addEventListener("keydown", function (e) {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        copy();
      }
    });
  })();
})();
