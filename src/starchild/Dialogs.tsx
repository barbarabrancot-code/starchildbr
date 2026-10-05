import { useEffect, useRef, type ReactNode } from "react";
import { Icon, Mascot } from "./Mascot";
import {
  balance,
  stage,
  costs,
  jobTitle,
  moves,
  goals,
  sourceOptions,
  type State,
  type JobKind,
  type Job,
} from "./model";
import { Artifact } from "./Artifact";
export type Modal = {
  kind:
    | "about"
    | "claim"
    | "source"
    | "evidence"
    | "run"
    | "artifact"
    | "settings";
  id?: string;
} | null;
function Dialog({
  children,
  onClose,
  wide = false,
}: {
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const r = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = r.current;
    el?.showModal();
    return () => el?.close();
  }, []);
  return (
    <dialog
      ref={r}
      className={`sc-dialog ${wide ? "wide-dialog" : ""}`}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      aria-label="Starchild details"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        className="dialog-close"
        onClick={onClose}
        aria-label="Close dialog"
      >
        <Icon name="close" />
      </button>
      {children}
    </dialog>
  );
}
interface Props {
  modal: Modal;
  s: State;
  update: (f: (s: State) => State) => void;
  close: () => void;
  name: string;
  setName: (v: string) => void;
  scope: boolean;
  setScope: (v: boolean) => void;
  claim: () => void;
  run: (k: JobKind) => void;
  working: boolean;
  activate: (id: string) => void;
  revoke: (id: string) => void;
  reset: () => void;
  feed: () => void;
  notify: (s: string) => void;
  save: (j: Job) => void;
}
export function Dialogs(p: Props) {
  const { modal, s, close } = p;
  if (!modal) return null;
  const source = sourceOptions.find((c) => c.id === modal.id);
  const job = s.jobs.find((j) => j.id === modal.id);
  const move = moves(s.profile).find((m) => m.id === modal.id);
  let content: ReactNode;
  if (modal.kind === "claim")
    content = (
      <div className="claim-modal">
        <Mascot level={1} compact />
        <span className="eyebrow">ONE QUICK STEP</span>
        <h2>Let’s get this fixed.</h2>
        <p>
          Start with 100 work credits, plus 20 more for choosing what matters
          most.
        </p>
        <div className="goal-section">
          <h3>What would make the biggest difference?</h3>
          <div className="goal-options">
            {goals.map((g) => (
              <button
                type="button"
                key={g.id}
                aria-pressed={s.profile.goal === g.id}
                className={s.profile.goal === g.id ? "selected" : ""}
                onClick={() =>
                  p.update((x) => ({
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
        <label>
          What should we call you? <small>optional</small>
          <input
            value={p.name}
            maxLength={60}
            onChange={(e) => p.setName(e.target.value)}
            placeholder="Your first name"
          />
        </label>
        <button
          className="meet-button"
          disabled={!goals.some((g) => g.id === s.profile.goal)}
          onClick={p.claim}
        >
          Start fixing <Icon name="arrow" />
        </button>
      </div>
    );
  else if (modal.kind === "source" && source)
    content = (
      <div className="source-modal">
        <span className={`connection-logo ${source.id}`}>
          <Icon name={source.icon} size={28} />
        </span>
        <span className="eyebrow">CONNECT</span>
        <h2>{source.name}</h2>
        <p>{source.why}</p>
        <div className="permission-row">
          <Icon name="eye" />
          <div>
            <strong>What Starchild sees</strong>
            <p>{source.scope}</p>
          </div>
        </div>
        <div className="permission-row">
          <Icon name="lock" />
          <div>
            <strong>What it never does</strong>
            <p>{source.never}</p>
          </div>
        </div>
        {s.sources.includes(source.id) ? (
          <>
            <div className="scope-box">
              {source.id === "social" && s.ownerPhone
                ? `Connected. Starchild will message ${s.ownerPhone}.`
                : "Connected."}
            </div>
            <button
              className="outline-button"
              onClick={() => p.revoke(source.id)}
            >
              Disconnect
            </button>
          </>
        ) : (
          <>
            {source.id === "social" && (
              <label className="owner-phone">
                Your WhatsApp number
                <input
                  type="tel"
                  inputMode="tel"
                  value={s.ownerPhone}
                  maxLength={30}
                  onChange={(e) =>
                    p.update((x) => ({ ...x, ownerPhone: e.target.value }))
                  }
                  placeholder="+55 48 99999-9999"
                />
              </label>
            )}
            <button
              className="meet-button"
              disabled={
                source.id === "social" &&
                s.ownerPhone.replace(/\D/g, "").length < 8
              }
              onClick={() => p.activate(source.id)}
            >
              Connect {source.brand} <Icon name="arrow" />
            </button>
          </>
        )}
      </div>
    );
  else if (modal.kind === "run")
    content = (
      <div className="run-modal">
        <Mascot
          level={Math.max(1, stage(s))}
          compact
          feedKey={p.working ? 1 : 0}
        />
        <span className="eyebrow">A DEFINED JOB. A CLEAR COST.</span>
        <h2>{jobTitle(modal.id as JobKind, s.profile)}</h2>
        <p>
          A template-built draft using your reviewed profile. Edit and download
          it here. This prototype does not call a language model or publish
          anything.
        </p>
        <div className="cost-line">
          <span>One-time draft cost</span>
          <strong>{costs[modal.id as JobKind]} credits</strong>
        </div>
        <div className="cost-line">
          <span>Your balance afterward</span>
          <strong>{balance(s) - costs[modal.id as JobKind]} credits</strong>
        </div>
        <button
          className="meet-button"
          disabled={p.working}
          onClick={() => p.run(modal.id as JobKind)}
        >
          {p.working ? (
            <>
              <i className="mini-spinner" /> Assembling your draft
            </>
          ) : (
            <>
              Create my draft <Icon name="arrow" />
            </>
          )}
        </button>
        <small className="fine-print">
          Reopening, editing and exporting this draft are free. No live action.
        </small>
      </div>
    );
  else if (modal.kind === "artifact" && job)
    content = (
      <Artifact
        job={job}
        profile={s.profile}
        save={p.save}
        feed={p.feed}
        notify={p.notify}
      />
    );
  else if (modal.kind === "evidence")
    content = (
      <div>
        <span className="eyebrow">EVIDENCE, NOT GUESSWORK</span>
        <h2>
          {modal.id === "profile"
            ? "Where the portrait comes from"
            : modal.id === "privacy"
              ? "Your information stays yours"
              : "Why this next move?"}
        </h2>
        {move ? (
          <>
            <div className="permission-row">
              <Icon name="eye" />
              <div>
                <strong>What supports it</strong>
                <p>{move.evidence}</p>
              </div>
            </div>
            <div className="permission-row">
              <Icon name="shield" />
              <div>
                <strong>What we do not know</strong>
                <p>{move.limit}</p>
              </div>
            </div>
            <p className="fine-print">
              Category playbook suggestion, not a causal finding or guarantee.
              Profile edits change future drafts; existing drafts remain
              snapshots until you edit them.
            </p>
          </>
        ) : (
          <>
            <p>
              {s.profile.sample
                ? "This is a bundled fictional example. The website address is illustrative and was not fetched."
                : "Your business name is suggested from the website address or Instagram handle you provided. It is not a verified business lookup. Other unknown fields remain blank until confirmed."}
            </p>
            <p>
              Edits are stored in this browser. There is no shared customer
              database, server account or live integration. Do not enter
              confidential client, financial or medical information.
            </p>
            <p>
              Production requires verified authority, scoped consent, secure
              accounts, server-side credits and audited execution.
            </p>
          </>
        )}
      </div>
    );
  else if (modal.kind === "settings")
    content = (
      <div>
        <span className="eyebrow">YOUR BOUNDARIES</span>
        <h2>Keep it comfortable.</h2>
        <label className="setting-row">
          <span>
            <strong>Quiet companion</strong>
            <small>Hide the dashboard creature. No lost progress.</small>
          </span>
          <input
            type="checkbox"
            checked={s.quiet}
            onChange={(e) =>
              p.update((x) => ({ ...x, quiet: e.target.checked }))
            }
          />
        </label>
        <label className="setting-row">
          <span>
            <strong>Reduce motion</strong>
            <small>Less movement and a calmer chomp.</small>
          </span>
          <input
            type="checkbox"
            checked={s.reduced}
            onChange={(e) =>
              p.update((x) => ({ ...x, reduced: e.target.checked }))
            }
          />
        </label>
        <div className="permission-row">
          <Icon name="lock" />
          <p>
            Everything is draft-only. Nothing can contact clients, change
            records or spend money.
          </p>
        </div>
        <button
          className="outline-button"
          onClick={() => {
            const blob = new Blob([JSON.stringify(s, null, 2)], {
              type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const el = document.createElement("a");
            el.href = url;
            el.download = "starchild-demo-workspace.json";
            el.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          }}
        >
          <Icon name="download" size={17} /> Export demo workspace
        </button>
        <button className="danger-button" onClick={p.reset}>
          Reset all local demo data
        </button>
      </div>
    );
  else
    content = (
      <div>
        <span className="eyebrow">STARCHILD / FIRST CONTACT</span>
        <h2>
          A working experience.
          <br />
          Not a live operator. Yet.
        </h2>
        <p>
          Explore minimal onboarding, an editable business portrait,
          evidence-labeled next moves, credits, downloadable drafts and an
          evolving companion that eats software-shaped cookies.
        </p>
        <div className="about-columns">
          <div>
            <strong>Works here</strong>
            <p>
              Link-based name suggestions, profile editing, goal-based ranking,
              local credits, editable deliverables, downloads, sample
              connections, approvals, reset and mascot interactions.
            </p>
          </div>
          <div>
            <strong>Not connected</strong>
            <p>
              Live AI enrichment, website scraping, Instagram, banking, ERP,
              authentication, payments, subscriptions, messaging and publishing.
            </p>
          </div>
        </div>
        <p>
          Example companies and connections are fictional. Custom URLs are
          parsed locally to suggest an editable name, not fetched. Information
          stays in this browser. Provider names identify proposed integrations
          only.
        </p>
        <p className="fine-print">
          The creature eats the busywork, not your records. Evolution never
          changes authority. Prices and credits are illustrative.
        </p>
      </div>
    );
  return (
    <Dialog wide={modal.kind === "artifact"} onClose={close}>
      {content}
    </Dialog>
  );
}
