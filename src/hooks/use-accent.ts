export type AccentColor = "blue" | "emerald" | "violet" | "amber";

const ACCENTS: Record<AccentColor, { primary: string; glow: string; hero: string }> = {
  blue: {
    primary: "oklch(0.62 0.19 258)",
    glow: "0 0 24px oklch(0.62 0.19 258 / 0.55)",
    hero: "radial-gradient(at 12% 8%, oklch(0.62 0.19 258 / 0.18) 0, transparent 45%), radial-gradient(at 88% 92%, oklch(0.72 0.18 152 / 0.12) 0, transparent 50%)",
  },
  emerald: {
    primary: "oklch(0.65 0.2 150)",
    glow: "0 0 24px oklch(0.65 0.2 150 / 0.55)",
    hero: "radial-gradient(at 12% 8%, oklch(0.65 0.2 150 / 0.18) 0, transparent 45%), radial-gradient(at 88% 92%, oklch(0.55 0.15 160 / 0.14) 0, transparent 50%)",
  },
  violet: {
    primary: "oklch(0.62 0.22 300)",
    glow: "0 0 24px oklch(0.62 0.22 300 / 0.55)",
    hero: "radial-gradient(at 12% 8%, oklch(0.62 0.22 300 / 0.18) 0, transparent 45%), radial-gradient(at 88% 92%, oklch(0.55 0.18 280 / 0.12) 0, transparent 50%)",
  },
  amber: {
    primary: "oklch(0.78 0.16 85)",
    glow: "0 0 24px oklch(0.78 0.16 85 / 0.55)",
    hero: "radial-gradient(at 12% 8%, oklch(0.78 0.16 85 / 0.18) 0, transparent 45%), radial-gradient(at 88% 92%, oklch(0.82 0.14 75 / 0.12) 0, transparent 50%)",
  },
};

const KEY = "neurosense-settings";

export function getAccentFromStorage(): AccentColor {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.accentColor && ACCENTS[parsed.accentColor as AccentColor]) {
        return parsed.accentColor as AccentColor;
      }
    }
  } catch {}
  return "blue";
}

export function applyAccent(accent: AccentColor) {
  const root = document.documentElement;
  const palette = ACCENTS[accent];
  root.style.setProperty("--primary", palette.primary);
  root.style.setProperty("--accent", palette.primary);
  root.style.setProperty("--ring", palette.primary);
  root.style.setProperty("--glow-primary", palette.glow);
  // Also update body background hero gradient via CSS custom property
  root.style.setProperty("--accent-hero", palette.hero);
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
