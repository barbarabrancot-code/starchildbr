import {
  Fragment,
  useEffect,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Mascot, Icon } from "./Mascot";
import { businessReference } from "./reference";
import { suggestBrands, type BrandSuggestion } from "./suggestions";
import {
  categories,
  examples,
  goals,
  moves,
  diagnostics,
  type Level,
  stages,
  stage,
  balance,
  costs,
  jobTitle,
  exampleProfile,
  type State,
  type Profile,
  type Category,
  type JobKind,
  type Page,
} from "./model";
export type Actions = {
  update: (fn: (s: State) => State) => void;
  go: (p: Page) => void;
  start: (p: Profile) => void;
  confirm: () => void;
  job: (k: JobKind) => void;
  claim: () => void;
  inspect: (id: string) => void;
  connect: (id: string) => void;
  notify: (s: string) => void;
};
export function Welcome({ state: s, a }: { state: State; a: Actions }) {
  const [site, setSite] = useState("");
  const [more, setMore] = useState(false);
  const [previewStage, setPreviewStage] = useState(0);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const suggestions = open ? suggestBrands(site) : [];
  const [picked, setPicked] = useState<BrandSuggestion | null>(null);
  function pick(b: BrandSuggestion) {
    setSite(b.kind === "instagram" ? `@${b.handle}` : b.domain);
    setPicked(b);
    setOpen(false);
    setActive(-1);
    setError("");
  }
  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((active + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((active - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      pick(suggestions[active]);
    }
  }
  function submit(e: FormEvent) {
    e.preventDefault();
    begin(site);
  }
  function begin(value: string) {
    try {
      const ref = businessReference(value);
      a.start({
        ...s.profile,
        name: picked ? picked.name : ref.name,
        site: ref.site,
        nameSource: ref.source,
        sample: false,
        reviewed: false,
        category: "other",
        summary: "",
        services: "",
        offer: "",
        price: "",
        location: "",
        channel: "",
        edited: [],
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Please check the link and try again.",
      );
    }
  }
  return (
    <main className="welcome">
      <div className="welcome-copy">
        <div className="world-caption">A new kind of business companion</div>
        <h1>
          Do your thing.
          <br />
          <span>
            We eat the
            <br className="desktop-break" /> busywork.
          </span>
        </h1>
        <form
          onSubmit={submit}
          className="intake-form source-intake"
          noValidate
        >
          <label htmlFor="business-source">
            Business name, Instagram or website
            <div className="input-icon">
              <Icon
                name={site.trim().startsWith("@") ? "instagram" : "globe"}
                size={17}
              />
              <input
                id="business-source"
                aria-label="Business name, Instagram or website"
                value={site}
                onChange={(e) => {
                  setSite(e.target.value);
                  setError("");
                  setOpen(true);
                  setActive(-1);
                  setPicked(null);
                }}
                onKeyDown={onKeyDown}
                onBlur={() => setOpen(false)}
                role="combobox"
                aria-expanded={suggestions.length > 0}
                aria-controls="source-suggestions"
                aria-autocomplete="list"
                maxLength={300}
                placeholder="Business name, @instagram or website"
                autoComplete="url"
                autoCapitalize="none"
                spellCheck={false}
                aria-invalid={!!error}
              />
              <button
                className="meet-button input-submit"
                type="submit"
                aria-label="Meet my Starchild"
              >
                <Icon name="arrow" />
              </button>
              {suggestions.length > 0 && (
                <ul
                  className="suggestions"
                  id="source-suggestions"
                  role="listbox"
                >
                  {suggestions.map((b, i) => (
                    <li
                      key={b.kind + b.domain}
                      role="option"
                      aria-selected={i === active}
                      className={i === active ? "active" : undefined}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        pick(b);
                      }}
                      onMouseEnter={() => setActive(i)}
                    >
                      <span
                        className="suggestion-logo"
                        style={{
                          background: `hsl(${(b.name.charCodeAt(0) * 47 + b.name.length * 31) % 360} 35% 32%)`,
                        }}
                      >
                        {b.name[0]}
                        <i className="suggestion-kind">
                          <Icon
                            name={
                              b.kind === "instagram" ? "instagram" : "globe"
                            }
                            size={9}
                          />
                        </i>
                      </span>
                      <strong>{b.name}</strong>
                      <em>{b.tagline}</em>
                      <code>
                        {b.kind === "instagram" ? `@${b.handle}` : b.domain}
                      </code>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </label>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </form>
        <button className="text-button no-link" onClick={() => a.go("manual")}>
          I don’t have a website or Instagram
        </button>
        {s.profile.name && !s.onboarding && (
          <button className="text-button no-link" onClick={() => a.go("work")}>
            ← Back to {s.profile.name}
          </button>
        )}
        <div className="sample-picker">
          <span>Take it for a spin</span>
          <button onClick={() => a.start(exampleProfile("fitness"))}>
            NUMA Studios <Icon name="arrow" size={14} />
          </button>
          <button
            className="sample-more"
            onClick={() => setMore(!more)}
            aria-expanded={more}
          >
            More examples {more ? "−" : "+"}
          </button>
          {more && (
            <div className="more-examples">
              {(Object.keys(examples) as Exclude<Category, "other">[])
                .filter((k) => k !== "fitness")
                .map((k) => (
                  <button key={k} onClick={() => a.start(exampleProfile(k))}>
                    {categories[k]} <Icon name="arrow" size={14} />
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>
      <aside className="welcome-world">
        <div className="world-orbit" />
        <Mascot
          level={previewStage}
          interactive
          onMunch={() => setPreviewStage((v) => Math.min(4, v + 1))}
        />
        <div className="world-bottom">
          <Icon name="spark" size={30} />
        </div>
      </aside>
    </main>
  );
}
function analysisSteps(sample: boolean): [string, string][] {
  return sample
    ? [
        [
          "Research the business",
          "Loading a public example business for this preview.",
        ],
        [
          "Explore the services",
          "Sorting the services and the starting offer.",
        ],
        ["Map the customer journey", "How a customer finds, asks and books."],
        ["Prepare your findings", "Nothing is filled in without a source."],
      ]
    : [
        [
          "Research your business",
          "Reading the website address or Instagram handle you gave us.",
        ],
        [
          "Check your online presence",
          "Only what the link itself shows. Nothing else is accessed.",
        ],
        [
          "Find the gaps",
          "Unverified details stay blank instead of being guessed.",
        ],
        ["Prepare your findings", "Putting together what we can honestly say."],
      ];
}
export function Portrait({ state: s, a }: { state: State; a: Actions }) {
  const p = s.profile;
  const [details, setDetails] = useState(false);
  const onboarding = s.onboarding;
  const steps = analysisSteps(p.sample);
  const [step, setStep] = useState(0);
  const [openStep, setOpenStep] = useState<number | null>(null);
  useEffect(() => {
    if (!onboarding) return;
    const t = setInterval(
      () => setStep((v) => Math.min(v + 1, steps.length)),
      900,
    );
    return () => clearInterval(t);
  }, [onboarding]);
  const analyzing = onboarding && step < steps.length;
  function edit(k: keyof Profile, v: string) {
    a.update((x) => ({
      ...x,
      profile: {
        ...x.profile,
        [k]: v,
        edited: [...new Set([...x.profile.edited, k])],
      },
    }));
  }
  function field(
    k: keyof Profile,
    label: string,
    placeholder: string,
    long = false,
  ) {
    return (
      <label className={long ? "wide" : ""}>
        {label}
        {long ? (
          <textarea
            aria-label={label}
            value={String(p[k])}
            maxLength={1800}
            rows={3}
            onChange={(e) => edit(k, e.target.value)}
            placeholder={placeholder}
          />
        ) : (
          <input
            aria-label={label}
            value={String(p[k])}
            maxLength={300}
            onChange={(e) => edit(k, e.target.value)}
            placeholder={placeholder}
          />
        )}
        <small className="provenance">
          {p.edited.includes(k)
            ? "Edited by you"
            : k === "name" && p.nameSource
              ? p.reviewed
                ? "Confirmed by you"
                : "Suggested from your link · please confirm"
              : p.sample
                ? "Example brief"
                : p[k]
                  ? "Supplied by you"
                  : "Not yet known"}
        </small>
      </label>
    );
  }
  const accordion = onboarding && (
    <ol className="step-accordion" aria-label="Getting to know your business">
      {steps.map(([title, detail], i) => {
        const state = step > i ? "done" : step === i ? "current" : "todo";
        const expanded = openStep === i || state === "current";
        return (
          <li key={title} className={"acc-item " + state}>
            <button
              type="button"
              className="acc-head"
              disabled={state !== "done"}
              aria-expanded={expanded}
              aria-current={state === "current" ? "step" : undefined}
              onClick={() => setOpenStep(openStep === i ? null : i)}
            >
              <span className="acc-num">
                {state === "current" ? <i className="mini-spinner" /> : i + 1}
              </span>
              <strong>{title}</strong>
              {state === "done" && (
                <span className={"acc-chevron " + (expanded ? "up" : "")}>
                  <Icon name="chevron" size={18} />
                </span>
              )}
            </button>
            <div className={"acc-body " + (expanded ? "open" : "")}>
              <p>{detail}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
  return (
    <>
      <div
        className={
          "portrait-layout" +
          (!onboarding ? " biz-mode" : "") +
          (onboarding && !analyzing ? " review" : "") +
          (details ? " editing" : "")
        }
      >
        <section>
          <div
            className={
              "page-heading" + (onboarding && !analyzing ? " with-actions" : "")
            }
          >
            <div>
              <span className="eyebrow">
                {analyzing ? "FIRST CONTACT" : "YOUR BUSINESS PORTRAIT"}
              </span>
              <h1>
                {analyzing
                  ? `Getting to know ${p.name}.`
                  : onboarding || !p.reviewed
                    ? "Does this feel like you?"
                    : "Make it more you."}
              </h1>
              <p>
                {analyzing
                  ? p.sample
                    ? "A preview of how your business portrait comes together."
                    : "A starting portrait, without pretending we know what we do not."
                  : "A starting picture, not a verdict. Every detail is yours to change."}
              </p>
            </div>
            {onboarding && !analyzing && (
              <div className="feel-actions">
                <button
                  className="text-button"
                  onClick={() => setDetails(!details)}
                  aria-expanded={details}
                >
                  {details ? "Close editor" : "Edit details"}
                </button>
                <button className="meet-button" onClick={a.confirm}>
                  Yes, that’s me <Icon name="arrow" />
                </button>
              </div>
            )}
          </div>
          {!onboarding && (
            <BizProfile
              s={s}
              a={a}
              onEdit={() => {
                setDetails(true);
                setTimeout(
                  () =>
                    document
                      .querySelector(".profile-editor")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" }),
                  50,
                );
              }}
            />
          )}
          {analyzing && accordion}
          {!analyzing && (
            <>
              <section
                className="business-preview"
                aria-label="Example business profile"
              >
                <div className="business-preview-cover">
                  <img
                    src="/assets/numa/1zio9g.avif"
                    alt="Interior do Numa Studios, em Campeche"
                  />
                </div>
                <div className="business-preview-profile">
                  <div className="example-logo has-logo" aria-hidden="true">
                    <img src="/assets/numa/logo.svg" alt="" />
                  </div>
                  <div>
                    <div className="preview-name-row">
                      <h2>NUMA Studios</h2>
                      <span className="tag">Static reference</span>
                    </div>
                    <p>@thenumastudios · Campeche, Florianópolis</p>
                  </div>
                </div>
                <div className="business-preview-copy">
                  <p>
                    Hot Pilates, Sculpt e Yoga em um estúdio boutique com sala
                    aquecida no Campeche.
                  </p>
                  <div>
                    <span>Hot Pilates</span>
                    <span>Sculpt</span>
                    <span>Yoga</span>
                  </div>
                </div>
                <div className="latest-posts">
                  <div className="latest-posts-heading">
                    <h3>Latest posts</h3>
                    <span>Example only</span>
                  </div>
                  <div className="latest-post-grid">
                    <article className="social-post post-photo">
                      <img
                        src="/assets/numa/slide-5.png"
                        alt="Treino de pilates do Numa Studios"
                      />
                      <span>Movimento com intenção</span>
                    </article>
                    <article className="social-post post-menu">
                      <img
                        src="/assets/numa/slide-2.png"
                        alt="Ambiente do Numa Studios"
                      />
                      <span>Sala aquecida</span>
                    </article>
                    <article className="social-post post-note">
                      <img
                        src="/assets/numa/slide-3.png"
                        alt="Experiência wellness do Numa Studios"
                      />
                      <span>Numa Flow</span>
                    </article>
                  </div>
                </div>
              </section>
              {(!onboarding || details) && (
                <section className="profile-editor">
                  <div className="profile-editor-heading">
                    <div>
                      <span className="eyebrow">SPOT SOMETHING WRONG?</span>
                      <h2>Correct the details we'll use.</h2>
                      <p>
                        This example stays the same. Your corrections shape the
                        next suggestions and drafts.
                      </p>
                    </div>
                    <button
                      className="text-button detail-toggle"
                      onClick={() => setDetails(!details)}
                      aria-expanded={details}
                    >
                      {details ? "Close editor" : "Edit details"}{" "}
                      <Icon name={details ? "close" : "plus"} size={15} />
                    </button>
                  </div>
                  {details && (
                    <>
                      <div className="profile-fields profile-editor-fields">
                        {field("name", "Business name", "Your business")}
                        {
                          <label>
                            Type of business
                            <select
                              value={p.category}
                              onChange={(e) => edit("category", e.target.value)}
                            >
                              {Object.entries(categories).map(([k, v]) => (
                                <option value={k} key={k}>
                                  {v}
                                </option>
                              ))}
                            </select>
                            <small className="provenance">
                              {p.sample
                                ? "From example brief"
                                : "Confirm to make the next moves more relevant"}
                            </small>
                          </label>
                        }
                        {field(
                          "summary",
                          "The picture so far",
                          "Tell us what you do in a sentence. Live enrichment is not connected in this prototype.",
                          true,
                        )}
                        {field(
                          "services",
                          "Your services",
                          "e.g. Private Pilates, small-group classes",
                        )}
                        {field(
                          "offer",
                          "Your starting offer",
                          "e.g. An introductory session",
                        )}
                      </div>
                      <div className="profile-fields detail-fields">
                        {field("location", "Location", "Neighborhood or city")}
                        {field(
                          "price",
                          "Published starting price",
                          "Leave blank if not confirmed",
                        )}
                        {field(
                          "channel",
                          "How customers reach you",
                          "e.g. Website → inquiry → booking",
                        )}
                        {field(
                          "tone",
                          "Your voice",
                          "e.g. Warm, direct and helpful",
                        )}
                        {field(
                          "policy",
                          "Important policy or boundary",
                          "Terms that must not be invented",
                          true,
                        )}
                      </div>
                    </>
                  )}
                </section>
              )}
              {s.claimed && (
                <div className="goal-section">
                  <h3>What would make the biggest difference?</h3>
                  <div className="goal-options">
                    {goals.map((g) => (
                      <button
                        key={g.id}
                        aria-pressed={p.goal === g.id}
                        className={p.goal === g.id ? "selected" : ""}
                        onClick={() =>
                          a.update((x) => ({
                            ...x,
                            profile: { ...x.profile, goal: g.id },
                          }))
                        }
                      >
                        <Icon name={g.icon} size={18} />
                        {g.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {!onboarding && (
                <div className="portrait-footer">
                  <p>
                    <Icon name="coin" size={17} /> Reviewing earns 20 demo
                    credits when you activate.
                  </p>
                  <button
                    className="meet-button"
                    disabled={!p.name.trim()}
                    onClick={a.confirm}
                  >
                    That’s my business <Icon name="arrow" />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
        <aside className="portrait-aside">
          <Mascot level={p.reviewed ? 1 : 0} />
          <h3>
            Less explaining.
            <br />
            More understanding.
          </h3>
          <p>
            Correct a detail once. Your next moves and new drafts will use the
            updated picture.
          </p>
          <div className="evidence-note">
            <Icon name="shield" />
            <div>
              <strong>No invented certainty.</strong>
              <p>
                {p.sample
                  ? "This portrait uses an example profile, not a live audit."
                  : "Your site has not been read. Unknowns stay unknown."}{" "}
                We do not infer revenue, private data or authority from a name.
              </p>
            </div>
          </div>
          <button className="text-button" onClick={() => a.inspect("profile")}>
            Where did this come from? <Icon name="arrow" size={16} />
          </button>
        </aside>
      </div>
    </>
  );
}
export function Work({
  state: s,
  a,
  feedKey,
}: {
  state: State;
  a: Actions;
  feedKey: number;
}) {
  const p = s.profile;
  const list = moves(p);
  const level = stage(s);
  const count = diagnostics(p).length;
  return (
    <>
      <div className="page-heading work-heading">
        <h1>
          {count === 1
            ? "We found 1 thing to improve."
            : `We found ${count} things to improve.`}
        </h1>
        <button className="edit-profile" onClick={() => a.go("profile")}>
          <Icon name="edit" size={16} /> Your business
        </button>
      </div>
      <div className="work-layout">
        <section>
          <Diagnosis s={s} a={a} />
          {(s.claimed || s.jobs.length > 0) && (
            <>
              <div className="section-title">
                <h2>More Starchild can do</h2>
                <span>{goals.find((g) => g.id === p.goal)?.name}</span>
              </div>
              <div className="move-list">
                {list.map((m, i) => {
                  const done = s.jobs.find((j) => j.id === m.id);
                  return (
                    <article
                      className={`move-card ${i === 0 ? "featured" : ""} ${!s.claimed && !done ? "locked" : ""}`}
                      key={m.id}
                    >
                      <div className="move-number">0{i + 1}</div>
                      <div className="move-content">
                        <span className={`evidence-tag ${m.type}`}>
                          <i />
                          {m.label}
                        </span>
                        <h3>{m.title}</h3>
                        <p>{m.description}</p>
                        <button
                          className="evidence-link"
                          onClick={() => a.inspect(m.id)}
                        >
                          Why this suggestion? <Icon name="arrow" size={13} />
                        </button>
                        <div className="move-bottom">
                          <span>
                            {done ? (
                              <>
                                <Icon name="check" size={14} />{" "}
                                {done.approved
                                  ? "Reviewed draft"
                                  : "Draft ready"}
                              </>
                            ) : (
                              <>
                                <Icon
                                  name={s.claimed ? "coin" : "lock"}
                                  size={14}
                                />
                                {s.claimed
                                  ? `${costs[m.id]} credits`
                                  : "Unlocks with sign-up"}
                              </>
                            )}
                          </span>
                          <button
                            className="action-button"
                            onClick={() => a.job(m.id)}
                          >
                            {done
                              ? "Open my work"
                              : !s.claimed
                                ? "Sign up to unlock"
                                : m.id === "reconcile" &&
                                    !s.sources.some(
                                      (c) => c === "bank" || c === "erp",
                                    )
                                  ? "Explore sample data"
                                  : `Create ${m.id === "page" ? "my page" : m.id === "replies" ? "my replies" : m.id === "checklist" ? "my checklist" : "sample brief"}`}
                            <Icon name="arrow" size={16} />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
              <button
                className="extra-job"
                onClick={() =>
                  a.job(p.goal === "admin" ? "reconcile" : "checklist")
                }
              >
                <Icon name="plus" size={16} />{" "}
                {p.goal === "admin"
                  ? "Try a sample financial brief"
                  : "Prepare an intake checklist"}
              </button>
            </>
          )}
        </section>
      </div>
    </>
  );
}
const levelLabel: Record<Level, string> = {
  urgent: "Needs fixing",
  improve: "Can improve",
  minor: "Nice to have",
};
const levelOrder: Level[] = ["urgent", "improve", "minor"];
const areaOf: Record<string, { icon: string; label: string }> = {
  booking: { icon: "calendar", label: "Booking" },
  images: { icon: "globe", label: "Website" },
  language: { icon: "globe", label: "Website" },
  alt: { icon: "globe", label: "Website" },
  preview: { icon: "globe", label: "Website" },
  speed: { icon: "globe", label: "Website" },
  website: { icon: "globe", label: "Website" },
  google: { icon: "search", label: "Google" },
  maps: { icon: "pin", label: "Google Maps" },
  bio: { icon: "instagram", label: "Instagram" },
};
function Diagnosis({ s, a }: { s: State; a: Actions }) {
  const p = s.profile;
  const list = [...diagnostics(p)].sort(
    (x, y) => levelOrder.indexOf(x.level) - levelOrder.indexOf(y.level),
  );
  return (
    <div className="diagnosis">
      <div className="diagnosis-list">
        {list.map((d) => (
          <article className={"diagnosis-card " + d.level} key={d.id}>
            <div className="diagnosis-top">
              <span className={"diagnosis-status " + d.level}>
                <i />
                {levelLabel[d.level]}
              </span>
              {areaOf[d.id] && (
                <span className="diagnosis-area">
                  <Icon name={areaOf[d.id].icon} size={15} />
                  {areaOf[d.id].label}
                </span>
              )}
            </div>
            <h3>{d.title}</h3>
            <p>{d.seen}</p>
            <button className="action-button" onClick={() => a.job(d.job)}>
              Fix it for me
              <Icon name="arrow" size={15} />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
export function Manual({ state: s, a }: { state: State; a: Actions }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("other");
  const [services, setServices] = useState("");
  const [city, setCity] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [error, setError] = useState("");
  function submit(e: FormEvent) {
    e.preventDefault();
    const digits = whatsapp.replace(/\D/g, "");
    if (!name.trim()) return setError("Add your business name to continue.");
    if (whatsapp.trim() && (digits.length < 8 || digits.length > 15))
      return setError("Check the WhatsApp number, with area code.");
    a.start({
      ...s.profile,
      name: name.trim().slice(0, 120),
      site: "",
      nameSource: "business-name",
      sample: false,
      reviewed: false,
      category,
      summary: "",
      services: services.trim(),
      offer: "",
      price: "",
      location: city.trim(),
      channel: whatsapp.trim() ? `WhatsApp ${whatsapp.trim()}` : "",
      edited: [
        "name",
        ...(services.trim() ? ["services"] : []),
        ...(city.trim() ? ["location"] : []),
        ...(whatsapp.trim() ? ["channel"] : []),
      ] as Profile["edited"],
    });
    a.update((x) => ({ ...x, onboarding: false, page: "work" }));
  }
  return (
    <main className="discovery manual">
      <span className="eyebrow">NO LINK NEEDED</span>
      <h1>Tell us a little.</h1>
      <p>Four quick answers are enough to start. You can add more later.</p>
      <form className="manual-form" onSubmit={submit} noValidate>
        <label>
          Business name
          <input
            value={name}
            maxLength={120}
            autoFocus
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            placeholder="e.g. Studio Aurora"
          />
        </label>
        <label>
          Type of business
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
          >
            {Object.entries(categories).map(([k, v]) => (
              <option value={k} key={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label>
          What you offer
          <input
            value={services}
            maxLength={300}
            onChange={(e) => setServices(e.target.value)}
            placeholder="e.g. Private Pilates, small-group classes"
          />
        </label>
        <div className="manual-pair">
          <label>
            City
            <input
              value={city}
              maxLength={120}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. São Paulo"
            />
          </label>
          <label>
            WhatsApp
            <input
              value={whatsapp}
              maxLength={30}
              inputMode="tel"
              onChange={(e) => {
                setWhatsapp(e.target.value);
                setError("");
              }}
              placeholder="+55 11 91234-5678"
            />
          </label>
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button className="meet-button" type="submit">
          See what I can do <Icon name="arrow" />
        </button>
      </form>
      <button className="text-button" onClick={() => a.go("welcome")}>
        Back to the beginning
      </button>
    </main>
  );
}
export function Deliverables({ state: s, a }: { state: State; a: Actions }) {
  return (
    <>
      <div className="page-heading work-heading">
        <h1>Work</h1>
      </div>
      {s.jobs.length ? (
        <div className="job-list">
          {s.jobs.map((j) => (
            <button key={j.id} onClick={() => a.job(j.id)}>
              <span className="job-icon">
                <Icon name="doc" />
              </span>
              <span>
                <strong>{j.title}</strong>
                <small>
                  {j.approved ? "Approved" : "Ready to review"} · {j.cost}{" "}
                  credits
                </small>
              </span>
              <Icon name="arrow" size={18} />
            </button>
          ))}
        </div>
      ) : (
        <div className="empty-work">
          <Icon name="doc" size={24} />
          <p>
            Nothing here yet.
            <br />
            <strong>Fix something and it lands here.</strong>
          </p>
          <button className="action-button" onClick={() => a.go("work")}>
            See what to improve <Icon name="arrow" size={16} />
          </button>
        </div>
      )}
    </>
  );
}
type Finding = { label: string; value: string; tone?: "good" | "warn" | "bad" };
type Dash = {
  id: string;
  icon: string;
  title: string;
  headline: string;
  tag: string;
  tone: "approval" | "fixes" | "locked" | "connect" | "good";
  findings: Finding[];
  pitch: string;
  approve?: string;
  job?: JobKind;
  src?: string;
  srcLabel?: string;
  private?: boolean;
};
function BizProfile({
  s,
  a,
  onEdit,
}: {
  s: State;
  a: Actions;
  onEdit: () => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const p = s.profile;
  const numa = p.sample && p.category === "fitness";
  let host = "";
  try {
    host = new URL(p.site).host.replace(/^www\./, "");
  } catch {}
  const igHandle = numa
    ? "@thenumastudios"
    : p.nameSource === "instagram-handle"
      ? "@" + p.site.replace(/\/$/, "").split("/").pop()
      : "";
  const tags = (p.services || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 5);
  const done = (id: string) => s.approved[id];
  const gate = (id: string, ready: string, tone: Dash["tone"]) =>
    done(id) === "weekly"
      ? { tag: "Running weekly", tone: "good" as const }
      : done(id)
        ? { tag: "Approved", tone: "good" as const }
        : { tag: ready, tone };
  const priv = (id: string, src: string) =>
    !s.claimed
      ? { tag: "Sign up to unlock", tone: "locked" as const }
      : !s.sources.includes(src)
        ? { tag: "Connect to see", tone: "connect" as const }
        : { tag: "Up to date", tone: "good" as const };
  const cards: Dash[] = [
    {
      id: "ig",
      icon: "instagram",
      title: "Instagram",
      headline: igHandle || "Not linked yet",
      ...gate("ig", "Needs your approval", "approval"),
      findings: [
        { label: "Posts this month", value: "12" },
        { label: "Longest gap", value: "9 days", tone: "warn" },
        { label: "Schedule", value: "None", tone: "bad" },
      ],
      pitch:
        "Your posts are scattered, with no schedule. I can build a weekly plan with content and images. Give me the OK and I'll do this week's, then you decide if I keep going.",
      approve: "OK, do this week's",
    },
    {
      id: "site",
      icon: "globe",
      title: "Website",
      headline: host || "No website yet",
      ...(numa
        ? gate("site", "4 fixes ready", "fixes")
        : host
          ? gate("site", "Ready to check", "fixes")
          : { tag: "No website", tone: "fixes" as const }),
      findings: numa
        ? [
            { label: "Load time", value: "0.3 s", tone: "good" },
            { label: "Photos", value: "about 1 MB", tone: "warn" },
            {
              label: "Language",
              value: "English and Portuguese",
              tone: "warn",
            },
            { label: "Google details", value: "Missing", tone: "bad" },
          ]
        : [
            {
              label: "Website",
              value: host || "None found",
              tone: host ? undefined : "bad",
            },
          ],
      pitch: numa
        ? "I can fix these. Give me the OK and I'll start with the photos and the Google details."
        : "I can build or check your site. Give me the OK and I'll start with a first page.",
      approve: "OK, start fixing",
      job: "page",
    },
    {
      id: "maps",
      icon: "pin",
      title: "Google Maps",
      headline: p.location || "Your area",
      ...(!s.claimed
        ? { tag: "Sign up to unlock", tone: "locked" as const }
        : gate("maps", "Needs your approval", "approval")),
      findings: [
        { label: "Listing", value: "Claimed", tone: "good" },
        { label: "Reviews waiting", value: "3", tone: "warn" },
        { label: "Hours match your site", value: "Yes", tone: "good" },
      ],
      pitch:
        "Three reviews are waiting for an answer. I can draft replies in your voice. You approve each one.",
      approve: "OK, draft the replies",
      private: true,
    },
    {
      id: "wa",
      icon: "whatsapp",
      title: "WhatsApp with Starchild",
      headline: "Owner channel",
      ...priv("wa", "social"),
      findings: [
        { label: "Questions waiting", value: "3" },
        { label: "Fixes approved by chat", value: "5" },
        { label: "Last reply", value: "12 min ago" },
      ],
      pitch:
        "Talk to me here instead of the app. I'll message you what needs your approval.",
      src: "social",
      srcLabel: "Connect WhatsApp",
      private: true,
    },
    {
      id: "book",
      icon: "calendar",
      title: "Scheduling",
      headline: "Classes and bookings",
      ...priv("book", "bookings"),
      findings: [
        { label: "Classes this week", value: "28" },
        { label: "Average fill", value: "74%" },
        { label: "Cancellations", value: "9", tone: "warn" },
      ],
      pitch:
        "I'll watch class fill and cancellations, and tell you what to move.",
      src: "bookings",
      srcLabel: "Connect scheduling",
      private: true,
    },
    {
      id: "fin",
      icon: "wallet",
      title: "Finance",
      headline: "Payments and invoices",
      ...priv("fin", "bank"),
      findings: [
        { label: "Revenue this month", value: "R$ 48,200" },
        { label: "Unpaid invoices", value: "6", tone: "warn" },
        { label: "Unmatched payments", value: "2", tone: "warn" },
      ],
      pitch: "I'll match payments to invoices and flag what's missing.",
      src: "bank",
      srcLabel: "Connect finance",
      private: true,
    },
  ];
  const open = cards.find((c) => c.id === openId) || null;
  function approve(c: Dash) {
    if (!s.claimed) {
      a.claim();
      return;
    }
    a.update((x) => ({ ...x, approved: { ...x.approved, [c.id]: "once" } }));
    if (c.job) {
      setOpenId(null);
      a.job(c.job);
    }
  }
  if (open) {
    const monday = new Date();
    monday.setHours(12, 0, 0, 0);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    const at = (n: number) => {
      const d = new Date(monday);
      d.setDate(d.getDate() + n);
      return d;
    };
    const posts = [
      {
        img: "/assets/numa/slide-5.png",
        when: at(1),
        time: "09:00",
        caption:
          "Hot Pilates: calor, controle e foco total. Reserve a sua aula pelo link na bio.",
      },
      {
        img: "/assets/numa/slide-2.png",
        when: at(3),
        time: "18:30",
        caption:
          "A sala aquecida do jeito que voc\u00EA gosta. Chegue 10 minutos antes e respire.",
      },
      {
        img: "/assets/numa/slide-3.png",
        when: at(5),
        time: "10:00",
        caption:
          "Numa Flow: movimento que acalma a semana. Qual aula voc\u00EA escolhe hoje?",
      },
    ];
    const fmt = (d: Date) =>
      d.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
    const ref = new Date();
    const y = ref.getFullYear();
    const mo = ref.getMonth();
    const lead = (new Date(y, mo, 1).getDay() + 6) % 7;
    const days = new Date(y, mo + 1, 0).getDate();
    const key = (d: Date) =>
      d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();
    const thisWeek = new Set(posts.map((p) => key(p.when)));
    const later = new Set([8, 10, 12, 15, 17, 19].map((n) => key(at(n))));
    const isIg = open.id === "ig";
    const needsGate = !!open.src;
    const blurred =
      open.private &&
      (!s.claimed || (open.src && !s.sources.includes(open.src)));
    return (
      <div className="biz-detail">
        <nav className="crumbs" aria-label="Breadcrumb">
          <button onClick={() => setOpenId(null)}>Your business</button>
          <span>/</span>
          <b>{open.title}</b>
        </nav>
        <header className="detail-head">
          <span className="dash-icon">
            <Icon name={open.icon} size={22} />
          </span>
          <div>
            <h1>{open.title}</h1>
            <span className={"dash-tag " + open.tone}>{open.tag}</span>
          </div>
        </header>
        <p className="dash-pitch">{open.pitch}</p>
        {isIg ? (
          <div className="ig-layout">
            <div className="ig-posts">
              {posts.map((p) => (
                <article className="ig-post" key={p.img}>
                  <img src={p.img} alt="" />
                  <div>
                    <span className="ig-when">
                      <Icon name="calendar" size={13} /> {fmt(p.when)}{" "}
                      {"\u00B7"} {p.time}
                    </span>
                    <p>{p.caption}</p>
                  </div>
                </article>
              ))}
            </div>
            <aside className="ig-cal" aria-label="Posting calendar">
              <header>
                <strong>
                  {ref.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </strong>
              </header>
              <div className="cal-grid">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <span className="cal-dow" key={i}>
                    {d}
                  </span>
                ))}
                {Array.from({ length: lead }, (_, i) => (
                  <span key={"b" + i} />
                ))}
                {Array.from({ length: days }, (_, i) => {
                  const d = new Date(y, mo, i + 1, 12);
                  const k = key(d);
                  return (
                    <span
                      key={i}
                      className={
                        "cal-day" +
                        (thisWeek.has(k)
                          ? " week"
                          : later.has(k)
                            ? " later"
                            : "") +
                        (key(ref) === k ? " today" : "")
                      }
                    >
                      {i + 1}
                    </span>
                  );
                })}
              </div>
              <ul className="cal-legend">
                <li>
                  <i className="week" /> This week
                </li>
                <li>
                  <i className="later" /> If I keep going
                </li>
              </ul>
            </aside>
          </div>
        ) : (
          <div className={"dash-findings" + (blurred ? " is-blurred" : "")}>
            {open.findings.map((f) => (
              <div key={f.label}>
                <span>{f.label}</span>
                <b className={f.tone}>{f.value}</b>
              </div>
            ))}
          </div>
        )}
        {done(open.id) ? (
          <div className="dash-done">
            <p>
              <Icon name="check" size={16} />{" "}
              {done(open.id) === "weekly"
                ? "Running every week. You can stop it anytime."
                : "Done for this week. Want me to keep going?"}
            </p>
            {done(open.id) === "once" && (
              <div className="dash-actions">
                <button
                  className="meet-button"
                  onClick={() =>
                    a.update((x) => ({
                      ...x,
                      approved: { ...x.approved, [open.id]: "weekly" },
                    }))
                  }
                >
                  Yes, keep going <Icon name="arrow" />
                </button>
                <button className="text-button" onClick={() => setOpenId(null)}>
                  Just this week
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="dash-actions">
            {needsGate ? (
              <button
                className="meet-button"
                onClick={() =>
                  s.claimed && open.src
                    ? (setOpenId(null), a.connect(open.src))
                    : a.claim()
                }
              >
                {s.claimed ? open.srcLabel : "Sign up to unlock"}{" "}
                <Icon name="arrow" />
              </button>
            ) : (
              <button className="meet-button" onClick={() => approve(open)}>
                {s.claimed || !open.private
                  ? open.approve
                  : "Sign up to unlock"}{" "}
                <Icon name="arrow" />
              </button>
            )}
            <button className="text-button" onClick={() => setOpenId(null)}>
              Not now
            </button>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="biz-top">
      <div className="biz-cover">
        {numa ? (
          <img
            src="/assets/numa/1zio9g.avif"
            alt="Interior do Numa Studios, em Campeche"
          />
        ) : (
          <div className="biz-cover-fallback" />
        )}
      </div>
      <div className="biz-head">
        <div
          className={"biz-avatar" + (numa ? " has-logo" : "")}
          aria-hidden="true"
        >
          {numa ? (
            <img src="/assets/numa/logo.svg" alt="" />
          ) : (
            p.name.slice(0, 1).toUpperCase()
          )}
        </div>
        <div className="biz-id">
          <h1>{p.name}</h1>
          <p>
            {[igHandle, p.location].filter(Boolean).join(" \u00B7 ") ||
              host ||
              "Your business"}
          </p>
        </div>
        <button className="edit-profile" onClick={onEdit}>
          <Icon name="edit" size={16} /> Edit details
        </button>
      </div>
      {p.summary && <p className="biz-desc">{p.summary}</p>}
      {tags.length > 0 && (
        <div className="biz-tags">
          {tags.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      )}
      <div className="biz-dash">
        {cards.map((c) => (
          <button
            className="dash-card"
            key={c.id}
            onClick={() => setOpenId(c.id)}
          >
            <span className="dash-icon">
              <Icon name={c.icon} size={20} />
            </span>
            <span className="dash-text">
              <strong>{c.title}</strong>
              <small>{c.headline}</small>
            </span>
            <span className={"dash-tag " + c.tone}>
              {c.tone === "locked" && <Icon name="lock" size={12} />}
              {c.tag}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
