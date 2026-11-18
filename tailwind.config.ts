import type { Config } from "tailwindcss";

/**
 * RoomPartner v9 design system — LIGHT ONLY.
 * Warm, modern light palette: deep indigo/violet primary, warm amber accent,
 * soft neutral surfaces (#F7F7FB), white cards. Emerald stays reserved for
 * semantic success/verified states only — never as the primary brand colour.
 * No dark-mode variants anywhere in the app (see globals.css).
 */
export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
        },
        accent: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
        },
        ink: {
          900: "#18181B",
          800: "#27272A",
          700: "#3F3F46",
          600: "#52525B",
          500: "#71717A",
          400: "#A1A1AA",
        },
        surface: {
          DEFAULT: "#F7F7FB",
          soft: "#FDFDFE",
          muted: "#EFEFF5",
        },
        // Semantic success/verified green (kept separate from the brand).
        ok: { 50: "#ECFDF5", 100: "#D1FAE5", 600: "#059669", 700: "#047857", 800: "#065F46" },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(24, 24, 27, 0.05), 0 4px 16px -4px rgba(24, 24, 27, 0.08)",
        lift: "0 2px 4px rgba(24, 24, 27, 0.06), 0 12px 32px -8px rgba(79, 70, 229, 0.22)",
        pop: "0 8px 30px rgba(24, 24, 27, 0.18)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        "slide-up": "slide-up 0.35s ease-out both",
        shimmer: "shimmer 1.4s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
