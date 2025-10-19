/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'arc-black': '#000000',
        'arc-white': '#FFFFFF',
        'arc-gray': '#1a1a1a',
      },
      fontFamily: {
        sans: ['Orbitron', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
