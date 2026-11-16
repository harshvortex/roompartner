import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: { brand: { 50: "#eef7f2", 500: "#0e9f6e", 600: "#0b8a5f", 700: "#09714e" } },
    },
  },
  plugins: [],
} satisfies Config;
