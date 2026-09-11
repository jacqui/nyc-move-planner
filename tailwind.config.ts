import type { Config } from "tailwindcss";

// Design tokens for the move planner: a "field notebook" feel —
// warm paper background, ink text, a single route-map blue accent
// for anything in-progress, and a muted signal-green for "done".
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F4EC",
        ink: "#1E2A2E",
        route: "#2F5D8A",
        done: "#5B7F5A",
        pending: "#B8863B",
        line: "#DCD5C3",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
