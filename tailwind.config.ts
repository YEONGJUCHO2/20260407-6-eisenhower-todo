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
          DEFAULT: "#131317",
          "container-lowest": "#0e0e12",
          "container-low": "#1b1b1f",
          container: "#1f1f23",
          "container-high": "#2a292e",
          "container-highest": "#353439",
        },
        "on-surface": {
          DEFAULT: "#e4e1e7",
          variant: "#c2c6d6",
        },
        outline: "#8c909f",
        quadrant: {
          do: { primary: "#ffb3ad", container: "#ff5451" },
          plan: { primary: "#adc6ff", container: "#0566d9" },
          delegate: { primary: "#ffb95f", container: "#ca8100" },
          delete: { primary: "#8c909f", container: "#424754" },
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
