/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e3a5f',
          50: '#e8edf3',
          100: '#c5d1e1',
          200: '#9fb3cd',
          300: '#7895b8',
          400: '#5b7ea8',
          500: '#3e6798',
          600: '#2a4f7a',
          700: '#1e3a5f',
          800: '#152944',
          900: '#0c1a2e',
        },
        accent: {
          DEFAULT: '#c9a84c',
          50: '#f8f2df',
          100: '#efe0b0',
          200: '#e4cc7e',
          300: '#d9b84c',
          400: '#c9a84c',
          500: '#b8942a',
          600: '#927420',
          700: '#6c5518',
          800: '#463710',
          900: '#201908',
        },
      },
    },
  },
  plugins: [],
}
