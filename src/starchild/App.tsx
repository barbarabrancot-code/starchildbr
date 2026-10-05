import { useEffect, useRef, useState } from "react";
import { Icon, Mark } from "./Mascot";
import {
  initial,
  balance,
  award,
  createJob,
  costs,
  goals,
  stage,
  stages,
  jobTitle,
  type State,
  type Page,
  type Profile,
  type JobKind,
  type Job,
} from "./model";
import {
  Welcome,
  Manual,
  Portrait,
  Work,
  Deliverables,
  type Actions,
} from "./Screens";
import { Connections, Evolution, Credits, Plans } from "./Extras";
import { Dialogs, type Modal } from "./Dialogs";
import { Companion } from "./Companion";
const KEY = "starchild-prototype-v1";
export function App() {
  const [s, setS] = useState<State>(initial);
  const [ready, setReady] = useState(false);
  const [modal, setModal] = useState<Modal>(null);
  const [toast, setToast] = useState("");
  const [pending, setPending] = useState<JobKind | null>(null);
  const [working, setWorking] = useState(false);
  const [feed, setFeed] = useState(0);
  const [bizOpen, setBizOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [scopeAccepted, setScopeAccepted] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const x = JSON.parse(raw);
        if (
          x.version === 1 &&
          x.profile &&
          typeof x.profile.name === "string" &&
          Array.isArray(x.ledger) &&
          Array.isArray(x.jobs) &&
          Array.isArray(x.sources)
        )
          setS({
            ...initial(),
            ...x,
            page: x.page === "discover" ? "profile" : x.page,
          });
      }
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem(KEY, JSON.stringify(s));
      } catch {}
    }
  }, [s, ready]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 5500);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  function switchBusiness(id: string) {
    setS((x) => {
      const target = x.saved.find((b) => b.id === id);
      if (!target) return x;
      return {
        ...x,
        profile: target.profile,
        jobs: target.jobs,
        sources: target.sources,
        businessId: target.id,
        onboarding: false,
        page: "work",
        saved: [
          ...x.saved.filter((b) => b.id !== id),
          {
            id: x.businessId,
            profile: x.profile,
            jobs: x.jobs,
            sources: x.sources,
          },
        ],
      };
    });
    setModal(null);
    setPending(null);
    setBizOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function go(page: Page) {
    setS((x) => ({
      ...x,
      page,
    }));
    setModal(null);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function notify(t: string) {
    setToast(t);
  }
  function openJob(k: JobKind) {
    if (s.jobs.some((j) => j.id === k)) {
      setModal({ kind: "artifact", id: k });
      return;
    }
    setPending(k);
    if (!s.claimed) {
      setModal({ kind: "claim" });
      return;
    }
    if (
      k === "reconcile" &&
      !s.sources.some((x) => x === "bank" || x === "erp")
    ) {
      setScopeAccepted(false);
      setModal({ kind: "source", id: "erp" });
      return;
    }
    if (balance(s) < costs[k]) {
      go("credits");
      notify("Not enough work credits.");
      return;
    }
    setModal({ kind: "run", id: k });
  }
  function claim() {
    let next = award(
      { ...s, claimed: true, name: displayName.trim().slice(0, 60) },
      "signup",
      "Signup work allowance",
      100,
    );
    if (next.profile.reviewed)
      next = award(next, "profile", "Business portrait reviewed", 20);
    if (goals.some((g) => g.id === next.profile.goal))
      next = award(next, "goal", "Business priority confirmed", 20);
    setS(next);
    notify("Your workspace is ready.");
    if (pending) {
      if (
        pending === "reconcile" &&
        !next.sources.some((x) => x === "bank" || x === "erp")
      ) {
        setScopeAccepted(false);
        setModal({ kind: "source", id: "erp" });
      } else setModal({ kind: "run", id: pending });
    } else setModal(null);
  }
  function run(k: JobKind) {
    if (working) return;
    if (s.jobs.some((j) => j.id === k)) {
      setModal({ kind: "artifact", id: k });
      return;
    }
    if (balance(s) < costs[k]) {
      notify("Not enough work credits.");
      return;
    }
    setWorking(true);
    timer.current = setTimeout(() => {
      setS((x) => {
        if (x.jobs.some((j) => j.id === k) || balance(x) < costs[k]) return x;
        return award(
          { ...x, jobs: [...x.jobs, createJob(k, x.profile)] },
          `job-${k}`,
          jobTitle(k, x.profile),
          -costs[k],
        );
      });
      setFeed((v) => v + 1);
      setWorking(false);
      setPending(null);
      setModal({ kind: "artifact", id: k });
      notify("One less thing to start from scratch. Your draft is ready.");
    }, 850);
  }
  function source(id: string) {
    setScopeAccepted(false);
    setModal({ kind: "source", id });
  }
  function activateSource(id: string) {
    if (!s.claimed) {
      setModal({ kind: "claim" });
      setPending(null);
      notify("Create your account first, then connect.");
      return;
    }
    setS((x) =>
      award(
        { ...x, sources: [...new Set([...x.sources, id])] },
        "source",
        "First useful sample source",
        60,
      ),
    );
    setFeed((v) => v + 1);
    notify("Connected.");
    if (pending === "reconcile" && (id === "bank" || id === "erp"))
      setModal({ kind: "run", id: "reconcile" });
    else setModal(null);
  }
  function revoke(id: string) {
    setS((x) => ({ ...x, sources: x.sources.filter((v) => v !== id) }));
    setModal(null);
    notify("Disconnected. Your drafts are unchanged.");
  }
  function reset() {
    if (
      !window.confirm(
        "Reset this prototype? This clears only your local demo profile, drafts and credits.",
      )
    )
      return;
    setS(initial());
    setModal(null);
    setPending(null);
    setDisplayName("");
    localStorage.removeItem(KEY);
    notify("A fresh beginning. Local demo data cleared.");
  }
  const a: Actions = {
    update: setS,
    go,
    start: (p: Profile) => {
      setS((x) => {
        const keep =
          x.profile.name && x.profile.name !== p.name
            ? [
                ...x.saved.filter((b) => b.id !== x.businessId),
                {
                  id: x.businessId,
                  profile: x.profile,
                  jobs: x.jobs,
                  sources: x.sources,
                },
              ]
            : x.saved;
        const fresh = initial();
        return {
          ...fresh,
          profile: p,
          page: "profile",
          onboarding: true,
          quiet: x.quiet,
          reduced: x.reduced,
          claimed: x.claimed,
          ledger: x.claimed ? x.ledger : [],
          name: x.claimed ? x.name : "",
          plan: x.plan,
          saved: keep,
          businessId: keep === x.saved ? x.businessId : Date.now().toString(36),
        };
      });
      setPending(null);
    },
    confirm: () => {
      setS((x) => {
        let n: State = {
          ...x,
          page: "work",
          onboarding: false,
          profile: { ...x.profile, reviewed: true },
        };
        if (n.claimed)
          n = award(n, "profile", "Business portrait reviewed", 20);
        return n;
      });
      setFeed((v) => v + 1);
      notify("Your portrait is confirmed. Let’s make something useful.");
      window.scrollTo({ top: 0, behavior: "instant" });
    },
    job: openJob,
    claim: () => {
      setPending(null);
      setModal({ kind: "claim" });
    },
    inspect: (id: string) => setModal({ kind: "evidence", id }),
    connect: source,
    notify,
  };
  const home =
    s.page === "welcome" || s.page === "discover" || s.page === "manual";
  const nav: {
    id: string;
    icon: string;
    label: string;
    sub?: string;
    page?: Page;
    run?: () => void;
  }[] = [
    { id: "work", icon: "spark", label: "Your next moves", page: "work" },
    { id: "profile", icon: "grid", label: "Your business", page: "profile" },
    {
      id: "whatsapp",
      icon: "whatsapp",
      label: "WhatsApp",
      sub: "Owner channel",
      run: () => source("social"),
    },
    { id: "deliverables", icon: "doc", label: "Work", page: "deliverables" },
    {
      id: "connections",
      icon: "link",
      label: "Connections",
      page: "connections",
    },
  ];
  const pageLabel: Record<string, string> = {
    work: "Your next moves",
    profile: "Your business",
    deliverables: "Work",
    connections: "Connections",
    evolution: "Your Starchild",
    credits: "Plan & credits",
    plans: "Packages",
  };
  const level = stage(s);
  return (
    <div
      className={`sc-app ${s.onboarding && s.page === "profile" ? "onboarding" : ""} ${s.reduced ? "reduce-motion" : ""} ${s.quiet ? "quiet-mode" : ""}`}
    >
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {home ? (
        <header className="landing-header">
          <button className="wordmark" onClick={() => go("welcome")}>
            <Mark />
            starchild
          </button>
        </header>
      ) : (
        <aside className="sidebar">
          <button className="wordmark" onClick={() => go("welcome")}>
            <Mark />
            starchild
          </button>
          <div className="biz-switch">
            <button
              className="workspace-label"
              aria-expanded={bizOpen}
              aria-haspopup="menu"
              onClick={() => setBizOpen(!bizOpen)}
            >
              <span className="business-avatar">
                {s.profile.name.slice(0, 1) || "S"}
              </span>
              <span className="biz-name">
                <strong>{s.profile.name || "Your workspace"}</strong>
                <small>
                  {s.saved.length + 1}{" "}
                  {s.saved.length ? "businesses" : "business"}
                </small>
              </span>
              <Icon name="chevron" size={16} />
            </button>
            {bizOpen && (
              <div className="biz-menu" role="menu">
                <div className="biz-item current" role="menuitem">
                  <span className="business-avatar">
                    {s.profile.name.slice(0, 1) || "S"}
                  </span>
                  <strong>{s.profile.name}</strong>
                  <Icon name="check" size={15} />
                </div>
                {s.saved.map((b) => (
                  <button
                    key={b.id}
                    className="biz-item"
                    role="menuitem"
                    onClick={() => switchBusiness(b.id)}
                  >
                    <span className="business-avatar">
                      {b.profile.name.slice(0, 1) || "S"}
                    </span>
                    <strong>{b.profile.name}</strong>
                  </button>
                ))}
                <button
                  className="biz-item biz-add"
                  role="menuitem"
                  onClick={() => {
                    setBizOpen(false);
                    go("welcome");
                  }}
                >
                  <Icon name="plus" size={16} /> Add a business
                </button>
              </div>
            )}
          </div>
          <nav aria-label="Main navigation">
            {nav.map((n) => (
              <button
                key={n.id}
                className={n.page && s.page === n.page ? "active" : ""}
                disabled={s.onboarding && s.page === "profile"}
                onClick={() => (n.page ? go(n.page) : n.run?.())}
              >
                <Icon name={n.icon} size={19} />
                <span className="nav-text">
                  {n.label}
                  {n.sub && <small>{n.sub}</small>}
                </span>
                {n.id === "connections" && s.sources.length > 0 && (
                  <b>{s.sources.length}</b>
                )}
              </button>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <button className="side-companion" onClick={() => go("evolution")}>
              <img src="/assets/starchild-original-blob.webp" alt="" />
              <span>
                <strong>{stages[level].name}</strong>
                <small>
                  {s.claimed ? balance(s) : 100} work credits · this business
                </small>
              </span>
              <Icon name="arrow" size={16} />
            </button>
            <button onClick={() => go("credits")}>
              <Icon name="coin" size={18} /> Plan & credits
            </button>
            <button onClick={() => setModal({ kind: "settings" })}>
              <Icon name="settings" size={18} /> Settings
            </button>
            <button onClick={() => setModal({ kind: "about" })}>
              <span className="status-dot" /> About this prototype
            </button>
          </div>
        </aside>
      )}
      <div id="main" className={home ? "home-body" : "app-body"}>
        {!home && (
          <header className="app-header">
            <span>
              Workspace <span className="slash">/</span> {pageLabel[s.page]}
            </span>
            <div>
              <button
                className="credit-pill"
                onClick={s.claimed ? () => go("credits") : a.claim}
              >
                <Icon name="coin" size={16} />
                {s.claimed ? balance(s) : 100}
                <span>credits</span>
              </button>
              <button
                className="user-avatar"
                onClick={() => setModal({ kind: "settings" })}
                aria-label="Workspace preferences"
              >
                {s.name.slice(0, 1) || "Y"}
              </button>
            </div>
          </header>
        )}
        <div className={home ? "" : "app-content"} key={s.page}>
          {s.page === "welcome" ? (
            <Welcome state={s} a={a} />
          ) : s.page === "manual" ? (
            <Manual state={s} a={a} />
          ) : s.page === "profile" ? (
            <Portrait state={s} a={a} />
          ) : s.page === "work" ? (
            <Work state={s} a={a} feedKey={feed} />
          ) : s.page === "deliverables" ? (
            <Deliverables state={s} a={a} />
          ) : s.page === "connections" ? (
            <Connections state={s} a={a} connect={source} />
          ) : s.page === "evolution" ? (
            <Evolution state={s} a={a} />
          ) : s.page === "credits" ? (
            <Credits state={s} a={a} />
          ) : (
            <Plans state={s} a={a} />
          )}
        </div>
        {!home && (
          <footer className="app-footer">
            <span>Less busywork. More business.</span>
          </footer>
        )}
      </div>
      {toast && (
        <div className="toast" role="status">
          <Icon name="check" size={17} />
          {toast}
          <button
            onClick={() => setToast("")}
            aria-label="Dismiss notification"
          >
            <Icon name="close" size={15} />
          </button>
        </div>
      )}
      {!home && !s.onboarding && <Companion s={s} a={a} />}
      <Dialogs
        modal={modal}
        s={s}
        update={setS}
        close={() => {
          if (!working) setModal(null);
        }}
        name={displayName}
        setName={setDisplayName}
        scope={scopeAccepted}
        setScope={setScopeAccepted}
        claim={claim}
        run={run}
        working={working}
        activate={activateSource}
        revoke={revoke}
        reset={reset}
        feed={() => setFeed((v) => v + 1)}
        notify={notify}
        save={(j: Job) =>
          setS((x) => ({
            ...x,
            jobs: x.jobs.map((v) => (v.id === j.id ? j : v)),
          }))
        }
      />
    </div>
  );
}
