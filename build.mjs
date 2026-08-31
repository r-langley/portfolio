// ---------------------------------------------------------------------------
// build.mjs — generates the static site from content/.
//   node build.mjs
// Outputs: index.html, approach.html, writing.html, work/<slug>.html,
//          preview.html (single-file clickable build of the whole site)
// ---------------------------------------------------------------------------

import { writeFile, mkdir, readFile, cp } from "node:fs/promises";
import { site, categories, approach } from "./content/site.mjs";
import { cases, archive } from "./content/cases.mjs";

const OUT = new URL("./", import.meta.url).pathname;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const tk = (s) =>
  String(s).replace(/\bTK\b/g, '<span class="tk">TK</span>');

/* --- icons ---------------------------------------------------------------- */
const I = {
  arrow: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 7h8M7.5 3.5 11 7l-3.5 3.5"/></svg>`,
  chev: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m4.5 2.5 4 3.5-4 3.5"/></svg>`,
  back: `<svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M11 7H3M6.5 3.5 3 7l3.5 3.5"/></svg>`,
  theme: `<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="3.2"/><path d="M8 1v1.6M8 13.4V15M15 8h-1.6M2.6 8H1M12.9 3.1l-1.1 1.1M4.2 11.8l-1.1 1.1M12.9 12.9l-1.1-1.1M4.2 4.2 3.1 3.1"/></svg>`,
  burger: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 4.5h12M2 8h12M2 11.5h12"/></svg>`,
};


/* --- resume / context markdown ------------------------------------------- */
// Copied to the clipboard on Cmd/Ctrl-K. Written so a visitor can paste it
// into any assistant and ask about Ross's work. Built from the same content
// the page renders, so it never drifts. TK-valued outcomes are omitted rather
// than shipped as fake numbers.
function buildResumeMarkdown() {
  const L = [];
  L.push(`# ${site.name} — ${site.role}`);
  L.push("");
  L.push(`${site.location} · ${site.email}`);
  L.push("");
  L.push("> Paste this into any AI assistant and ask about my work, my approach, or a specific project. It is a living résumé and context file.");
  L.push("");
  L.push("## In one line");
  L.push(site.hero.deck);
  L.push("");
  L.push("## Point of view");
  for (const it of site.principles.items) {
    L.push(`- **${it.title.replace(/<[^>]+>/g, "")}** — ${it.body}`);
  }
  L.push("");
  L.push("## Selected work");
  const clean = (x) => String(x).replace(/<[^>]+>/g, "");
  const ordered = [...cases].sort((a, b) => a.order - b.order);
  for (const c of ordered) {
    L.push("");
    L.push(`### ${clean(c.title)}`);
    L.push(`${c.company} · ${c.role} · ${c.period}`.replace(/TK/g, "—"));
    L.push("");
    L.push(clean(c.deck));
    const outs = c.outcomes.filter((o) => !/\bTK\b/.test(o.value));
    if (outs.length) {
      L.push("");
      for (const o of outs) L.push(`- ${clean(o.value)} — ${clean(o.label)}`);
    }
    const problem = c.sections.find((x) => x.kind === "problem");
    if (problem && problem.body) { L.push(""); L.push(clean(problem.body[0])); }
  }
  L.push("");
  L.push("## Approach, in full");
  for (const b of approach.blocks) {
    if (b.kind === "quote") { L.push(""); L.push(`> ${b.text}`); continue; }
    if (b.heading === "Colophon") continue;
    L.push("");
    L.push(`### ${b.heading}`);
    (b.body || []).forEach((x) => L.push(clean(x)));
    (b.list || []).forEach((x) => L.push(`- ${clean(x)}`));
  }
  L.push("");
  L.push(`## Contact`);
  L.push(`${site.contact.heading} ${site.contact.body} — ${site.email}`);
  return L.join("\n");
}

/* --- hero image placeholders --------------------------------------------- */
const TONE_HEX = { indigo: "#4f46e5", teal: "#0d7a63", amber: "#a55a08" };

