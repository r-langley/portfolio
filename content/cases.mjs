// ---------------------------------------------------------------------------
// cases.mjs — the case study collection.
//
// SHAPE NOTE (read before wiring a CMS):
//   Every case is the same object. `outcomes` is capped at 3 and is the only
//   thing the card grid, the table view and the drill-down hero all share.
//   `sections` is an ordered array of blocks — this is what becomes a portable
//   text / block content field.
//   `heroImage` renders a real <img> when it has a relative `src` (a string, or
//   an array to stack several — see the Fresh case, whose `alt` is a matching
//   array), else a procedural `tone`+`motif` placeholder. The container hugs the
//   image: full width, natural height, intrinsic size read at build time.
//
// TK = a number or fact still to supply. Rendered in a dashed chip so nothing
// unverified ships quietly.
// ---------------------------------------------------------------------------

export const cases = [
  /* ------------------------------------------------------------------ 01 */
  {
    slug: "org-brain",
    foot: "Fresh KDS",
    company: "Fresh Technology",
    role: "Head of Product Design",
    period: "2024 — 2026",
    category: "operating",
    featured: true,
    order: 1,

    title: "Design context everyone can use",
    deck:
      "Two years turning scattered product knowledge into a graph the whole company works inside — and the object model now sitting on top of the design system, where agents read it too.",

    outcomes: [
      { value: "2 repos", label: "used daily across the company" },
      { value: "6 months", label: "from community of practice to operating model" },
      { value: "SDLC", label: "research became queryable by everyone" },
    ],

    meta: [
      { k: "Scope", v: "Knowledge architecture, object model, tooling, org practice" },
      { k: "Surface", v: "Obsidian → two repos → design system object layer" },
      { k: "My role", v: "Set the model, ran the practice, wrote the structure" },
    ],

    heroImage: {
      src: "assets/cases/org-brain/org-brain.png",
      alt: "Fresh org brain — object-model graph of entities and links",
      tone: "amber",
      motif: "nodes",
    },

    sections: [
      {
        kind: "problem",
        heading: "The problem",
        body: [
          "Product knowledge lived in people. Decisions got re-litigated every quarter because the reasoning behind them was in a thread, a deck, or someone's memory. The cost is not documentation debt — it is that the company keeps paying for the same decision.",
          "Then agents arrived as readers. Ambiguity a person routes around silently becomes an error an agent commits confidently. That changed the requirement: the documentation had to be structured, not merely written.",
        ],
      },
      {
        kind: "quote",
        text:
          "Design documentation now has two readers, people and agents, and the agents are less forgiving.",
      },
      {
        kind: "constraints",
        heading: "Constraints",
        list: [
          "Nobody maintains documentation as a chore. It has to be load-bearing or it rots.",
          "It had to survive people who did not care about the model.",
          "No budget for a knowledge team — this ran alongside shipping product.",
        ],
      },
      {
        kind: "move",
        heading: "What I did",
        list: [
          "<strong>Canonical structure first.</strong> Gathered and synthesised the product docs into one structure with consistent front-matter — so a document's meaning is machine-readable before anyone reads the prose.",
          "<strong>Tested the graph, then iterated the model.</strong> Built it in Obsidian, used it in anger, and changed the schema against real retrieval rather than a whiteboard.",
          "<strong>Started an AI community of practice.</strong> Cross-functional, weekly, in the open, with something concrete on the table. Not a ritual — a way of building shared context.",
          "<strong>Layered an object model on the design system.</strong> Coherent objects, properties and links, so the full range of stakeholders can manipulate the same information without a translation step.",
          "<strong>Changed the toolchain to match.</strong> Recommended Granola and Subframe; both now sit in the SDLC. UX research stopped being a deck and became queryable insight available to everyone.",
        ],
      },
      {
        kind: "result",
        heading: "Result",
        body: [
          "The org brain is two repos, used daily by everyone in the company. Six months after the community of practice started it was not a ritual — it was the operating model the company works inside, and engineering owns it now, which is the point.",
          "The larger consequence: design became a shared practice rather than an individual one. The same layer is now becoming composable infrastructure agents use to run autonomous optimisation of enterprise operating systems.",
        ],
      },
      {
        kind: "reflection",
        heading: "What I would do differently",
        body: [
          "I under-solved visibility. In a previous life everything lived in Figma and the work was self-evidently on display. Now it lives in markdown and repos, and iterations and critical findings get lost between a PM's prototype, the review, the port into Subframe and the frontend build. The model is right; the shop window is missing.",
        ],
      },
    ],

    tags: ["knowledge graph", "object model", "AI-native SDLC", "org design", "design systems"],
  },

  /* ------------------------------------------------------------------ 02 */
  {
    slug: "fresh",
    foot: "Fresh KDS",
    company: "Fresh Technology",
    role: "Head of Product Design",
    period: "2023 — 2026",
    category: "operations",
    featured: true,
    order: 2,

    title: "Enterprise configurability at scale",
    deck:
      "A kitchen display system that stopped reporting what happened and started managing what happens next — then the enterprise configurability layer that turned that into a 7-Eleven win.",

    outcomes: [
      { value: "+40%", label: "signup conversion, mostly from previously low-converting segments" },
      { value: "7-Eleven", label: "won on three months of enterprise configurability" },
      { value: "4", label: "product surfaces shipped" },
    ],

    meta: [
      { k: "Scope", v: "Web, KDS item times, automations, device management, enterprise config" },
      { k: "Team", v: "TK designers, TK engineers", tk: true },
      { k: "My role", v: "Design leadership, research, systems, hands-on frontend" },
    ],

    heroImage: {
      src: "assets/cases/fresh/kds-enterprise.png",
      alt: "Fresh — enterprise configurability across locations",
      tone: "teal",
      motif: "grid",
    },

    sections: [
      {
        kind: "problem",
        heading: "The problem",
        body: [
          "A kitchen display system tells you an order arrived and an order left. Everything between those two events — the part that decides whether food goes out hot — was invisible. Expo could see a ticket sitting at nine minutes but not which item had been sitting, or why.",
          "Operators compensated with memory and volume. That works at forty covers. It does not work at four hundred, and it does not transfer to a new hire on a Friday.",
        ],
      },
      {
        kind: "constraints",
        heading: "Constraints",
        list: [
          "Gloved hands, wet screens, no hover, no precision targets.",
          "Read at three feet, in motion, in peripheral vision.",
          "Zero tolerance for a modal during service.",
          "Hardware in the field with no on-site IT, ever.",
          "Enterprise buyers are rarely the operators — their feedback arrives a step removed from the product.",
        ],
      },
      {
        kind: "move",
        heading: "What I did",
        body: [
          "Sequenced it as a tier model: surface item-level truth first, let the system recommend second, let it act last.",
        ],
        list: [
          "<strong>Item times.</strong> Moved the unit of measurement from ticket to item. Hold and release semantics, fire rules and cook-time deltas became first-class data — which made pacing a design surface instead of a kitchen folk skill.",
          "<strong>Automations.</strong> A rules layer operators author themselves. Manual authoring first, recommendations layered on later — deliberately, so trust was earned against visible behaviour.",
          "<strong>Web.</strong> Brought back-of-house configuration out of the device and into a browser, so a multi-site operator changes routing for twenty kitchens without touching twenty screens.",
          "<strong>Device management.</strong> Fleet health, remote recovery, rollout control. Support-call volume treated as a design metric, not an ops metric.",
          "<strong>Enterprise configurability.</strong> The context model work was in service of enterprises who need visibility and control across vast surfaces. Three months of build, and it won 7-Eleven.",
        ],
      },
      {
        kind: "move",
        heading: "Owning a number design could move",
        body: [
          "Signup had no scalable way of answering who converts and who does not. I defined the success metric — increase signup — then worked segment by segment inside it, partnering with marketing on language and web content aimed at specific needs rather than a general audience.",
          "Conversion is up 40%, and most of the gain came from segments that previously converted worst. That is the shape of result I want design measured on: a number it can actually influence, agreed in advance.",
        ],
      },
      {
        kind: "reflection",
        heading: "What I would do differently",
        body: [
          "On item timing I proposed a different build and was overruled. The proposal may or may not have been right — but I lost it on delivery, not on substance. I pitched it to sales and business development in terms that did not match what they were actually hearing from customers, and got too cerebral about reinterpreting the need and taking a different market position.",
          "I now own the feature end to end, and I am treating the implementation as a test of the original assumptions: gather the evidence, then earn the direction rather than argue for it.",
          "The second gap is research access. Fresh customers are busy and hard to reach, and a roadmap shaped mostly by what surfaces in a sales conversation is a bad roadmap. I have been merging outreach with the business side and capturing conversations so the raw material is shared, plus field research on the initiative I led directly.",
        ],
      },
    ],

    tags: ["restaurant ops", "realtime", "device fleet", "enterprise", "conversion"],
  },

  /* ------------------------------------------------------------------ 03 */
  {
    slug: "lolo",
    foot: "LOLO",
    company: "Lolo",
    role: "Design Lead (founding-level)",
    period: "2024 — 2026",
    category: "agentic",
    featured: true,
    order: 3,

    title: "Designing agentic experiences for sensitive wealth data",
    deck:
      "Agentic workflows for wealth advisors running many client portfolios at once — meetings, document vault, change management — built so every automated action leaves evidence a regulator can follow.",

    outcomes: [
      { value: "TK", label: "advisor hours returned per week", tk: true },
      { value: "100%", label: "agent actions with an audit trail" },
      { value: "TK", label: "portfolios under management on-platform", tk: true },
    ],

    meta: [
      { k: "Scope", v: "Meetings, workflows, document vault, change management, audit" },
      { k: "Team", v: "TK", tk: true },
      { k: "My role", v: "Design lead, design system (Terra), agent interaction model" },
    ],

    heroImage: {
      src: "assets/cases/lolo/lolo.png",
      alt: "Lolo — agentic workflows for wealth advisors",
      tone: "indigo",
      motif: "flow",
    },

    sections: [
      {
        kind: "problem",
        heading: "The problem",
        body: [
          "An advisor with 200 households spends most of the week on the same handful of motions: prepare for the meeting, capture what was agreed, update the plan, prove later that they did it. The work is repetitive but the accountability is personal and regulated.",
          "That combination is exactly where agents look attractive and exactly where they are dangerous. An agent that quietly rebalances is a compliance event, not a feature.",
        ],
      },
      {
        kind: "quote",
        text: "An agent can draft the screen. It cannot decide what the noun means.",
      },
      {
        kind: "constraints",
        heading: "Constraints",
        list: [
          "Fiduciary duty — a recommendation the advisor cannot explain is unusable.",
          "Every state change has to be reconstructable after the fact.",
          "Advisors will not adopt a tool that makes them read more than they used to.",
          "Multi-client context: the agent must never blur one household into another.",
        ],
      },
      {
        kind: "move",
        heading: "What I did",
        list: [
          "<strong>Evidence as an interface primitive.</strong> Every agent output carries its sources inline — the document, the clause, the meeting moment. Provenance is part of the sentence, not a drawer you open.",
          "<strong>Change management as a review queue.</strong> Agents propose, advisors dispose. The unit of work is a diff with a reason attached, not a completed action with a notification.",
          "<strong>Meetings as the ingestion point.</strong> The transcript is where intent enters the system, so it became the front door: commitments extracted, routed into workflows, tied back to the household.",
          "<strong>Document vault.</strong> Structured retrieval that agents and humans read the same way, so the answer an advisor sees is the answer the agent used.",
          "<strong>Terra.</strong> Built the design system underneath — token architecture, component contracts, theming — so the agent surfaces stayed coherent as the product doubled.",
        ],
      },
      {
        kind: "move",
        heading: "Where I forbade it",
        body: [
          "Anything that writes to the record of truth, anything that produces a legal attestation, anything a client signs. Not because the model could not — because when it is wrong you need to know exactly which human decided.",
        ],
      },
      {
        kind: "result",
        heading: "Result",
        body: [
          "TK — hours returned per advisor per week, and adoption against the manual path.",
          "The design position that held: an agent's job is to assemble the evidence and stage the decision. The advisor still makes it, and can show why.",
        ],
      },
      {
        kind: "reflection",
        heading: "What I would do differently",
        body: ["TK — the review queue was probably too heavy in v1. Say what you cut and why."],
      },
    ],

    tags: ["agentic AI", "wealth management", "audit", "design systems", "regulated"],
  },

  /* ------------------------------------------------------------------ 04 */
  {
    slug: "viasat",
    foot: "Viasat",
    company: "Viasat",
    role: "Product Designer",
    period: "2 years",
    category: "operations",
    featured: true,
    order: 4,

    title: "Creating consistency in multi-tenant networks",
    deck:
      "Multi-tenant satellite connectivity for Delta and American Airlines: fleet software management, a resolution system for when a tail goes dark, and the first ML tooling for internal error identification.",

    outcomes: [
      { value: "2", label: "senior designers led" },
      { value: "Delta / AA", label: "carriers on the tooling" },
      { value: "1st", label: "ML + automation tooling built internally" },
    ],

    meta: [
      { k: "Scope", v: "Fleet software management, resolution systems, error identification ML" },
      { k: "Domain", v: "Hardware connectivity, multi-tenant satellite networks" },
      { k: "My role", v: "Product design, led two senior designers, airline ops research" },
    ],

    heroImage: {
      src: "assets/cases/viasat/viasat.png",
      alt: "Viasat — multi-tenant fleet connectivity tooling",
      tone: "teal",
      motif: "arcs",
    },

    sections: [
      {
        kind: "problem",
        heading: "The problem",
        body: [
          "An airline's connectivity team learns a plane's system is degraded when passengers complain. By then the aircraft is airborne, the maintenance window is gone, and the fix waits for the next overnight.",
          "The data existed. It arrived as telemetry across a multi-tenant satellite network that no single view made legible, inside a window where action was still possible.",
        ],
      },
      {
        kind: "constraints",
        heading: "Constraints",
        list: [
          "Maintenance windows are short, scheduled and geographically fixed.",
          "Aviation change control — you do not push software to a tail casually.",
          "Multi-tenant: one network, several carriers, no bleed between them.",
          "Operators triage hundreds of tails; they do not study one.",
        ],
      },
      {
        kind: "move",
        heading: "What I did",
        list: [
          "<strong>Fleet software management.</strong> Version state across the fleet as one legible view, with rollout staged against maintenance windows rather than calendar dates.",
          "<strong>Resolution system.</strong> Restructured the flow around the window instead of the ticket: what can be fixed before this tail flies again, ordered by what is achievable.",
          "<strong>Error identification ML.</strong> The first ML and automation tooling built for the internal teams — ranking and clustering so recurring degradations surfaced as one pattern with a fix instead of forty tickets with forty owners. The interface shows why a cluster formed, because operators need grounds to overrule a model.",
        ],
      },
      {
        kind: "result",
        heading: "Result",
        body: ["TK — resolution time against baseline, and fleet coverage at handover."],
      },
    ],

    tags: ["aviation", "fleet ops", "ML ranking", "multi-tenant", "telemetry"],
  },

  /* ------------------------------------------------------------------ 05 */
  {
    slug: "reaktor",
    foot: "Reaktor",
    company: "Reaktor",
    role: "Global operating strategy",
    period: "3 years · Helsinki",
    category: "operating",
    featured: true,
    order: 5,

    title: "Designing the org",
    deck:
      "Three years on the global operating strategy team: built and led onboarding across offices, wrote the talent growth rubrics, and hired the designers and engineers who had to work inside both.",

    outcomes: [
      { value: "Global", label: "onboarding built and led from Helsinki" },
      { value: "Rubrics", label: "talent growth framework authored" },
      { value: "3 years", label: "on operating strategy" },
    ],

    meta: [
      { k: "Scope", v: "Onboarding, growth rubrics, hiring, operating practice" },
      { k: "Base", v: "Helsinki, working across offices" },
      { k: "My role", v: "Global operating strategy team" },
    ],

    heroImage: {
      src: "assets/cases/reaktor/reaktor.png",
      alt: "Reaktor — global operating strategy and onboarding",
      tone: "amber",
      motif: "blocks",
    },

    sections: [
      {
        kind: "problem",
        heading: "The problem",
        body: [
          "A consultancy's product is its people, and its scaling problem is that judgment does not transfer by osmosis. Offices drift. What a strong designer means in one place stops matching what it means in another, and the gap only shows up in a project that goes wrong.",
        ],
      },
      {
        kind: "move",
        heading: "What I did",
        list: [
          "<strong>Global onboarding.</strong> Designed and led the programme that set a shared baseline for how people work, not just where the tools are.",
          "<strong>Talent growth rubrics.</strong> Wrote the framework that made progression legible — what changes between levels, in language a person can act on.",
          "<strong>Hiring.</strong> Recruited designers and engineers against those rubrics, which is the only way a rubric survives contact with a hiring decision.",
        ],
      },
      {
        kind: "move",
        heading: "Where the thinking came from",
        body: [
          "This is where I studied service ecosystem design with the people who developed it. The premise: teams in an organisation can each have real purpose and genuine customer focus and still be quietly in conflict — and sometimes the highest-leverage route to the customer runs through another team.",
          "Which is why I keep asking what design can do for the tooling of product management, engineering, customer success, marketing, recruiting. Design's leverage is rarely in setting the business outcome directly. It is in putting the organisation in the best possible shape to reach it.",
        ],
      },
      {
        kind: "result",
        heading: "Result",
        body: [
          "TK — retention, ramp time, or whatever you measured the programme against. Even a qualitative answer beats leaving it blank.",
          "The playbook — cross-functional people sharing in the open, weekly, with something concrete on the table — is the same one I ran a decade later to build the org brain at Fresh.",
        ],
      },
    ],

    tags: ["operating strategy", "onboarding", "career frameworks", "hiring", "service ecosystem design"],
  },

  /* ------------------------------------------------------------------ 06 */
  {
    slug: "bonsai",
    foot: "Bonsai",
    company: "Bonsai",
    role: "Product Designer / Frontend",
    period: "2023",
    category: "agentic",
    featured: true,
    order: 6,

    title: "Search that builds its own interface",
    deck:
      "Embedded AI search where the answer is not a paragraph — it is an assembled UI. A generative component library, the v1 frontend, and a demo machine that made the idea sellable.",

    outcomes: [
      { value: "TK", label: "components in the generative library", tk: true },
      { value: "v1", label: "frontend shipped solo" },
      { value: "TK", label: "deals influenced by the demo", tk: true },
    ],

    meta: [
      { k: "Scope", v: "Generative component library, frontend v1, demo environment" },
      { k: "Team", v: "TK", tk: true },
      { k: "My role", v: "Design and frontend implementation" },
    ],

    heroImage: {
      src: "assets/cases/bonsai/bonsai.png",
      alt: "Bonsai — generative search that assembles its own UI",
      tone: "indigo",
      motif: "blocks",
    },

    sections: [
      {
        kind: "problem",
        heading: "The problem",
        body: [
          "Embedded search returns links. A model can return an answer. Neither is what the user wanted, which is usually a comparison, a status, a form already filled in, a next action.",
          "The bottleneck was not retrieval quality. It was that the response layer had exactly one shape: text.",
        ],
      },
      {
        kind: "constraints",
        heading: "Constraints",
        list: [
          "The model picks the layout at runtime — every component has to be safe in any composition.",
          "Embedded in someone else's product: inherit their type and colour without inheriting their bugs.",
          "Latency budget measured in the first painted token.",
        ],
      },
      {
        kind: "move",
        heading: "What I did",
        list: [
          "<strong>A component library designed for a non-human consumer.</strong> Each component declares what it is for and what data it requires, so the model selects on intent rather than appearance. Judgment encoded as constraints, not as a style guide.",
          "<strong>Make the wrong combination impossible to produce.</strong> A small set of primitives that compose predictably beats a large set of pre-built answers that almost fit — and an agent assembling from valid contracts cannot emit something invalid. That is where the speed comes from.",
          "<strong>Built the v1 frontend myself</strong> rather than specifying it. The interaction model only became real once streaming, partial states and layout shift were solved in code.",
          "<strong>The demo machine.</strong> A configurable environment where a prospect saw the system answer questions about their own content in minutes. It did more for the roadmap than any deck.",
        ],
      },
      {
        kind: "result",
        heading: "Result",
        body: [
          "TK — library size, and what the demo converted.",
          "The transferable lesson: generative UI is a design systems problem before it is an AI problem. If the components do not carry judgment, the model has nothing good to choose from.",
        ],
      },
    ],

    tags: ["generative UI", "design systems", "frontend", "embedded", "demo"],
  },

  /* ------------------------------------------------------------------ 07 */
  {
    slug: "adidas",
    foot: "adidas",
    company: "adidas",
    role: "Product Designer",
    period: "TK",
    category: "operating",
    featured: false,
    order: 7,

    title: "Merging two teams that shipped the same brand differently",
    deck:
      "Brought in to facilitate the merge of the web and mobile teams: one set of systems, one set of shared outcomes and principles, one development lifecycle.",

    outcomes: [
      { value: "2 → 1", label: "web and mobile teams merged" },
      { value: "Shared", label: "systems, principles and SDLC" },
      { value: "TK", label: "scale of the surface", tk: true },
    ],

    meta: [
      { k: "Scope", v: "Team merge, system consolidation, shared SDLC" },
      { k: "Team", v: "TK", tk: true },
      { k: "My role", v: "Facilitation and product design" },
    ],

    heroImage: { tone: "amber", motif: "flow", alt: "adidas team merge — hero image slot" },

    sections: [
      {
        kind: "problem",
        heading: "The problem",
        body: [
          "Two teams, one brand, two answers to every question. Web and mobile had each built a coherent world; the incoherence only showed up where a customer crossed between them.",
        ],
      },
      {
        kind: "move",
        heading: "What I did",
        list: [
          "<strong>Consolidated the systems</strong> so there was one place a component decision could be made.",
          "<strong>Agreed shared outcomes and principles</strong> before touching process — merging rituals between teams that disagree about the goal just relocates the argument.",
          "<strong>One development lifecycle,</strong> so the merge held after the attention moved on.",
        ],
      },
      {
        kind: "result",
        heading: "Result",
        body: ["TK — what actually changed for the customer, and what held a year later."],
      },
    ],

    tags: ["team merge", "design systems", "SDLC", "consolidation"],
  },

  /* ------------------------------------------------------------------ 08 */
  {
    slug: "sygma",
    foot: "Sygma",
    company: "Sygma",
    role: "Product Designer",
    period: "2023",
    category: "agentic",
    featured: false,
    order: 8,

    title: "Agents for the parts of hardware engineering nobody wants",
    deck:
      "Scheduling and document change management for hardware teams — where a missed revision does not cause a bug, it causes a build.",

    outcomes: [
      { value: "TK", label: "cycle time on change approvals", tk: true },
      { value: "2", label: "agent surfaces defined" },
      { value: "TK", label: "pilot teams", tk: true },
    ],

    meta: [
      { k: "Scope", v: "Scheduling agent, document change management" },
      { k: "Team", v: "TK", tk: true },
      { k: "My role", v: "Product design" },
    ],

    heroImage: { tone: "indigo", motif: "nodes", alt: "Sygma engineering agents — hero image slot" },

    sections: [
      {
        kind: "problem",
        heading: "The problem",
        body: [
          "Hardware schedules are a dependency graph pretending to be a spreadsheet. A spec revision on Tuesday invalidates a fabrication slot in three weeks, and the only mechanism connecting those two facts is a person remembering.",
        ],
      },
      {
        kind: "constraints",
        heading: "Constraints",
        list: [
          "Changes are expensive and physical — no undo.",
          "Engineers distrust automation that touches a released document.",
          "The source of truth is spread across PLM, email and PDFs.",
        ],
      },
      {
        kind: "move",
        heading: "What I did",
        list: [
          "<strong>Scheduling agent framed as a scout, not a scheduler.</strong> It finds the conflict and shows the chain of consequence. A human still moves the date.",
          "<strong>Change management as impact propagation.</strong> When a document revises, the interface answers one question fast: what does this break, and who needs to know today.",
          "<strong>Confidence made visible.</strong> Where the agent inferred a dependency rather than read one, it says so. Silent inference is how these tools lose engineers permanently.",
        ],
      },
      {
        kind: "result",
        heading: "Result",
        body: ["TK — approval cycle time and pilot outcome."],
      },
    ],

    tags: ["agentic AI", "hardware", "change management", "scheduling"],
  },
];

