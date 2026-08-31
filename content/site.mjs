// ---------------------------------------------------------------------------
// site.mjs — global content. This is the CMS seam: everything the templates
// render comes from here or from cases.mjs.
// ---------------------------------------------------------------------------

export const site = {
  name: "Ross Langley",
  wordmark: "ross langley",
  role: "Product Design Director",
  domain: "rosslangley.com",
  email: "rlangley07@gmail.com",
  location: "Coral Springs, FL",

  hero: {
    // Each string is one line of the headline. Characters land on these glyphs.
    headline: ["Design that survives", "contact with the floor"],
    deck:
      "I grow products and teams for high-urgency, regulated environments where issues cascade and forgiveness is lost credibility.",
    ctas: [
      { label: "Read the work", href: "#work", primary: true },
      { label: "Résumé", href: "#", primary: false },
    ],
  },

  nav: {
    // Sub-pages intentionally absent — the home page carries the whole story.
    primary: [],
    actions: [
      { label: "résumé", href: "#" },
      { label: "get in touch", href: "mailto:rlangley07@gmail.com", primary: true },
    ],
  },

  strip: {
    label: "Recent",
    items: [
      { name: "Fresh Technology", note: "Head of Product Design: KDS, enterprise config, org brain" },
      { name: "Lolo", note: "Product Engineer: agentic workflows for wealth advisors" },
      { name: "Bonsai", note: "Embedded AI search — generative component library" },
      { name: "Sygma", note: "Agents for hardware engineering ops" },
      { name: "Viasat", note: "Satellite connectivity for Delta and American Airlines" },
      { name: "adidas", note: "Merged the web and mobile teams onto one system" },
      { name: "Reaktor", note: "Global operating strategy — Helsinki" },
    ],
  },

  // Three positions, not three adjectives. Each one is defensible in an
  // interview and each has a case study behind it.
  principles: {
    label: "Point of view",
    heading: "Point of view",
    items: [
      {
        n: "01",
        title: "Velocity is a systems property",
        body:
          "Not a process change. Coherent objects, properties and links — the semantics that let every stakeholder manipulate the same information — are what make a team fast. Make the wrong combination impossible to produce and you stop losing weeks to re-litigating decisions.",
      },
      {
        n: "02",
        title: "Design should be on the hook for a number it can move",
        body:
          "Most design orgs pick metrics they cannot influence and get judged on them anyway. Override rate on AI recommendations. Escalation rate — how often someone leaves the product to get an answer. Rework after submission. Two of those, agreed in advance, not assigned afterwards.",
      },
      {
        n: "03",
        title: "An agent can draft the screen; it cannot decide what the noun means",
        body:
          "Surfaces composed from known components are fair game — if the contracts are right, an agent cannot assemble something invalid. The object model is not. Neither is anything irreversible or legally attestable. Everyone claims the velocity half; the limit is the half worth stating.",
      },
    ],
  },

  contact: {
    heading: "Open to design leadership roles.",
    body:
      "Director and Head-of-Design roles in operational, agentic or regulated products. Happy to walk through any of these in depth — including the parts that did not work, which are usually the more useful conversation.",
    email: "rlangley07@gmail.com",
  },

  footer: {
    columns: [
      {
        title: "Browse",
        links: [
          { label: "Work", href: "/#work" },
          { label: "Archive", href: "/#archive" },
          { label: "Approach", href: "/approach.html" },
          { label: "Writing", href: "/writing.html" },
        ],
      },
      {
        title: "Elsewhere",
        links: [
          { label: "LinkedIn", href: "#" },
          { label: "Read.cv", href: "#" },
          { label: "GitHub", href: "#" },
          { label: "Figma", href: "#" },
        ],
      },
      {
        title: "Site",
        links: [
          { label: "Résumé (PDF)", href: "#" },
          { label: "Colophon", href: "/approach.html#colophon" },
          { label: "Email", href: "mailto:rlangley07@gmail.com" },
        ],
      },
    ],
  },
};

export const categories = {
  agentic:   { label: "Agentic systems",      tone: "indigo" },
  operations:{ label: "Operational software", tone: "teal" },
  operating: { label: "Operating models",     tone: "amber" },
};

