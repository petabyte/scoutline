import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#13161C",       // court-at-night background
        paper: "#EFEBDF",     // stat-sheet paper
        line: "#3A3F4B",      // hairline rules on dark
        "line-light": "#C9C2B0", // hairline rules on paper
        amber: "#E2A83D",     // scoreboard accent
        court: "#4C8C6B",     // verified-green
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  plugins: [],
};
export default config;