function heroImage(img) {
  // A real image, when the case supplies one. The src is RELATIVE (no leading
  // slash) on purpose: the site is served under /portfolio/, so an absolute
  // "/assets/…" would resolve to the host root and 404. The .hero-img container
  // holds the 2.25:1 ratio, so width/height here only hint intrinsic size (and
  // keep it CLS-free); object-fit: cover crops to the box. Cases without a src
  // fall through to the procedural placeholder below.
  if (img.src) {
    const src = String(img.src).replace(/^\/+/, ""); // guard a stray leading slash
    return `<div class="hero-img">
    <img src="${esc(src)}" alt="${esc(img.alt)}" width="2400" height="1068" loading="lazy" decoding="async">
  </div>`;
  }

  const c = TONE_HEX[img.tone] || "#4f46e5";
  const motifs = {
    grid: Array.from({ length: 90 }, (_, i) => {
      const x = 40 + (i % 15) * 78, y = 40 + Math.floor(i / 15) * 62;
      const o = (0.06 + ((i * 37) % 60) / 160).toFixed(2);
      return `<rect x="${x}" y="${y}" width="58" height="42" rx="6" fill="${c}" opacity="${o}"/>`;
    }).join(""),
    flow: Array.from({ length: 7 }, (_, i) => {
      const y = 60 + i * 52;
      return `<path d="M40 ${y} C 340 ${y - 46 + i * 8}, 780 ${y + 60 - i * 10}, 1160 ${y}" stroke="${c}" stroke-width="${1 + (i % 3)}" fill="none" opacity="${(0.18 + i * 0.09).toFixed(2)}"/>`;
    }).join("") + `<circle cx="600" cy="220" r="90" fill="${c}" opacity=".08"/>`,
    blocks: Array.from({ length: 22 }, (_, i) => {
      const w = 60 + ((i * 53) % 190), h = 30 + ((i * 29) % 90);
      const x = 40 + ((i * 137) % 1020), y = 40 + ((i * 91) % 340);
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${c}" opacity="${(0.08 + ((i * 17) % 40) / 160).toFixed(2)}"/>`;
    }).join(""),
    nodes: Array.from({ length: 26 }, (_, i) => {
      const x = 70 + ((i * 173) % 1060), y = 50 + ((i * 119) % 350);
      const x2 = 70 + (((i + 3) * 173) % 1060), y2 = 50 + (((i + 3) * 119) % 350);
      return `<line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="1" opacity=".18"/><circle cx="${x}" cy="${y}" r="${4 + (i % 5) * 2}" fill="${c}" opacity="${(0.2 + (i % 5) * 0.12).toFixed(2)}"/>`;
    }).join(""),
    arcs: Array.from({ length: 9 }, (_, i) =>
      `<circle cx="600" cy="470" r="${90 + i * 62}" fill="none" stroke="${c}" stroke-width="${i % 2 ? 1 : 2}" opacity="${(0.34 - i * 0.03).toFixed(2)}"/>`
    ).join("") + `<circle cx="600" cy="470" r="18" fill="${c}" opacity=".55"/>`,
  };
  return `<div class="hero-img">
    <svg viewBox="0 0 1200 470" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(img.alt)}">
      <rect width="1200" height="470" fill="${c}" opacity=".05"/>
      ${motifs[img.motif] || motifs.grid}
    </svg>
    <span class="hero-img__note">Hero image slot — replace</span>
  </div>`;
}


// Cmd/Ctrl-K clipboard payload + the toast it flashes. `<` is escaped so a
// stray "</script>" in the content can never close the tag early.
const resumeInject = () => `<div class="toast" id="copyToast" role="status" aria-live="polite">Context copied — paste into any AI to ask about my work</div>
<script>window.__RESUME_MD = ${JSON.stringify(buildResumeMarkdown()).replace(/</g, "\\u003c")};</script>`;

/* --- chrome --------------------------------------------------------------- */
const nav = () => `
<header class="nav">
  <div class="wrap nav__in">
    <button class="nav__theme" id="themebtn" aria-label="Toggle theme">${I.theme}</button>
    <a class="nav__mark" href="/index.html"><b>ROSS</b> <span>Product Design &amp; Agentic Systems</span></a>
    <div class="nav__act">
      <a href="mailto:${site.email}" class="is-primary">Get in touch</a>
    </div>
  </div>
</header>`;

