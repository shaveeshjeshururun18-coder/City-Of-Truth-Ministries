/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#e1e9fe',
          200: '#c7d5fd',
          300: '#a3b8fc',
          400: '#8193f8',
          500: '#646df2',
          600: '#4c51f7',
          700: '#3c3ee2',
          800: '#3233ba',
          900: '#2d2f93',
          950: '#1b1c57',
        },
        accent: {
          50: '#fffce7',
          100: '#fff9c1',
          200: '#fff287',
          300: '#ffe541',
          400: '#ffd21d',
          500: '#ffb703',
          600: '#e38200',
          700: '#bd5b03',
          800: '#9a4708',
          900: '#7e3b0b',
          950: '#491d00',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
        tamil: ['Mukta Malar', 'Noto Sans Tamil', 'Catamaran', 'sans-serif'],
        tamilSerif: ['Noto Serif Tamil', 'serif'],
        bamini25: ['Bamini_25', 'sans-serif'],
        bamini03: ['Bamini_03', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    }
  },
  plugins: [],
}
