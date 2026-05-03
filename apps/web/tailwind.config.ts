import type { Config } from "tailwindcss";

// Nordic minimalist palette inspired by finn.no:
// generous whitespace, near-black text on white, blue for actions, gray for chrome.
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0c0c0c",
          soft: "#1a1a1a",
          mute: "#5b5b5b",
          line: "#e5e5e5",
          fog: "#f6f6f6",
        },
        accent: {
          DEFAULT: "#0063fb",
          hover: "#0050cc",
          soft: "#e6efff",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      maxWidth: {
        page: "1200px",
      },
    },
  },
  plugins: [],
} satisfies Config;
