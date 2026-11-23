import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "hanji-bg": "#F7F5F0",
        "ink-black": {
          DEFAULT: "#04151F",
          deep: "#020B10",
        },
        "burnt-orange": {
          DEFAULT: "#C44900",
          hover: "#A83E00",
          light: "#E05A0B",
        },
        "slate-grey": {
          DEFAULT: "#183A37",
          dark: "#0F2523",
          light: "#245450",
        },
        wheat: {
          DEFAULT: "#EFD6AC",
          light: "#F7E8CE",
          dark: "#D6B887",
        },
        "sejong-gold": {
          DEFAULT: "#CDA357",
          hover: "#B88E3E",
          light: "#DFC082",
          muted: "rgba(205, 163, 87, 0.15)",
        },
      },
      fontFamily: {
        hunmin: ["var(--font-hunmin)", "serif"],
        pretendard: ["var(--font-pretendard)", "sans-serif"],
        serif: ["var(--font-hunmin)", "serif"],
        sans: ["var(--font-pretendard)", "sans-serif"],
      },
      boxShadow: {
        traditional: "0 10px 30px -10px rgba(4, 21, 31, 0.15)",
        "orange-glow": "0 0 25px -3px rgba(196, 73, 0, 0.4)",
        "neon-course": "0 0 15px rgba(196, 73, 0, 0.8)",
      },
    },
  },
  plugins: [],
};
export default config;
