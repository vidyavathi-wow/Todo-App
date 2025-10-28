/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#ff8058",
        white: "#f5f5f5",
        "gray-dark": "#0f172a",
        gray: "#1f2937",
        "gray-light": "#4b5563",
        success: "#10b981",
        error: "#ef4444",
        info: "#3b82f6",
        warning: "#f59e0b",
        bg: "#1e293b",
      },
    },
  },
  plugins: [],
};