const footer = () => `
<footer class="foot">
  <div class="wrap">
    <div class="foot__grid">
      <div>
        <div class="foot__mark">${esc(site.name)}</div>
        <p class="foot__blurb">${esc(site.role)} — operational, agentic and regulated products. ${esc(site.location)}.</p>
      </div>
      ${site.footer.columns.map((c) => `
      <div>
        <h4>${esc(c.title)}</h4>
        <ul>${c.links.map((l) => `<li><a href="${l.href}">${esc(l.label)}</a></li>`).join("")}</ul>
      </div>`).join("")}
    </div>
    <div class="foot__base">
      <span>© ${new Date().getFullYear()} ${esc(site.name)}</span>
      <span>Shell build — content model not yet wired to a CMS</span>
    </div>
  </div>
</footer>`;

const page = (title, body, { hero = false } = {}) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/site.css">
</head>
<body>
${nav()}
${body}
${resumeInject()}
${hero ? `<script>window.__RINGS_CFG={bgOpaque:false,outlineWidth:0.012,wireColor:"#8a8c84",wireAlpha:0.55,camDist:9.5};</script>
<script src="/assets/hero.js"></script>
<script src="/assets/rings.js"></script>` : ""}
<script src="/assets/site.js"></script>
</body>
</html>`;

/* --- home ----------------------------------------------------------------- */
// Each character needs its own box so the physics can measure the glyph, but
// bare inline-block spans make every character a line-break opportunity. Words
// are wrapped in a nowrap unit so the headline still breaks on spaces only.
const glyphs = (line) =>
  line
    .split(" ")
    .map((w) => `<span class="wd">${[...w].map((ch) => `<span class="gl">${esc(ch)}</span>`).join("")}</span>`)
    .join(" ");

function heroSection() {
  return `
<section class="hero" id="hero">
  <div class="hero__stage" id="stage"></div>
  <div class="wrap hero__in">
    <button class="kpill" id="copyCtx" type="button" aria-label="Copy résumé and context for your agent">
      <kbd class="kkey" data-kmod>⌘</kbd><span class="kplus">+</span><kbd class="kkey">K</kbd>
      <span class="kpill__label">copy for your agent</span>
    </button>
    <h1>${site.hero.headline.map((l) => `<span class="ln">${glyphs(l)}</span>`).join("")}</h1>
    <p class="hero__deck">${esc(site.hero.deck)}</p>
    <div class="hero__ctas">
      ${site.hero.ctas.map((c) => `<a class="btn${c.primary ? " btn--primary" : ""}" href="${c.href}">${esc(c.label)} ${c.primary ? I.arrow : ""}</a>`).join("")}
    </div>
  </div>
</section>`;
}

function stripSection() {
  const items = site.strip.items
    .map((i) => `<div class="strip__item"><b>${esc(i.name)}</b><span>${esc(i.note)}</span></div>`)
    .join("");
  return `
<section class="strip">
  <div class="wrap strip__in">
    <div class="strip__label mono">${esc(site.strip.label)}</div>
    <div class="strip__vp"><div class="strip__track">${items}${items}</div></div>
  </div>
</section>`;
}

function card(c) {
  const cat = categories[c.category];
  return `
<a class="card tone-${cat.tone}" href="/work/${c.slug}.html">
  <h3>${tk(esc(c.title))}</h3>
  <p>${tk(esc(c.deck))}</p>
  <div class="card__out">
    ${c.outcomes.slice(0, 2).map((o) => `<div><span class="out__v">${tk(esc(o.value))}</span><span class="out__l">${esc(o.label)}</span></div>`).join("")}
  </div>
  <div class="card__foot">
    <span class="tag tone-${cat.tone}">${esc(cat.label)}</span>
    <span class="card__yr">${esc(c.foot || c.company)}</span>
  </div>
</a>`;
}

function tableRow(c) {
  const cat = categories[c.category];
  return `
<a class="trow" href="/work/${c.slug}.html">
  <span class="trow__t">${esc(c.company)}<small>${esc(c.period)}</small></span>
  <span class="trow__t">${tk(esc(c.title))}<small>${esc(c.role)}</small></span>
  <span class="trow__o">${tk(esc(c.outcomes[0].value))} ${esc(c.outcomes[0].label)}</span>
  <span class="tag tone-${cat.tone}">${esc(cat.label.split(" ")[0])}</span>
