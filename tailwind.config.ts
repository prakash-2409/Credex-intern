import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}", "./data/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 20px 60px rgba(17, 19, 24, 0.08)",
      },
    },
  },
};

export default config;