// Archive rows — the dense, grouped listing. Deliberately narrower than the
// case studies: these are the individual moves, so a visitor scanning for one
// specific capability finds it without reading six stories.
export const archive = [
  {
    group: "Agentic systems",
    key: "agentic",
    rows: [
      { title: "Evidence as an interface primitive", org: "Lolo", year: "2025", href: "/work/lolo.html", note: "Provenance inside the sentence, not in a drawer" },
      { title: "Change management review queue", org: "Lolo", year: "2025", href: "/work/lolo.html", note: "Agents propose, advisors dispose" },
      { title: "Meeting-to-workflow ingestion", org: "Lolo", year: "2024", href: "/work/lolo.html", note: "Transcript as the front door" },
      { title: "Generative component library", org: "Bonsai", year: "2023", href: "/work/bonsai.html", note: "Make the invalid combination impossible to produce" },
      { title: "Embedded search frontend v1", org: "Bonsai", year: "2023", href: "/work/bonsai.html", note: "Streaming, partial states, no layout shift" },
      { title: "Document change propagation", org: "Sygma", year: "2023", href: "/work/sygma.html", note: "What breaks, and who needs to know today" },
      { title: "Scheduling scout agent", org: "Sygma", year: "2023", href: "/work/sygma.html", note: "Finds the conflict, human moves the date" },
    ],
  },
  {
    group: "Operational software",
    key: "operations",
    rows: [
      { title: "KDS item times", org: "Fresh", year: "2025", href: "/work/fresh.html", note: "Ticket → item as the unit of truth" },
      { title: "Automations", org: "Fresh", year: "2025", href: "/work/fresh.html", note: "Operator-authored rules layer" },
      { title: "Enterprise configurability", org: "Fresh", year: "2025", href: "/work/fresh.html", note: "Three months of build; won 7-Eleven" },
      { title: "Signup conversion programme", org: "Fresh", year: "2025", href: "/work/fresh.html", note: "+40%, mostly from the worst-converting segments" },
      { title: "Web configuration app", org: "Fresh", year: "2024", href: "/work/fresh.html", note: "Multi-site routing without touching devices" },
      { title: "Device fleet management", org: "Fresh", year: "2024", href: "/work/fresh.html", note: "Support-call volume as a design metric" },
      { title: "Fleet software management", org: "Viasat", year: "—", href: "/work/viasat.html", note: "Rollout staged to maintenance windows" },
      { title: "Resolution system", org: "Viasat", year: "—", href: "/work/viasat.html", note: "Ordered by what is achievable before wheels-up" },
      { title: "Error identification ML", org: "Viasat", year: "—", href: "/work/viasat.html", note: "Forty tickets → one pattern with a fix" },
    ],
  },
  {
    group: "Operating models",
    key: "operating",
    rows: [
      { title: "Org brain — canonical doc structure", org: "Fresh", year: "2024", href: "/work/org-brain.html", note: "Consistent front-matter, machine-readable meaning" },
      { title: "AI community of practice", org: "Fresh", year: "2025", href: "/work/org-brain.html", note: "Ritual → operating model; engineering owns it" },
      { title: "Object model on the design system", org: "Fresh", year: "2026", href: "/work/org-brain.html", note: "Design as a shared practice, not an individual one" },
      { title: "Granola + Subframe in the SDLC", org: "Fresh", year: "2025", href: "/work/org-brain.html", note: "Research becomes queryable insight" },
      { title: "Global onboarding programme", org: "Reaktor", year: "—", href: "/work/reaktor.html", note: "A shared baseline for how people work" },
      { title: "Talent growth rubrics", org: "Reaktor", year: "—", href: "/work/reaktor.html", note: "Progression in language a person can act on" },
      { title: "Web + mobile team merge", org: "adidas", year: "TK", href: "/work/adidas.html", note: "One system, one lifecycle, shared principles" },
    ],
  },
];
