import { useState } from "react";
import { Icon, Mascot } from "./Mascot";
import { balance, stage, stages, sourceOptions, type State } from "./model";
import type { Actions } from "./Screens";
export function Connections({
  state: s,
  a,
  connect,
}: {
  state: State;
  a: Actions;
  connect: (id: string) => void;
}) {
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">CONTEXT, ON YOUR TERMS</span>
        <h1>
          Feed it context.
          <br />
          Not your entire life.
        </h1>
        <p>
          A useful connection earns 60 demo credits once. Read-only by default.
          Nothing here connects to a real account.
        </p>
      </div>
      <div className="connection-grid">
        {sourceOptions.map((c) => {
          const active = s.sources.includes(c.id);
          return (
            <article className="connection-card" key={c.id}>
              <div className="connection-top">
                <span className={`connection-logo ${c.id}`}>
                  <Icon name={c.icon} size={25} />
                </span>
                <span className={`tag ${active ? "green" : ""}`}>
                  {active ? "Sample active" : "Simulation"}
                </span>
              </div>
              <h2>{c.name}</h2>
              <small>{c.brand}</small>
              <p>{c.why}</p>
              <div className="scope-box">
                <Icon name="lock" size={15} />
                <span>
                  {active
                    ? "Bundled sample only. Access can be revoked."
                    : "Review the exact scope before activating."}
                </span>
              </div>
              <button
                className="connection-action"
                onClick={() => connect(c.id)}
              >
                {active ? "Review sample access" : "Explore connection"}
                <Icon name="arrow" size={18} />
              </button>
            </article>
          );
        })}
      </div>
      <div className="privacy-panel">
        <Icon name="shield" size={28} />
        <div>
          <h3>Good help does not need everything.</h3>
          <p>
            Connections only unlock relevant tasks. No private messages,
            financial credentials, client lists or health records are requested.
            Revoking sample access never removes earned credits.
          </p>
          <button className="text-button" onClick={() => a.inspect("privacy")}>
            Read the prototype boundaries <Icon name="arrow" size={15} />
          </button>
        </div>
      </div>
      <div className="community-panel">
        <div>
          <span className="eyebrow">THE LOCAL LAYER</span>
          <h2>
            Your independence.
            <br />A little more connected.
          </h2>
          <p>
            Explore a future local network for introductions, shared experiences
            and independent businesses. Participation never shares customer
            records.
          </p>
        </div>
        <div>
          <button
            className={s.community ? "outline-button" : "action-button"}
            onClick={() => {
              a.update((x) => ({ ...x, community: !x.community }));
              a.notify(
                s.community
                  ? "Community preview disabled."
                  : "Community preview enabled locally. No listing or introduction was published.",
              );
            }}
          >
            {s.community
              ? "Leave community preview"
              : "Explore the community preview"}
            <Icon name="arrow" size={16} />
          </button>
          <small>Demo preference only. No live directory.</small>
        </div>
      </div>
    </>
  );
}
export function Evolution({ state: s, a }: { state: State; a: Actions }) {
  const actual = stage(s);
  const [selected, setSelected] = useState(actual);
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">A HEALTHY APPETITE FOR BUSYWORK</span>
        <h1>
          Small beginning.
          <br />
          Extraordinary potential.
        </h1>
        <p>
          From a single cell to your Starchild. Every stage celebrates useful
          progress, not how much you spend.
        </p>
      </div>
      <div className="evolution-showcase">
        <div className="evo-stage">
          <span className="stage-preview-label">
            {selected === actual
              ? "YOUR CURRENT STAGE"
              : "CHARACTER PREVIEW ONLY"}{" "}
            · 0{selected + 1} / 05
          </span>
          <Mascot
            level={selected}
            interactive
            onMunch={() => setSelected((v) => Math.min(4, v + 1))}
          />
          <div className="evo-stage-name">
            <h2>{stages[selected].name}</h2>
            <p>{stages[selected].line}</p>
          </div>
        </div>
        <div className="evolution-steps">
          {stages.map((v, i) => (
            <button
              className={`evolution-step ${selected === i ? "selected" : ""}`}
              key={v.name}
              onClick={() => setSelected(i)}
            >
              <span
                className={
                  i <= actual ? "stage-number achieved" : "stage-number"
                }
              >
                {i < actual ? (
                  <Icon name="check" size={17} />
                ) : (
                  String(i + 1).padStart(2, "0")
                )}
              </span>
              <span>
                <strong>{v.name}</strong>
                <small>{v.detail}</small>
              </span>
              {i === actual && <span className="tag">You are here</span>}
            </button>
          ))}
        </div>
      </div>
      <div className="policy-card">
        <div>
          <Icon name="shield" size={24} />
          <h3>More capable. Never less accountable.</h3>
          <p>
            Plans change your work allowance, not permission. This prototype can
            prepare drafts. It cannot send messages, publish, move money or
            change business records.
          </p>
        </div>
        <label className="policy-checkbox">
          <input
            type="checkbox"
            checked={s.policy}
            onChange={(e) =>
              a.update((x) => ({ ...x, policy: e.target.checked }))
            }
          />
          <span>
            My operating policy: draft first. Ask before anything goes live.
            <small>
              Demo acknowledgement only. It grants no external access.
            </small>
          </span>
        </label>
      </div>
      <img
        className="brand-cover"
        src="/assets/cover.webp"
        alt="Starchild, an organic business companion. Less busywork. More business."
      />
    </>
  );
}
export function Credits({ state: s, a }: { state: State; a: Actions }) {
  const onboarding = [
    {
      id: "signup",
      title: "Meet your Starchild",
      description: "Activate the local demo workspace.",
      amount: 100,
      action: a.claim,
    },
    {
      id: "profile",
      title: "Review your business portrait",
      description: "Correct it or confirm it. Accuracy earns the same reward.",
      amount: 20,
      action: () => a.go("profile"),
    },
    {
      id: "goal",
      title: "Choose what matters",
      description: "Tell us which outcome would help most.",
      amount: 20,
      action: () => a.go("profile"),
    },
    {
      id: "source",
      title: "Explore one useful source",
      description: "Use a bundled sample. One reward, not one per app.",
      amount: 60,
      action: () => a.go("connections"),
    },
  ];
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">WORK CREDITS</span>
        <h1>
          Make room for
          <br />
          the useful things.
        </h1>
        <p>
          Clear costs. No token math. These are prototype credits, not money or
          a paid balance.
        </p>
      </div>
      <div className="credits-overview">
        <div>
          <Icon name="coin" size={26} />
          <strong>{balance(s)}</strong>
          <span>available demo credits</span>
        </div>
        <p>
          See the cost before every job.
          <br />
          Reopening and editing a draft is free.
          <br />
          No rewards for uploading more personal data.
        </p>
      </div>
      <div className="credit-milestones">
        {onboarding.map((o) => {
          const done = s.ledger.some((e) => e.id === o.id);
          return (
            <div key={o.id}>
              <span className="milestone-icon">
                <Icon name={done ? "check" : "spark"} />
              </span>
              <span>
                <strong>{o.title}</strong>
                <p>{o.description}</p>
              </span>
              <b>+{o.amount}</b>
              <button
                className="outline-button"
                disabled={done}
                onClick={o.action}
              >
                {done ? "Earned" : "Explore"}
              </button>
            </div>
          );
        })}
      </div>
      <div className="section-title">
        <h2>Every credit, accounted for</h2>
        <span>{s.ledger.length} entries</span>
      </div>
      <div className="ledger">
        {s.ledger.length ? (
          s.ledger
            .slice()
            .reverse()
            .map((e) => (
              <div key={e.id}>
                <span>
                  <strong>{e.label}</strong>
                  <small>
                    {new Date(e.at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })}
                  </small>
                </span>
                <b className={e.amount > 0 ? "positive" : ""}>
                  {e.amount > 0 ? "+" : ""}
                  {e.amount}
                </b>
              </div>
            ))
        ) : (
          <p>Activate your demo workspace to claim the first 100 credits.</p>
        )}
      </div>
    </>
  );
}
export function Plans({ state: s, a }: { state: State; a: Actions }) {
  const plans = [
    {
      name: "Explore",
      price: "0",
      description: "A small beginning. One useful result.",
      features: [
        "100 signup work credits",
        "Editable business portrait",
        "Useful drafts you can keep",
        "No card required",
      ],
    },
    {
      name: "Solo",
      price: "249",
      description: "Your craft. Less of everything else.",
      features: [
        "Proposed: 400 monthly credits",
        "A bounded operating routine",
        "Approval-first actions",
        "One business workspace",
      ],
    },
    {
      name: "Grow",
      price: "1,490",
      description: "A little team around your business.",
      features: [
        "Proposed: 2,500 monthly credits",
        "More supported workflows",
        "Operator-assisted setup",
        "Defined human escalation",
      ],
    },
  ];
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">CHOOSE YOUR CAPACITY</span>
        <h1>
          More work off your plate.
          <br />
          Not more software to learn.
        </h1>
        <p>
          Illustrative package design only. No plan is for sale here. Selecting
          one changes the preview, not your bill or permissions.
        </p>
      </div>
      <div className="plan-grid">
        {plans.map((p, i) => (
          <article
            key={p.name}
            className={`plan-card ${i === 1 ? "highlight" : ""}`}
          >
            <span className="tag">
              {s.plan === p.name
                ? "Preview selected"
                : i === 1
                  ? "FOR INDEPENDENTS"
                  : "PACKAGE CONCEPT"}
            </span>
            <h2>{p.name}</h2>
            <p>{p.description}</p>
            <div className="plan-price">
              <small>R$</small>
              {p.price}
              <span>/ month</span>
            </div>
            <ul>
              {p.features.map((f) => (
                <li key={f}>
                  <Icon name="check" size={17} />
                  {f}
                </li>
              ))}
            </ul>
            <button
              className={s.plan === p.name ? "outline-button" : "action-button"}
              onClick={() => {
                a.update((x) => ({ ...x, plan: p.name }));
                a.notify(
                  `${p.name} preview selected. No charge. No extra authority or live service activated.`,
                );
              }}
            >
              {s.plan === p.name ? "Selected in preview" : `Preview ${p.name}`}
              <Icon name="arrow" size={16} />
            </button>
          </article>
        ))}
      </div>
      <div className="privacy-panel">
        <Icon name="lock" size={25} />
        <div>
          <h3>Upgrades never purchase certainty or permission.</h3>
          <p>
            Real packaging would need tested delivery costs, supported
            integrations and explicit service terms. Advertising, messaging and
            third-party costs would be separate and require approval.
          </p>
        </div>
      </div>
    </>
  );
}
