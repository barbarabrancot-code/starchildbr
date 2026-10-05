import { useState } from "react";
import { Icon } from "./Mascot";
import type { Job, Profile } from "./model";
const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ] || c,
  );
export function Artifact({
  job,
  profile,
  save,
  feed,
  notify,
}: {
  job: Job;
  profile: Profile;
  save: (j: Job) => void;
  feed: () => void;
  notify: (s: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [heading, setHeading] = useState(job.heading);
  const [body, setBody] = useState(job.body);
  function apply() {
    save({ ...job, heading, body, approved: false });
    setEditing(false);
    notify("Draft updated. Review again before using it.");
  }
  function download() {
    const page = job.id === "page";
    const text = page
      ? `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(profile.name)} · Draft</title><style>*{box-sizing:border-box}body{margin:0;background:#f4f6ef;color:#243b2f;font:17px/1.7 system-ui,sans-serif}main{max-width:760px;margin:60px auto;padding:44px;background:white;border-radius:24px}small{color:#647167}h1{font-size:48px;line-height:1.1;letter-spacing:-2px}p{white-space:pre-wrap}button{padding:15px 23px;border:0;border-radius:10px;background:#d5e783;color:#233629;font:inherit}aside{margin-top:30px;font-size:13px;color:#6b746b}@media(max-width:600px){main{margin:20px;padding:25px}h1{font-size:34px}}</style></head><body><main><small>DRAFT · NOT PUBLISHED</small><h2>${esc(profile.name)}</h2><h1>${esc(heading)}</h1><p>${esc(body)}</p><button type="button" disabled>Contact request · not connected</button><aside>Template-built prototype. Owner review and a real contact or booking destination are required before publication. No forms collect information and no appointment is booked.</aside></main></body></html>`
      : `${job.title}\n${"=".repeat(job.title.length)}\n\n${heading}\n\n${body}\n\nPrototype draft. Not sent or published. Owner review required.`;
    const url = URL.createObjectURL(
      new Blob([text], {
        type: page ? "text/html;charset=utf-8" : "text/plain;charset=utf-8",
      }),
    );
    const el = document.createElement("a");
    el.href = url;
    el.download = `starchild-${job.id}-draft.${page ? "html" : "txt"}`;
    el.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Draft exported. Nothing was published or sent.");
  }
  return (
    <div className="artifact">
      <span className="eyebrow">ONE LESS THING TO START FROM SCRATCH</span>
      <h2>{job.title}</h2>
      <p className="artifact-subtitle">
        Built from your reviewed portrait. An actual editable deliverable, not a
        live campaign.
      </p>
      <div className="artifact-toolbar">
        <span className={`tag ${job.approved ? "green" : ""}`}>
          {job.approved ? "Approved locally" : "Ready for your review"}
        </span>
        <div>
          <button
            className="text-button"
            onClick={() => {
              if (editing) apply();
              else setEditing(true);
            }}
          >
            <Icon name={editing ? "check" : "edit"} size={16} />
            {editing ? "Save draft" : "Edit draft"}
          </button>
          <button
            className="text-button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(`${heading}\n\n${body}`);
                notify("Draft copied.");
              } catch {
                notify("Clipboard access unavailable. Use Download instead.");
              }
            }}
          >
            <Icon name="copy" size={16} />
            Copy
          </button>
          <button className="text-button" onClick={download}>
            <Icon name="download" size={16} />
            Download
          </button>
        </div>
      </div>
      {editing ? (
        <div className="artifact-editor">
          <label>
            Headline
            <input
              value={heading}
              maxLength={300}
              onChange={(e) => setHeading(e.target.value)}
            />
          </label>
          <label>
            Content
            <textarea
              value={body}
              rows={14}
              maxLength={10000}
              onChange={(e) => setBody(e.target.value)}
            />
          </label>
        </div>
      ) : job.id === "page" ? (
        <div className="page-preview">
          <div className="preview-chrome">
            <span />
            <span />
            <span />
            <small>Local preview · {profile.name}</small>
          </div>
          <div className="preview-content">
            <div className="preview-brand">
              <span>{profile.name.slice(0, 1)}</span>
              {profile.name}
            </div>
            <span className="preview-eyebrow">A GOOD PLACE TO BEGIN</span>
            <h3>{heading}</h3>
            {body.split("\n\n").map((t, i) => (
              <p key={i}>{t}</p>
            ))}
            <button
              onClick={() =>
                notify(
                  "Preview only. A verified contact or booking destination is required before publication.",
                )
              }
            >
              Request more information <Icon name="arrow" size={17} />
            </button>
            <small>
              Request flow preview. No live bookings or submissions.
            </small>
            <div className="preview-art">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      ) : (
        <div className="document-preview">
          {body.split("\n\n").map((t, i) => (
            <p key={i}>{t}</p>
          ))}
        </div>
      )}
      <div className="artifact-approval">
        <p>
          <Icon name="shield" size={18} />
          {job.approved
            ? "Approved here, not published anywhere."
            : "Your approval marks a reviewed draft. It does not publish, send or authorize external actions."}
        </p>
        <button
          className={job.approved ? "outline-button" : "action-button"}
          disabled={editing || job.approved}
          onClick={() => {
            save({ ...job, heading, body, approved: true });
            feed();
            notify(
              "Draft approved locally. Nothing was sent, published or changed externally.",
            );
          }}
        >
          {job.approved ? "Reviewed & approved" : "Approve this draft"}
          <Icon name="check" size={17} />
        </button>
      </div>
    </div>
  );
}
