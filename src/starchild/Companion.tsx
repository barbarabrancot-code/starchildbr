import { useEffect, useRef, useState } from "react";
import { Icon, Mascot } from "./Mascot";
import { diagnostics, goals, stage, type Goal, type State } from "./model";
import type { Actions } from "./Screens";

type Option = { label: string; icon?: string; run: () => void };
type Step = { id: string; say: string; options: Option[] };
type Msg = { from: "me" | "bot"; text: string; options?: Option[] };

const levelRank = { urgent: 0, improve: 1, minor: 2 } as const;

/** Maps a typed or spoken phrase to one tappable card. Keyword matching, not an AI model. */
function intent(text: string) {
  const t = text.toLowerCase();
  if (/whats|zap|repl|messag|respond|mensag/.test(t)) return "whatsapp";
  if (/fix|improv|better|problem|site|google|melhor|arrum/.test(t))
    return "fix";
  if (/credit|price|cost|plan|pay|pre[cç]o|pagar|cr[eé]dito/.test(t))
    return "credits";
  if (/business|profile|edit|neg[oó]cio|perfil/.test(t)) return "business";
  return "other";
}

export function Companion({ s, a }: { s: State; a: Actions }) {
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState(false);
  const [voice, setVoice] = useState(false);
  const [vStep, setVStep] = useState<Step | null>(null);
  const [vHeard, setVHeard] = useState("");
  const [vSpeaking, setVSpeaking] = useState(false);
  const voiceRef = useRef(false);
  const [wantListen, setWantListen] = useState(false);
  const [draft, setDraft] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [custom, setCustom] = useState<Step | null>(null);
  const [typing, setTyping] = useState(false);
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [sound, setSound] = useState(false);
  const [munch, setMunch] = useState(0);
  const [pop, setPop] = useState(false);
  const recRef = useRef<any>(null);
  const firstRef = useRef<HTMLButtonElement>(null);
  const canListen =
    typeof window !== "undefined" &&
    !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  const p = s.profile;

  const top = [...diagnostics(p)].sort(
    (x, y) => levelRank[x.level] - levelRank[y.level],
  )[0];

  function answer(id: string) {
    a.update((x) => ({
      ...x,
      cookies: x.cookies + 1,
      asked: x.asked.includes(id) ? x.asked : [...x.asked, id],
    }));
    setMunch((v) => v + 1);
    setPop(true);
    setTimeout(() => setPop(false), 900);
    setCustom(null);
  }
  function later(id: string) {
    return () => answer(id);
  }
  function leave(id: string, go: () => void) {
    return () => {
      answer(id);
      setOpen(false);
      setChat(false);
      stopVoice();
      go();
    };
  }

  const queue: Step[] = [
    {
      id: "goal",
      say: "What would help most right now?",
      options: goals
        .filter((g) => g.id !== "decide")
        .map((g) => ({
          label: g.name,
          icon: g.icon,
          run: () => {
            a.update((x) => ({
              ...x,
              profile: { ...x.profile, goal: g.id as Goal },
            }));
            answer("goal");
          },
        })),
    },
    {
      id: "fix",
      say: top
        ? `Want me to fix this? ${top.title}.`
        : "Want me to fix the top thing?",
      options: [
        {
          label: "Yes, do it",
          icon: "check",
          run: leave("fix", () => top && a.job(top.job)),
        },
        { label: "Not now", icon: "clock", run: later("fix") },
      ],
    },
    {
      id: "whatsapp",
      say: "Want to talk to me on WhatsApp?",
      options: [
        {
          label: "Yes",
          icon: "check",
          run: leave("whatsapp", () => a.connect("social")),
        },
        { label: "Maybe later", icon: "clock", run: later("whatsapp") },
      ],
    },
  ];
  const step = custom ?? queue.find((q) => !s.asked.includes(q.id)) ?? null;
  const done = !step;
  const total = queue.length;
  const answered = queue.filter((q) => s.asked.includes(q.id)).length;
  const say = step ? step.say : "All caught up. Tap me anytime.";

  function build(t: string): Step {
    const kind = intent(t);
    let out: Step = { id: "custom", say: "", options: [] };
    const c = (say: string, options: Option[]) => {
      out = { id: "custom", say, options };
    };
    if (kind === "whatsapp")
      c("Want to talk to me on WhatsApp?", [
        {
          label: "Yes",
          icon: "check",
          run: leave("custom", () => a.connect("social")),
        },
        { label: "No", icon: "close", run: () => setCustom(null) },
      ]);
    else if (kind === "fix")
      c(top ? `Top fix: ${top.title}.` : "Let me look at your business.", [
        {
          label: "Fix it",
          icon: "check",
          run: leave("custom", () => top && a.job(top.job)),
        },
        {
          label: "Show all",
          icon: "grid",
          run: leave("custom", () => a.go("work")),
        },
      ]);
    else if (kind === "credits")
      c("Credits pay for each fix. Want to look?", [
        {
          label: "Show me",
          icon: "coin",
          run: leave("custom", () => a.go("credits")),
        },
        { label: "No", icon: "close", run: () => setCustom(null) },
      ]);
    else if (kind === "business")
      c("Want to edit your business details?", [
        {
          label: "Edit",
          icon: "edit",
          run: leave("custom", () => a.go("profile")),
        },
        { label: "No", icon: "close", run: () => setCustom(null) },
      ]);
    else
      c("Not sure I got that. Tap the closest:", [
        {
          label: "What to improve",
          icon: "spark",
          run: leave("custom", () => a.go("work")),
        },
        {
          label: "My business",
          icon: "grid",
          run: leave("custom", () => a.go("profile")),
        },
        {
          label: "Credits",
          icon: "coin",
          run: leave("custom", () => a.go("credits")),
        },
      ]);
    return out;
  }
  function ask(raw: string) {
    const t = raw.trim();
    if (!t) return;
    setText("");
    setTyping(false);
    setCustom(build(t));
  }
  function sendChat(raw: string) {
    const t = raw.trim();
    if (!t) return;
    setDraft("");
    const reply = build(t);
    setMsgs((m) => [
      ...m,
      { from: "me", text: t },
      { from: "bot", text: reply.say, options: reply.options },
    ]);
  }
  function speak(line: string, then?: () => void) {
    if (typeof speechSynthesis === "undefined") {
      then?.();
      return;
    }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(line);
    u.lang = navigator.language || "en-US";
    u.onstart = () => setVSpeaking(true);
    u.onend = () => {
      setVSpeaking(false);
      then?.();
    };
    u.onerror = () => {
      setVSpeaking(false);
      then?.();
    };
    speechSynthesis.speak(u);
  }
  function hear() {
    if (voiceRef.current) listen(handleVoice);
  }
  function handleVoice(t: string) {
    setVHeard(t);
    const st = build(t);
    setVStep(st);
    speak(st.say, hear);
  }
  function greeting(): Msg {
    const last = s.jobs[s.jobs.length - 1];
    if (last)
      return {
        from: "bot",
        text: `Hi${s.name ? " " + s.name : ""}! I saw you asked me to fix "${last.title}". It's ready for you to review. Any questions, or do you need something else?`,
        options: [
          { label: "Open it", run: () => leaveChat(() => a.job(last.id)) },
          {
            label: "Fix something else",
            run: () => leaveChat(() => a.go("work")),
          },
          { label: "Talk on WhatsApp", run: () => sendChat("whatsapp") },
        ],
      };
    if (top)
      return {
        from: "bot",
        text: `Hi! I found ${diagnostics(p).length} things to improve for ${p.name}. Want me to start with "${top.title}"?`,
        options: [
          { label: "Yes, start", run: () => leaveChat(() => a.job(top.job)) },
          { label: "Show all", run: () => leaveChat(() => a.go("work")) },
          { label: "Talk on WhatsApp", run: () => sendChat("whatsapp") },
        ],
      };
    return {
      from: "bot",
      text: "Hi! I'm your Starchild. What do you need?",
      options: [
        { label: "What to improve", run: () => sendChat("improve") },
        { label: "Talk on WhatsApp", run: () => sendChat("whatsapp") },
        { label: "Credits", run: () => sendChat("credits") },
      ],
    };
  }
  function leaveChat(go: () => void) {
    setChat(false);
    go();
  }
  function openChat() {
    setMsgs((m) => (m.some((x) => x.from === "me") ? m : [greeting()]));
    setChat(true);
  }
  function startVoice() {
    voiceRef.current = true;
    setVoice(true);
    setVStep(null);
    setVHeard("");
    listen(handleVoice);
  }
  function stopVoice() {
    voiceRef.current = false;
    setVoice(false);
    setVSpeaking(false);
    recRef.current?.stop();
    if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
  }

  function listen(onText: (t: string) => void = ask) {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const Ctor =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = navigator.language || "en-US";
    rec.interimResults = false;
    rec.onresult = (e: any) => onText(e.results[0][0].transcript);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  }

  useEffect(() => {
    if (!open || !sound || typeof speechSynthesis === "undefined") return;
    speechSynthesis.cancel();
    speechSynthesis.speak(new SpeechSynthesisUtterance(say));
    return () => speechSynthesis.cancel();
  }, [open, sound, say]);
  useEffect(() => {
    if (!open) return;
    firstRef.current?.focus();
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [open, say]);

  useEffect(() => {
    if (open && wantListen) {
      setWantListen(false);
      listen();
    }
  }, [open, wantListen]);
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [msgs, chat]);

  const pending = queue.length - answered;
  return (
    <>
      {voice && !open && !chat && (
        <section className="voice-bubble" aria-live="polite">
          <div className="voice-head">
            <span
              className={
                "voice-state " +
                (listening ? "listen" : vSpeaking ? "speak" : "")
              }
            >
              <i />
              {listening
                ? "Listening…"
                : vSpeaking
                  ? "Speaking…"
                  : "Tap the mic to talk"}
            </span>
            <button
              className="stage-icon"
              onClick={stopVoice}
              aria-label="End voice chat"
            >
              <Icon name="close" size={16} />
            </button>
          </div>
          {vHeard && <p className="voice-heard">“{vHeard}”</p>}
          <p className="voice-say">
            {vStep ? vStep.say : "I'm listening. What do you need?"}
          </p>
          {vStep && (
            <div className="chat-chips">
              {vStep.options.map((o) => (
                <button key={o.label} onClick={o.run}>
                  {o.label}
                </button>
              ))}
            </div>
          )}
          {!listening && !vSpeaking && (
            <button
              className="voice-again"
              onClick={() => listen(handleVoice)}
              aria-label="Speak"
            >
              <Icon name="mic" size={18} />
            </button>
          )}
        </section>
      )}
      {!open && !chat && (
        <div className="companion-dock">
          <div className="dock-options">
            <button
              className="dock-opt"
              onClick={startVoice}
              disabled={!canListen}
              aria-label="Talk with voice"
              title={
                canListen ? "Talk" : "Voice isn't supported in this browser"
              }
            >
              <Icon name="mic" size={20} />
            </button>
            <button
              className="dock-opt"
              onClick={openChat}
              aria-label="Open chat"
              title="Chat"
            >
              <Icon name="chat" size={20} />
            </button>
          </div>
          <button
            className="companion-fab"
            onClick={openChat}
            aria-label="Chat with your Starchild"
          >
            <img src="/assets/starchild-original-blob.webp" alt="" />
          </button>
        </div>
      )}
      {chat && (
        <section
          className="chat-widget"
          role="dialog"
          aria-label="Chat with your Starchild"
        >
          <header>
            <img src="/assets/starchild-original-blob.webp" alt="" />
            <div>
              <strong>Starchild</strong>
              <small>Replies right away</small>
            </div>
            <button
              className="stage-icon"
              onClick={() => setChat(false)}
              aria-label="Close chat"
            >
              <Icon name="close" size={18} />
            </button>
          </header>
          <div className="chat-body" ref={bodyRef}>
            {msgs.map((m, i) => (
              <div key={i} className={"chat-msg " + m.from}>
                <p>{m.text}</p>
                {m.options && i === msgs.length - 1 && (
                  <div className="chat-chips">
                    {m.options.map((o) => (
                      <button key={o.label} onClick={o.run}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <form
            className="chat-input"
            onSubmit={(e) => {
              e.preventDefault();
              sendChat(draft);
            }}
          >
            <input
              value={draft}
              maxLength={160}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type a message"
              aria-label="Message"
            />
            <button aria-label="Send">
              <Icon name="arrow" size={18} />
            </button>
          </form>
        </section>
      )}
    </>
  );
}
