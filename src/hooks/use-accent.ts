export type AccentColor = "blue" | "emerald" | "violet" | "amber";

const KEY = "neurosense-settings";

export function getAccentFromStorage(): AccentColor {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.accentColor && ["blue", "emerald", "violet", "amber"].includes(parsed.accentColor)) {
        return parsed.accentColor as AccentColor;
      }
    }
  } catch {}
  return "blue";
}

export function applyAccent(accent: AccentColor) {
  const root = document.documentElement;
  root.classList.remove("accent-blue", "accent-emerald", "accent-violet", "accent-amber");
  root.classList.add(`accent-${accent}`);
}

export function setAccent(accent: AccentColor) {
  applyAccent(accent);
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed.accentColor = accent;
    localStorage.setItem(KEY, JSON.stringify(parsed));
  } catch {}
}
