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
        ferea: {
          bg: "#F3EFEA",
          surface: "#EAE4DA",
          dark: "#010101",
          espresso: "#7E4124",
          caramel: "#AC6D36",
          amber: "#DD9F57",
          roasted: "#5B2207",
          muted: "#7A7269",
        },
        cream: {
          DEFAULT: "#F3EFEA",
          surface: "#EAE4DA",
          dark: "#E3DCCF",
        },
        espresso: {
          DEFAULT: "#010101",
          dark: "#000000",
          light: "#7E4124",
          muted: "#7A7269",
        },
        terracotta: {
          DEFAULT: "#7E4124",
          hover: "#5B2207",
          light: "#F7ECE4",
          soft: "#FDEEE6",
        },
        coffee: {
          border: "#D8D0C8",
          borderLight: "#E8E2D9",
        },
      },
      fontFamily: {
        display: ["'Akshar'", "'Fira Sans Extra Condensed'", "'Bebas Neue'", "sans-serif"],
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["'Inter'", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
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

