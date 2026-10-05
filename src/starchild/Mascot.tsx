import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { snacks } from "./model";
export function Mark() {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="3.7" strokeLinecap="round">
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d="M20 5v8" transform={`rotate(${i * 45} 20 20)`} />
        ))}
      </g>
      <circle cx="20" cy="20" r="3" fill="currentColor" />
    </svg>
  );
}
export function Icon({
  name = "spark",
  size = 20,
}: {
  name?: string;
  size?: number;
}) {
  const paths: Record<string, string> = {
    arrow: "M4 12h15m-6-6 6 6-6 6",
    back: "M20 12H5m6-6-6 6 6 6",
    check: "m5 12 4 4L19 6",
    plus: "M12 5v14M5 12h14",
    close: "m6 6 12 12M6 18 18 6",
    edit: "m14 5 5 5M4 20l4-1L20 7a2 2 0 0 0-4-4L4 15v5",
    link: "m9 15 6-6M8 16l-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m0 12a4 4 0 0 0 6 0l5-5a4 4 0 0 0-6-6l-1 1",
    globe:
      "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3c-5 4-5 14 0 18 5-4 5-14 0-18",
    instagram:
      "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm9 8.4a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm1.5-4.9h.01",
    chevron: "m6 9 6 6 6-6",
    search: "M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm10 2-4.3-4.3",
    mic: "M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3Zm-7 9a7 7 0 0 0 14 0M12 19v3",
    volume:
      "M4 9v6h4l5 4V5L8 9H4Zm13 0a4 4 0 0 1 0 6M19.5 6.5a8 8 0 0 1 0 11",
    mute: "M4 9v6h4l5 4V5L8 9H4Zm13 1 5 5m0-5-5 5",
    whatsapp:
      "M3 21l1.6-4.6A8.5 8.5 0 1 1 8 19.4L3 21Zm6.3-12.2c-.4 3 2.7 6.2 5.8 6.2l1.4-1.4-2.1-1-1 .9c-1-.4-2.1-1.5-2.5-2.5l.9-1-1-2.1-1.5 1Z",
    pin: "M12 22s8-8 8-13a8 8 0 1 0-16 0c0 5 8 13 8 13Zm0-10a3 3 0 1 0 0-6 3 3 0 0 0 0 6",
    people:
      "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm4-3a4 4 0 0 1 0 8m2 3a4 4 0 0 1 3 4v2",
    repeat: "M4 7h13l3 3M20 7V3M20 17H7l-3-3M4 17v4",
    clock: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 7v5l3 2",
    wallet: "M3 6h16v14H3V6Zm0 0V3h14v3m-2 6h7v5h-7v-5",
    spark: "m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7",
    shield: "m12 2 8 4v6c0 6-8 10-8 10S4 18 4 12V6l8-4Zm-4 9 3 3 5-5",
    doc: "M14 2H5v20h14V7l-5-5Zm0 0v5h5M8 12h8M8 16h6",
    download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
    eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Zm13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
    grid: "M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 0h7v7h-7v-7",
    calendar: "M3 5h18v17H3V5Zm0 5h18M7 2v6M17 2v6M7 14h2M13 14h2M7 18h2",
    chat: "M21 3H3v14h5l4 4v-4h9V3ZM7 8h10M7 12h7",
    copy: "M9 9h12v12H9V9ZM5 15H3V3h12v2",
    coin: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 7v10M15 9h-5a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H9",
    pause: "M8 5v14M16 5v14",
    lock: "M5 10h14v12H5V10Zm3 0V6a4 4 0 0 1 8 0v4",
    settings:
      "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2",
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.spark} />
    </svg>
  );
}
export function Mascot({
  level = 0,
  compact = false,
  interactive = false,
  feedKey = 0,
  onMunch,
}: {
  level?: number;
  compact?: boolean;
  interactive?: boolean;
  feedKey?: number;
  onMunch?: () => void;
}) {
  const id = useId().replace(/:/g, "");
  const [chewing, setChewing] = useState<number | null>(null);
  const [awaitingSnack, setAwaitingSnack] = useState(false);
  const [draggingSnack, setDraggingSnack] = useState<number | null>(null);
  const [bites, setBites] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prior = useRef(feedKey);
  const safeLevel = Math.max(0, Math.min(4, level));
  const growth = 0.88 + safeLevel * 0.035;
  function eat(i: number) {
    if (!Number.isInteger(i) || i < 0 || i >= snacks.length) return;
    if (timer.current) clearTimeout(timer.current);
    setChewing(i);
    setBites((v) => v + 1);
    timer.current = setTimeout(() => {
      setChewing(null);
      timer.current = null;
      onMunch?.();
    }, 1800);
  }
  useEffect(() => {
    if (feedKey !== prior.current) {
      prior.current = feedKey;
      eat(feedKey % snacks.length);
    }
  }, [feedKey]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const animationStyle = {
    "--mouth-x": `${((210 + (206 - 210) * growth) / 420) * 100}%`,
    "--mouth-y": `${((330 + (139 - 330) * growth) / 405) * 100}%`,
  } as CSSProperties;
  const mouthOpen = chewing !== null || awaitingSnack || draggingSnack !== null;
  return (
    <div
      className={`mascot-wrap original-mascot ${compact ? "compact" : ""} ${chewing !== null ? "is-chewing" : ""} ${mouthOpen ? "is-expecting" : ""}`}
      style={animationStyle}
    >
      <div
        className={`mascot level-${safeLevel}`}
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes("application/x-starchild-cookie"))
            e.preventDefault();
        }}
        onDrop={(e) => {
          const raw = e.dataTransfer.getData("application/x-starchild-cookie");
          if (!raw) return;
          e.preventDefault();
          setDraggingSnack(null);
          eat(Number(raw));
        }}
        role="img"
        aria-label={`Original Starchild blob, evolution stage ${safeLevel + 1}${mouthOpen ? ", ready to eat a software cookie" : ""}`}
      >
        <svg viewBox="0 0 420 405" fill="none" aria-hidden="true">
          <defs>
            <linearGradient
              id={`${id}mouth`}
              x1="190"
              y1="120"
              x2="223"
              y2="159"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#172c1d" />
              <stop offset="1" stopColor="#3e562c" />
            </linearGradient>
          </defs>
          <g
            transform={`translate(210 330) scale(${growth}) translate(-210 -330)`}
          >
            <g className="mascot-float">
              <g className="mascot-body original-blob-body">
                <image
                  href="/assets/starchild-original-blob.webp"
                  x="35"
                  y="18"
                  width="350"
                  height="376.923"
                  preserveAspectRatio="xMidYMid meet"
                />
                {mouthOpen && (
                  <g className="original-mouth">
                    <ellipse
                      cx="206"
                      cy="139"
                      rx="17.5"
                      ry="18"
                      fill={`url(#${id}mouth)`}
                    />
                    <ellipse
                      cx="206"
                      cy="149"
                      rx="9"
                      ry="4.5"
                      fill="#d7a795"
                      opacity=".9"
                    />
                    <path
                      d="M194 128q5-5 10-5"
                      stroke="#8b9f5b"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      opacity=".7"
                    />
                  </g>
                )}
              </g>
            </g>
          </g>
        </svg>
        {chewing !== null && (
          <div className="snack-animation" key={bites}>
            <span className="flying-cookie">
              <Icon name={snacks[chewing].icon} size={25} />
              <i />
              <i />
              <i />
            </span>
            {Array.from({ length: 9 }, (_, i) => (
              <i
                className="crumb"
                key={i}
                style={
                  {
                    "--dx": `${Math.cos(i * 2.3) * 70}px`,
                    "--dy": `${Math.sin(i * 2.3) * 55 - 10}px`,
                    "--rot": `${i * 61}deg`,
                  } as CSSProperties
                }
              />
            ))}
            <span className="chomp-word">nom.</span>
          </div>
        )}
      </div>
      {interactive && (
        <div className="snack-tray">
          <p aria-live="polite">
            {chewing !== null
              ? `Mmm. ${snacks[chewing].name.toLowerCase()}.`
              : "A healthy appetite for busywork."}
          </p>
          <div>
            {snacks.map((snack, i) => (
              <button
                type="button"
                key={snack.name}
                className="cookie-button"
                disabled={chewing === i}
                draggable
                onDragStart={(e) => {
                  setDraggingSnack(i);
                  e.dataTransfer.setData(
                    "application/x-starchild-cookie",
                    String(i),
                  );
                  e.dataTransfer.effectAllowed = "copy";
                }}
                onDragEnd={() => setDraggingSnack(null)}
                onMouseEnter={() => setAwaitingSnack(true)}
                onMouseLeave={() => setAwaitingSnack(false)}
                onFocus={() => setAwaitingSnack(true)}
                onBlur={() => setAwaitingSnack(false)}
                onClick={() => eat(i)}
                title={`Feed ${snack.name.toLowerCase()} to Starchild`}
                aria-label={`Feed ${snack.short} cookie`}
              >
                <span className="cookie">
                  <Icon name={snack.icon} />
                  <i />
                  <i />
                  <i />
                </span>
                <span>{snack.short}</span>
              </button>
            ))}
          </div>
          <small>
            Click or drag a cookie. Same little blob, bigger appetite.
          </small>
        </div>
      )}
    </div>
  );
}
