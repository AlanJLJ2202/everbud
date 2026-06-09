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
        background: "var(--background)",
        foreground: "var(--foreground)",
        botanical: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        earth: {
          50: "#fdf8f0",
          100: "#f5e6d0",
          200: "#ebd0a8",
          300: "#d4a86a",
          400: "#c48d42",
          500: "#a67332",
          600: "#8b5e2a",
          700: "#6b4820",
          800: "#503618",
          900: "#3d2910",
        },
        cream: {
          50: "#fefdf8",
          100: "#fdf9ed",
          200: "#faf3d8",
          300: "#f5e8b8",
          400: "#edd98e",
          500: "#e2c55e",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "grain": "url('/noise.svg')",
      },
    },
  },
  plugins: [],
};
export default config;