</a>`;
}

function workSection() {
  const ordered = [...cases].sort((a, b) => a.order - b.order);
  const featured = ordered.filter((c) => c.featured);
  return `
<section class="sec" id="work">
  <div class="wrap">
    <div class="sec__head">
      <h2 class="h2">Problems, and what changed after.</h2>
    </div>
    <div class="cards">${featured.map(card).join("")}</div>
  </div>
</section>`;
}

function archiveSection() {
  return `
<section class="sec sec--tight" id="archive">
  <div class="wrap">
    <div class="sec__head">
      <h2 class="h2">Everything else, grouped by the kind of problem.</h2>
    </div>
    <div class="arch">
      ${archive.map((g, i) => `
      <div class="arch__grp" data-open="${i === 0}">
        <button class="arch__hd" aria-expanded="${i === 0}">
          <h3>${esc(g.group)}</h3>
          <span class="arch__ct">${g.rows.length}</span>
          <span class="arch__chev">${I.chev}</span>
        </button>
        <div class="arch__body"><div class="arch__inner">
          ${g.rows.map((r) => `
          <a class="arow" href="${r.href}">
            <span class="arow__t">${tk(esc(r.title))}</span>
            <span class="arow__n">${tk(esc(r.note))}</span>
            <span class="arow__o">${esc(r.org)}</span>
            <span class="arow__y">${tk(esc(r.year))}</span>
          </a>`).join("")}
        </div></div>
      </div>`).join("")}
    </div>
  </div>
</section>`;
}

function principlesSection() {
  return `
<section class="sec">
  <div class="wrap">
    <h2 class="h2" style="margin-bottom:34px">${esc(site.principles.heading)}</h2>
  </div>
  <div class="wrap">
    <div class="rings-band">
      <canvas id="rings" aria-hidden="true"></canvas>
    </div>
  </div>
  <div class="wrap"><div class="prin">
    ${site.principles.items.map((p) => `
    <div class="prin__i">
      <div class="prin__n">${esc(p.n)}</div>
      <h3>${esc(p.title)}</h3>
      <p>${esc(p.body)}</p>
    </div>`).join("")}
  </div></div>
</section>`;
}

function ctaSection() {
  return `
<section class="sec sec--tight">
  <div class="wrap">
    <div class="cta">
      <div class="cta__blob" id="ctaBlob" aria-hidden="true">
        <svg viewBox="0 0 100 100" width="100" height="100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#4f46e5"/>
          <g class="blob__eyes" id="ctaEyes">
            <ellipse cx="37" cy="45" rx="10.5" ry="12.5" fill="#ffffff"/>
            <ellipse cx="63" cy="45" rx="10.5" ry="12.5" fill="#ffffff"/>
            <g id="ctaPupils">
              <circle cx="37" cy="47" r="4.8" fill="#14150f"/>
              <circle cx="63" cy="47" r="4.8" fill="#14150f"/>
            </g>
          </g>
          <path d="M38 66c4 4.4 20 4.4 24 0" stroke="#ffffff" stroke-width="3.4" fill="none" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="cta__row">
        <div style="flex:1 1 380px">
          <h2>${esc(site.contact.heading)}</h2>
          <p>${esc(site.contact.body)}</p>
        </div>
        <div class="hero__ctas" style="margin:0">
          <a class="btn btn--primary" href="mailto:${site.contact.email}">${esc(site.contact.email)} ${I.arrow}</a>
          <a class="btn" href="#">Résumé</a>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

const homeBody = () =>
  `<div class="stage">${heroSection()}${stripSection()}</div>` + workSection() + archiveSection() + principlesSection() + ctaSection();

