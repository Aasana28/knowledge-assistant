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
        brand: {
          50: "#f2f8f7",
          100: "#dbeefc",
          200: "#b5dfdb",
          300: "#86c6c0",
          400: "#54a69f",
          500: "#2F6F6B", // Primary accent color (#2F6F6B muted teal)
          600: "#265b58",
          700: "#204a47",
          800: "#1b3c3a",
          900: "#173331",
          950: "#0b1c1b",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;

