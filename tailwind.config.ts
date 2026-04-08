import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "var(--color-surface)",
          "container-lowest": "var(--color-surface-container-lowest)",
          "container-low": "var(--color-surface-container-low)",
          "container": "var(--color-surface-container)",
          "container-high": "var(--color-surface-container-high)",
          "container-highest": "var(--color-surface-container-highest)",
        },
        "on-surface": {
          DEFAULT: "var(--color-on-surface)",
          variant: "var(--color-on-surface-variant)",
        },
        outline: "var(--color-outline)",
        quadrant: {
          do: {
            primary: "var(--color-q-do-primary)",
            container: "var(--color-q-do-container)",
          },
          plan: {
            primary: "var(--color-q-plan-primary)",
            container: "var(--color-q-plan-container)",
          },
          delegate: {
            primary: "var(--color-q-delegate-primary)",
            container: "var(--color-q-delegate-container)",
          },
          delete: {
            primary: "var(--color-q-delete-primary)",
            container: "var(--color-q-delete-container)",
          },
        },
        error: { DEFAULT: "#ffb4ab", container: "#93000a" },
      },
      fontFamily: {
        display: ["Manrope", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      fontSize: {
        "display-lg": ["32px", { lineHeight: "1.2", fontWeight: "800" }],
        "display-md": ["24px", { lineHeight: "1.3", fontWeight: "700" }],
        headline: ["18px", { lineHeight: "1.4", fontWeight: "700" }],
        "body-lg": ["16px", { lineHeight: "1.5", fontWeight: "500" }],
        "body-md": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        "body-sm": ["13px", { lineHeight: "1.5", fontWeight: "400" }],
        "label-lg": ["12px", { lineHeight: "1.4", fontWeight: "600" }],
        "label-sm": [
          "10px",
          {
            lineHeight: "1.4",
            fontWeight: "600",
            letterSpacing: "0.1em",
          },
        ],
      },
      spacing: {
        "2xs": "2px",
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
        "3xl": "64px",
      },
      borderRadius: {
        sm: "4px",
        md: "10px",
        lg: "16px",
        xl: "24px",
        full: "9999px",
      },
    },
  },
  plugins: [],
};
export default config;