/* --- case study page ------------------------------------------------------ */
function caseBody(c) {
  const cat = categories[c.category];
  const ordered = [...cases].sort((a, b) => a.order - b.order);
  const idx = ordered.findIndex((x) => x.slug === c.slug);
  const next = ordered[(idx + 1) % ordered.length];

  const block = (s) =>
    s.kind === "quote"
      ? `<blockquote class="pull">${esc(s.text)}</blockquote>`
      : `
  <div class="blk">
    <h2>${esc(s.heading)}</h2>
    ${(s.body || []).map((p) => `<p>${tk(p)}</p>`).join("")}
    ${s.list ? `<ul>${s.list.map((li) => `<li>${tk(li)}</li>`).join("")}</ul>` : ""}
  </div>`;

  return `
<main>
  <div class="wrap case__top"><a class="back" href="/index.html">${I.back} All work</a></div>
  <div class="wrap case__hd">
    <div class="case__kicker">
      <span class="tag tone-${cat.tone}">${esc(cat.label)}</span>
      <span class="mono">${esc(c.company)} · ${esc(c.role)} · ${tk(esc(c.period))}</span>
    </div>
    <h1>${tk(esc(c.title))}</h1>
    <p class="case__deck">${tk(esc(c.deck))}</p>
  </div>
  <div class="wrap">
    ${heroImage(c.heroImage)}
    <div class="outbar">
      ${c.outcomes.map((o) => `<div class="outbar__i"><div class="outbar__v">${tk(esc(o.value))}</div><div class="outbar__l">${esc(o.label)}</div></div>`).join("")}
    </div>
  </div>
  <div class="wrap case__body">
    <div>${c.sections.map(block).join("")}</div>
    <aside class="case__meta">
      <dl>
        ${c.meta.map((m) => `<dt>${esc(m.k)}</dt><dd>${tk(esc(m.v))}</dd>`).join("")}
        <dt>Tags</dt>
        <dd>${c.tags.map((t) => `<span class="tag">${tk(esc(t))}</span>`).join(" ")}</dd>
      </dl>
    </aside>
  </div>
  <div class="wrap">
    <div class="nextcase">
      <div><div class="mono" style="margin-bottom:6px">Next</div><b>${tk(esc(next.company))} — ${tk(esc(next.title))}</b></div>
      <a class="btn" href="/work/${next.slug}.html">Read it ${I.arrow}</a>
    </div>
  </div>
</main>`;
}

/* --- static prose pages --------------------------------------------------- */
const approachBlock = (b) =>
  b.kind === "quote"
    ? `<blockquote class="pull pull--wide">${esc(b.text)}</blockquote>`
    : `
  <section class="blk"${b.anchor ? ` id="${b.anchor}"` : ""}>
    <h2>${esc(b.heading)}</h2>
    ${(b.body || []).map((p) => `<p>${tk(p)}</p>`).join("")}
    ${b.list ? `<ul>${b.list.map((li) => `<li>${tk(li)}</li>`).join("")}</ul>` : ""}
    ${(b.after || []).map((p) => `<p>${tk(p)}</p>`).join("")}
  </section>`;

const approachBody = () => `
<main>
  <div class="wrap case__top"><a class="back" href="/index.html">${I.back} Home</a></div>
  <div class="wrap case__hd">
    <h1 style="margin-top:0">${esc(approach.title)}</h1>
    <p class="case__deck">${esc(approach.deck)}</p>
  </div>
  <div class="wrap"><div class="prose prose--wide">
    ${approach.blocks.map(approachBlock).join("")}
  </div></div>
</main>`;

const writingBody = () => `
<main class="wrap"><div class="prose">
  <h1>Writing</h1>
  <p>Placeholder page. Intent-driven design, the collapse of the designer–developer handoff, and what agentic products do to interface conventions.</p>
  <ul>
    <li><span class="tk">TK</span> — post one</li>
    <li><span class="tk">TK</span> — post two</li>
    <li><span class="tk">TK</span> — post three</li>
  </ul>
</div></main>`;

/* --- assemble pages (in memory) ------------------------------------------- */
const pages = [
  { file: "index.html", title: `${site.name} — ${site.role}`, body: homeBody(), hero: true, id: "home" },
  { file: "approach.html", title: `Approach — ${site.name}`, body: approachBody(), id: "approach" },
  { file: "writing.html", title: `Writing — ${site.name}`, body: writingBody(), id: "writing" },
  ...cases.map((c) => ({
    file: `work/${c.slug}.html`,
    title: `${c.company} — ${site.name}`,
    body: caseBody(c),
    id: `work-${c.slug}`,
  })),
];

