import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--outline-variant)",
        input: "var(--outline-variant)",
        ring: "var(--primary)",
        background: "var(--background)",
        foreground: "var(--on-surface)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--on-primary)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--on-secondary)",
        },
        muted: {
          DEFAULT: "var(--surface-container-low)",
          foreground: "var(--on-surface-variant)",
        },
        accent: {
          DEFAULT: "var(--surface-container-high)",
          foreground: "var(--on-surface)",
        },
        card: {
          DEFAULT: "var(--surface-container-lowest)",
          foreground: "var(--on-surface)",
        },
        surface: "var(--surface)",
        "surface-container-lowest": "var(--surface-container-lowest)",
        "surface-container-low": "var(--surface-container-low)",
        "surface-container": "var(--surface-container)",
        "surface-container-high": "var(--surface-container-high)",
        "surface-container-highest": "var(--surface-container-highest)",
        "on-primary": "var(--on-primary)",
        "on-secondary": "var(--on-secondary)",
        "on-surface": "var(--on-surface)",
        "on-surface-variant": "var(--on-surface-variant)",
        "outline-variant": "var(--outline-variant)",
        "primary-container": "var(--primary-container)",
        "secondary-container": "var(--secondary-container)",
        "on-secondary-container": "var(--on-secondary-container)",
        "primary-fixed": "var(--primary-fixed)",
        "primary-fixed-dim": "var(--primary-fixed-dim)",
        "on-primary-fixed-variant": "var(--on-primary-fixed-variant)",
        tertiary: "var(--tertiary)",
        "tertiary-container": "var(--tertiary-container)",
        "tertiary-fixed": "var(--tertiary-fixed)",
        "on-tertiary": "var(--on-tertiary)",
        "on-tertiary-container": "var(--on-tertiary-container)",
        error: "var(--error)",
        "error-container": "var(--error-container)",
        "on-error-container": "var(--on-error-container)",
      },
      boxShadow: {
        soft: "0 8px 32px rgba(0, 0, 0, 0.04)",
        ambient: "0 8px 32px rgba(0, 88, 188, 0.16)",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      fontFamily: {
        sans: ["var(--font-body)", "Inter", "Noto Sans Thai", "system-ui", "sans-serif"],
        headline: [
          "var(--font-headline)",
          "Plus Jakarta Sans",
          "Noto Sans Thai",
          "system-ui",
          "sans-serif",
        ],
      },
      backgroundImage: {
        "atmospheric-gradient": "linear-gradient(135deg, var(--primary-container) 0%, var(--primary) 100%)",
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
