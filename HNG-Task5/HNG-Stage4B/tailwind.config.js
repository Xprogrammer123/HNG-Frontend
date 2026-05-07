/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f7ff',
          100: '#ebf0fe',
          200: '#dae3fe',
          300: '#bfcbfc',
          400: '#9baaf9',
          500: '#6d7df4',
          600: '#535be9',
          700: '#4448d6',
          800: '#393caf',
          900: '#32368c',
          950: '#1e2052',
        },
      },
    },
  },
  plugins: [],
}