/* --- shared single-file body ---------------------------------------------- */
// One self-contained document holds every page as a section; a tiny client
// router maps the multi-page hrefs onto them. No absolute asset paths, so it
// runs unchanged at any URL depth (a GitHub Pages project subpath included).
const css = await readFile(OUT + "assets/site.css", "utf8");
const js = await readFile(OUT + "assets/site.js", "utf8");
const heroJs = await readFile(OUT + "assets/hero.js", "utf8");
const ringsJs = await readFile(OUT + "assets/rings.js", "utf8");

const FONTS =
  `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">`;

const innerBody = `<style>${css}
.pg{display:none}.pg.is-on{display:block}</style>
${pages
  .map(
    (p) => `<div class="pg${p.id === "home" ? " is-on" : ""}" data-pg="${p.id}">${nav()}${p.body}</div>`
  )
  .join("\n")}
${resumeInject()}
<script>
// client router: maps the multi-page hrefs onto in-document sections
(function(){
  var map={"/index.html":"home","/approach.html":"approach","/writing.html":"writing"};
  ${JSON.stringify(cases.map((c) => c.slug))}.forEach(function(s){ map["/work/"+s+".html"]="work-"+s; });
  function show(id,anchor){
    var pgs=document.querySelectorAll(".pg");
    for(var i=0;i<pgs.length;i++) pgs[i].classList.toggle("is-on",pgs[i].dataset.pg===id);
    var t=anchor&&document.querySelector('.pg.is-on '+anchor);
    if(t) t.scrollIntoView({behavior:"smooth"}); else window.scrollTo(0,0);
  }
  document.addEventListener("click",function(e){
    var a=e.target.closest&&e.target.closest("a[href]"); if(!a) return;
    var h=a.getAttribute("href");
    if(!h||h.indexOf("mailto:")===0) return;
    if(h.charAt(0)==="#"){ return; }
    var hash=""; var base=h;
    var hi=h.indexOf("#"); if(hi>-1){ base=h.slice(0,hi); hash=h.slice(hi); }
    if(base==="/"||base==="") base="/index.html";
    if(map[base]!==undefined){ e.preventDefault(); show(map[base],hash||null); }
    else if(h==="#"){ e.preventDefault(); }
  });
})();
</script>
<script>${js}</script>
<script>${heroJs}</script>
<script>window.__RINGS_CFG={bgOpaque:false,outlineWidth:0.012,wireColor:"#8a8c84",wireAlpha:0.55,camDist:9.5};</script>
<script>${ringsJs}</script>`;

// Artifact fragment (wrapped by the runtime skeleton at publish time).
const preview = `<title>${esc(site.name)} Portfolio</title>
${FONTS}
${innerBody}
`;
await writeFile(OUT + "preview.html", preview);

/* --- dist/ (deployable, static host) -------------------------------------- */
// Full standalone document: proper head + noindex (site stays unlisted) so it
// serves correctly from GitHub Pages without any base-path handling.
const DIST = OUT + "dist/";
await mkdir(DIST + "assets", { recursive: true });

const siteIndex = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(site.name)} — ${esc(site.role)}</title>
${FONTS}
</head>
<body>
${innerBody}
</body>
</html>`;
await writeFile(DIST + "index.html", siteIndex);

// standalone WebGL ring tunnel (spec-exact, opaque) — reproducible in the build
const ringTunnel = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Ring Tunnel</title>
<style>
  html,body{margin:0;height:100%;background:#ededed;overflow:hidden}
  #rings{display:block;width:100vw;height:100vh;cursor:grab}
</style>
</head>
<body>
<canvas id="rings"></canvas>
<script>${ringsJs}</script>
</body>
</html>`;
await writeFile(DIST + "ring-tunnel.html", ringTunnel);
await writeFile(OUT + "ring-tunnel.html", ringTunnel); // convenience copy at root

// copy source assets into dist (case images live here; css/js are already
// inlined, but shipping them keeps the folder self-describing for later)
await cp(OUT + "assets", DIST + "assets", { recursive: true });

// static-host housekeeping: skip Jekyll, keep the site out of search indexes
await writeFile(DIST + ".nojekyll", "");
await writeFile(DIST + "robots.txt", "User-agent: *\nDisallow: /\n");

console.log("built dist/ — " + pages.length + " pages in one self-contained index.html");
