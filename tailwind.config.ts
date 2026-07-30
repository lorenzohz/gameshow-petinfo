import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Identidade principal
        offwhite: "#f5f6f7",
        ink: "#0b0d12",
        // Azuis
        "blue-deepest": "#10316b",
        "blue-dark": "#214179",
        "blue-primary": "#1961a5",
        "blue-light": "#3788d1",
        // Cores das equipes (naipes)
        "suit-paus": "#1f9d55",
        "suit-copas": "#e0473f",
        "suit-espadas": "#7c3aed",
        "suit-ouros": "#f2994a",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      boxShadow: {
        stage: "0 20px 45px -15px rgba(16, 49, 107, 0.45)",
        card: "0 10px 25px -8px rgba(11, 13, 18, 0.25)",
      },
      backgroundImage: {
        "stage-gradient": "linear-gradient(135deg, #10316b 0%, #1961a5 55%, #3788d1 100%)",
      },
    },
  },
  plugins: [],
} satisfies Config;
