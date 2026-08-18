/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f5ff',
          100: '#e0ebff',
          200: '#c3d7ff',
          300: '#94b8ff',
          400: '#5e8eff',
          500: '#3b62ff',
          600: '#1a37ff',
          700: '#1225e6',
          800: '#1421ba',
          900: '#172293',
          950: '#0e1256',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