// ---------------------------------------------------------------------------
// approach.html — the long-form argument. Blocks render in order.
// ---------------------------------------------------------------------------
export const approach = {
  title: "Approach",
  deck:
    "What I believe about design leadership, in the terms I would defend it. Each of these has a case study behind it rather than a slide.",

  blocks: [
    { kind: "quote", text: "Button placement is what you should never have to talk about. If we are debating it, the system failed." },

    {
      kind: "section",
      heading: "System design",
      body: [
        "Design documentation now has two readers, people and agents, and the agents are less forgiving. A person routes silently around an ambiguity; an agent commits it confidently. That single fact changes what documentation is for — it stops being a record and becomes a contract.",
        "So the first questions I ask about a design system are not about components. What systems exist today, how are they composed, where do they live, how are they governed, and is there a shared context model underneath them? If two products disagree about what a core noun means, no component library reconciles them. The unification has to happen at the model.",
      ],
    },

    {
      kind: "section",
      heading: "Service ecosystem design",
      body: [
        "I studied this in Finland with the people who developed it, and it still shapes how I pick work. The premise: teams inside one organisation can each have real purpose and genuine customer focus and still be quietly working against each other — and sometimes the highest-leverage route to the customer runs through another team.",
        "Which is why I keep asking what design can do for the tooling of product management, engineering, customer success, marketing and recruiting. Design's leverage is rarely in setting the business outcome directly. It is in putting the organisation in the best possible shape to reach it. When a designer gets obsessed with button placement, this is what I remind them of — and then I change the incentive, because reminding people is not a mechanism.",
      ],
    },

    {
      kind: "section",
      heading: "What design should be measured on",
      body: [
        "Design is accountable when it is on the hook for a number it can actually move. Most design orgs pick metrics they cannot influence, then get judged on them anyway. The ones I would put my name to look like this:",
      ],
      list: [
        "<strong>Override rate on model recommendations.</strong> When an operator overrides, either the model was wrong or the interface failed to explain it. The second half belongs to design, and it is measurable.",
        "<strong>Time to first successful outcome</strong> for a new user in the workflow that matters most.",
        "<strong>Escalation rate</strong> — how often somebody has to leave the product to get an answer.",
        "<strong>Rework</strong> — how many entries get corrected after submission.",
      ],
      after: [
        "Two of those, agreed with the people I report to, not assigned to me after the fact. And on attribution I would rather be honest than clever: in enterprise, credit is always partly a story. What I can defend is the mechanism — what changed in the workflow and why that produced the number. Agreeing the mechanism up front beats arguing about credit afterwards.",
      ],
    },

    {
      kind: "section",
      heading: "Design in an AI-native SDLC",
      body: [
        "<strong>What AI drafts:</strong> surfaces composed from known components. If the contracts are right, an agent assembling a screen from them cannot produce something invalid — which is where the speed actually comes from. Training on constraints and rules beats training on examples.",
        "<strong>What AI must never decide:</strong> the object model. What a core noun <em>is</em>. Semantics, and anything irreversible or legally attestable.",
        "<strong>Where I would forbid it outright:</strong> anything that writes to the record of truth, anything that produces a legal attestation, anything a customer signs. Not because the model cannot — because when it is wrong you need to know exactly which human decided.",
      ],
    },

    {
      kind: "section",
      heading: "How I change an organisation",
      body: [
        "The same playbook twice, a decade apart. At Reaktor: cross-functional people sharing in the open, weekly, with something concrete on the table. At Fresh: an AI community of practice that six months later was not a ritual — it was the operating model the company works inside, and engineering owns it now, which is the point. If a practice still needs me to convene it, it has not landed.",
      ],
    },

    {
      kind: "section",
      heading: "Colophon",
      anchor: "colophon",
      body: [
        "Static HTML, no framework. Content lives in a single module so it can be swapped for a CMS without touching a template. The hero physics is a purpose-built solver — circles against the measured bounding boxes of the headline glyphs — with original character artwork. Type is Instrument Sans and IBM Plex Mono.",
      ],
    },
  ],
};
