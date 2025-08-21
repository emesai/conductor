/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",  // penting! supaya semua komponen React ke-scan
    "./public/index.html",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
