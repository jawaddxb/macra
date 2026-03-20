import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a0a",
        surface: "#111111",
        "surface-alt": "#161616",
        accent: "#0A7B6E",
        "accent-light": "#0d9e8d",
        border: "#1f1f1f",
        muted: "#666666",
        "text-primary": "#ffffff",
        "text-secondary": "#e5e5e5",
      },
    },
  },
  plugins: [],
};
export default config;
