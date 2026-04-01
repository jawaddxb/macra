import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#050a0f",
        surface: "#0a1018",
        "surface-alt": "#101820",
        accent: "#0A7B6E",
        "accent-light": "#0d9e8d",
        border: "#1a2430",
        muted: "#5a6a7a",
        "text-primary": "#ffffff",
        "text-secondary": "#c8d6e5",
      },
      fontFamily: {
        mono: ["var(--font-space-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
