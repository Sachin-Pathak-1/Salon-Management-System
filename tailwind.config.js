/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'heading': ['Playfair Display', 'serif'],
        'body': ['Montserrat', 'sans-serif'],
      },
      colors: {
        background: "var(--background)",
        text: "var(--text)",
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        danger: "var(--danger)",
        "gray-100": "var(--gray-100)",
        "border-light": "var(--border-light)",
      }
    },
  },
  plugins: [],
};
