/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './features/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // DigiBarangay brand navy — primary dark tone extracted from the logo mark
        navy: {
          50:  '#E8EEF8',
          100: '#C3D1EE',
          200: '#9BB3E4',
          300: '#7396D9',
          400: '#4B79CF',
          500: '#245CC4',
          600: '#1C4BA3',
          700: '#153A83',
          800: '#0F2A62',
          900: '#0D2B5E',
          950: '#080F1E',
        },
        // DigiBarangay accent blue — electric blue arc and "Digi" wordmark extracted from the logo
        gold: {
          300: '#7AB8F5',
          400: '#3D9AEF',
          500: '#1877E8',
          600: '#1461C4',
        },
      },
    },
  },
  plugins: [],
};
