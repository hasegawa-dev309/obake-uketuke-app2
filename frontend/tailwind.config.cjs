/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./reservation.html",
    "./admin.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 6px 18px rgba(2,6,23,0.06)",
      },
      borderRadius: {
        xl2: "1rem",
      },
    },
  },
  plugins: [],
};
