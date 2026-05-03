import type { Config } from "tailwindcss";

// Tokens calibrated against finn.no's live DOM:
//   - body text #1B1B1F (softer black, not pure)
//   - card border #DEDEE3 (very light)
//   - input/edge border #84848F (medium grey, visibly delineated)
//   - mute text #5C5C66
//   - blue accent #0063FB (their actual brand color, used sparingly)
//
// Custom card shadow mirrors finn's two-stop drop:
//   0 1px 6px rgba(0,0,0,0.12), 0 1px 1px rgba(0,0,0,0.16)
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1b1b1f",
          soft: "#2a2a30",
          mute: "#5c5c66",
          line: "#dedee3",   // card / divider border
          edge: "#84848f",   // visible input border
          fog: "#f6f6f7",    // section background
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
      boxShadow: {
        card: "0 1px 6px rgba(0,0,0,0.12), 0 1px 1px rgba(0,0,0,0.16)",
        "card-hover":
          "0 2px 12px rgba(0,0,0,0.14), 0 1px 2px rgba(0,0,0,0.18)",
      },
    },
  },
  plugins: [],
} satisfies Config;
