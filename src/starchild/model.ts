export type Category =
  | "fitness"
  | "cafe"
  | "accounting"
  | "legal"
  | "realestate"
  | "construction"
  | "clinic"
  | "other";
export type Goal = "customers" | "repeat" | "admin" | "cash" | "decide";
export type Page =
  | "welcome"
  | "manual"
  | "deliverables"
  | "discover"
  | "profile"
  | "work"
  | "connections"
  | "evolution"
  | "credits"
  | "plans";
export type JobKind = "page" | "replies" | "checklist" | "reconcile";
export interface Profile {
  nameSource?: "instagram-handle" | "website-address" | "business-name";
  name: string;
  role: string;
  site: string;
  category: Category;
  location: string;
  summary: string;
  services: string;
  offer: string;
  price: string;
  channel: string;
  tone: string;
  policy: string;
  goal: Goal;
  sample: boolean;
  reviewed: boolean;
  edited: string[];
}
export interface Job {
  id: JobKind;
  title: string;
  heading: string;
  body: string;
  approved: boolean;
  created: string;
  cost: number;
}
export interface Entry {
  id: string;
  label: string;
  amount: number;
  at: string;
}
export interface SavedBusiness {
  id: string;
  profile: Profile;
  jobs: Job[];
  sources: string[];
}
export interface State {
  version: 1;
  page: Page;
  profile: Profile;
  claimed: boolean;
  name: string;
  ledger: Entry[];
  sources: string[];
  jobs: Job[];
  plan: string;
  policy: boolean;
  quiet: boolean;
  reduced: boolean;
  community: boolean;
  onboarding: boolean;
  businessId: string;
  saved: SavedBusiness[];
  cookies: number;
  ownerPhone: string;
  approved: Record<string, "once" | "weekly">;
  asked: string[];
}
export const categories: Record<Category, string> = {
  fitness: "Boutique fitness",
  cafe: "Café / restaurant",
  accounting: "Accounting",
  legal: "Legal services",
  realestate: "Real estate",
  construction: "Construction",
  clinic: "Medical clinic",
  other: "Other business",
};
export const goals: { id: Goal; name: string; icon: string }[] = [
  { id: "customers", name: "More customers", icon: "people" },
  { id: "repeat", name: "More repeat business", icon: "repeat" },
  { id: "admin", name: "Less admin", icon: "clock" },
  { id: "cash", name: "Clearer cash flow", icon: "wallet" },
  { id: "decide", name: "Help me decide", icon: "spark" },
];
export const stages = [
  {
    name: "Origin",
    line: "A little spark. A beginning.",
    detail: "A name and a starting point. Nothing assumed, no access granted.",
  },
  {
    name: "Awakening",
    line: "Your business, understood.",
    detail:
      "Your portrait and priority have been reviewed. The next move can be more relevant.",
  },
  {
    name: "Explorer",
    line: "Your first useful thing, done.",
    detail:
      "A usable draft is ready. Review, edit and download it before anything is published.",
  },
  {
    name: "Operator",
    line: "Context becomes capability.",
    detail:
      "A sample source has been explored and a draft approved. No live actions run in this prototype.",
  },
  {
    name: "The Starchild",
    line: "A little less on your plate.",
    detail:
      "Two approved drafts, a sample source and an operating policy. A product milestone, not a claim of superintelligence.",
  },
];
export function initial(): State {
  return {
    version: 1,
    page: "welcome",
    profile: {
      name: "",
      role: "Owner / Founder",
      site: "",
      category: "other",
      location: "",
      summary: "",
      services: "",
      offer: "",
      price: "",
      channel: "",
      tone: "Clear and personal",
      policy: "",
      goal: "decide",
      sample: false,
      reviewed: false,
      edited: [],
    },
    claimed: false,
    onboarding: false,
    businessId: "main",
    saved: [],
    cookies: 0,
    ownerPhone: "",
    approved: {},
    asked: [],
    name: "",
    ledger: [],
    sources: [],
    jobs: [],
    plan: "Explore",
    policy: false,
    quiet: false,
    reduced: false,
    community: false,
  };
}
export const examples: Record<Exclude<Category, "other">, Partial<Profile>> = {
  fitness: {
    name: "NUMA Studios",
    site: "https://numastudios.com.br",
    location: "Campeche, Florianópolis",
    summary:
      "A boutique studio in Campeche offering Hot Pilates, Sculpt and Yoga in a heated room.",
    services: "Hot Pilates, Sculpt, Yoga",
    offer: "An introductory class",
    price: "",
    channel: "Instagram → first class",
    tone: "Warm, calm and clear",
    policy:
      "Ask the studio about changes or cancellations before confirming a class.",
  },
  cafe: {
    name: "Casa Clara Café",
    site: "casaclara.example",
    location: "Campeche, Florianópolis",
    summary:
      "An independent neighborhood café bringing people together over seasonal food and carefully prepared coffee. A place for a slow breakfast, a working morning or a shared table.",
    services: "Breakfast, Specialty coffee, Group tables",
    offer: "Seasonal breakfast and specialty coffee",
    channel: "Instagram → menu → visit or table request",
    tone: "Welcoming, relaxed and local",
    policy: "Group table requests are confirmed by our team.",
  },
  accounting: {
    name: "Conta Clara",
    site: "contaclara.example",
    location: "Florianópolis",
    summary:
      "An independent accounting practice helping small business owners keep their records organized and understand the next administrative step.",
    services: "Monthly accounting, Business onboarding, Document organization",
    offer: "An introductory conversation about your business",
    channel: "Website → inquiry → introductory call",
    tone: "Precise, accessible and reassuring",
    policy: "Scope and fees are agreed after an initial conversation.",
  },
  legal: {
    name: "Ramos Advocacia",
    site: "ramos-legal.example",
    location: "Florianópolis",
    summary:
      "A fictional legal practice testing a clear administrative appointment experience. Case assessment and legal advice remain with qualified professionals.",
    services: "Business law consultations, Contract review",
    offer: "An appointment request with the legal team",
    channel: "Website → administrative inquiry → appointment",
    tone: "Professional, discreet and clear",
    policy:
      "Do not send confidential case documents through an unverified channel.",
  },
  realestate: {
    name: "Costa Imóveis",
    site: "costaimoveis.example",
    location: "Sul da Ilha, Florianópolis",
    summary:
      "An independent real estate team coordinating inquiries and viewings. The team verifies property details and availability before confirming visits.",
    services: "Property inquiries, Viewing coordination, Seller consultations",
    offer: "Tell us what you are looking for",
    channel: "Listing → inquiry → viewing request",
    tone: "Helpful, specific and transparent",
    policy:
      "Property availability and viewing times must be confirmed by the team.",
  },
  construction: {
    name: "Ateliê Construção",
    site: "atelieconstrucao.example",
    location: "Florianópolis",
    summary:
      "A small construction business organizing inquiries before a site visit. Better initial briefs help the team understand scope without inventing estimates.",
    services: "Renovations, Site visits, Project scoping",
    offer: "Start with a clear project brief",
    channel: "Referral → inquiry → site assessment",
    tone: "Direct, dependable and practical",
    policy: "Estimates follow a qualified review of the scope and site.",
  },
  clinic: {
    name: "Clínica Aurora",
    site: "clinicaaurora.example",
    location: "Florianópolis",
    summary:
      "A fictional medical clinic testing a simpler administrative appointment experience. Qualified clinicians handle medical advice and decisions.",
    services: "Appointment coordination, Administrative information",
    offer: "Request an appointment",
    channel: "Website → request → confirmation",
    tone: "Calm, clear and respectful",
    policy:
      "Do not include diagnoses, medical records or urgent requests. For emergencies, contact local emergency services.",
  },
};
export function exampleProfile(c: Exclude<Category, "other">): Profile {
  return { ...initial().profile, ...examples[c], category: c, sample: true };
}
export function balance(s: State) {
  return s.ledger.reduce((n, e) => n + e.amount, 0);
}
export function stage(s: State) {
  if (
    s.policy &&
    s.ledger.some((e) => e.id === "source") &&
    s.jobs.filter((j) => j.approved).length >= 2
  )
    return 4;
  if (s.ledger.some((e) => e.id === "source") && s.jobs.some((j) => j.approved))
    return 3;
  if (s.jobs.length) return 2;
  if (s.profile.reviewed) return 1;
  return 0;
}
export function award(
  s: State,
  id: string,
  label: string,
  amount: number,
): State {
  return s.ledger.some((e) => e.id === id)
    ? s
    : {
        ...s,
        ledger: [
          ...s.ledger,
          { id, label, amount, at: new Date().toISOString() },
        ],
      };
}
export const costs: Record<JobKind, number> = {
  page: 60,
  replies: 20,
  checklist: 20,
  reconcile: 40,
};
export function jobTitle(k: JobKind, p: Profile) {
  if (k === "page")
    return p.category === "fitness"
      ? "First-visit page"
      : p.category === "cafe"
        ? "Visit & menu page"
        : p.category === "realestate"
          ? "Viewing-request page"
          : p.category === "construction"
            ? "Project-request page"
            : "Appointment-request page";
  return {
    replies: "Welcome reply pack",
    checklist: "Owner-ready intake checklist",
    reconcile: "Sample reconciliation brief",
  }[k];
}
export function createJob(k: JobKind, p: Profile): Job {
  const services = p.services || "your services";
  return {
    id: k,
    title: jobTitle(k, p),
    heading: p.offer || `Welcome to ${p.name}`,
    body:
      k === "page"
        ? [
            p.summary || `${p.name}: ${services}.`,
            `${p.offer || "Get in touch to discuss what you need."}${p.price ? " · " + p.price : ""}`,
            p.policy ||
              "Details and terms need the business owner’s confirmation.",
          ].join("\n\n")
        : k === "replies"
          ? [
              `FIRST INQUIRY\nHello! Thanks for reaching out to ${p.name}. We help with ${services.toLowerCase()}. ${p.offer ? `Our starting point is: ${p.offer}.` : "What would you like help with?"}`,
              `NEXT STEP\nPlease share your preferred time and a way to contact you. Availability is confirmed by our team.`,
              `CHANGE REQUEST\nThanks for letting us know. ${p.policy || "We will check the applicable terms before confirming a change."}`,
              `HANDOFF\nThis needs a person from our team. We will review the details before responding. Please do not send sensitive records here.`,
            ].join("\n\n")
          : k === "checklist"
            ? [
                `INQUIRY CHECKLIST · ${p.name}`,
                `1. Confirm the service requested: ${services}.`,
                `2. Ask only for necessary contact information and preferred timing.`,
                `3. Clarify scope with the owner before quoting or promising availability.`,
                `4. Confirm the applicable terms: ${p.policy || "Owner confirmation needed."}`,
                `5. Request approval before publishing, messaging or changing records.`,
                `6. Record the handoff and unresolved questions. Professional judgments remain with qualified people.`,
              ].join("\n\n")
            : "BUNDLED DEMO DATA ONLY\n\nTX-001 · R$90 received → INV-001 · R$90. Exact reference match.\nTX-002 · R$180 received → INV-002 · R$180. Exact reference match.\nTX-003 · R$87 received → INV-003 · R$90. R$3 difference; cause unknown.\nTX-004 · R$90 received → no matching reference. Needs review.\n\nTotal receipts: R$447. Two exact matches; two exceptions. No fees or discounts are assumed. No records have been changed. No inference about your business is made.",
    approved: false,
    created: new Date().toISOString(),
    cost: costs[k],
  };
}
export interface Move {
  id: JobKind;
  label: string;
  type: "observed" | "opportunity" | "unknown";
  title: string;
  description: string;
  evidence: string;
  limit: string;
  impact: string;
}
export type Level = "urgent" | "improve" | "minor";
export interface Diagnostic {
  id: string;
  level: Level;
  title: string;
  seen: string;
  fix: string;
  job: JobKind;
}
/** Only fixable findings from public data. The NUMA example was read from its public homepage on 5 Oct 2026. */
export function diagnostics(p: Profile): Diagnostic[] {
  const d = (
    id: string,
    level: Level,
    title: string,
    seen: string,
    fix: string,
  ): Diagnostic => ({ id, level, title, seen, fix, job: "page" });
  if (p.sample && p.category === "fitness")
    return [
      d(
        "booking",
        "urgent",
        "Booking happens on another site",
        "Visitors leave your site to book.",
        "Brings booking back into one journey.",
      ),
      d(
        "images",
        "improve",
        "Photos are too heavy",
        "About 1 MB of PNGs slows the page.",
        "Converts and resizes them.",
      ),
      d(
        "google",
        "urgent",
        "Google can't read your hours",
        "No business data on the homepage.",
        "Writes it from details you confirm.",
      ),
      d(
        "language",
        "improve",
        "Two languages, one page",
        "English headlines, Portuguese text.",
        "Rewrites the homepage in your voice.",
      ),
      d(
        "alt",
        "minor",
        "Photos have no descriptions",
        "Google and screen readers skip them.",
        "Writes one for each photo.",
      ),
      d(
        "preview",
        "minor",
        "Shared links show no image",
        "Previews look plain on WhatsApp.",
        "Picks the image and preview text.",
      ),
    ];
  if (p.nameSource === "website-address")
    return [
      d(
        "speed",
        "improve",
        "Page speed",
        "Slow pages lose visitors.",
        "Checks load time and shrinks what slows it.",
      ),
      d(
        "preview",
        "improve",
        "Link previews",
        "Shared links need a title and image.",
        "Sets up the preview text and image.",
      ),
      d(
        "google",
        "improve",
        "Google business details",
        "Hours and address should be readable by Google.",
        "Writes them from details you confirm.",
      ),
    ];
  if (p.nameSource === "instagram-handle")
    return [
      d(
        "website",
        "urgent",
        "No website",
        "Instagram is your only address.",
        "Builds a first page from your details.",
      ),
      d(
        "bio",
        "improve",
        "Bio: location and WhatsApp",
        "Many profiles miss the city or a number.",
        "Writes a bio that says where and how to ask.",
      ),
    ];
  return [
    d(
      "website",
      "urgent",
      "No public page",
      "Nothing to find you on yet.",
      "Builds a first page from your details.",
    ),
    d(
      "maps",
      "improve",
      "Google Maps listing",
      "Nearby customers can't find you.",
      "Prepares the listing text, hours and categories.",
    ),
  ];
}
export function moves(p: Profile): Move[] {
  const page: Move = {
    id: "page",
    label:
      p.sample && !p.edited.length
        ? "Observed in example"
        : "Opportunity to test",
    type: p.sample && !p.edited.length ? "observed" : "opportunity",
    title:
      p.category === "fitness"
        ? "Make the first visit feel effortless."
        : p.category === "cafe"
          ? "Turn curiosity into a first visit."
          : "Give every inquiry a clear next step.",
    description:
      "Bring your offer, the details people need and one clear next step into a beautifully simple page.",
    evidence: p.sample
      ? "The fictional example includes an advertised offer but no dedicated first-visit or inquiry guide. No real website was scanned."
      : "Based on the profile you supplied, not a website audit. We have not established that your existing process is inadequate.",
    limit:
      "An easier journey may help. No conversion lift or lost revenue has been measured.",
    impact: "No account connection needed",
  };
  const replies: Move = {
    id: "replies",
    label: "Opportunity to test",
    type: "opportunity",
    title: "Make the next reply a better one.",
    description:
      "Prepare consistent, personal replies for inquiries, next steps and changes. Your voice, with fewer repeated questions.",
    evidence:
      "Uses your confirmed services and tone. No private conversations were accessed.",
    limit:
      "We do not know your response times or how many inquiries are missed.",
    impact: "A useful draft in one step",
  };
  const data: Move = {
    id: p.goal === "admin" ? "checklist" : "reconcile",
    label:
      p.goal === "admin" ? "Opportunity to test" : "Needs more information",
    type: p.goal === "admin" ? "opportunity" : "unknown",
    title:
      p.goal === "admin"
        ? "Stop asking the same questions twice."
        : "Find out where the money stops matching.",
    description:
      p.goal === "admin"
        ? "Give your team a short, service-specific intake checklist. Only the information that matters."
        : "See how payment matches and unresolved differences could reach you. Start with a read-only sample.",
    evidence:
      p.goal === "admin"
        ? "Uses the services and policies you confirmed."
        : "A real diagnosis needs bank and receivable records. This prototype only loads bundled fictional transactions.",
    limit:
      p.goal === "admin"
        ? "The owner must review required fields and professional scope."
        : "No actual financial issue has been diagnosed. No money moves.",
    impact:
      p.goal === "admin"
        ? "No integrations needed"
        : "Try a scoped sample source",
  };
  return p.goal === "cash"
    ? [data, page, replies]
    : p.goal === "admin"
      ? [data, replies, page]
      : p.goal === "repeat"
        ? [replies, page, data]
        : [page, replies, data];
}
export const sourceOptions = [
  {
    id: "bookings",
    name: "Bookings & attendance",
    brand: "Calendar",
    icon: "calendar",
    why: "Understand booked capacity and cancellations.",
    scope: "Bookings, services and attendance. No customer identities.",
    never: "No schedule changes, customer messages or prices.",
  },
  {
    id: "erp",
    name: "Your ERP",
    brand: "Omie / Odoo",
    icon: "grid",
    why: "Match the commercial record with what was paid.",
    scope: "Receivables and transaction references, read only.",
    never: "No accounting writes, tax filings or new invoices.",
  },
  {
    id: "bank",
    name: "Bank transactions",
    brand: "Pluggy",
    icon: "wallet",
    why: "Check payment matches and prepare exceptions.",
    scope: "Transactions to match against what you billed. Read only.",
    never: "No credentials, money movement or investment orders.",
  },
  {
    id: "social",
    name: "Talk to Starchild on WhatsApp",
    brand: "WhatsApp",
    icon: "whatsapp",
    why: "Skip the app. Get what needs your attention and approve fixes by replying.",
    scope: "Only your own chat with Starchild.",
    never: "Never messages your customers or reads your other chats.",
  },
];
export const snacks = [
  { icon: "grid", name: "Spreadsheet chaos", short: "Spreadsheets" },
  { icon: "chat", name: "Endless follow-ups", short: "Inbox" },
  { icon: "doc", name: "Manual reconciliation", short: "ERP" },
  { icon: "calendar", name: "Scheduling headaches", short: "Bookings" },
];
