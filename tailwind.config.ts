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
        cream: {
          DEFAULT: "#FAF5EE",
          surface: "#F6F0E8",
          dark: "#F2ECE4",
        },
        espresso: {
          DEFAULT: "#3A302A",
          dark: "#201A16",
          light: "#605850",
          muted: "#9A9088",
        },
        terracotta: {
          DEFAULT: "#C2652A",
          hover: "#A95420",
          light: "#F7ECE4",
          soft: "#FDEEE6",
        },
        coffee: {
          border: "#D8D0C8",
          borderLight: "#E8E2D9",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 2px 10px rgba(58, 48, 42, 0.05)",
        card: "0 4px 20px rgba(58, 48, 42, 0.07)",
        dropdown: "0 10px 30px rgba(58, 48, 42, 0.12)",
      },
    },
  },
  plugins: [],
};
export default config;

