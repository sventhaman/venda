import type { Config } from "tailwindcss";

// Palette: Nordic minimal foundation with a Japanese-coded accent.
//   - ink: near-black + greys for the chrome and body
//   - accent: persimmon (柿色 kaki-iro). A warm, distinctive marketplace
//     orange tied to the name "ichiba" (市場). Replaces the borrowed
//     finn.no blue.
//   - brand: a deeper accent variant for hover/active states.
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0a0a0a",
          soft: "#171717",
          mute: "#5b5b5b",
          line: "#e5e5e5",
          fog: "#f6f5f1", // Slightly warm white — pairs with persimmon, less sterile.
        },
        accent: {
          DEFAULT: "#e8541b", // 柿色 — persimmon, the marketplace warm.
          hover: "#c83f0d",
          soft: "#fde8df",
          ink: "#7c2c0e", // For high-contrast text over soft.
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        // Stack used only for the kanji mark — falls back to system Japanese.
        ja: [
          '"Noto Sans JP"',
          '"Hiragino Sans"',
          '"Yu Gothic"',
          "ui-sans-serif",
          "sans-serif",
        ],
      },
      maxWidth: {
        page: "1200px",
      },
    },
  },
  plugins: [],
} satisfies Config;
