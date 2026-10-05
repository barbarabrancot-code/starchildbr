/** A local name suggestion, not a live or verified business lookup. */
export interface BusinessReference {
  name: string;
  site: string;
  source: "instagram-handle" | "website-address" | "business-name";
}
function displayName(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[._-]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\p{L}/gu, (c) => c.toLocaleUpperCase())
    .slice(0, 120);
}
export function businessReference(input: string): BusinessReference {
  const raw = input.trim();
  if (!raw)
    throw new Error("Add your website or Instagram handle to get started.");
  if (raw.length > 300)
    throw new Error("Please use a shorter website or profile link.");
  if (!/[@./:\\]/.test(raw)) {
    if (!/\p{L}/u.test(raw) || raw.length < 2)
      throw new Error("Enter your business name, website or @instagram.");
    return {
      name: raw
        .replace(/\s+/g, " ")
        .replace(/\b\p{L}/gu, (c) => c.toLocaleUpperCase())
        .slice(0, 120),
      site: "",
      source: "business-name",
    };
  }
  const handlePattern = /^[A-Za-z0-9_](?:[A-Za-z0-9_.]{0,28}[A-Za-z0-9_])?$/;
  if (raw.startsWith("@")) {
    const handle = raw.slice(1);
    if (!handlePattern.test(handle) || handle.includes(".."))
      throw new Error("Enter an Instagram profile, such as @your.business.");
    return {
      name: displayName(handle),
      site: `https://www.instagram.com/${handle}/`,
      source: "instagram-handle",
    };
  }
  let url: URL;
  try {
    url = new URL(/^[a-z][a-z\d+.-]*:/i.test(raw) ? raw : `https://${raw}`);
  } catch {
    throw new Error("Use a website address or an @instagram handle.");
  }
  if (
    !["https:", "http:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.port ||
    !url.hostname.includes(".") ||
    /\s/.test(raw)
  )
    throw new Error("Use a public website or Instagram profile URL.");
  const host = url.hostname.toLowerCase().replace(/^(?:www\.|m\.)/, "");
  if (host === "instagram.com") {
    const segments = url.pathname.split("/").filter(Boolean),
      handle = segments[0] || "";
    const reserved = [
      "p",
      "reel",
      "reels",
      "stories",
      "explore",
      "accounts",
      "direct",
      "share",
    ];
    if (
      segments.length !== 1 ||
      reserved.includes(handle.toLowerCase()) ||
      !handlePattern.test(handle) ||
      handle.includes("..")
    )
      throw new Error(
        "Use the business Instagram profile, rather than a post or reel.",
      );
    return {
      name: displayName(handle),
      site: `https://www.instagram.com/${handle}/`,
      source: "instagram-handle",
    };
  }
  if (
    host === "localhost" ||
    /^\d+(?:\.\d+){3}$/.test(host) ||
    host.endsWith(".local") ||
    host.startsWith("[")
  )
    throw new Error("Please enter your public business website.");
  const parts = host.split(".");
  const compound =
    /(?:\.com\.br|\.net\.br|\.org\.br|\.adv\.br|\.med\.br|\.eng\.br|\.arq\.br|\.co\.uk|\.com\.au|\.co\.kr|\.co\.in)$/.test(
      host,
    );
  const brand = parts[Math.max(0, parts.length - (compound ? 3 : 2))];
  if (!brand) throw new Error("Use a website address or an @instagram handle.");
  return {
    name: displayName(brand),
    site: `${url.protocol}//${url.host}${url.pathname}`,
    source: "website-address",
  };
}
